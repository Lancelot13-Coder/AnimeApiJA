import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';

export default function CrearPersonajeScreen() {
  const { user }  = useAuth();
  const router    = useRouter();
  const params    = useLocalSearchParams();

  const categoriaId = params.categoria_id as string;
  const color       = params.color ? decodeURIComponent(params.color as string) : '#6366f1';
  const pid         = params.pid as string | undefined;
  const editando    = !!pid;

  const [nombre,   setNombre]   = useState('');
  const [edad,     setEdad]     = useState('');
  const [poder,    setPoder]    = useState('');
  const [imagenes, setImagenes] = useState<string[]>(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!pid) return;
    (async () => {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('personajes_usuario')
        .select('*')
        .eq('id', pid)
        .single();

      if (err || !data) {
        setError('No se pudo cargar el personaje.');
        setLoading(false);
        return;
      }

      setNombre(data.nombre  ?? '');
      setEdad(data.edad      ?? '');
      setPoder(data.poder    ?? '');
      setImagenes([
        data.imagen1 ?? '',
        data.imagen2 ?? '',
        data.imagen3 ?? '',
        data.imagen4 ?? '',
      ]);
      setLoading(false);
    })();
  }, [pid]);

  const seleccionarImagen = async (index: number) => {
  const imagenesActuales = imagenes.filter(Boolean).length;

  if (imagenesActuales >= 4 && !imagenes[index]) {
    Alert.alert('Límite alcanzado', 'Solo puedes agregar 4 imágenes por personaje.');
    return;
  }

  // Pedir permisos
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });

  if (result.canceled) return;

  const asset = result.assets[0];
  const uri   = asset.uri;
  const type  = asset.mimeType ?? '';

  // Validar formato por mimeType (más confiable que la extensión en web)
  const esValido = type === 'image/jpeg' || type === 'image/jpg' || type === 'image/png';
  if (!esValido) {
    Alert.alert('Formato inválido', 'Solo se permiten imágenes en formato JPG o PNG.');
    return;
  }

  const ext = type === 'image/png' ? 'png' : 'jpg';

  setLoading(true);
  try {
    const fileName = `${user!.id}/${Date.now()}_${index + 1}.${ext}`;

    // Compatible con web y móvil
    let uploadData: ArrayBuffer;

    if (uri.startsWith('data:')) {
      // Web — base64
      const base64 = uri.split(',')[1];
      const binary  = atob(base64);
      const bytes   = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      uploadData = bytes.buffer;
    } else {
      // Móvil — fetch normal
      const response = await fetch(uri);
      const blob     = await response.blob();
      uploadData     = await blob.arrayBuffer();
    }

    const { error: uploadError } = await supabase.storage
      .from('anime-images')
      .upload(`usuarios/${fileName}`, uploadData, {
        contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        upsert: true,
      });

    if (uploadError) {
      Alert.alert('Error', `No se pudo subir la imagen: ${uploadError.message}`);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('anime-images')
      .getPublicUrl(`usuarios/${fileName}`);

    const nuevasImagenes = [...imagenes];
    nuevasImagenes[index] = urlData.publicUrl;
    setImagenes(nuevasImagenes);

  } catch (e: any) {
    Alert.alert('Error', `Ocurrió un error al Intentar Subir la Imagen: ${e.message}`);
  } finally {
    setLoading(false);
  }
};

 
  const eliminarImagen = (index: number) => {
    const nuevas = [...imagenes];
    nuevas[index] = '';
    setImagenes(nuevas);
  };

  const guardar = async () => {
    if (!nombre.trim()) { setError('El nombre del personaje es obligatorio.'); return; }
    setLoading(true); setError('');

    const datos = {
      categoria_id: Number(categoriaId),
      user_id:      user!.id,
      nombre:       nombre.trim(),
      edad:         edad.trim(),
      poder:        poder.trim(),
      imagen1:      imagenes[0] || '',
      imagen2:      imagenes[1] || '',
      imagen3:      imagenes[2] || '',
      imagen4:      imagenes[3] || '',
    };

    if (editando) {
      const { error: err } = await supabase
        .from('personajes_usuario')
        .update(datos)
        .eq('id', params.pid);
      if (err) { setError('Error al actualizar.'); setLoading(false); return; }
    } else {
      const { error: err } = await supabase
        .from('personajes_usuario')
        .insert(datos);
      if (err) { setError('Error al guardar.'); setLoading(false); return; }
    }

    setLoading(false);
    router.back();
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

      <Text style={styles.title}>{editando ? '✏️ Editar Personaje' : '👤 Nuevo Personaje'}</Text>

      {loading && !nombre && editando && (
        <ActivityIndicator color={color} style={{ marginVertical: 20 }} />
      )}
      
      {/* Nombre */}
      <Text style={styles.label}>Nombre *</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre del personaje"
        placeholderTextColor="#555"
        value={nombre}
        onChangeText={setNombre}
        maxLength={100}
      />

      {/* Edad */}
      <Text style={styles.label}>Edad</Text>
      <TextInput
        style={styles.input}
        placeholder="ej: 17, Desconocida, ~20s"
        placeholderTextColor="#555"
        value={edad}
        onChangeText={setEdad}
        maxLength={50}
      />

      {/* Poder */}
      <Text style={styles.label}>Poder / Técnica</Text>
      <TextInput
        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
        placeholder="Describe el poder o habilidad..."
        placeholderTextColor="#555"
        value={poder}
        onChangeText={setPoder}
        multiline
        maxLength={300}
      />

      {/* Imágenes */}
      <Text style={styles.label}>
        Imágenes (máx. 4 — solo JPG o PNG)
      </Text>
      <Text style={styles.labelSub}>
        {imagenes.filter(Boolean).length}/4 imágenes agregadas
      </Text>

      <View style={styles.imagenesGrid}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={styles.imagenSlot}>
            {imagenes[i] ? (
              <>
                <Image
                  source={{ uri: imagenes[i] }}
                  style={[styles.imagenPreview, { borderColor: color }]}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.btnEliminarImg}
                  onPress={() => eliminarImagen(i)}
                >
                  <Text style={styles.btnEliminarImgText}>✕</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.imagenVacia, { borderColor: color }]}
                onPress={() => seleccionarImagen(i)}
                disabled={loading}
              >
                <Text style={styles.imagenVaciaText}>＋</Text>
                <Text style={styles.imagenVaciaLabel}>Imagen {i + 1}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {loading && <ActivityIndicator color={color} style={{ marginVertical: 12 }} />}
      {!!error  && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={[styles.btnGuardar, { backgroundColor: color }]}
        onPress={guardar}
        disabled={loading}
      >
        <Text style={styles.btnGuardarText}>
          {editando ? 'Guardar cambios' : 'Agregar personaje'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnCancelar} onPress={() => router.back()}>
        <Text style={styles.btnCancelarText}>Cancelar</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:              { flex: 1, backgroundColor: '#0d0d1a' },
  container:           { padding: 24, paddingBottom: 40 },
  title:               { fontSize: 22, color: '#fff', fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  label:               { color: '#aaa', fontSize: 13, fontWeight: 'bold', marginBottom: 6, marginTop: 14 },
  labelSub:            { color: '#666', fontSize: 11, marginBottom: 8, marginTop: -4 },
  input:               { backgroundColor: '#1a1a2e', color: '#fff', padding: 13, borderRadius: 12, borderWidth: 1, borderColor: '#2d2d4e', fontSize: 15 },
  imagenesGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  imagenSlot:          { width: '47%', aspectRatio: 1, position: 'relative' },
  imagenPreview:       { width: '100%', height: '100%', borderRadius: 12, borderWidth: 2 },
  btnEliminarImg:      { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  btnEliminarImgText:  { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  imagenVacia:         { width: '100%', height: '100%', borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', gap: 4 },
  imagenVaciaText:     { color: '#aaa', fontSize: 28 },
  imagenVaciaLabel:    { color: '#555', fontSize: 11 },
  errorText:           { color: '#e74c3c', textAlign: 'center', marginTop: 12 },
  btnGuardar:          { padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnGuardarText:      { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnCancelar:         { padding: 13, borderRadius: 12, alignItems: 'center', marginTop: 10, backgroundColor: '#2d2d4e' },
  btnCancelarText:     { color: '#aaa', fontWeight: 'bold', fontSize: 14 },
});