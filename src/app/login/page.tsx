'use client'

export const dynamic = 'force-dynamic'


import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type FormData = {
    email: string
    password: string
    rememberMe: boolean
}

type FormErrors = Partial<Record<keyof FormData, string>>

type ApiResponse = {
    message: string
    user?: {
        _id: string
        name: string
        email: string
        createdAt: number
    }
}

export default function LoginPage() {
    const router = useRouter()
    const [form, setForm] = useState<FormData>({
        email: '',
        password: '',
        rememberMe: false,
    })
    const [errors, setErrors] = useState<FormErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const onChange =
        (key: keyof FormData) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = key === 'rememberMe' ? e.target.checked : e.target.value
            setForm((s) => ({ ...s, [key]: value }))
            setErrors((prev) => ({ ...prev, [key]: undefined }))
            setMessage(null)
        }

    const validate = (values: FormData): FormErrors => {
        const err: FormErrors = {}
        if (!values.email.trim()) err.email = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) err.email = 'Invalid email'
        if (!values.password) err.password = 'Password is required'
        return err
    }

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
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                }),
            })

            const data = await response.json() as ApiResponse

            if (!response.ok) {
                throw new Error(data.message ?? 'Login failed')
            }

            if (!data.user) {
                throw new Error('No user data returned')
            }

            // Store user data
            if (form.rememberMe) {
                localStorage.setItem('user', JSON.stringify(data.user))
            } else {
                sessionStorage.setItem('user', JSON.stringify(data.user))
            }

            setMessage({ 
                type: 'success', 
                text: 'Login successful! Redirecting...' 
            })

            setTimeout(() => {
                router.push('/')
            }, 1000)

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.'
            setMessage({ 
                type: 'error', 
                text: errorMessage
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main style={styles.container}>
            <h1 style={styles.title}>Welcome back</h1>
            <p style={styles.subtitle}>Log in to your account</p>

            <form onSubmit={handleSubmit} noValidate style={styles.form}>
                <label style={styles.label}>
                    Email
                    <input
                        aria-label="Email"
                        value={form.email}
                        onChange={onChange('email')}
                        style={styles.input}
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
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
                        placeholder="Enter your password"
                        autoComplete="current-password"
                    />
                    {errors.password && <div style={styles.error}>{errors.password}</div>}
                </label>

                <div style={styles.optionsRow}>
                    <label style={styles.checkboxLabel}>
                        <input
                            aria-label="Remember me"
                            checked={form.rememberMe}
                            onChange={onChange('rememberMe')}
                            type="checkbox"
                        />
                        <span style={{ marginLeft: 8 }}>Remember me</span>
                    </label>
                    <a href="#" style={styles.forgotLink}>Forgot password?</a>
                </div>

                <button type="submit" disabled={isSubmitting} style={styles.button}>
                    {isSubmitting ? 'Logging in...' : 'Log in'}
                </button>

                {message && (
                    <div
                        role={message.type === 'error' ? 'alert' : 'status'}
                        style={message.type === 'error' ? styles.messageError : styles.messageSuccess}
                    >
                        {message.text}
                    </div>
                )}

                <div style={styles.signupPrompt}>
                    Don&apos;t have an account?{' '}
                    <Link href="/registration" style={styles.signupLink}>
                        Sign up
                    </Link>
                </div>
            </form>
        </main>
    )
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        maxWidth: 420,
        margin: '48px auto',
        padding: 24,
        border: '1px solid #e6e6e6',
        borderRadius: 8,
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
    },
    title: { margin: '0 0 8px 0', fontSize: 24, fontWeight: 600 },
    subtitle: { margin: '0 0 24px 0', fontSize: 14, color: '#666' },
    form: { display: 'flex', flexDirection: 'column', gap: 16 },
    label: { display: 'flex', flexDirection: 'column', fontSize: 14, fontWeight: 500 },
    input: {
        marginTop: 6,
        padding: '10px 12px',
        fontSize: 14,
        borderRadius: 6,
        border: '1px solid #ccc',
        outline: 'none',
    },
    optionsRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 14,
    },
    checkboxLabel: { display: 'flex', alignItems: 'center' },
    forgotLink: { color: '#0366d6', textDecoration: 'none' },
    button: {
        marginTop: 8,
        padding: '10px 14px',
        fontSize: 15,
        fontWeight: 500,
        borderRadius: 6,
        border: 'none',
        background: '#0366d6',
        color: '#fff',
        cursor: 'pointer',
    },
    error: { color: '#b00020', fontSize: 13, marginTop: 4 },
    messageSuccess: { padding: 12, marginTop: 8, color: '#0b6623', background: '#e8f5e9', borderRadius: 6 },
    messageError: { padding: 12, marginTop: 8, color: '#b00020', background: '#ffebee', borderRadius: 6 },
    signupPrompt: { textAlign: 'center', marginTop: 16, fontSize: 14, color: '#666' },
    signupLink: { color: '#0366d6', textDecoration: 'none', fontWeight: 500 },
}