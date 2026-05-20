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
  new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));

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
        <Text style={styles.title}>{moments.length || 0} moments</Text>
        <Text style={styles.copy}>A quiet cut of the days your group chose to keep.</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#171615" />
      ) : moments.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No kept moments yet</Text>
          <Text style={styles.emptyCopy}>Daily winners will appear here in date order.</Text>
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
          <Text style={styles.endKicker}>
            {highlight.names.length > 1 ? "THIS MONTH'S HIGHLIGHTS" : "THIS MONTH'S HIGHLIGHT"}
          </Text>
          <Text style={styles.endName}>{highlight.names.join(' / ').toUpperCase()}</Text>
          <Text style={styles.endCopy}>
            {highlight.count} {highlight.count === 1 ? 'MOMENT' : 'MOMENTS'} KEPT
          </Text>
          <Text style={styles.made}>made with dayby</Text>
        </View>
      ) : null}

      {params.groupId ? <ExportActions groupId={params.groupId} videoUri={null} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
    paddingHorizontal: 22,
    paddingBottom: 42,
    paddingTop: 74,
    backgroundColor: '#FFFEFB',
  },
  hero: {
    minHeight: 190,
    justifyContent: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E1DA',
    paddingBottom: 22,
  },
  kicker: {
    color: '#78716C',
    fontSize: 13,
    fontWeight: '900',
  },
  title: {
    marginTop: 8,
    color: '#171615',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 0,
  },
  copy: {
    marginTop: 10,
    color: '#68625D',
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
    borderColor: '#E5E1DA',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FBFAF7',
  },
  date: {
    width: 64,
    color: '#171615',
    fontSize: 20,
    fontWeight: '900',
  },
  rowBody: {
    borderLeftWidth: 1,
    borderLeftColor: '#D8D2C8',
    paddingLeft: 16,
  },
  time: {
    color: '#171615',
    fontSize: 18,
    fontWeight: '900',
  },
  name: {
    marginTop: 4,
    color: '#78716C',
    fontSize: 12,
    fontWeight: '800',
  },
  empty: {
    borderTopWidth: 1,
    borderTopColor: '#E5E1DA',
    paddingTop: 18,
  },
  emptyTitle: {
    color: '#171615',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyCopy: {
    marginTop: 8,
    color: '#68625D',
    fontSize: 15,
    lineHeight: 22,
  },
  endCard: {
    minHeight: 170,
    justifyContent: 'center',
    borderRadius: 8,
    padding: 22,
    backgroundColor: '#171615',
  },
  endKicker: {
    color: '#D8D2C8',
    fontSize: 12,
    fontWeight: '900',
  },
  endName: {
    marginTop: 10,
    color: '#FFFEFB',
    fontSize: 30,
    fontWeight: '900',
  },
  endCopy: {
    marginTop: 8,
    color: '#D8D2C8',
    fontSize: 14,
    fontWeight: '800',
  },
  made: {
    marginTop: 22,
    color: '#A49B91',
    fontSize: 12,
  },
});
