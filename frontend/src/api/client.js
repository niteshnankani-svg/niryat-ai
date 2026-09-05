export const API_URL = import.meta.env.VITE_API_URL || 'https://backend-production-a3c6.up.railway.app'

export async function apiGet(path) {
  const res = await fetch(`${API_URL}${path}`)
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json()
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.detail || `POST ${path} failed: ${res.status}`)
  }
  return res.json()
}
