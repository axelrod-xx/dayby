import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ExportActions } from '@/src/features/export/ExportActions';
import { recordGroupActivity } from '@/src/features/groups/groupService';
import { listWeeklyMoments, weekRangeLabel, type WeeklyMoment } from '@/src/features/weekly/weeklyService';

export default function WeeklyMemoryScreen() {
  const { groupId, weekStart } = useLocalSearchParams<{ groupId: string; weekStart: string }>();
  const [moments, setMoments] = useState<WeeklyMoment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId || !weekStart) {
      return;
    }

    listWeeklyMoments({ groupId, weekStart })
      .then(setMoments)
      .catch((error) => Alert.alert('Could not load weekly memory', error.message))
      .finally(() => setLoading(false));
    recordGroupActivity(groupId, 'view').catch(() => undefined);
  }, [groupId, weekStart]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>THIS WEEK</Text>
        <Text style={styles.title}>{moments.length} moments</Text>
        <Text style={styles.copy}>{weekStart ? weekRangeLabel(weekStart) : ''}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#102033" />
      ) : moments.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Still taking shape</Text>
          <Text style={styles.emptyCopy}>Weekly memories appear quietly as days get kept.</Text>
        </View>
      ) : (
        <View style={styles.timeline}>
          {moments.map((moment) => (
            <View key={moment.id} style={styles.row}>
              <Text style={styles.date}>{moment.day_label.toUpperCase()}</Text>
              <View style={styles.rowBody}>
                <Text style={styles.time}>{moment.time_label}</Text>
                <Text style={styles.name}>{moment.display_name.toUpperCase()}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {groupId ? <ExportActions groupId={groupId} videoUri={null} /> : null}
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
    borderColor: '#E5E1DA',
    borderRadius: 8,
    padding: 18,
    backgroundColor: '#FFFFFF',
  },
  kicker: {
    color: '#2F80ED',
    fontSize: 12,
    fontWeight: '900',
  },
  title: {
    marginTop: 8,
    color: '#102033',
    fontSize: 32,
    fontWeight: '900',
  },
  copy: {
    marginTop: 8,
    color: '#5D6974',
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
    borderColor: '#E5E1DA',
    borderRadius: 8,
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
    color: '#102033',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyCopy: {
    marginTop: 8,
    color: '#5D6974',
    fontSize: 15,
    lineHeight: 22,
  },
});
