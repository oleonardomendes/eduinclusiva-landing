export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('edu_token')
}

export function getUser(): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null
  const u = localStorage.getItem('edu_user')
  return u ? JSON.parse(u) : null
}

export function setAuth(token: string, user: Record<string, unknown>) {
  localStorage.setItem('edu_token', token)
  localStorage.setItem('edu_user', JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem('edu_token')
  localStorage.removeItem('edu_user')
}

export function isAuthenticated(): boolean {
  return !!getToken()
}
