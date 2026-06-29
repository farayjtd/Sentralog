import AbsenPage from '../../components/AbsenPage'
import KepalaWHSidebar from '../../components/KepalaWHSidebar'

export default function KepalaWHAbsen() {
  return (
    <AbsenPage
      roleName="Kepala WH"
      role="kepala_wh"
      color="#7c3aed"
      locationRule="wh_only"
      SidebarComponent={KepalaWHSidebar}
      headerTitle="Absensi"
    />
  )
}