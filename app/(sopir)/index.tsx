import AbsenDashboard from '../../components/AbsenDashboard'
import SopirSidebar from '../../components/SopirSidebar'

export default function SopirDashboard() {
  return (
    <AbsenDashboard
      roleName="Sopir"
      color="#e65100"
      absenRoute="/(sopir)/absen"
      SidebarComponent={SopirSidebar}
    />
  )
}