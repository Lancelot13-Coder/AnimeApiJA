import { Image, StyleSheet } from 'react-native';

type Props = {
  imgSource: string;
  size?: number;
};

export default function ImageViewer({ imgSource, size = 120 }: Props) {
  if (!imgSource) return null;
  return (
    <Image
      source={{ uri: imgSource }}
      style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: '#1a1a2e' },
});