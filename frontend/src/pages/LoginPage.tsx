import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export const LoginPage = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore(s => s.setAuth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await authApi.login(form)
      setAuth(data.user, data.access_token)
      navigate('/')
    } catch {
      setError('Неверный email или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Добро пожаловать</h1>
          <p className="text-sm text-text-muted">Войдите в свой аккаунт</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Email" type="email" placeholder="you@example.com"
            value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          <Input label="Пароль" type="password" placeholder="••••••••"
            value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
          {error && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-btn px-3 py-2">{error}</p>}
          <Button type="submit" size="lg" loading={loading}>Войти</Button>
        </form>

        <p className="text-sm text-text-muted text-center mt-6">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-orange hover:opacity-80 transition-opacity">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  )
}