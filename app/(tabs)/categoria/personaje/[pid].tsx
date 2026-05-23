import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function PersonajeRedirect() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    router.replace(`/(tabs)/categoria/${params.categoria_id}` as any);
  }, []);

  return null;
}