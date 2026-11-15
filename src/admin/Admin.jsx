import { useEffect, useState } from 'react'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import {
  Alert, AppShell, Anchor, Burger, Button, Center, Group, Loader, MantineProvider, Menu, NavLink, Paper, Stack, Text, Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  ArrowLeft, Briefcase, ChevronDown, FileText, GraduationCap, LayoutGrid, LogOut, UserRound, Workflow, Wrench,
} from 'lucide-react'
import { Notifications } from '@mantine/notifications'
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { app, ADMIN_EMAILS } from '../services/firebase'
import ListPage from './ListPage'
import SectionsPage from './SectionsPage'
import { hrefFor, navigate, siteHref, useAdminPath } from './router'
import { UnsavedProvider, useUnsaved } from './Unsaved'
import { theme } from './theme'
import './admin.css'

const auth = getAuth(app)

const ICON = { size: 16, strokeWidth: 1.5, 'aria-hidden': true }

// [clave de datos, etiqueta, ícono, segmento de la URL]
const TABS = [
  ['sections', 'Textos', <FileText {...ICON} />, 'textos'],
  ['projects', 'Proyectos', <LayoutGrid {...ICON} />, 'proyectos'],
  ['jobs', 'Trabajos', <Briefcase {...ICON} />, 'trabajos'],
  ['education', 'Estudios', <GraduationCap {...ICON} />, 'estudios'],
  ['skillGroups', 'Habilidades', <Wrench {...ICON} />, 'habilidades'],
  ['workItems', 'Cómo trabajo', <Workflow {...ICON} />, 'como-trabajo'],
]
const DEFAULT_PAGE = 'proyectos'

const goToSite = () => window.location.assign(siteHref())

const backToSite = (e) => {
  e.preventDefault()
  goToSite()
}

function Login({ error, onLogin }) {
  return (
    <Center mih="100vh" p="md">
      <Paper withBorder p="xl" w={360} maw="100%">
        <Stack align="center">
          <Title order={2}>Backoffice</Title>
          <Text c="dimmed" size="sm" ta="center">Entrá con una cuenta de Google autorizada</Text>
          <Button fullWidth onClick={onLogin}>Entrar con Google</Button>
          {error && <Alert color="red" w="100%">{error}</Alert>}
          <Anchor href={siteHref()} size="sm" c="dimmed" onClick={backToSite} className="bo-back">
            <ArrowLeft {...ICON} /> Volver al portfolio
          </Anchor>
        </Stack>
      </Paper>
    </Center>
  )
}

function Shell({ user }) {
  const [page, sub] = useAdminPath()
  const found = TABS.find((t) => t[3] === page)
  const tab = found?.[0]
  // /bo o una página que no existe: se reemplaza por la de inicio (sin ensuciar el historial).
  useEffect(() => { if (!found) navigate(`/${DEFAULT_PAGE}`, { replace: true }) }, [found])
  const [opened, { toggle, close }] = useDisclosure()
  const { guard } = useUnsaved()
  const name = user.displayName || user.email
  return (
    <AppShell
      header={{ height: 56 }} padding="lg"
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" aria-label="Menú" />
            <Title order={4}>Backoffice</Title>
          </Group>
          <Group gap="sm" wrap="nowrap">
            <Menu position="bottom-end" width={240} withinPortal>
              <Menu.Target>
                <Button
                  variant="subtle" color="gray" size="compact-md" aria-label="Cuenta"
                  leftSection={<UserRound {...ICON} />} rightSection={<ChevronDown size={14} strokeWidth={1.5} aria-hidden />}
                >
                  <span className="bo-account-name">{name}</span>
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Sesión iniciada con</Menu.Label>
                <Text size="xs" c="dimmed" px="sm" pb="xs" truncate>{user.email}</Text>
                <Menu.Divider />
                <Menu.Item color="negative" leftSection={<LogOut {...ICON} />} onClick={() => guard(() => signOut(auth))}>Cerrar sesión</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="sm" className="bo-nav">
        {TABS.map(([key, label, icon, slug]) => (
          <NavLink
            key={key} label={label} leftSection={icon} active={tab === key} href={hrefFor(`/${slug}`)}
            onClick={(e) => {
              e.preventDefault()
              if (tab !== key || sub) guard(() => { navigate(`/${slug}`); close() })
              else close()
            }}
          />
        ))}
        <NavLink label="Volver a la web" leftSection={<ArrowLeft {...ICON} />} href={siteHref()} onClick={(e) => { e.preventDefault(); guard(goToSite) }} mt="auto" />
      </AppShell.Navbar>
      <AppShell.Main>
        <div>
          {tab === 'sections' && <SectionsPage sectionId={sub} />}
          {tab && tab !== 'sections' && <ListPage key={tab} name={tab} slug={page} itemId={sub} />}
        </div>
      </AppShell.Main>
    </AppShell>
  )
}

export default function Admin() {
  const [user, setUser] = useState(undefined)
  const [error, setError] = useState('')

  useEffect(() => onAuthStateChanged(auth, (u) => {
    if (u && !ADMIN_EMAILS.includes(u.email)) {
      setError(`${u.email} no tiene permiso.`)
      signOut(auth)
      setUser(null)
    } else {
      setUser(u)
    }
  }), [])

  const login = async () => {
    setError('')
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <MantineProvider theme={theme} forceColorScheme="dark">
      <Notifications position="bottom-right" />
      {user === undefined ? (
        <Center mih="100vh"><Loader /></Center>
      ) : user ? (
        <UnsavedProvider><Shell user={user} /></UnsavedProvider>
      ) : (
        <Login error={error} onLogin={login} />
      )}
    </MantineProvider>
  )
}
