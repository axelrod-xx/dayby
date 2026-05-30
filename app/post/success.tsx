import { Link, type Href, useLocalSearchParams } from 'expo-router';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useI18n } from '@/src/lib/i18n/I18nProvider';

export default function PostSuccessScreen() {
  const { t } = useI18n();
  const { count, groupId, groupName } = useLocalSearchParams<{
    count?: string;
    groupId?: string;
    groupName?: string;
  }>();
  const postedCount = Math.max(Number(count ?? 0), 1);
  const hasSingleGroup = Boolean(groupId);
  const resolvedGroupName = groupName || t('postSuccess.fallbackGroup');
  const shareText = hasSingleGroup
    ? t('postSuccess.share.single', { groupName: resolvedGroupName })
    : t('postSuccess.share.multi', { count: postedCount });

  const shareMoment = async () => {
    await Share.share({
      message: `${shareText}\n${t('common.brandPromise').replace('\n', ' ')}`,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>{t('postSuccess.kicker')}</Text>
        <Text style={styles.title}>{t('postSuccess.title')}</Text>
        <Text style={styles.copy}>
          {hasSingleGroup
            ? t('postSuccess.copy.single', { groupName: resolvedGroupName })
            : t('postSuccess.copy.multi', { count: postedCount })}
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{t('postSuccess.tellGroup')}</Text>
        <Text style={styles.panelText}>{t('postSuccess.tellCopy')}</Text>
        <View style={styles.panelAction}>
          <PrimaryButton onPress={() => void shareMoment()} variant="light">
            {t('postSuccess.shareThis')}
          </PrimaryButton>
        </View>
      </View>

      <View style={styles.panelSoft}>
        <Text style={styles.panelTitle}>{t('postSuccess.tomorrow')}</Text>
        <Text style={styles.panelText}>{t('postSuccess.tomorrowCopy')}</Text>
      </View>

      <View style={styles.actions}>
        {hasSingleGroup ? (
          <Link href={{ pathname: '/groups/[groupId]', params: { groupId } } as unknown as Href} asChild>
            <PrimaryButton onPress={() => undefined} variant="accent">
              {t('postSuccess.openGroup')}
            </PrimaryButton>
          </Link>
        ) : (
          <Link href={'/(tabs)/groups' as Href} asChild>
            <PrimaryButton onPress={() => undefined} variant="accent">
              {t('postSuccess.openGroups')}
            </PrimaryButton>
          </Link>
        )}
        <Link href={'/(tabs)' as Href} asChild>
          <PrimaryButton onPress={() => undefined} variant="light">
            {t('common.home')}
          </PrimaryButton>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 22,
    paddingBottom: 42,
    paddingTop: 84,
    backgroundColor: '#F6FAFF',
  },
  hero: {
    paddingVertical: 8,
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
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 47,
  },
  copy: {
    marginTop: 12,
    color: '#4E6A80',
    fontSize: 17,
    lineHeight: 25,
  },
  panel: {
    borderWidth: 1,
    borderColor: '#BAD4EC',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  panelSoft: {
    borderTopWidth: 1,
    borderTopColor: '#D8E9F5',
    paddingTop: 18,
  },
  panelTitle: {
    color: '#102033',
    fontSize: 18,
    fontWeight: '800',
  },
  panelText: {
    marginTop: 8,
    color: '#4E6A80',
    fontSize: 15,
    lineHeight: 22,
  },
  panelAction: {
    marginTop: 14,
  },
  actions: {
    gap: 10,
  },
});
