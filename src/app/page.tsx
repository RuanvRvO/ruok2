'use client'

import { useUser } from '@/hooks/useUser'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HomePage() {
  const { user, isLoading, logout } = useUser()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Welcome to RUOK2</h1>
        <p style={styles.text}>Please log in to continue</p>
        <div style={styles.buttonGroup}>
          <Link href="/login">
            <button style={styles.primaryButton}>Log In</button>
          </Link>
          <Link href="/registration">
            <button style={styles.secondaryButton}>Sign Up</button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.welcomeCard}>
        <h1 style={styles.title}>Welcome back, {user.name}! 👋</h1>
        <div style={styles.userInfo}>
          <p style={styles.label}>Email:</p>
          <p style={styles.value}>{user.email}</p>
          
          <p style={styles.label}>Member since:</p>
          <p style={styles.value}>
            {new Date(user.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        
        <button onClick={handleLogout} style={styles.logoutButton}>
          Log Out
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 600,
    margin: '48px auto',
    padding: 24,
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
  },
  loading: {
    textAlign: 'center',
    fontSize: 18,
    color: '#666',
  },
  welcomeCard: {
    padding: 32,
    border: '1px solid #e6e6e6',
    borderRadius: 12,
    background: '#fff',
  },
  title: {
    margin: '0 0 24px 0',
    fontSize: 28,
    fontWeight: 600,
  },
  text: {
    marginBottom: 24,
    fontSize: 16,
    color: '#666',
  },
  userInfo: {
    marginBottom: 24,
    padding: 20,
    background: '#f8f9fa',
    borderRadius: 8,
  },
  label: {
    margin: '12px 0 4px 0',
    fontSize: 12,
    fontWeight: 600,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  value: {
    margin: '0 0 8px 0',
    fontSize: 16,
    color: '#333',
  },
  buttonGroup: {
    display: 'flex',
    gap: 12,
  },
  primaryButton: {
    padding: '12px 24px',
    fontSize: 15,
    fontWeight: 500,
    borderRadius: 6,
    border: 'none',
    background: '#0366d6',
    color: '#fff',
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '12px 24px',
    fontSize: 15,
    fontWeight: 500,
    borderRadius: 6,
    border: '2px solid #0366d6',
    background: '#fff',
    color: '#0366d6',
    cursor: 'pointer',
  },
  logoutButton: {
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 500,
    borderRadius: 6,
    border: '1px solid #dc3545',
    background: '#fff',
    color: '#dc3545',
    cursor: 'pointer',
  },
}
