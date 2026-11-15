import { Alert, Anchor, Button, Center, Paper, Stack, Text, Title } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'
import type { MouseEvent } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { siteHref } from '@/lib/basePath'
import { ICON } from '@/lib/icons'

const backToSite = (e: MouseEvent): void => {
  e.preventDefault()
  window.location.assign(siteHref())
}

export default function LoginPage() {
  const { error, login } = useAdminAuth()
  return (
    <Center mih="100vh" p="md">
      <Paper withBorder p="xl" w={360} maw="100%">
        <Stack align="center">
          <Title order={2}>Backoffice</Title>
          <Text c="dimmed" size="sm" ta="center">Entrá con una cuenta de Google autorizada</Text>
          <Button fullWidth onClick={() => void login()}>Entrar con Google</Button>
          {error && <Alert color="red" w="100%">{error}</Alert>}
          <Anchor href={siteHref()} size="sm" c="dimmed" onClick={backToSite} className="bo-back">
            <ArrowLeft {...ICON} /> Volver al portfolio
          </Anchor>
        </Stack>
      </Paper>
    </Center>
  )
}
