import { AnimeProvider } from '@/context/AnimeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';


function NavGuard() {

  const { user, loading } = useAuth();
  const segments  = useSegments();
  const router    = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === ('(auth)' as any);

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login' as any);
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)/' as any);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0d0d1a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#e74c3c" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AnimeProvider>
        <NavGuard />
      </AnimeProvider>
    </AuthProvider>
  );
}
