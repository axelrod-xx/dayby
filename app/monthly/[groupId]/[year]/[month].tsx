import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ExportActions } from '@/src/features/export/ExportActions';
import { recordGroupActivity } from '@/src/features/groups/groupService';
import {
  calculateMonthlyHighlight,
  listMonthlyMoments,
  type MonthlyMoment,
} from '@/src/features/monthly/monthlyService';

const monthName = (year: number, month: number) =>
  new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));

export default function MonthlyMemoryScreen() {
  const params = useLocalSearchParams<{ groupId: string; year: string; month: string }>();
  const year = Number(params.year);
  const month = Number(params.month);
  const [moments, setMoments] = useState<MonthlyMoment[]>([]);
  const [loading, setLoading] = useState(true);
  const highlight = useMemo(() => calculateMonthlyHighlight(moments), [moments]);

  useEffect(() => {
    if (!params.groupId || !year || !month) {
      return;
    }

    listMonthlyMoments({ groupId: params.groupId, year, month })
      .then(setMoments)
      .catch((error) => Alert.alert('Could not load monthly memory', error.message))
      .finally(() => setLoading(false));
    recordGroupActivity(params.groupId, 'view').catch(() => undefined);
  }, [month, params.groupId, year]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>OUR {monthName(year, month).toUpperCase()}</Text>
        <Text style={styles.title}>{highlight?.durationLabel ?? '0s'} ready</Text>
        <Text style={styles.copy}>A one-minute sample of the month. The full archive stays with the group.</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#102033" />
      ) : moments.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No kept moments yet</Text>
          <Text style={styles.emptyCopy}>When your group posts, this month starts taking shape.</Text>
        </View>
      ) : (
        <View style={styles.timeline}>
          {moments.map((moment) => (
            <View key={moment.id} style={styles.row}>
              <Text style={styles.date}>{moment.date.slice(5).replace('-', '.')}</Text>
              <View style={styles.rowBody}>
                <Text style={styles.time}>{moment.time_label}</Text>
                <Text style={styles.name}>{moment.display_name.toUpperCase()}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {highlight ? (
        <View style={styles.endCard}>
          <Text style={styles.endKicker}>THIS MONTH'S SAMPLE</Text>
          <Text style={styles.endName}>{highlight.names.slice(0, 4).join(' / ').toUpperCase()}</Text>
          <Text style={styles.endCopy}>
            {highlight.count} {highlight.count === 1 ? 'MOMENT' : 'MOMENTS'} / {highlight.dayCount}{' '}
            {highlight.dayCount === 1 ? 'DAY' : 'DAYS'}
          </Text>
          <Text style={styles.made}>made with dayby</Text>
        </View>
      ) : null}

      <View style={styles.shareCue}>
        <Text style={styles.shareKicker}>Made to leave the app</Text>
        <Text style={styles.shareTitle}>One minute to share.</Text>
        <Text style={styles.shareCopy}>
          dayby keeps the archive quiet here, then your group can bring the highlight to Reels, TikTok, Stories, or LINE.
        </Text>
      </View>

      {params.groupId ? <ExportActions groupId={params.groupId} videoUri={null} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
    paddingHorizontal: 22,
    paddingBottom: 42,
    paddingTop: 68,
    backgroundColor: '#102033',
  },
  hero: {
    minHeight: 260,
    justifyContent: 'flex-end',
    borderRadius: 16,
    padding: 22,
    backgroundColor: '#1B3458',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 6,
  },
  kicker: {
    color: '#B8C9DA',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 46,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  copy: {
    marginTop: 10,
    color: '#B8C9DA',
    fontSize: 16,
    lineHeight: 23,
  },
  timeline: {
    gap: 10,
  },
  row: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,254,251,0.14)',
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,254,251,0.06)',
  },
  date: {
    width: 64,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  rowBody: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,254,251,0.22)',
    paddingLeft: 16,
  },
  time: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  name: {
    marginTop: 4,
    color: '#9FB8CC',
    fontSize: 12,
    fontWeight: '800',
  },
  empty: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,254,251,0.18)',
    paddingTop: 18,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyCopy: {
    marginTop: 8,
    color: '#9FB8CC',
    fontSize: 15,
    lineHeight: 22,
  },
  endCard: {
    minHeight: 170,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,254,251,0.18)',
    borderRadius: 16,
    padding: 22,
    backgroundColor: '#102033',
  },
  endKicker: {
    color: '#B8C9DA',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  endName: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
  },
  endCopy: {
    marginTop: 8,
    color: '#B8C9DA',
    fontSize: 14,
    fontWeight: '800',
  },
  made: {
    marginTop: 22,
    color: '#9FB8CC',
    fontSize: 12,
  },
  shareCue: {
    borderWidth: 1,
    borderColor: 'rgba(255,254,251,0.18)',
    borderRadius: 16,
    padding: 18,
    backgroundColor: 'rgba(255,254,251,0.07)',
  },
  shareKicker: {
    color: '#B8C9DA',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  shareTitle: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  shareCopy: {
    marginTop: 8,
    color: '#9FB8CC',
    fontSize: 15,
    lineHeight: 22,
  },
});
