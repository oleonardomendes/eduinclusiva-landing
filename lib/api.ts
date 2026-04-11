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

export async function registrarPercepcao(
  filho_id: number,
  atividade_id: number,
  payload: {
    humor: string
    observacao?: string
    proxima_acao: string
  },
  token: string
) {
  return api.post(
    `/v1/familia/filhos/${filho_id}/atividades/${atividade_id}/percepcao`,
    payload,
    token
  )
}

export async function getEvolucao(filho_id: number, token: string) {
  return api.get(`/v1/familia/filhos/${filho_id}/evolucao`, token)
}

export async function getPercepcoes(filho_id: number, token: string) {
  return api.get(`/v1/familia/filhos/${filho_id}/percepcoes`, token)
}
