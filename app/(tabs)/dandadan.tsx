import ImageViewer from '@/components/ImageViewer';
import { AnimeContext, Personaje } from '@/context/AnimeContext';
import React, { useContext, useState } from 'react';
import {
  ActivityIndicator, FlatList, Image, Modal,
  Pressable, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';

const API_URL = 'https://anime-api-oed5.onrender.com';
const ACCENT  = '#8b5cf6'; 

export default function DanDaDanScreen() {
  const { setUltimoDanDaDan } = useContext(AnimeContext);

  const [nombre,     setNombre]     = useState('');
  const [personaje,  setPersonaje]  = useState<Personaje | null>(null);
  const [lista,      setLista]      = useState<Personaje[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [modalImg,   setModalImg]   = useState(false);
  const [modalLista, setModalLista] = useState(false);

  const imagenes = personaje
    ? [personaje.imagen1, personaje.imagen2, personaje.imagen3, personaje.imagen4].filter(Boolean)
    : [];

  const buscar = async () => {
    if (!nombre.trim()) return;
    setLoading(true); setError(''); setPersonaje(null);
    try {
      const res = await fetch(`${API_URL}/dandadan/nombre/${encodeURIComponent(nombre.trim().toLowerCase())}`);
      if (res.status === 404) { setError('Personaje no encontrado en la base de datos.'); return; }
      if (!res.ok) { setError(`Error del servidor: ${res.status}`); return; }
      const data: Personaje = await res.json();
      setPersonaje(data);
      setUltimoDanDaDan(data);
    } catch { setError('No se pudo conectar con el servidor.'); }
    finally { setLoading(false); }
  };

  const cargarLista = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/dandadan`);
      if (!res.ok) { setError(`Error: ${res.status}`); return; }
      const data: Personaje[] = await res.json();
      setLista(data);
      setModalLista(true);
    } catch { setError('No se pudo cargar la lista.'); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

      <Text style={styles.title}>👻 DAN DA DAN</Text>
      <Text style={styles.subtitle}>Busca un personaje</Text>

      <TextInput
        style={styles.input}
        placeholder="ej: Okarun, Momo, Aira..."
        placeholderTextColor="#666"
        value={nombre}
        onChangeText={setNombre}
        autoCapitalize="none"
        onSubmitEditing={buscar}
      />

      <View style={styles.botonesRow}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: ACCENT }]} onPress={buscar} disabled={loading}>
          <Text style={styles.btnText}>🔍 Buscar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#1a6bd4' }]} onPress={cargarLista} disabled={loading}>
          <Text style={styles.btnText}>📋 Consultar Api Local</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color={ACCENT} style={{ marginTop: 20 }} />}
      {!!error  && <Text style={styles.errorText}>{error}</Text>}

      {personaje && !loading && (
        <View style={[styles.card, { borderColor: ACCENT }]}>
          <ImageViewer imgSource={personaje.imagen1} size={110} />
          <View style={styles.infoBox}>
            <Text style={styles.infoNombre}>{personaje.nombre}</Text>
            <Text style={styles.infoItem}>🎂 Edad: <Text style={styles.infoVal}>{personaje.edad}</Text></Text>
            <Text style={styles.infoItem}>⚡ Poder/Técnica: <Text style={styles.infoVal}>{personaje.poder}</Text></Text>
          </View>
          <Text style={styles.contadorText}>🖼️ {imagenes.length} imágenes recuperadas</Text>
          <TouchableOpacity style={[styles.btnVerImg, { backgroundColor: '#1a6bd4' }]} onPress={() => setModalImg(true)}>
            <Text style={styles.btnText}>Ver imágenes</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal Imágenes */}
      <Modal animationType="slide" transparent visible={modalImg} onRequestClose={() => setModalImg(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>🖼️ {personaje?.nombre} — imágenes</Text>
            <Text style={styles.modalSub}>{imagenes.length} imágenes encontradas</Text>
            <View style={styles.modalGrid}>
              {imagenes.map((uri, i) => (
                <View key={i} style={styles.modalImgBox}>
                  <Image source={{ uri }} style={[styles.modalSprite, { borderColor: ACCENT }]} resizeMode="cover" />
                  <Text style={styles.modalImgLabel}>Imagen {i + 1}</Text>
                </View>
              ))}
            </View>
            <Pressable style={[styles.btnCerrar, { backgroundColor: ACCENT }]} onPress={() => setModalImg(false)}>
              <Text style={styles.btnText}>✕ Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal Lista */}
      <Modal animationType="slide" transparent visible={modalLista} onRequestClose={() => setModalLista(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>📋 Personajes — Dan Da Dan</Text>
            <Text style={styles.modalSub}>{lista.length} personajes en la base</Text>
            <FlatList
              data={lista}
              keyExtractor={item => String(item.id)}
              style={{ maxHeight: 350 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.listaItem}
                  onPress={() => { setPersonaje(item); setUltimoDanDaDan(item); setModalLista(false); setNombre(item.nombre); }}
                >
                  <Image source={{ uri: item.imagen1 }} style={styles.listaImg} />
                  <View>
                    <Text style={styles.listaNombre}>{item.nombre}</Text>
                    <Text style={styles.listaInfo}>Edad: {item.edad}</Text>
                    <Text style={styles.listaInfo}>Poder: {item.poder}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
            <Pressable style={[styles.btnCerrar, { backgroundColor: '#1a6bd4' }]} onPress={() => setModalLista(false)}>
              <Text style={styles.btnText}>✕ Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0d0d1a' },
  container: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 30, color: '#8b5cf6', fontWeight: 'bold', textAlign: 'center', letterSpacing: 3, marginBottom: 4 },
  subtitle: { color: '#aaa', textAlign: 'center', fontSize: 13, marginBottom: 20 },
  input: { backgroundColor: '#111', color: '#fff', padding: 13, borderRadius: 12, borderWidth: 1, borderColor: '#2d2d4e', fontSize: 15, marginBottom: 12 },
  botonesRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  btn: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  errorText: { color: '#e74c3c', textAlign: 'center', marginTop: 12 },
  card: { backgroundColor: '#1a1a2e', borderRadius: 20, borderWidth: 2, padding: 20, alignItems: 'center', marginTop: 12, gap: 10 },
  infoBox: { width: '100%', gap: 4 },
  infoNombre: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  infoItem: { color: '#aaa', fontSize: 13 },
  infoVal: { color: '#fff', fontWeight: 'bold' },
  contadorText: { color: '#aaa', fontSize: 13, marginTop: 8 },
  btnVerImg: { width: '100%', padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#1a1a2e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  modalSub: { color: '#888', fontSize: 12, textAlign: 'center', marginBottom: 16 },
  modalGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, paddingBottom: 16 },
  modalImgBox: { alignItems: 'center', width: 120 },
  modalSprite: { width: 110, height: 110, borderRadius: 55, borderWidth: 2 },
  modalImgLabel: { color: '#aaa', fontSize: 11, marginTop: 6 },
  btnCerrar: { padding: 13, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  listaItem: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2d2d4e' },
  listaImg: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#0d0d1a' },
  listaNombre: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  listaInfo: { color: '#888', fontSize: 12 },
});