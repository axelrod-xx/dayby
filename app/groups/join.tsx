import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { joinGroupWithCode } from '@/src/features/groups/groupService';

export default function JoinGroupScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);

  const join = async () => {
    try {
      setJoining(true);
      const groupId = await joinGroupWithCode(code);
      router.replace({ pathname: '/groups/[groupId]', params: { groupId } } as unknown as Href);
    } catch (error) {
      Alert.alert('Could not join group', error instanceof Error ? error.message : 'Please check the code.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Invite</Text>
        <Text style={styles.title}>Join group</Text>
        <Text style={styles.copy}>Enter the invite code from a friend.</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Invite code</Text>
        <TextInput
          autoCapitalize="characters"
          maxLength={12}
          onChangeText={(value) => setCode(value.toUpperCase())}
          placeholder="DAYBY1"
          placeholderTextColor="#8FAFC2"
          style={styles.input}
          value={code}
        />
      </View>

      <PrimaryButton disabled={code.trim().length < 4} loading={joining} onPress={() => void join()}>
        Join friends
      </PrimaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
    paddingHorizontal: 22,
    paddingTop: 82,
    backgroundColor: '#F7FBFF',
  },
  hero: {
    minHeight: 164,
    justifyContent: 'flex-end',
  },
  kicker: {
    marginBottom: 10,
    color: '#2F80ED',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#102033',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  copy: {
    marginTop: 10,
    color: '#4E6A80',
    fontSize: 16,
    lineHeight: 23,
  },
  form: {
    gap: 8,
  },
  label: {
    color: '#4E6A80',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: '#B8C9DA',
    borderRadius: 14,
    paddingHorizontal: 16,
    color: '#102033',
    fontSize: 20,
    letterSpacing: 0,
    backgroundColor: '#FFFFFF',
  },
});
