const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const ROLE_TO_USER = {
  tenant: 'tenant_atheeq',
  owner: 'owner_mr_silva',
  admin: 'admin_demo',
}

function getRole() {
  const value = localStorage.getItem('rentease_role') || 'tenant'
  return ROLE_TO_USER[value] ? value : 'tenant'
}

function getUserId(role) {
  return ROLE_TO_USER[role] || ROLE_TO_USER.tenant
}

function buildUrl(path, query = {}) {
  const url = new URL(path, API_BASE_URL)
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })
  return url.toString()
}

async function request(path, options = {}, query) {
  const role = getRole()
  const headers = {
    'Content-Type': 'application/json',
    'X-ROLE': role,
    'X-USER-ID': getUserId(role),
    ...(options.headers || {}),
  }

  const response = await fetch(buildUrl(path, query), {
    ...options,
    headers,
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const errorJson = await response.json()
      if (errorJson.message) {
        message = errorJson.message
      }
    } catch {
      // Fallback keeps generic HTTP error text.
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return null
  }
  return response.json()
}

export const apiClient = {
  get: (path, query) => request(path, { method: 'GET' }, query),
  post: (path, body, query) => request(path, { method: 'POST', body: JSON.stringify(body || {}) }, query),
  put: (path, body, query) => request(path, { method: 'PUT', body: JSON.stringify(body || {}) }, query),
  delete: (path, query) => request(path, { method: 'DELETE' }, query),
}
