import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'dayby' }} />
      <View style={styles.container}>
        <Text style={styles.kicker}>Lost moment</Text>
        <Text style={styles.title}>This page is not here.</Text>
        <Text style={styles.copy}>The memory is probably somewhere else.</Text>
        <View style={styles.action}>
          <Link href="/" asChild>
            <PrimaryButton onPress={() => undefined} variant="accent">
              Back home
            </PrimaryButton>
          </Link>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    backgroundColor: '#FFFFFF',
  },
  kicker: {
    color: '#2F80ED',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 12,
    color: '#102033',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 44,
  },
  copy: {
    marginTop: 10,
    color: '#4E6A80',
    fontSize: 16,
    lineHeight: 24,
  },
  action: {
    marginTop: 26,
  },
});
