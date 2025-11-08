'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.push('/registration');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to Your Company
          </h1>
          <div className="w-20 h-1 bg-indigo-600 mx-auto mb-6"></div>
        </div>

        {/* Company Description - You can edit this text */}
        <div className="text-center mb-10">
          <p className="text-lg text-gray-700 leading-relaxed">
            We help businesses transform their ideas into reality through 
            innovative technology solutions. Our platform provides the tools 
            and services you need to succeed in the digital age.
          </p>
          <p className="text-md text-gray-600 mt-4">
            Join thousands of satisfied customers who trust us with their business growth.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={handleLogin}
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg 
                       hover:bg-indigo-700 transition-colors duration-200 
                       shadow-md hover:shadow-lg"
          >
            Login
          </button>
          <button 
            onClick={handleRegister}
            className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg 
                       border-2 border-indigo-600 hover:bg-indigo-50 
                       transition-colors duration-200"
          >
            Register
          </button>
        </div>

        {/* Optional: Additional info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Secure • Reliable • My First Website</p>
        </div>
      </div>
    </main>
  );
}