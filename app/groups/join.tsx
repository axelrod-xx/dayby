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
      <View>
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
          placeholderTextColor="#A49B91"
          style={styles.input}
          value={code}
        />
      </View>

      <PrimaryButton disabled={code.trim().length < 4} loading={joining} onPress={() => void join()}>
        Join group
      </PrimaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 26,
    paddingLeft: 22,
    paddingRight: 44,
    paddingTop: 82,
    backgroundColor: '#FFFDF8',
  },
  kicker: {
    marginBottom: 10,
    color: '#E65A3C',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: '#171615',
    fontSize: 40,
    fontWeight: '900',
  },
  copy: {
    marginTop: 10,
    color: '#68625D',
    fontSize: 16,
    lineHeight: 23,
  },
  form: {
    gap: 8,
  },
  label: {
    color: '#57534E',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: '#D8D2C8',
    borderRadius: 8,
    paddingHorizontal: 14,
    color: '#171615',
    fontSize: 20,
    letterSpacing: 0,
    backgroundColor: '#FFFFFF',
  },
});
