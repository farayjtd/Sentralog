import AbsenPage from '../../components/AbsenPage'
import TeknikSipilSidebar from '../../components/TeknikSipilSidebar'

export default function TeknikSipilAbsen() {
  return (
    <AbsenPage
      roleName="Teknik Sipil"
      color="#1565c0"
      locationRule="free"
      SidebarComponent={TeknikSipilSidebar}
      headerTitle="Absensi"
    />
  )
}