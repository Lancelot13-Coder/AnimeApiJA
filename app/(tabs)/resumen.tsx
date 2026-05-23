import { AnimeContext, PersonajeUsuario } from '@/context/AnimeContext';
import React, { useContext, useState } from 'react';
import {
  Image, Modal, Pressable, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';

export default function ResumenScreen() {
  const {
    ultimosChainsawMan, ultimosDanDaDan, ultimosCastlevania,
    ultimosPorCategoria,
  } = useContext(AnimeContext);

  const [modalVisible, setModalVisible] = useState(false);

  const categoriasDefault = [
    { label: '🪚 Chainsaw Man', personaje: ultimosChainsawMan, color: '#e74c3c' },
    { label: '👻 Dan Da Dan',   personaje: ultimosDanDaDan,    color: '#8b5cf6' },
    { label: '🧛 Castlevania',  personaje: ultimosCastlevania, color: '#f59e0b' },
  ];

  // Imágenes de los 3 animes fijos
  const imagenesDefault = categoriasDefault.flatMap(({ personaje, label, color }) => {
    if (!personaje) return [];
    return [personaje.imagen1, personaje.imagen2, personaje.imagen3, personaje.imagen4]
      .filter(Boolean)
      .map(uri => ({ uri, label: `${label} — ${personaje.nombre}`, color }));
  });

  // Imágenes de los animes del usuario
  const categoriasUsuario = Object.values(ultimosPorCategoria);
  const imagenesUsuario = categoriasUsuario.flatMap((p: PersonajeUsuario) =>
    [p.imagen1, p.imagen2, p.imagen3, p.imagen4]
      .filter(Boolean)
      .map(uri => ({ uri, label: `${p.categoria_emoji} ${p.categoria_nombre} — ${p.nombre}`, color: p.categoria_color }))
  );

  const todasImagenes = [...imagenesDefault, ...imagenesUsuario];
  const hayAlguno = categoriasDefault.some(c => c.personaje !== null) || categoriasUsuario.length > 0;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

      <Text style={styles.title}>📋 RESUMEN</Text>
      <Text style={styles.subtitle}>Últimos personajes consultados por categoría</Text>

      {!hayAlguno && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            Aún no has consultado ningún personaje.{'\n'}
            Ve a cada pestaña y busca uno 👀
          </Text>
        </View>
      )}

      {/* ── Animes fijos ── */}
      {categoriasDefault.map(({ label, personaje, color }) => (
        <View key={label} style={[styles.card, { borderColor: color }]}>
          <Text style={[styles.cardAnime, { color }]}>{label}</Text>
          {!personaje ? (
            <Text style={styles.noConsultado}>Sin consultar aún</Text>
          ) : (
            <View style={styles.personajeRow}>
              <Image source={{ uri: personaje.imagen1 }} style={[styles.avatar, { borderColor: color }]} />
              <View style={styles.infoBox}>
                <Text style={styles.nombre}>{personaje.nombre}</Text>
                <Text style={styles.info}>🎂 Edad: <Text style={styles.infoVal}>{personaje.edad}</Text></Text>
                <Text style={styles.info}>⚡ Poder: <Text style={styles.infoVal}>{personaje.poder}</Text></Text>
              </View>
            </View>
          )}
        </View>
      ))}

      {/* ── Animes del usuario ── */}
      {categoriasUsuario.map((p: PersonajeUsuario) => (
        <View key={p.categoria_id} style={[styles.card, { borderColor: p.categoria_color }]}>
          <Text style={[styles.cardAnime, { color: p.categoria_color }]}>
            {p.categoria_emoji} {p.categoria_nombre}
          </Text>
          <View style={styles.personajeRow}>
            {p.imagen1
              ? <Image source={{ uri: p.imagen1 }} style={[styles.avatar, { borderColor: p.categoria_color }]} />
              : <View style={[styles.avatar, { borderColor: p.categoria_color, backgroundColor: '#2d2d4e', alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ fontSize: 24 }}>👤</Text>
                </View>
            }
            <View style={styles.infoBox}>
              <Text style={styles.nombre}>{p.nombre}</Text>
              {!!p.edad  && <Text style={styles.info}>🎂 Edad: <Text style={styles.infoVal}>{p.edad}</Text></Text>}
              {!!p.poder && <Text style={styles.info}>⚡ Poder: <Text style={styles.infoVal}>{p.poder}</Text></Text>}
            </View>
          </View>
        </View>
      ))}

      {/* Total imágenes + botón */}
      {hayAlguno && (
        <View style={styles.totalBox}>
          <Text style={styles.totalText}>
            🖼️ Total de imágenes:{' '}
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{todasImagenes.length}</Text>
          </Text>
          <TouchableOpacity style={styles.btnVerTodas} onPress={() => setModalVisible(true)}>
            <Text style={styles.btnText}>Ver imágenes</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal todas las imágenes */}
      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>🖼️ Todas las imágenes</Text>
            <Text style={styles.modalSub}>{todasImagenes.length} imágenes en total</Text>
            <ScrollView contentContainerStyle={styles.modalGrid}>
              {todasImagenes.map((img, i) => (
                <View key={i} style={styles.modalImgBox}>
                  <Image
                    source={{ uri: img.uri }}
                    style={[styles.modalSprite, { borderColor: img.color }]}
                    resizeMode="cover"
                  />
                  <Text style={styles.modalImgLabel}>{img.label}</Text>
                </View>
              ))}
            </ScrollView>
            <Pressable style={styles.btnCerrar} onPress={() => setModalVisible(false)}>
              <Text style={styles.btnText}>✕ Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:         { flex: 1, backgroundColor: '#0d0d1a' },
  container:      { padding: 24, paddingBottom: 40 },
  title:          { fontSize: 28, color: '#fff', fontWeight: 'bold', textAlign: 'center', letterSpacing: 3, marginBottom: 4 },
  subtitle:       { color: '#888', textAlign: 'center', fontSize: 13, marginBottom: 24 },
  emptyBox:       { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16 },
  emptyText:      { color: '#666', textAlign: 'center', lineHeight: 22 },
  card:           { backgroundColor: '#1a1a2e', borderRadius: 20, borderWidth: 2, padding: 18, marginBottom: 16 },
  cardAnime:      { fontWeight: 'bold', fontSize: 16, marginBottom: 12 },
  noConsultado:   { color: '#555', fontSize: 13, fontStyle: 'italic' },
  personajeRow:   { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar:         { width: 70, height: 70, borderRadius: 35, borderWidth: 2, backgroundColor: '#0d0d1a' },
  infoBox:        { flex: 1, gap: 3 },
  nombre:         { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  info:           { color: '#aaa', fontSize: 12 },
  infoVal:        { color: '#fff', fontWeight: 'bold' },
  totalBox:       { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 18, alignItems: 'center', gap: 12, marginTop: 4 },
  totalText:      { color: '#aaa', fontSize: 14 },
  btnVerTodas:    { backgroundColor: '#1a6bd4', width: '100%', padding: 13, borderRadius: 12, alignItems: 'center' },
  btnText:        { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#1a1a2e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalTitle:     { color: '#fff', fontSize: 17, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  modalSub:       { color: '#888', fontSize: 12, textAlign: 'center', marginBottom: 16 },
  modalGrid:      { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, paddingBottom: 16 },
  modalImgBox:    { alignItems: 'center', width: 120 },
  modalSprite:    { width: 110, height: 110, borderRadius: 55, borderWidth: 2 },
  modalImgLabel:  { color: '#aaa', fontSize: 10, marginTop: 6, textAlign: 'center' },
  btnCerrar:      { backgroundColor: '#333', padding: 13, borderRadius: 12, alignItems: 'center', marginTop: 8 },
});