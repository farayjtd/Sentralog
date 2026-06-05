import AbsenForm from '../../components/AbsenForm'

export default function TukangAbsen() {
  return (
    <AbsenForm
      roleName="Tukang"
      color="#37474f"
      backRoute="/(tukang)"
      requireGeofencing={true}
    />
  )
}