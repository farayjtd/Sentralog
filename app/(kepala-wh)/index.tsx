import AbsenDashboard from '../../components/AbsenDashboard'
import KepalaWHSidebar from '../../components/KepalaWHSidebar'

export default function KepalaWHDashboard() {
  return (
    <AbsenDashboard
      roleName="Kepala Warehouse"
      color="#6a1b9a"
      absenRoute="/(kepala-wh)/absen"
      SidebarComponent={KepalaWHSidebar}
    />
  )
}