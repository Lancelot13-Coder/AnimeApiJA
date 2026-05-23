import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={styles.title}>Personaje no encontrado</Text>
      <Text style={styles.sub}>Volviendo al inicio...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#0d0d1a',
    alignItems: 'center', justifyContent: 'center',
  },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  sub:   { color: '#888', fontSize: 14, marginTop: 8 },
});