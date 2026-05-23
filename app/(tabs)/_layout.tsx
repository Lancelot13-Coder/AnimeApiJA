import { useAuth } from '@/context/AuthContext';
import { Tabs } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';

export default function TabsLayout() {
  const { signOut } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: '#0d0d1a', borderTopColor: '#2d2d4e' },
        tabBarActiveTintColor:   '#fff',
        tabBarInactiveTintColor: '#555',
        headerStyle:      { backgroundColor: '#0d0d1a' },
        headerTintColor:  '#fff',
        headerRight: () => (
          <TouchableOpacity onPress={signOut} style={{ marginRight: 16 }}>
            <Text style={{ color: '#e74c3c', fontSize: 13, fontWeight: 'bold' }}>
              Cerrar sesión
            </Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen name="index"       options={{ title: 'Chainsaw Man', tabBarLabel: 'Chainsaw', tabBarIcon: ({ focused }) => <Text style={{ fontSize: 18 }}>{focused ? '🪚' : '🔪'}</Text> }} />
      <Tabs.Screen name="dandadan"    options={{ title: 'Dan Da Dan',   tabBarLabel: 'Dan Da Dan', tabBarIcon: ({ focused }) => <Text style={{ fontSize: 18 }}>{focused ? '👻' : '🛸'}</Text> }} />
      <Tabs.Screen name="castlevania" options={{ title: 'Castlevania',  tabBarLabel: 'Castlevania', tabBarIcon: ({ focused }) => <Text style={{ fontSize: 18 }}>{focused ? '🧛' : '🏰'}</Text> }} />
      <Tabs.Screen
  name="categorias"
  options={{
    title: 'Mis Animes',
    tabBarLabel: 'Categorías',
    tabBarIcon: ({ focused }) => (
      <Text style={{ fontSize: 18 }}>{focused ? '🎬' : '📁'}</Text>
    ),
  }}
/>

<Tabs.Screen name="categoria/[id]"         options={{ href: null }} />
<Tabs.Screen name="categoria/crear"        options={{ href: null }} />
<Tabs.Screen name="categoria/personaje/crear" options={{ href: null }} />
<Tabs.Screen name="categoria/personaje/[pid]"   options={{ href: null }} />
      <Tabs.Screen name="resumen"     options={{ title: 'Resumen',      tabBarLabel: 'Resumen', tabBarIcon: ({ focused }) => <Text style={{ fontSize: 18 }}>{focused ? '📋' : '📄'}</Text> }} />
    </Tabs>
  );
}