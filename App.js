import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'; // Updated Import
import { ShieldAlert, Thermometer, Server, ChevronLeft, Activity } from 'lucide-react-native';

const SERVICES = [
  { name: 'Proxmox VE', url: `https://${process.env.EXPO_PUBLIC_PROXMOX_IP}:8006` }, 
  { name: 'Sonarr (Servarr)', url: `http://${process.env.EXPO_PUBLIC_SONARR_IP}:8989` },
  { name: 'Immich Photos', url: `http://${process.env.EXPO_PUBLIC_IMMICH_IP}:2283` },
  { name: 'Home Assistant', url: `http://${process.env.EXPO_PUBLIC_HASS_IP}:8123` }
];

export default function App() {
  return (
    <SafeAreaProvider>
      <MainDashboard />
    </SafeAreaProvider>
  );
}

function MainDashboard() {
  const [viewingUrl, setViewingUrl] = useState(null);
  const [stats, setStats] = useState({ temp: '--', security_breaks: 0 });

  useEffect(() => {
    const fetchVitals = async () => {
      try {
        const res = await fetch(process.env.EXPO_PUBLIC_STATS_API_URL);
        const data = await res.json();
        setStats(data);
      } catch (e) {
        console.log("Node stats unreachable.");
      }
    };
    fetchVitals();
    const timer = setInterval(fetchVitals, 10000);
    return () => clearInterval(timer);
  }, []);

  if (viewingUrl) {
    return (
      <SafeAreaView style={styles.webContainer} edges={['top', 'bottom']}>
        <TouchableOpacity style={styles.backBar} onPress={() => setViewingUrl(null)}>
          <ChevronLeft color="white" size={24} />
          <Text style={styles.backText}>Dashboard</Text>
        </TouchableOpacity>
        <WebView 
          source={{ uri: viewingUrl }} 
          style={{ flex: 1 }}
          allowsBackForwardNavigationGestures
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Node Commander</Text>

        <View style={styles.vitalsRow}>
          <View style={styles.vitalCard}>
            <Thermometer color="#ff4444" size={24} />
            <Text style={styles.vitalNum}>{stats.temp}</Text>
            <Text style={styles.vitalLabel}>CPU TEMPERATURE</Text>
          </View>
          <View style={styles.vitalCard}>
            <ShieldAlert color={stats.security_breaks > 0 ? "#fbbf24" : "#4ade80"} size={24} />
            <Text style={styles.vitalNum}>{stats.security_breaks}</Text>
            <Text style={styles.vitalLabel}>AUTH FAILURES</Text>
          </View>
        </View>

        <Text style={styles.subhead}>Network Services</Text>
        {SERVICES.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.serviceBtn} 
            onPress={() => setViewingUrl(item.url)}
          >
            <View style={styles.serviceIconWrapper}>
              <Server color="#fff" size={20} />
            </View>
            <Text style={styles.serviceText}>{item.name}</Text>
            <Activity color="#333" size={16} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { padding: 20 },
  webContainer: { flex: 1, backgroundColor: '#111' },
  title: { color: '#fff', fontSize: 32, fontWeight: '900', marginVertical: 20 },
  vitalsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 35 },
  vitalCard: { backgroundColor: '#111', width: '48%', padding: 20, borderRadius: 24 },
  vitalNum: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginVertical: 8 },
  vitalLabel: { color: '#555', fontSize: 10, fontWeight: '800' },
  subhead: { color: '#444', fontSize: 13, fontWeight: '900', marginBottom: 15, textTransform: 'uppercase' },
  serviceBtn: { backgroundColor: '#111', padding: 18, borderRadius: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  serviceIconWrapper: { backgroundColor: '#222', padding: 10, borderRadius: 12, marginRight: 15 },
  serviceText: { color: '#eee', flex: 1, fontSize: 17, fontWeight: '600' },
  backBar: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#111' },
  backText: { color: 'white', fontWeight: '700', marginLeft: 10, fontSize: 16 }
});