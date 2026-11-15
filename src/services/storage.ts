// ÚNICO lugar que toca localStorage. Todo falla en silencio (modo privado, cuota, etc.).

export function readString(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // sin storage: se ignora
  }
}

export function readJson<T>(key: string): T | null {
  const raw = readString(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T // el llamador declara la forma; el JSON lo escribimos nosotros
  } catch {
    return null
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    writeString(key, JSON.stringify(value))
  } catch {
    // valor no serializable: se ignora
  }
}
