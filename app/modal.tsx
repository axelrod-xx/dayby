import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.wordmark}>dayby</Text>
      <Text style={styles.title}>A month, made by friends.</Text>
      <Text style={styles.copy}>
        dayby keeps the final memory quiet. No in-app music, no public feed, no watermark over the moments.
      </Text>
      <View style={styles.action}>
        <Link href="/" asChild>
          <PrimaryButton onPress={() => undefined} variant="light">
            Back to dayby
          </PrimaryButton>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    backgroundColor: '#171615',
  },
  wordmark: {
    color: '#FFFEFB',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 0,
  },
  title: {
    marginTop: 18,
    color: '#FFFEFB',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
  },
  copy: {
    marginTop: 12,
    color: '#D8D2C8',
    fontSize: 16,
    lineHeight: 24,
  },
  action: {
    marginTop: 28,
  },
});
