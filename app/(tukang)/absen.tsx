import AbsenPage from '../../components/AbsenPage'
import TukangSidebar from '../../components/TukangSidebar'

export default function TukangAbsen() {
  return (
    <AbsenPage
      roleName="Tukang"
      color="#37474f"
      locationRule="both"
      SidebarComponent={TukangSidebar}
      headerTitle="Absensi"
    />
  )
}