import AbsenPage from '../../components/AbsenPage'
import TeknikSipilSidebar from '../../components/TeknikSipilSidebar'

export default function TeknikSipilAbsen() {
  return (
    <AbsenPage
      roleName="Teknik Sipil"
      role="teknik_sipil"
      color="#1d4ed8"
      locationRule="free"
      SidebarComponent={TeknikSipilSidebar}
      headerTitle="Absensi"
    />
  )
}