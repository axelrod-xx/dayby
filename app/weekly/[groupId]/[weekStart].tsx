import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ExportActions } from '@/src/features/export/ExportActions';
import { recordGroupActivity } from '@/src/features/groups/groupService';
import { listWeeklyMoments, type WeeklyMoment } from '@/src/features/weekly/weeklyService';
import { resolveErrorMessage } from '@/src/lib/i18n/errors';
import { useI18n } from '@/src/lib/i18n/I18nProvider';

export default function WeeklyMemoryScreen() {
  const { groupId, weekStart } = useLocalSearchParams<{ groupId: string; weekStart: string }>();
  const { formatters, t } = useI18n();
  const [moments, setMoments] = useState<WeeklyMoment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId || !weekStart) {
      return;
    }

    listWeeklyMoments({ groupId, weekStart })
      .then(setMoments)
      .catch((error) => Alert.alert(t('weekly.alert.loadFailed'), resolveErrorMessage(error, t)))
      .finally(() => setLoading(false));
    recordGroupActivity(groupId, 'view').catch(() => undefined);
  }, [groupId, t, weekStart]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>{t('weekly.kicker')}</Text>
        <Text style={styles.title}>{t('weekly.title', { count: moments.length })}</Text>
        <Text style={styles.copy}>{weekStart ? formatters.weekRange(weekStart) : ''}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#102033" />
      ) : moments.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{t('weekly.emptyTitle')}</Text>
          <Text style={styles.emptyCopy}>{t('weekly.emptyCopy')}</Text>
        </View>
      ) : (
        <View style={styles.timeline}>
          {moments.map((moment) => (
            <View key={moment.id} style={styles.row}>
              <Text style={styles.date}>{formatters.weekdayShort(moment.date).toUpperCase()}</Text>
              <View style={styles.rowBody}>
                <Text style={styles.time}>{formatters.time(moment.captured_at)}</Text>
                <Text style={styles.name}>{moment.display_name.toUpperCase()}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {groupId ? (
        <ExportActions
          groupId={groupId}
          r2Keys={moments.map((moment) => moment.r2_key)}
          sourceUris={moments.map((moment) => moment.playback_url)}
        />
      ) : null}
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
    borderWidth: 1,
    borderColor: '#D8E9F5',
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#FFFFFF',
    shadowColor: '#102033',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  kicker: {
    color: '#2F80ED',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: {
    marginTop: 8,
    color: '#102033',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  copy: {
    marginTop: 8,
    color: '#4E6A80',
    fontSize: 15,
  },
  timeline: {
    gap: 10,
  },
  row: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8E9F5',
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  date: {
    width: 64,
    color: '#102033',
    fontSize: 16,
    fontWeight: '900',
  },
  rowBody: {
    borderLeftWidth: 1,
    borderLeftColor: '#B8C9DA',
    paddingLeft: 16,
  },
  time: {
    color: '#102033',
    fontSize: 18,
    fontWeight: '900',
  },
  name: {
    marginTop: 4,
    color: '#617B8F',
    fontSize: 12,
    fontWeight: '800',
  },
  empty: {
    borderTopWidth: 1,
    borderTopColor: '#D8E9F5',
    paddingTop: 18,
  },
  emptyTitle: {
    color: '#102033',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyCopy: {
    marginTop: 8,
    color: '#4E6A80',
    fontSize: 15,
    lineHeight: 22,
  },
});
