import { afterEach, describe, expect, it, vi } from 'vitest'

// legacyHash lee BASE al cargar: se simula BASE_URL y se reimporta; window/location/history son stubs mínimos.
const setup = async (hash: string, search = '', baseUrl = '/'): Promise<{ run: () => void; replaceState: ReturnType<typeof vi.fn> }> => {
  const replaceState = vi.fn()
  vi.stubGlobal('window', { location: { hash, search }, history: { replaceState } })
  vi.stubEnv('BASE_URL', baseUrl)
  vi.resetModules()
  const { migrateHashRoute } = await import('./legacyHash')
  return { run: migrateHashRoute, replaceState }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('migrateHashRoute', () => {
  it.each([
    ['#/bo', '/bo'],
    ['#/bo/login', '/bo/login'],
    ['#/bo/proyectos/abc', '/bo/proyectos/abc'],
    ['#/backoffice', '/bo'],
    ['#/backoffice/proyectos', '/bo/proyectos'],
  ])('%s -> %s', async (hash, expected) => {
    const { run, replaceState } = await setup(hash)
    run()
    expect(replaceState).toHaveBeenCalledTimes(1)
    expect(replaceState).toHaveBeenCalledWith(null, '', expected)
  })

  it('quita la barra final', async () => {
    const a = await setup('#/bo/')
    a.run()
    expect(a.replaceState).toHaveBeenCalledWith(null, '', '/bo')
    const b = await setup('#/backoffice/')
    b.run()
    expect(b.replaceState).toHaveBeenCalledWith(null, '', '/bo')
    const c = await setup('#/bo/proyectos/')
    c.run()
    expect(c.replaceState).toHaveBeenCalledWith(null, '', '/bo/proyectos')
  })

  it('quita solo una barra final (comportamiento actual)', async () => {
    const { run, replaceState } = await setup('#/bo//')
    run()
    expect(replaceState).toHaveBeenCalledWith(null, '', '/bo/')
  })

  it('antepone BASE y conserva el query string', async () => {
    const { run, replaceState } = await setup('#/backoffice/login', '?x=1', '/portfolio/')
    run()
    expect(replaceState).toHaveBeenCalledWith(null, '', '/portfolio/bo/login?x=1')
  })

  it.each(['', '#', '#bo', '#/', '#/otra', '#/boo', '#/backoffice2', '#/bo?x=1', '#!/bo', '#/x/bo'])(
    'ignora el hash %j',
    async (hash) => {
      const { run, replaceState } = await setup(hash)
      run()
      expect(replaceState).not.toHaveBeenCalled()
    },
  )
})
