import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegister } from '@/hooks/useAuth'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const navigate = useNavigate()
  const register = useRegister()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) return
    register.mutate(
      { name, email, phone, password, password_confirmation: confirmPassword },
      { onSuccess: () => navigate('/') },
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold">
            <span className="text-[#002f34]">Trade</span>
            <span className="text-[#23e5db]">Flex</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-[#002f34] focus:ring-1 focus:ring-[#002f34] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-[#002f34] focus:ring-1 focus:ring-[#002f34] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+1 555-0123"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-[#002f34] focus:ring-1 focus:ring-[#002f34] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Min 6 characters"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-[#002f34] focus:ring-1 focus:ring-[#002f34] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-[#002f34] focus:ring-1 focus:ring-[#002f34] outline-none"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
            )}
          </div>

          {register.isError && (
            <p className="text-sm text-red-600">Registration failed. Try again.</p>
          )}

          <button
            type="submit"
            disabled={register.isPending || password !== confirmPassword}
            className="w-full py-2.5 bg-[#002f34] text-white rounded-lg font-semibold text-sm hover:bg-[#003e45] disabled:opacity-60"
          >
            {register.isPending ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-[#23e5db] font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
