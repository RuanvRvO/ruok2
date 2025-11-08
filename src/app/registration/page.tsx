'use client'

import React, { useState, useMemo } from 'react'
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type FormData = {
    name: string
    email: string
    password: string
    confirmPassword: string
    acceptTerms: boolean
}

type FormErrors = Partial<Record<keyof FormData, string>>

export default function RegistrationPage() {
    const router = useRouter()
    const [form, setForm] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
    })
    const [errors, setErrors] = useState<FormErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
        null
    )

    // Convex mutation hook
    const registerUser = useMutation(api.users.registerUser)

    const onChange =
        (key: keyof FormData) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = key === 'acceptTerms' ? e.target.checked : e.target.value
            setForm((s) => ({ ...s, [key]: value }))
            setErrors((prev) => ({ ...prev, [key]: undefined }))
            setMessage(null)
        }

    const validate = (values: FormData): FormErrors => {
        const err: FormErrors = {}
        if (!values.name.trim()) err.name = 'Name is required'
        if (!values.email.trim()) err.email = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) err.email = 'Invalid email'
        if (!values.password) err.password = 'Password is required'
        else if (values.password.length < 8) err.password = 'Password must be at least 8 characters'
        if (values.password !== values.confirmPassword) err.confirmPassword = 'Passwords do not match'
        if (!values.acceptTerms) err.acceptTerms = 'You must accept the terms'
        return err
    }

    const passwordStrength = useMemo(() => {
        const p = form.password
        let score = 0
        if (p.length >= 8) score++
        if (/[A-Z]/.test(p)) score++
        if (/[0-9]/.test(p)) score++
        if (/[^A-Za-z0-9]/.test(p)) score++
        return score // 0..4
    }, [form.password])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)
        const validation = validate(form)
        if (Object.keys(validation).length > 0) {
            setErrors(validation)
            return
        }

        setIsSubmitting(true)
        try {
            // Call Convex mutation to register user
            const result = await registerUser({
                name: form.name,
                email: form.email,
                password: form.password,
            })

            // Automatically log in the user after successful registration
            const userData = {
                _id: result.userId,
                name: form.name,
                email: form.email,
                createdAt: Date.now(),
            }

            // Store user data in localStorage (automatically logged in)
            localStorage.setItem('user', JSON.stringify(userData))

            setMessage({ 
                type: 'success', 
                text: 'Registration successful! Redirecting...' 
            })

            // Redirect to home page after 1 second
            setTimeout(() => {
                router.push('/')
            }, 1000)
            
        } catch (err: any) {
            setMessage({ 
                type: 'error', 
                text: err.message || 'Registration failed. Please try again.' 
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main style={styles.container}>
            <h1 style={styles.title}>Create an account</h1>

            <form onSubmit={handleSubmit} noValidate style={styles.form}>
                <label style={styles.label}>
                    Name
                    <input
                        aria-label="Full name"
                        value={form.name}
                        onChange={onChange('name')}
                        style={styles.input}
                        type="text"
                        placeholder="Your name"
                    />
                    {errors.name && <div style={styles.error}>{errors.name}</div>}
                </label>

                <label style={styles.label}>
                    Email
                    <input
                        aria-label="Email"
                        value={form.email}
                        onChange={onChange('email')}
                        style={styles.input}
                        type="email"
                        placeholder="you@example.com"
                    />
                    {errors.email && <div style={styles.error}>{errors.email}</div>}
                </label>

                <label style={styles.label}>
                    Password
                    <input
                        aria-label="Password"
                        value={form.password}
                        onChange={onChange('password')}
                        style={styles.input}
                        type="password"
                        placeholder="At least 8 characters"
                    />
                    <div style={styles.passwordRow}>
                        <div style={{ ...styles.strengthBar, ...strengthStyle(passwordStrength) }} />
                        <small style={styles.strengthText}>
                            {['Very weak', 'Weak', 'Okay', 'Strong', 'Very strong'][passwordStrength]}
                        </small>
                    </div>
                    {errors.password && <div style={styles.error}>{errors.password}</div>}
                </label>

                <label style={styles.label}>
                    Confirm password
                    <input
                        aria-label="Confirm password"
                        value={form.confirmPassword}
                        onChange={onChange('confirmPassword')}
                        style={styles.input}
                        type="password"
                        placeholder="Repeat your password"
                    />
                    {errors.confirmPassword && <div style={styles.error}>{errors.confirmPassword}</div>}
                </label>

                <label style={styles.checkboxLabel}>
                    <input
                        aria-label="Accept terms"
                        checked={form.acceptTerms}
                        onChange={onChange('acceptTerms')}
                        type="checkbox"
                    />
                    <span style={{ marginLeft: 8 }}>I agree to the terms and privacy policy</span>
                </label>
                {errors.acceptTerms && <div style={styles.error}>{errors.acceptTerms}</div>}

                <button type="submit" disabled={isSubmitting} style={styles.button}>
                    {isSubmitting ? 'Creating account...' : 'Register'}
                </button>

                {message && (
                    <div
                        role={message.type === 'error' ? 'alert' : 'status'}
                        style={message.type === 'error' ? styles.messageError : styles.messageSuccess}
                    >
                        {message.text}
                    </div>
                )}

                <div style={styles.loginPrompt}>
                    Already have an account?{' '}
                    <Link href="/login" style={styles.loginLink}>
                        Log in
                    </Link>
                </div>
            </form>
        </main>
    )
}

/* Simple inline styles so the file is self-contained */
const styles: Record<string, React.CSSProperties> = {
    container: {
        maxWidth: 520,
        margin: '48px auto',
        padding: 24,
        border: '1px solid #e6e6e6',
        borderRadius: 8,
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
    },
    title: { margin: '0 0 16px 0', fontSize: 22 },
    form: { display: 'flex', flexDirection: 'column', gap: 12 },
    label: { display: 'flex', flexDirection: 'column', fontSize: 14 },
    input: {
        marginTop: 6,
        padding: '8px 10px',
        fontSize: 14,
        borderRadius: 6,
        border: '1px solid #ccc',
        outline: 'none',
    },
    checkboxLabel: { display: 'flex', alignItems: 'center', marginTop: 8, fontSize: 14 },
    button: {
        marginTop: 8,
        padding: '10px 14px',
        fontSize: 15,
        borderRadius: 6,
        border: 'none',
        background: '#0366d6',
        color: '#fff',
        cursor: 'pointer',
    },
    error: { color: '#b00020', fontSize: 13, marginTop: 6 },
    messageSuccess: { marginTop: 12, color: '#0b6623', padding: 12, background: '#e8f5e9', borderRadius: 6 },
    messageError: { marginTop: 12, color: '#b00020', padding: 12, background: '#ffebee', borderRadius: 6 },
    passwordRow: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 },
    strengthBar: { width: 96, height: 8, borderRadius: 4, background: '#eee' },
    strengthText: { fontSize: 12, color: '#444' },
    loginPrompt: { textAlign: 'center', marginTop: 16, fontSize: 14, color: '#666' },
    loginLink: { color: '#0366d6', textDecoration: 'none', fontWeight: 500 },
}

function strengthStyle(score: number): React.CSSProperties {
    const colors = ['#eee', '#e4572e', '#f4a261', '#2a9d8f', '#2b8aee']
    const widths = ['8px', '24px', '48px', '72px', '96px']
    return {
        background: colors[score] || colors[0],
        width: widths[score] || widths[0],
    }
}
