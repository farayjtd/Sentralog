import AbsenPage from '../../components/AbsenPage'
import TukangSidebar from '../../components/TukangSidebar'

export default function TukangAbsen() {
  return (
    <AbsenPage
      roleName="Tukang"
      role="tukang"
      color="#475569"
      locationRule="both"
      SidebarComponent={TukangSidebar}
      headerTitle="Absensi"
    />
  )
}