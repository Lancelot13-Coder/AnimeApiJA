import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator, Alert, Platform, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';

type Categoria = {
  id: number;
  nombre: string;
  descripcion: string;
  color: string;
  emoji: string;
};

function confirmar(titulo: string, mensaje: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    const ok = window.confirm(`${titulo}\n\n${mensaje}`);
    if (ok) onConfirm();
  } else {
    Alert.alert(titulo, mensaje, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: onConfirm },
    ]);
  }
}

export default function CategoriasScreen() {
  const { user } = useAuth();
  const router   = useRouter();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading,    setLoading]    = useState(false);

  const cargar = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('categorias')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setCategorias(data ?? []);
    setLoading(false);
  };

  // Recarga cada vez que el usuario vuelve a esta pantalla
  useFocusEffect(useCallback(() => { cargar(); }, []));

  const eliminar = (cat: Categoria) => {
    confirmar(
      'Eliminar anime',
      `¿Eliminar "${cat.nombre}" y todos sus personajes?`,
      async () => {
            await supabase.from('categorias').delete().eq('id', cat.id);
            cargar();
          }
    );
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

      <Text style={styles.title}>🎬 MIS ANIMES</Text>
      <Text style={styles.subtitle}>Tus categorías personalizadas</Text>

      {/* Botón crear */}
      <TouchableOpacity
        style={styles.btnCrear}
        onPress={() => router.push('/(tabs)/categoria/crear' as any)}
      >
        <Text style={styles.btnCrearText}>＋ Crear nuevo anime</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator color="#6366f1" style={{ marginTop: 24 }} />}

      {!loading && categorias.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyText}>
            Aún no has creado ningún anime.{'\n'}
            ¡Crea tu primera categoría!
          </Text>
        </View>
      )}

      {/* Lista de animes */}
      {categorias.map(cat => (
        <View key={cat.id} style={[styles.card, { borderColor: cat.color }]}>

          <View style={styles.cardHeader}>
            <Text style={styles.cardEmoji}>{cat.emoji}</Text>
            <View style={styles.cardInfo}>
              <Text style={styles.cardNombre}>{cat.nombre}</Text>
              {!!cat.descripcion && (
                <Text style={styles.cardDesc}>{cat.descripcion}</Text>
              )}
            </View>
          </View>

          <View style={styles.cardBtns}>
            <TouchableOpacity
              style={[styles.btnVer, { backgroundColor: cat.color }]}
              onPress={() => router.push(`/(tabs)/categoria/${cat.id}` as any)}
            >
              <Text style={styles.btnVerText}>👁️ Ver personajes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnEditar}
              onPress={() => router.push(`/(tabs)/categoria/crear?id=${cat.id}&nombre=${cat.nombre}&descripcion=${cat.descripcion}&color=${encodeURIComponent(cat.color)}&emoji=${cat.emoji}` as any)}
            >
              <Text style={styles.btnEditarText}>✏️</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnEliminar}
              onPress={() => eliminar(cat)}
            >
              <Text style={styles.btnEliminarText}>🗑️</Text>
            </TouchableOpacity>
          </View>

        </View>
      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:          { flex: 1, backgroundColor: '#0d0d1a' },
  container:       { padding: 24, paddingBottom: 40 },
  title:           { fontSize: 28, color: '#fff', fontWeight: 'bold', textAlign: 'center', letterSpacing: 3, marginBottom: 4 },
  subtitle:        { color: '#888', textAlign: 'center', fontSize: 13, marginBottom: 20 },
  btnCrear:        { backgroundColor: '#6366f1', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  btnCrearText:    { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  emptyBox:        { alignItems: 'center', marginTop: 40, gap: 12 },
  emptyEmoji:      { fontSize: 48 },
  emptyText:       { color: '#666', textAlign: 'center', lineHeight: 22 },
  card:            { backgroundColor: '#1a1a2e', borderRadius: 20, borderWidth: 2, padding: 16, marginBottom: 14 },
  cardHeader:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  cardEmoji:       { fontSize: 32 },
  cardInfo:        { flex: 1 },
  cardNombre:      { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  cardDesc:        { color: '#888', fontSize: 12, marginTop: 2 },
  cardBtns:        { flexDirection: 'row', gap: 8 },
  btnVer:          { flex: 1, padding: 10, borderRadius: 10, alignItems: 'center' },
  btnVerText:      { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  btnEditar:       { backgroundColor: '#2d2d4e', padding: 10, borderRadius: 10, alignItems: 'center', width: 44 },
  btnEditarText:   { fontSize: 16 },
  btnEliminar:     { backgroundColor: '#2d2d4e', padding: 10, borderRadius: 10, alignItems: 'center', width: 44 },
  btnEliminarText: { fontSize: 16 },
});