import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const { user, isAuthenticated, setAuth, logout } = useAuthStore()
  return { user, isAuthenticated, setAuth, logout }
}