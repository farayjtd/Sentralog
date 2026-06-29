import { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native'

import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState({
    trucks: 0,
    drivers: 0,
    employees: 0,
    warehouses: 0,
    projects: 0,
    deliveries: 0,
  })

  const loadDashboard = async () => {
    try {
      setLoading(true)

      const [
        trucksRes,
        driversRes,
        employeesRes,
        warehousesRes,
        projectsRes,
        deliveriesRes,
      ] = await Promise.all([
        supabase.from('trucks').select('id'),

        supabase
          .from('users')
          .select('id')
          .eq('role', 'sopir'),

        supabase
          .from('users')
          .select('id')
          .neq('role', 'admin')
          .neq('role', 'owner'),

        supabase.from('warehouses').select('id'),

        supabase.from('projects').select('id'),

        supabase
          .from('deliveries')
          .select('id')
          .in('status', ['driver_acc', 'berangkat']),
      ])

      setStats({
        trucks: trucksRes.data?.length ?? 0,
        drivers: driversRes.data?.length ?? 0,
        employees: employeesRes.data?.length ?? 0,
        warehouses: warehousesRes.data?.length ?? 0,
        projects: projectsRes.data?.length ?? 0,
        deliveries: deliveriesRes.data?.length ?? 0,
      })
    } catch (err) {
      console.log('Dashboard Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1a1a2e"
      />

      <AdminHeader
        title="Dashboard"
        onToggleSidebar={() =>
          setSidebarOpen(!sidebarOpen)
        }
      />

      <View style={styles.body}>
        {sidebarOpen && <AdminSidebar />}

        <View style={styles.main}>
          <Text style={styles.title}>
            Dashboard Sentralog
          </Text>

          <Text style={styles.subtitle}>
            Ringkasan data operasional sistem
          </Text>

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator
                size="large"
                color="#4f46e5"
              />
            </View>
          ) : (
            <>
              <View style={styles.grid}>
                <View style={styles.card}>
                  <Text style={styles.cardValue}>
                    {stats.trucks}
                  </Text>
                  <Text style={styles.cardLabel}>
                    Total Truk
                  </Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardValue}>
                    {stats.drivers}
                  </Text>
                  <Text style={styles.cardLabel}>
                    Total Driver
                  </Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardValue}>
                    {stats.employees}
                  </Text>
                  <Text style={styles.cardLabel}>
                    Total Pegawai
                  </Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardValue}>
                    {stats.warehouses}
                  </Text>
                  <Text style={styles.cardLabel}>
                    Warehouse
                  </Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardValue}>
                    {stats.projects}
                  </Text>
                  <Text style={styles.cardLabel}>
                    Total Project
                  </Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardValue}>
                    {stats.deliveries}
                  </Text>
                  <Text style={styles.cardLabel}>
                    Pengiriman Aktif
                  </Text>
                </View>
              </View>

              <View style={styles.summary}>
                <Text style={styles.summaryTitle}>
                  Ringkasan Sistem
                </Text>

                <Text style={styles.summaryItem}>
                  🚚 Total Armada: {stats.trucks}
                </Text>

                <Text style={styles.summaryItem}>
                  👨‍✈️ Total Driver: {stats.drivers}
                </Text>

                <Text style={styles.summaryItem}>
                  👥 Total Pegawai: {stats.employees}
                </Text>

                <Text style={styles.summaryItem}>
                  🏭 Total Warehouse: {stats.warehouses}
                </Text>

                <Text style={styles.summaryItem}>
                  📋 Total Project: {stats.projects}
                </Text>

                <Text style={styles.summaryItem}>
                  📦 Pengiriman Aktif: {stats.deliveries}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },

  body: {
    flex: 1,
    flexDirection: 'row',
  },

  main: {
    flex: 1,
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
  },

  subtitle: {
    marginTop: 6,
    marginBottom: 24,
    fontSize: 15,
    color: '#64748b',
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },

  card: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  cardValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4f46e5',
  },

  cardLabel: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 14,
  },

  summary: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1a1a2e',
  },

  summaryItem: {
    marginBottom: 10,
    color: '#475569',
    fontSize: 15,
  },
})