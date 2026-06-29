import AbsenPage from '../../components/AbsenPage'
import SopirSidebar from '../../components/SopirSidebar'

export default function SopirAbsen() {
  return (
    <AbsenPage
      roleName="Sopir"
      role="sopir"
      color="#ea580c"
      locationRule="wh_only"
      SidebarComponent={SopirSidebar}
      headerTitle="Absensi"
    />
  )
}