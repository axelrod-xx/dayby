import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { createReport, reportReasons, type ReportReason } from '@/src/features/safety/reportService';

export default function ReportScreen() {
  const router = useRouter();
  const { groupId, postId } = useLocalSearchParams<{ groupId?: string; postId?: string }>();
  const [reason, setReason] = useState<ReportReason>('uncomfortable');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    try {
      setSaving(true);
      await createReport({ groupId, postId, reason, note });
      Alert.alert('Report sent', 'Thanks. We will keep this space careful.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Could not send report', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Safety</Text>
        <Text style={styles.title}>Report</Text>
        <Text style={styles.copy}>Tell us what feels off. dayby is for small groups, not pressure.</Text>
      </View>

      <View style={styles.options}>
        {reportReasons.map((item) => {
          const selected = item.value === reason;
          return (
            <Pressable
              key={item.value}
              onPress={() => setReason(item.value)}
              style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && styles.pressed]}>
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{item.label}</Text>
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        multiline
        onChangeText={setNote}
        placeholder="Add a little context"
        placeholderTextColor="#8FAFC2"
        style={styles.input}
        textAlignVertical="top"
        value={note}
      />

      <PrimaryButton loading={saving} onPress={() => void submit()} variant="accent">
        Send report
      </PrimaryButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 22,
    paddingHorizontal: 22,
    paddingBottom: 42,
    paddingTop: 74,
    backgroundColor: '#F7FBFF',
  },
  hero: {
    minHeight: 150,
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
    marginTop: 12,
    color: '#4E6A80',
    fontSize: 16,
    lineHeight: 24,
  },
  options: {
    gap: 10,
  },
  option: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D8E9F5',
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  optionSelected: {
    borderColor: '#2F80ED',
    backgroundColor: '#DCEEFF',
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }],
  },
  optionText: {
    flex: 1,
    paddingRight: 12,
    color: '#617B8F',
    fontSize: 15,
    fontWeight: '800',
  },
  optionTextSelected: {
    color: '#102033',
  },
  radio: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#B8C9DA',
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
  },
  radioSelected: {
    borderColor: '#2F80ED',
    backgroundColor: '#2F80ED',
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  input: {
    minHeight: 124,
    borderWidth: 1,
    borderColor: '#B8C9DA',
    borderRadius: 14,
    padding: 14,
    color: '#102033',
    fontSize: 16,
    lineHeight: 22,
    backgroundColor: '#FFFFFF',
  },
});
