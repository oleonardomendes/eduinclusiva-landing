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

export async function getPlanoStatus(token: string) {
  return api.get('/v1/familia/plano', token)
}

export async function upgradePlano(token: string) {
  return api.post('/v1/familia/plano/upgrade', { plano: 'familia' }, token)
}

// ─── Especialista — Pacientes ─────────────────────────────────────────────────

export async function getPacientes(token: string) {
  return api.get('/v1/especialista/pacientes/', token)
}

export async function createPaciente(payload: unknown, token: string) {
  return api.post('/v1/especialista/pacientes/', payload, token)
}

export async function getPaciente(id: number, token: string) {
  return api.get(`/v1/especialista/pacientes/${id}`, token)
}

// ─── Especialista — Sessões ───────────────────────────────────────────────────

export async function getSessoes(paciente_id: number, token: string) {
  return api.get(`/v1/especialista/pacientes/${paciente_id}/sessoes/`, token)
}

export async function createSessao(paciente_id: number, payload: unknown, token: string) {
  return api.post(`/v1/especialista/pacientes/${paciente_id}/sessoes/`, payload, token)
}

// ─── Especialista — Planos ────────────────────────────────────────────────────

export async function getPlanos(paciente_id: number, token: string) {
  return api.get(`/v1/especialista/pacientes/${paciente_id}/planos/`, token)
}

export async function createPlano(paciente_id: number, payload: unknown, token: string) {
  return api.post(`/v1/especialista/pacientes/${paciente_id}/planos/`, payload, token)
}

export async function enviarPlanoFamilia(plano_id: number, token: string) {
  return api.post(`/v1/especialista/planos/${plano_id}/enviar-familia`, {}, token)
}

// ─── Especialista — Evolução ──────────────────────────────────────────────────

export async function getEvolucaoPaciente(paciente_id: number, token: string) {
  return api.get(`/v1/especialista/pacientes/${paciente_id}/evolucao/`, token)
}

export async function getEvolucaoModulo(pacienteId: number, modulo: string, token: string) {
  return api.get(`/v1/especialista/pacientes/${pacienteId}/${modulo}/evolucao/`, token)
}

// ─── Família — Planos prescritos ─────────────────────────────────────────────

export async function getPlanosPrescritos(token: string) {
  return api.get('/v1/familia/planos-prescritos/', token)
}

export async function registrarTarefa(
  plano_id: number,
  tarefa_index: number,
  payload: { concluiu: boolean; humor: string; observacao?: string },
  token: string
) {
  return api.post(
    `/v1/familia/planos/${plano_id}/tarefas/${tarefa_index}/registrar`,
    payload,
    token
  )
}

// ─── Especialista — Registros da família ─────────────────────────────────────

export async function getRegistrosFamilia(paciente_id: number, token: string) {
  return api.get(`/v1/especialista/pacientes/${paciente_id}/registros-familia/`, token)
}

// ─── Especialista — Avaliação por módulo ─────────────────────────────────────

export async function getAvaliacaoModulo(paciente_id: number | string, modulo: string, token: string) {
  return api.get(`/v1/especialista/pacientes/${paciente_id}/${modulo}/avaliacao/`, token)
}

export async function salvarAvaliacaoModulo(paciente_id: number | string, modulo: string, payload: unknown, token: string) {
  return api.post(`/v1/especialista/pacientes/${paciente_id}/${modulo}/avaliacao/`, payload, token)
}

// ─── Público — Convite ────────────────────────────────────────────────────────

export async function getConvite(codigo: string) {
  const response = await fetch(`${API_URL}/v1/publico/convite/${codigo}`)
  if (!response.ok) throw new Error(await response.text())
  return response.json()
}
