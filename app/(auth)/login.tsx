import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  Pressable, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router     = useRouter();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa tu Correo Electronico y Contraseña.');
      return;
    }
    setLoading(true);
    setError('');
    const err = await signIn(email.trim(), password);
    if (err) setError('Credenciales incorrectas. Verifica que tu Correo Electronico y Contraseña sean las Correctas.');
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>

        <Text style={styles.emoji}>🎌</Text>
        <Text style={styles.title}>ANIME APP API J-A</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

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
            placeholder="••••••••"
            placeholderTextColor="#555"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={styles.btnLogin}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Iniciar Sesión</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>¿No tienes una Cuenta? </Text>
          <Pressable onPress={() => router.push('/(auth)/register' as any)}>
            <Text style={styles.registerLink}>Regístrate Aqui</Text>
          </Pressable>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#0d0d1a' },
  inner:        { flex: 1, padding: 28, justifyContent: 'center' },
  emoji:        { fontSize: 52, textAlign: 'center', marginBottom: 8 },
  title:        { fontSize: 32, color: '#fff', fontWeight: 'bold', textAlign: 'center', letterSpacing: 4 },
  subtitle:     { color: '#888', textAlign: 'center', fontSize: 14, marginBottom: 36 },
  form:         { gap: 10 },
  label:        { color: '#aaa', fontSize: 13, fontWeight: 'bold', marginBottom: -4 },
  input:        {
    backgroundColor: '#1a1a2e', color: '#fff', padding: 14,
    borderRadius: 12, borderWidth: 1, borderColor: '#2d2d4e', fontSize: 15,
  },
  errorText:    { color: '#e74c3c', fontSize: 13, textAlign: 'center', marginTop: 4 },
  btnLogin:     {
    backgroundColor: '#e74c3c', padding: 15, borderRadius: 12,
    alignItems: 'center', marginTop: 8,
  },
  btnText:      { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  registerRow:  { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerText: { color: '#888', fontSize: 14 },
  registerLink: { color: '#e74c3c', fontSize: 14, fontWeight: 'bold' },
});