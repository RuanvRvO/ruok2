'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            R U OK?
          </h1>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-6">
            Employee Wellbeing Tracking
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A simple, effective way to track and improve your team's emotional wellbeing through daily check-ins
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Daily Email Check-ins</h3>
            <p className="text-gray-600">
              Employees receive a daily email at 4pm to share how their day went
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Analytics</h3>
            <p className="text-gray-600">
              View organization-wide and group-based wellbeing trends on your dashboard
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Privacy First</h3>
            <p className="text-gray-600">
              Optional anonymous responses ensure employees feel comfortable sharing
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link
            href="/manager/register"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            Create Organization
          </Link>
          <Link
            href="/manager/login"
            className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all border-2 border-blue-600"
          >
            Manager Login
          </Link>
        </div>

        {/* How it Works */}
        <div className="mt-24">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full text-2xl font-bold mb-4">
                1
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Setup Your Organization</h4>
              <p className="text-gray-600">
                Create your account and add employee emails. Organize them into groups for detailed tracking.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full text-2xl font-bold mb-4">
                2
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Daily Check-ins</h4>
              <p className="text-gray-600">
                Employees receive an email at 4pm daily to select Green, Amber, or Red and optionally add comments.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 text-purple-600 rounded-full text-2xl font-bold mb-4">
                3
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Track & Improve</h4>
              <p className="text-gray-600">
                View trends on your dashboard and take action to improve team wellbeing where needed.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>R U OK? - Employee Wellbeing Tracking Platform</p>
        </div>
      </footer>
    </div>
  )
}
