import AbsenPage from '../../components/AbsenPage'
import SopirSidebar from '../../components/SopirSidebar'

export default function SopirAbsen() {
  return (
    <AbsenPage
      roleName="Sopir"
      color="#e65100"
      locationRule="wh_only"
      SidebarComponent={SopirSidebar}
      headerTitle="Absensi"
    />
  )
}