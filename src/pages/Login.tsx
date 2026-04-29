import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useLogin } from '@/hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const login = useLogin()

  const from = (location.state as { from?: string })?.from ?? '/'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    login.mutate(
      { email, password },
      { onSuccess: () => navigate(from, { replace: true }) },
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold">
            <span className="text-[#002f34]">Trade</span>
            <span className="text-[#23e5db]">Flex</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-[#002f34] focus:ring-1 focus:ring-[#002f34] outline-none"
            />
          </div>

          {login.isError && (
            <p className="text-sm text-red-600">Invalid email or password</p>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full py-2.5 bg-[#002f34] text-white rounded-lg font-semibold text-sm hover:bg-[#003e45] disabled:opacity-60"
          >
            {login.isPending ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#23e5db] font-semibold hover:underline">
            Register
          </Link>
        </p>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Demo: use <strong>sarah@demo.com</strong> with any password
          </p>
        </div>
      </div>
    </div>
  )
}
