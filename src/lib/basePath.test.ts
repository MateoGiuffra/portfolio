import { afterEach, describe, expect, it, vi } from 'vitest'

import type * as BasePathModule from './basePath'

type BaseModule = typeof BasePathModule

// BASE se calcula al cargar el módulo: se simula BASE_URL y se reimporta.
const load = async (baseUrl: string): Promise<BaseModule> => {
  vi.stubEnv('BASE_URL', baseUrl)
  vi.resetModules()
  return import('./basePath')
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('basePath', () => {
  it('GitHub Pages: "/portfolio/" -> BASE "/portfolio"', async () => {
    const m = await load('/portfolio/')
    expect(m.BASE).toBe('/portfolio')
    expect(m.siteHref()).toBe('/portfolio/')
    expect(m.hrefFor('/bo/login')).toBe('/portfolio/bo/login')
  })
  it('sin barra final también se acepta', async () => {
    expect((await load('/portfolio')).BASE).toBe('/portfolio')
  })
  it('dev: "/" -> BASE ""', async () => {
    const m = await load('/')
    expect(m.BASE).toBe('')
    expect(m.siteHref()).toBe('/')
    expect(m.hrefFor('/bo')).toBe('/bo')
  })
  it('build relativo ("./" o vacío) -> BASE ""', async () => {
    expect((await load('./')).BASE).toBe('')
    expect((await load('')).BASE).toBe('')
  })
})
