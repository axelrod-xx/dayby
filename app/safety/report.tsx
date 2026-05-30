import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { createReport, reportReasons, type ReportReason } from '@/src/features/safety/reportService';
import { resolveErrorMessage } from '@/src/lib/i18n/errors';
import { useI18n, type TranslateFn } from '@/src/lib/i18n/I18nProvider';

export default function ReportScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { groupId, postId } = useLocalSearchParams<{ groupId?: string; postId?: string }>();
  const [reason, setReason] = useState<ReportReason>('uncomfortable');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    try {
      setSaving(true);
      await createReport({ groupId, postId, reason, note });
      Alert.alert(t('safety.alert.sentTitle'), t('safety.alert.sentBody'), [
        {
          text: t('common.ok'),
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert(t('safety.alert.failed'), resolveErrorMessage(error, t));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>{t('safety.kicker')}</Text>
        <Text style={styles.title}>{t('safety.title')}</Text>
        <Text style={styles.copy}>{t('safety.copy')}</Text>
      </View>

      <View style={styles.options}>
        {reportReasons.map((item) => {
          const selected = item === reason;
          return (
            <Pressable
              key={item}
              onPress={() => setReason(item)}
              style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && styles.pressed]}>
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{reasonLabel(item, t)}</Text>
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
        placeholder={t('safety.notePlaceholder')}
        placeholderTextColor="#8FAFC2"
        style={styles.input}
        textAlignVertical="top"
        value={note}
      />

      <PrimaryButton loading={saving} onPress={() => void submit()} variant="accent">
        {t('safety.sendReport')}
      </PrimaryButton>
    </ScrollView>
  );
}

function reasonLabel(reason: ReportReason, t: TranslateFn) {
  switch (reason) {
    case 'uncomfortable':
      return t('safety.reason.uncomfortable');
    case 'privacy':
      return t('safety.reason.privacy');
    case 'harassment':
      return t('safety.reason.harassment');
    case 'other':
      return t('safety.reason.other');
  }
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
