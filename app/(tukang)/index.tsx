import AbsenDashboard from '../../components/AbsenDashboard'
import TukangSidebar from '../../components/TukangSidebar'

export default function TukangDashboard() {
  return (
    <AbsenDashboard
      roleName="Tukang"
      color="#37474f"
      absenRoute="/(tukang)/absen"
      SidebarComponent={TukangSidebar}
    />
  )
}