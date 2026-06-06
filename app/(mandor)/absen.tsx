import AbsenPage from '../../components/AbsenPage'
import MandorSidebar from '../../components/MandorSidebar'

export default function MandorAbsen() {
  return (
    <AbsenPage
      roleName="Mandor"
      color="#c62828"
      locationRule="lapangan_only"
      SidebarComponent={MandorSidebar}
      headerTitle="Absensi"
    />
  )
}