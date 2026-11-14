import { useEffect, useState } from 'react'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import {
  Alert, AppShell, Anchor, Burger, Button, Center, Group, Loader, MantineProvider, NavLink, Paper, Stack, Text, Title,
  createTheme,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Notifications } from '@mantine/notifications'
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { app, ADMIN_EMAILS } from '../services/firebase'
import ListPage from './ListPage'
import SectionsPage from './SectionsPage'
import './admin.css'

const auth = getAuth(app)
const theme = createTheme({ primaryColor: 'indigo' })

const TABS = [
  ['sections', 'Textos', '✎'],
  ['projects', 'Proyectos', '▣'],
  ['jobs', 'Trabajos', '💼'],
  ['education', 'Estudios', '🎓'],
  ['skillGroups', 'Habilidades', '🛠'],
  ['workItems', 'Cómo trabajo', '⚙'],
]

const backToSite = (e) => {
  e.preventDefault()
  window.location.assign(window.location.pathname.replace(/\/(bo|backoffice)\/?$/, '/') + window.location.search)
}

function Login({ error, onLogin }) {
  return (
    <Center mih="100vh" p="md">
      <Paper withBorder shadow="md" p="xl" w={360} maw="100%">
        <Stack align="center">
          <Title order={2}>Backoffice</Title>
          <Text c="dimmed" size="sm" ta="center">Entrá con una cuenta de Google autorizada.</Text>
          <Button fullWidth onClick={onLogin}>Entrar con Google</Button>
          {error && <Alert color="red" w="100%">{error}</Alert>}
          <Anchor href="./" size="sm" c="dimmed" onClick={backToSite}>← Volver al portfolio</Anchor>
        </Stack>
      </Paper>
    </Center>
  )
}

function Shell({ user }) {
  const [tab, setTab] = useState('projects')
  const [opened, { toggle, close }] = useDisclosure()
  return (
    <AppShell
      header={{ height: 56 }} padding="md"
      navbar={{ width: 220, breakpoint: 'sm', collapsed: { mobile: !opened } }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" aria-label="Menú" />
            <Title order={4}>Backoffice</Title>
          </Group>
          <Group gap="sm" wrap="nowrap">
            <Text size="sm" c="dimmed" visibleFrom="sm">{user.email}</Text>
            <Button variant="default" size="xs" onClick={() => signOut(auth)}>Salir</Button>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="xs">
        {TABS.map(([key, label, icon]) => (
          <NavLink
            key={key} label={label} leftSection={<span aria-hidden="true">{icon}</span>} active={tab === key}
            onClick={() => { setTab(key); close() }}
          />
        ))}
        <NavLink label="← Volver a la web" href="./" onClick={backToSite} mt="auto" />
      </AppShell.Navbar>
      <AppShell.Main>
        <div style={{ maxWidth: 860 }}>
          {tab === 'sections' ? <SectionsPage /> : <ListPage key={tab} name={tab} />}
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
        <Shell user={user} />
      ) : (
        <Login error={error} onLogin={login} />
      )}
    </MantineProvider>
  )
}
