import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
  onPress?: () => void;
  color?: string;
  disabled?: boolean;
};

export default function Button({ label, onPress, color = '#1a6bd4', disabled }: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.btn, { backgroundColor: disabled ? '#333' : color }]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={styles.label}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  btn: {
    padding: 13, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  label: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});