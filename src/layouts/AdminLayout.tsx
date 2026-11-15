import { AppShell, Burger, Button, Group, Menu, NavLink, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { ArrowLeft, ChevronDown, LogOut, UserRound } from 'lucide-react'
import { Outlet, useNavigate, useParams } from 'react-router'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useUnsaved } from '@/hooks/useUnsaved'
import { adminPath } from '@/lib/adminPaths'
import { hrefFor, siteHref } from '@/lib/basePath'
import { ICON, ICON_SM } from '@/lib/icons'
import { ADMIN_TABS } from './adminTabs'

export default function AdminLayout() {
  const { user, logout } = useAdminAuth()
  const { page, id } = useParams()
  const navigate = useNavigate()
  const [opened, { toggle, close }] = useDisclosure()
  const { guard } = useUnsaved()
  if (!user) return null
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
                  leftSection={<UserRound {...ICON} />} rightSection={<ChevronDown {...ICON_SM} />}
                >
                  <span className="bo-account-name">{name}</span>
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Sesión iniciada con</Menu.Label>
                <Text size="xs" c="dimmed" px="sm" pb="xs" truncate>{user.email}</Text>
                <Menu.Divider />
                <Menu.Item color="negative" leftSection={<LogOut {...ICON} />} onClick={() => guard(() => { void logout() })}>Cerrar sesión</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="sm" className="bo-nav">
        {ADMIN_TABS.map(({ key, label, icon, slug }) => (
          <NavLink
            key={key} label={label} leftSection={icon} active={page === slug} href={hrefFor(adminPath(slug))}
            onClick={(e) => {
              e.preventDefault()
              if (page !== slug || id) guard(() => { void navigate(adminPath(slug)); window.scrollTo(0, 0); close() })
              else close()
            }}
          />
        ))}
        <NavLink
          label="Volver a la web" leftSection={<ArrowLeft {...ICON} />} href={siteHref()} mt="auto"
          onClick={(e) => { e.preventDefault(); guard(() => window.location.assign(siteHref())) }}
        />
      </AppShell.Navbar>
      <AppShell.Main>
        <div>
          <Outlet />
        </div>
      </AppShell.Main>
    </AppShell>
  )
}
