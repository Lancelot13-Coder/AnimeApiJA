import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  Pressable, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const router     = useRouter();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !confirm.trim()) {
      setError('Todos los Campos son Obligatorios.'); return;
    }
    if (password.length < 6) {
      setError('La Contraseña debe tener al menos 6 Caracteres.'); return;
    }
    if (password !== confirm) {
      setError('Las Contraseñas no Coinciden entre si.'); return;
    }
    setLoading(true); setError('');
    const err = await signUp(email.trim(), password);
    if (err) {
      setError('No se pudo Crear la Cuenta. El Correo Electronico puede que ya esta en uso en otra Cuenta.');
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successEmoji}>✅</Text>
        <Text style={styles.successTitle}>¡Cuenta Creada Exitosamente!</Text>
        <Text style={styles.successSub}>
          Revisa tu Correo Electronico para Confirmar tu Cuenta y luego Inicia Sesión de nuevo.
        </Text>
        <TouchableOpacity
          style={styles.btnLogin}
          onPress={() => router.replace('/(auth)/login' as any)}
        >
          <Text style={styles.btnText}>Ir al Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>

        <Text style={styles.emoji}>🎌</Text>
        <Text style={styles.title}>CREAR CUENTA</Text>
        <Text style={styles.subtitle}>Regístrate para acceder a Anime App Api J-A</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Correo Electronico</Text>
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#555"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#555"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Confirmar Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Repite tu contraseña"
            placeholderTextColor="#555"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
          />

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={styles.btnLogin}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Crear Cuenta</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>¿Ya tienes una Cuenta? </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.loginLink}>Inicia Sesión aqui</Text>
          </Pressable>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#0d0d1a' },
  inner:            { flex: 1, padding: 28, justifyContent: 'center' },
  emoji:            { fontSize: 52, textAlign: 'center', marginBottom: 8 },
  title:            { fontSize: 28, color: '#fff', fontWeight: 'bold', textAlign: 'center', letterSpacing: 3 },
  subtitle:         { color: '#888', textAlign: 'center', fontSize: 14, marginBottom: 32 },
  form:             { gap: 10 },
  label:            { color: '#aaa', fontSize: 13, fontWeight: 'bold', marginBottom: -4 },
  input:            {
    backgroundColor: '#1a1a2e', color: '#fff', padding: 14,
    borderRadius: 12, borderWidth: 1, borderColor: '#2d2d4e', fontSize: 15,
  },
  errorText:        { color: '#e74c3c', fontSize: 13, textAlign: 'center', marginTop: 4 },
  btnLogin:         {
    backgroundColor: '#e74c3c', padding: 15,
    borderRadius: 12, alignItems: 'center', marginTop: 8,
  },
  btnText:          { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  loginRow:         { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText:        { color: '#888', fontSize: 14 },
  loginLink:        { color: '#e74c3c', fontSize: 14, fontWeight: 'bold' },
  successContainer: {
    flex: 1, backgroundColor: '#0d0d1a',
    justifyContent: 'center', alignItems: 'center', padding: 28,
  },
  successEmoji:     { fontSize: 60, marginBottom: 16 },
  successTitle:     { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  successSub:       { color: '#888', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
});