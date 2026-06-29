import AppShell from '../../components/AppShell'
import DataList from '../../components/DataList'
import { supabase } from '../../lib/supabase'
import { ROLE_LABEL } from '../../lib/status'

const ACCENT = '#047857'

export default function CekPegawai() {
  interface U { id: string; full_name: string; username: string; email: string; role: string; is_active: boolean }
  const fetcher = async (): Promise<U[]> => {
    const { data } = await supabase.from('users').select('*').neq('role', 'admin').neq('role', 'owner').order('full_name')
    return data ?? []
  }
  return (
    <AppShell role="owner" title="Pegawai" subtitle="Seluruh staf operasional.">
      <DataList<U>
        accent={ACCENT}
        icon="person-outline"
        countNoun="pegawai"
        fetcher={fetcher}
        titleOf={(u) => u.full_name}
        subtitleOf={(u) => ROLE_LABEL[u.role] ?? u.role}
        badgeOf={(u) => u.is_active ? { text: 'Aktif', color: '#059669', bg: '#ecfdf5' } : { text: 'Nonaktif', color: '#dc2626', bg: '#fef2f2' }}
        columns={[
          { label: 'Username', render: (u) => u.username },
          { label: 'Email', render: (u) => u.email },
        ]}
        emptyTitle="Belum ada pegawai"
        emptyIcon="people-outline"
      />
    </AppShell>
  )
}
