import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { createGroup, getLocalTimezone } from '@/src/features/groups/groupService';
import { resolveErrorMessage } from '@/src/lib/i18n/errors';
import { useI18n } from '@/src/lib/i18n/I18nProvider';

export default function CreateGroupScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [memberLimit, setMemberLimit] = useState('8');
  const [saving, setSaving] = useState(false);
  const timezone = getLocalTimezone();

  const save = async () => {
    try {
      setSaving(true);
      const groupId = await createGroup({
        name,
        timezone,
        memberLimit: Number(memberLimit) || 8,
        monthlyHighlightEnabled: true,
      });
      router.replace({ pathname: '/groups/[groupId]', params: { groupId } } as unknown as Href);
    } catch (error) {
      Alert.alert(t('groupCreate.alert.failed'), resolveErrorMessage(error, t));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <Text style={styles.kicker}>{t('groupCreate.kicker')}</Text>
        <Text style={styles.title}>{t('groupCreate.title')}</Text>
        <Text style={styles.copy}>{t('groupCreate.copy')}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>{t('groupCreate.nameLabel')}</Text>
        <TextInput
          maxLength={80}
          onChangeText={setName}
          placeholder={t('groupCreate.namePlaceholder')}
          placeholderTextColor="#8FAFC2"
          style={styles.input}
          value={name}
        />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>{t('groupCreate.timezoneLabel')}</Text>
        <View style={styles.readOnlyBox}>
          <Text style={styles.readOnlyText}>{timezone}</Text>
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>{t('groupCreate.memberLimitLabel')}</Text>
        <TextInput
          inputMode="numeric"
          maxLength={2}
          onChangeText={setMemberLimit}
          style={styles.input}
          value={memberLimit}
        />
      </View>

      <PrimaryButton disabled={!name.trim()} loading={saving} onPress={() => void save()}>
        {t('groupCreate.startGroup')}
      </PrimaryButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 22,
    paddingHorizontal: 22,
    paddingBottom: 40,
    paddingTop: 74,
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
    fontSize: 17,
    backgroundColor: '#FFFFFF',
  },
  readOnlyBox: {
    minHeight: 56,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8E9F5',
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F3F8FC',
  },
  readOnlyText: {
    color: '#617B8F',
    fontSize: 17,
  },
});
