import AbsenDashboard from '../../components/AbsenDashboard'
import MandorSidebar from '../../components/MandorSidebar'

export default function MandorDashboard() {
  return (
    <AbsenDashboard
      roleName="Mandor"
      color="#c62828"
      absenRoute="/(mandor)/absen"
      SidebarComponent={MandorSidebar}
    />
  )
}