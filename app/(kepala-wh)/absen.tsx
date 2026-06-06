import AbsenPage from '../../components/AbsenPage'
import KepalaWHSidebar from '../../components/KepalaWHSidebar'

export default function KepalaWHAbsen() {
  return (
    <AbsenPage
      roleName="Kepala WH"
      color="#6a1b9a"
      locationRule="wh_only"
      SidebarComponent={KepalaWHSidebar}
      headerTitle="Absensi"
    />
  )
}