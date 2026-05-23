import { AnimeContext } from '@/context/AnimeContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Image, Modal, Platform,
  Pressable, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';

type Personaje = {
  id: number;
  nombre: string;
  edad: string;
  poder: string;
  imagen1: string;
  imagen2: string;
  imagen3: string;
  imagen4: string;
};

type Categoria = {
  id: number;
  nombre: string;
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

export default function CategoriaDetalleScreen() {
  const { id }   = useLocalSearchParams();
  const { user } = useAuth();
  const router   = useRouter();
  const { setUltimoCategoria } = useContext(AnimeContext);

  const [categoria,             setCategoria]             = useState<Categoria | null>(null);
  const [personajes,            setPersonajes]            = useState<Personaje[]>([]);
  const [loading,               setLoading]               = useState(false);
  const [busqueda,              setBusqueda]              = useState('');
  const [personajeEncontrado,   setPersonajeEncontrado]   = useState<Personaje | null>(null);
  const [errorBusqueda,         setErrorBusqueda]         = useState('');
  const [modalImg,              setModalImg]              = useState(false);
  const [modalLista,            setModalLista]            = useState(false);
  const [personajeSeleccionado, setPersonajeSeleccionado] = useState<Personaje | null>(null);

  const cargar = async () => {
    setLoading(true);
    const { data: cat } = await supabase
      .from('categorias')
      .select('*')
      .eq('id', id)
      .single();
    setCategoria(cat);

    const { data: pers } = await supabase
      .from('personajes_usuario')
      .select('*')
      .eq('categoria_id', id)
      .order('created_at', { ascending: true });
    setPersonajes(pers ?? []);
    setLoading(false);
  };

  // ── UN SOLO useFocusEffect que limpia y recarga ──
  useFocusEffect(useCallback(() => {
    cargar();
    setPersonajeEncontrado(null);
    setBusqueda('');
    setErrorBusqueda('');
  }, [id]));

  // ── Buscar ──────────────────────────────────────────────
  const buscar = async () => {
    if (!busqueda.trim()) return;
    setErrorBusqueda('');
    setPersonajeEncontrado(null);

    // Busca directo en Supabase para tener datos frescos
    const { data } = await supabase
      .from('personajes_usuario')
      .select('*')
      .eq('categoria_id', id)
      .ilike('nombre', busqueda.trim());

    if (!data || data.length === 0) {
      setErrorBusqueda('Personaje no encontrado en este anime.');
      return;
    }

    const encontrado = data[0];
    setPersonajeEncontrado(encontrado);

    if (categoria) {
      setUltimoCategoria({
        ...encontrado,
        categoria_id:     categoria.id,
        categoria_nombre: categoria.nombre,
        categoria_color:  categoria.color,
        categoria_emoji:  categoria.emoji,
        anime:            categoria.nombre,
      });
    }
  };

  // ── Eliminar ────────────────────────────────────────────
  const eliminarPersonaje = (p: Personaje) => {
    confirmar(
      'Eliminar personaje',
      `¿Eliminar a "${p.nombre}"?`,
      async () => {
        setModalLista(false);

            const { error } = await supabase
              .from('personajes_usuario')
              .delete()
              .eq('id', p.id);

            if (error) {
              Alert.alert('Error', error.message);
              return;
            }

            // Limpia si era el que estaba en pantalla
            if (personajeEncontrado?.id === p.id) {
              setPersonajeEncontrado(null);
              setBusqueda('');
            }

            await cargar();
            Alert.alert('✅', `${p.nombre} eliminado correctamente.`);
          }
    );
  };

  // ── Editar — usa router.push con params object ──────────
  const irAEditar = (p: Personaje) => {
    setModalLista(false);
    setModalImg(false);

    router.push({
      pathname: '/(tabs)/categoria/personaje/crear' as any,
      params: {
        categoria_id: String(id),
        color:        encodeURIComponent(categoria?.color ?? '#6366f1'),
        pid:          String(p.id),
      },
    });
  };

  const verImagenes = (p: Personaje) => {
    setPersonajeSeleccionado(p);
    setModalImg(true);
  };

  const imagenes = personajeSeleccionado
    ? [personajeSeleccionado.imagen1, personajeSeleccionado.imagen2,
       personajeSeleccionado.imagen3, personajeSeleccionado.imagen4].filter(Boolean)
    : [];

  const color = categoria?.color ?? '#6366f1';

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

      {categoria && (
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>{categoria.emoji}</Text>
          <Text style={[styles.headerNombre, { color }]}>{categoria.nombre.toUpperCase()}</Text>
          <Text style={styles.headerSub}>Busca un personaje</Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Nombre del personaje..."
        placeholderTextColor="#555"
        value={busqueda}
        onChangeText={setBusqueda}
        autoCapitalize="none"
        onSubmitEditing={buscar}
      />

      <View style={styles.botonesRow}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: color }]} onPress={buscar}>
          <Text style={styles.btnText}>🔍 Buscar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#1a6bd4' }]}
          onPress={() => { cargar(); setModalLista(true); }}
        >
          <Text style={styles.btnText}>📋 Consultar lista</Text>
        </TouchableOpacity>
      </View>

      {!!errorBusqueda && <Text style={styles.errorText}>{errorBusqueda}</Text>}
      {loading && <ActivityIndicator color={color} style={{ marginTop: 20 }} />}

      {/* Card personaje encontrado */}
      {personajeEncontrado && !loading && (
        <View style={[styles.card, { borderColor: color }]}>
          {personajeEncontrado.imagen1 ? (
            <Image source={{ uri: personajeEncontrado.imagen1 }}
              style={[styles.avatar, { borderColor: color }]} />
          ) : (
            <View style={[styles.avatarPlaceholder, { borderColor: color }]}>
              <Text style={{ fontSize: 36 }}>👤</Text>
            </View>
          )}

          <View style={styles.infoBox}>
            <Text style={styles.cardNombre}>{personajeEncontrado.nombre}</Text>
            {!!personajeEncontrado.edad &&
              <Text style={styles.cardDato}>🎂 Edad: <Text style={styles.cardVal}>{personajeEncontrado.edad}</Text></Text>}
            {!!personajeEncontrado.poder &&
              <Text style={styles.cardDato}>⚡ Poder: <Text style={styles.cardVal}>{personajeEncontrado.poder}</Text></Text>}
          </View>

          <Text style={styles.imgContador}>
            🖼️ {[personajeEncontrado.imagen1, personajeEncontrado.imagen2,
                  personajeEncontrado.imagen3, personajeEncontrado.imagen4].filter(Boolean).length} imágenes recuperadas
          </Text>

          <TouchableOpacity
            style={[styles.btnVerImg, { backgroundColor: '#1a6bd4' }]}
            onPress={() => verImagenes(personajeEncontrado)}
          >
            <Text style={styles.btnText}>Ver imágenes</Text>
          </TouchableOpacity>

          <View style={styles.cardAcciones}>
            <TouchableOpacity
              style={styles.btnEditar}
              onPress={() => irAEditar(personajeEncontrado)}
            >
              <Text style={styles.btnAccionText}>✏️ Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnEliminarCard}
              onPress={() => eliminarPersonaje(personajeEncontrado)}
            >
              <Text style={styles.btnAccionText}>🗑️ Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Botón agregar */}
      <TouchableOpacity
        style={[styles.btnAgregar, { backgroundColor: color },
          personajes.length >= 10 && styles.btnDisabled]}
        onPress={() => {
          if (personajes.length >= 10) {
            Alert.alert('Límite', 'Solo puedes tener 10 personajes por anime.');
            return;
          }
          router.push({
            pathname: '/(tabs)/categoria/personaje/crear' as any,
            params: { categoria_id: String(id), color: encodeURIComponent(color) },
          });
        }}
      >
        <Text style={styles.btnText}>
          {personajes.length >= 10 ? '🚫 Límite alcanzado (10/10)' : '＋ Agregar personaje'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.contadorText}>{personajes.length}/10 personajes</Text>

      {/* Modal Imágenes */}
      <Modal animationType="slide" transparent visible={modalImg} onRequestClose={() => setModalImg(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>🖼️ {personajeSeleccionado?.nombre}</Text>
            <Text style={styles.modalSub}>{imagenes.length} imágenes</Text>
            <View style={styles.modalGrid}>
              {imagenes.map((uri, i) => (
                <View key={i} style={styles.modalImgBox}>
                  <Image source={{ uri }} style={[styles.modalSprite, { borderColor: color }]} resizeMode="cover" />
                  <Text style={styles.modalImgLabel}>Imagen {i + 1}</Text>
                </View>
              ))}
            </View>
            <Pressable style={[styles.btnCerrar, { backgroundColor: color }]} onPress={() => setModalImg(false)}>
              <Text style={styles.btnCerrarText}>✕ Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal Lista */}
      <Modal animationType="slide" transparent visible={modalLista} onRequestClose={() => setModalLista(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>📋 {categoria?.nombre} — personajes</Text>
            <Text style={styles.modalSub}>{personajes.length} personajes</Text>
            <FlatList
              data={personajes}
              keyExtractor={item => String(item.id)}
              style={{ maxHeight: 380 }}
              renderItem={({ item }) => (
                <View style={styles.listaItem}>
                  {item.imagen1
                    ? <Image source={{ uri: item.imagen1 }} style={styles.listaImg} />
                    : <View style={[styles.listaImg, { backgroundColor: '#2d2d4e', alignItems: 'center', justifyContent: 'center' }]}>
                        <Text>👤</Text>
                      </View>
                  }
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listaNombre}>{item.nombre}</Text>
                    {!!item.edad  && <Text style={styles.listaInfo}>Edad: {item.edad}</Text>}
                    {!!item.poder && <Text style={styles.listaInfo}>Poder: {item.poder}</Text>}
                  </View>
                  <TouchableOpacity
                    style={styles.listaBtnEditar}
                    onPress={() => irAEditar(item)}
                  >
                    <Text style={{ fontSize: 16 }}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.listaBtnEliminar}
                    onPress={() => eliminarPersonaje(item)}
                  >
                    <Text style={{ fontSize: 16 }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            <Pressable style={[styles.btnCerrar, { backgroundColor: '#1a6bd4' }]} onPress={() => setModalLista(false)}>
              <Text style={styles.btnCerrarText}>✕ Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:             { flex: 1, backgroundColor: '#0d0d1a' },
  container:          { padding: 24, paddingBottom: 40 },
  header:             { alignItems: 'center', marginBottom: 20 },
  headerEmoji:        { fontSize: 44, marginBottom: 4 },
  headerNombre:       { fontSize: 26, fontWeight: 'bold', letterSpacing: 3 },
  headerSub:          { color: '#888', fontSize: 13, marginTop: 4 },
  input:              { backgroundColor: '#111', color: '#fff', padding: 13, borderRadius: 12, borderWidth: 1, borderColor: '#2d2d4e', fontSize: 15, marginBottom: 10 },
  botonesRow:         { flexDirection: 'row', gap: 10, marginBottom: 12 },
  btn:                { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  btnText:            { color: '#fff', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  errorText:          { color: '#e74c3c', textAlign: 'center', marginBottom: 8 },
  card:               { backgroundColor: '#1a1a2e', borderRadius: 20, borderWidth: 2, padding: 20, alignItems: 'center', gap: 8, marginBottom: 16 },
  avatar:             { width: 110, height: 110, borderRadius: 55, borderWidth: 2 },
  avatarPlaceholder:  { width: 110, height: 110, borderRadius: 55, borderWidth: 2, backgroundColor: '#2d2d4e', alignItems: 'center', justifyContent: 'center' },
  infoBox:            { width: '100%', gap: 4 },
  cardNombre:         { color: '#fff', fontWeight: 'bold', fontSize: 20, textAlign: 'center' },
  cardDato:           { color: '#aaa', fontSize: 13 },
  cardVal:            { color: '#fff', fontWeight: 'bold' },
  imgContador:        { color: '#aaa', fontSize: 13 },
  btnVerImg:          { width: '100%', padding: 12, borderRadius: 12, alignItems: 'center' },
  cardAcciones:       { flexDirection: 'row', gap: 10, width: '100%' },
  btnEditar:          { flex: 1, backgroundColor: '#2d2d4e', padding: 10, borderRadius: 10, alignItems: 'center' },
  btnEliminarCard:    { flex: 1, backgroundColor: '#2d2d4e', padding: 10, borderRadius: 10, alignItems: 'center' },
  btnAccionText:      { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  btnAgregar:         { padding: 13, borderRadius: 12, alignItems: 'center', marginBottom: 6 },
  btnDisabled:        { opacity: 0.5 },
  contadorText:       { color: '#666', fontSize: 12, textAlign: 'center', marginBottom: 8 },
  modalOverlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'flex-end' },
  modalContainer:     { backgroundColor: '#1a1a2e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalTitle:         { color: '#fff', fontSize: 17, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  modalSub:           { color: '#888', fontSize: 12, textAlign: 'center', marginBottom: 16 },
  modalGrid:          { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, paddingBottom: 16 },
  modalImgBox:        { alignItems: 'center', width: 120 },
  modalSprite:        { width: 110, height: 110, borderRadius: 55, borderWidth: 2 },
  modalImgLabel:      { color: '#aaa', fontSize: 11, marginTop: 6 },
  btnCerrar:          { padding: 13, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnCerrarText:      { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  listaItem:          { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2d2d4e' },
  listaImg:           { width: 50, height: 50, borderRadius: 25 },
  listaNombre:        { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  listaInfo:          { color: '#888', fontSize: 12 },
  listaBtnEditar:     { backgroundColor: '#2d2d4e', padding: 8, borderRadius: 8, marginLeft: 4 },
  listaBtnEliminar:   { backgroundColor: '#2d2d4e', padding: 8, borderRadius: 8, marginLeft: 4 },
});