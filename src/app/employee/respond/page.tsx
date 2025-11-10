'use client'

export const dynamic = 'force-dynamic'


import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'

// Type assertion to allow access to new API functions before Convex deployment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiAny = api as any

function EmployeeRespondContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [selectedStatus, setSelectedStatus] = useState<'green' | 'amber' | 'red' | null>(null)
  const [customResponse, setCustomResponse] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  // Validate token
  const tokenValidation = useQuery(
    apiAny.emailTokens.validateToken,
    token ? { token } : 'skip'
  )

  // Check if already responded today
  const hasResponded = useQuery(
    apiAny.responses.hasRespondedToday,
    tokenValidation?.valid && tokenValidation.employeeId
      ? { employeeId: tokenValidation.employeeId }
      : 'skip'
  )

  const submitResponse = useMutation(apiAny.responses.submitResponse)

  useEffect(() => {
    if (hasResponded?.hasResponded && hasResponded.response) {
      setSelectedStatus(hasResponded.response.status)
      setCustomResponse(hasResponded.response.customResponse || '')
      setIsAnonymous(hasResponded.response.isAnonymous)
    }
  }, [hasResponded])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedStatus) {
      setError('Please select a status')
      return
    }

    if (!tokenValidation?.valid || !tokenValidation.employeeId) {
      setError('Invalid or expired link')
      return
    }

    try {
      await submitResponse({
        employeeId: tokenValidation.employeeId as Id<'employees'>,
        status: selectedStatus,
        customResponse: customResponse.trim() || undefined,
        isAnonymous,
      })
      setSubmitted(true)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit response')
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h2>
          <p className="text-gray-600">This link is invalid. Please use the link from your email.</p>
        </div>
      </div>
    )
  }

  if (tokenValidation === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Validating...</div>
      </div>
    )
  }

  if (!tokenValidation.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h2>
          <p className="text-gray-600">{tokenValidation.error}</p>
          <p className="text-sm text-gray-500 mt-4">Please use the latest link from your email.</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your response has been {hasResponded?.hasResponded ? 'updated' : 'submitted'} successfully.
          </p>
          <p className="text-sm text-gray-500">
            We appreciate you taking the time to share how you're doing.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-2">R U OK?</h1>
            <p className="text-blue-100">How was your day today?</p>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {hasResponded?.hasResponded && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  You've already responded today. You can update your response below.
                </p>
              </div>
            )}

            {/* Status Selection */}
            <div className="mb-8">
              <label className="block text-lg font-medium text-gray-900 mb-4">
                Select your status:
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedStatus('green')}
                  className={`relative p-6 rounded-lg border-2 transition-all ${
                    selectedStatus === 'green'
                      ? 'border-green-500 bg-green-50 shadow-lg scale-105'
                      : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <div className="text-5xl mb-2">🟢</div>
                  <p className="font-semibold text-gray-900">Green</p>
                  <p className="text-xs text-gray-600 mt-1">Great day!</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStatus('amber')}
                  className={`relative p-6 rounded-lg border-2 transition-all ${
                    selectedStatus === 'amber'
                      ? 'border-yellow-500 bg-yellow-50 shadow-lg scale-105'
                      : 'border-gray-300 hover:border-yellow-300 hover:bg-yellow-50'
                  }`}
                >
                  <div className="text-5xl mb-2">🟡</div>
                  <p className="font-semibold text-gray-900">Amber</p>
                  <p className="text-xs text-gray-600 mt-1">Okay day</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStatus('red')}
                  className={`relative p-6 rounded-lg border-2 transition-all ${
                    selectedStatus === 'red'
                      ? 'border-red-500 bg-red-50 shadow-lg scale-105'
                      : 'border-gray-300 hover:border-red-300 hover:bg-red-50'
                  }`}
                >
                  <div className="text-5xl mb-2">🔴</div>
                  <p className="font-semibold text-gray-900">Red</p>
                  <p className="text-xs text-gray-600 mt-1">Tough day</p>
                </button>
              </div>
            </div>

            {/* Custom Response */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-900 mb-2">
                Want to share more? (Optional)
              </label>
              <textarea
                value={customResponse}
                onChange={(e) => setCustomResponse(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Tell us more about your day..."
              />
            </div>

            {/* Anonymous Toggle */}
            {customResponse.trim() && (
              <div className="mb-8">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Keep my written response anonymous
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-2 ml-8">
                  Your status (Green/Amber/Red) and email will still be tracked for analytics, but your written comment will be shown as anonymous to managers.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedStatus}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {hasResponded?.hasResponded ? 'Update Response' : 'Submit Response'}
            </button>
          </form>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Your responses help us create a better work environment for everyone.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function EmployeeRespondPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    }>
      <EmployeeRespondContent />
    </Suspense>
  )
}
