import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';

const COLORES = ['#e74c3c','#f59e0b','#8b5cf6','#6366f1','#10b981','#3b82f6','#ec4899','#14b8a6'];
const EMOJIS  = ['🎬','⚔️','🔥','👊','🌙','💀','🐉','🌸','🤖','👻','🧛','🪚','🛸','⚡','🎭'];

export default function CrearCategoriaScreen() {
  const { user }  = useAuth();
  const router    = useRouter();
  const params    = useLocalSearchParams();


  const editando  = !!params.id;
  const [nombre,      setNombre]      = useState((params.nombre as string) ?? '');
  const [descripcion, setDescripcion] = useState((params.descripcion as string) ?? '');
  const [color,       setColor]       = useState((params.color as string) ? decodeURIComponent(params.color as string) : '#6366f1');
  const [emoji,       setEmoji]       = useState((params.emoji as string) ?? '🎬');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  const guardar = async () => {
    if (!nombre.trim()) { setError('El nombre del anime es obligatorio.'); return; }
    setLoading(true); setError('');

    if (editando) {
      const { error: err } = await supabase
        .from('categorias')
        .update({ nombre: nombre.trim(), descripcion, color, emoji })
        .eq('id', params.id);
      if (err) { setError('Error al actualizar.'); setLoading(false); return; }
    } else {
      const { error: err } = await supabase
        .from('categorias')
        .insert({ user_id: user!.id, nombre: nombre.trim(), descripcion, color, emoji });
      if (err) {
        setError(err.message.includes('unique') ? 'Ya tienes un anime con ese nombre.' : 'Error al crear.');
        setLoading(false); return;
      }
    }

    setLoading(false);
    router.back();
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

      <Text style={styles.title}>{editando ? '✏️ Editar Anime' : '➕ Nuevo Anime'}</Text>

      {/* Nombre */}
      <Text style={styles.label}>Nombre del anime *</Text>
      <TextInput
        style={styles.input}
        placeholder="ej: Dragon Ball, Naruto..."
        placeholderTextColor="#555"
        value={nombre}
        onChangeText={setNombre}
        maxLength={50}
      />

      {/* Descripción */}
      <Text style={styles.label}>Descripción (opcional)</Text>
      <TextInput
        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
        placeholder="Breve descripción del anime..."
        placeholderTextColor="#555"
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        maxLength={150}
      />

      {/* Emoji */}
      <Text style={styles.label}>Elige un emoji</Text>
      <View style={styles.emojiGrid}>
        {EMOJIS.map(e => (
          <TouchableOpacity
            key={e}
            style={[styles.emojiBtn, emoji === e && { backgroundColor: color }]}
            onPress={() => setEmoji(e)}
          >
            <Text style={styles.emojiText}>{e}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Color */}
      <Text style={styles.label}>Elige un color</Text>
      <View style={styles.colorGrid}>
        {COLORES.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.colorBtn, { backgroundColor: c },
              color === c && styles.colorBtnSelected]}
            onPress={() => setColor(c)}
          />
        ))}
      </View>

      {/* Preview */}
      <View style={[styles.preview, { borderColor: color }]}>
        <Text style={styles.previewEmoji}>{emoji}</Text>
        <Text style={styles.previewNombre}>{nombre || 'Nombre del anime'}</Text>
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={[styles.btnGuardar, { backgroundColor: color }]}
        onPress={guardar}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnGuardarText}>{editando ? 'Guardar cambios' : 'Crear anime'}</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnCancelar} onPress={() => router.back()}>
        <Text style={styles.btnCancelarText}>Cancelar</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:            { flex: 1, backgroundColor: '#0d0d1a' },
  container:         { padding: 24, paddingBottom: 40 },
  title:             { fontSize: 24, color: '#fff', fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  label:             { color: '#aaa', fontSize: 13, fontWeight: 'bold', marginBottom: 6, marginTop: 14 },
  input:             { backgroundColor: '#1a1a2e', color: '#fff', padding: 13, borderRadius: 12, borderWidth: 1, borderColor: '#2d2d4e', fontSize: 15 },
  emojiGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiBtn:          { width: 44, height: 44, borderRadius: 10, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' },
  emojiText:         { fontSize: 22 },
  colorGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  colorBtn:          { width: 36, height: 36, borderRadius: 18 },
  colorBtnSelected:  { borderWidth: 3, borderColor: '#fff' },
  preview:           { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1a1a2e', borderRadius: 16, borderWidth: 2, padding: 16, marginTop: 20 },
  previewEmoji:      { fontSize: 32 },
  previewNombre:     { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  errorText:         { color: '#e74c3c', textAlign: 'center', marginTop: 12 },
  btnGuardar:        { padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnGuardarText:    { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnCancelar:       { padding: 13, borderRadius: 12, alignItems: 'center', marginTop: 10, backgroundColor: '#2d2d4e' },
  btnCancelarText:   { color: '#aaa', fontWeight: 'bold', fontSize: 14 },
});