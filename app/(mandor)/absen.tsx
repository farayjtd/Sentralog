import AbsenPage from '../../components/AbsenPage'
import MandorSidebar from '../../components/MandorSidebar'

export default function MandorAbsen() {
  return (
    <AbsenPage
      roleName="Mandor"
      role="mandor"
      color="#dc2626"
      locationRule="lapangan_only"
      SidebarComponent={MandorSidebar}
      headerTitle="Absensi"
    />
  )
}