const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://backend-eduinclusiva-v1.onrender.com'

export const api = {
  async post(path: string, body: unknown, token?: string) {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw await res.json()
    return res.json()
  },

  async get(path: string, token: string) {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw await res.json()
    return res.json()
  },

  async patch(path: string, body: unknown, token: string) {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw await res.json()
    return res.json()
  },
}
