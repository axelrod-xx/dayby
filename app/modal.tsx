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
    backgroundColor: '#F6FAFF',
  },
  wordmark: {
    color: '#102033',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
  },
  title: {
    marginTop: 18,
    color: '#102033',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  copy: {
    marginTop: 12,
    color: '#4E6A80',
    fontSize: 16,
    lineHeight: 24,
  },
  action: {
    marginTop: 28,
  },
});
