import { describe, expect, it } from 'vitest'
import { ADMIN_LOGIN, ADMIN_ROOT, adminPath, DEFAULT_ADMIN_PAGE } from './adminPaths'

describe('adminPaths', () => {
  it('constantes', () => {
    expect(ADMIN_ROOT).toBe('/bo')
    expect(ADMIN_LOGIN).toBe('/bo/login')
    expect(DEFAULT_ADMIN_PAGE).toBe('proyectos')
  })
  it('adminPath une segmentos bajo /bo', () => {
    expect(adminPath()).toBe('/bo')
    expect(adminPath('proyectos')).toBe('/bo/proyectos')
    expect(adminPath('proyectos', 'abc')).toBe('/bo/proyectos/abc')
  })
  it('no normaliza ni codifica segmentos', () => {
    expect(adminPath('')).toBe('/bo/')
    expect(adminPath('a b', 'c/d')).toBe('/bo/a b/c/d')
  })
})
