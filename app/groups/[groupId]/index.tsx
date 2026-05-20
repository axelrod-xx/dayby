import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { getGroup } from '@/src/features/groups/groupService';
import type { GroupWithMembership } from '@/src/features/groups/types';

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [group, setGroup] = useState<GroupWithMembership | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) {
      return;
    }

    getGroup(groupId)
      .then(setGroup)
      .catch((error) => Alert.alert('Could not load group', error.message))
      .finally(() => setLoading(false));
  }, [groupId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#171615" />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Group not found</Text>
        <Text style={styles.copy}>You may need to join this group first.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{group.name}</Text>
        <Text style={styles.copy}>{group.timezone}</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Today</Text>
        <Text style={styles.panelText}>Capture flow comes next: shoot 10 sec, keep 2 sec.</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Settings</Text>
        <Text style={styles.panelText}>
          {group.member_limit} members on {group.plan}. Monthly highlight is{' '}
          {group.monthly_highlight_enabled ? 'on' : 'off'}.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFEFB',
  },
  container: {
    flex: 1,
    gap: 24,
    paddingHorizontal: 22,
    paddingTop: 84,
    backgroundColor: '#FFFEFB',
  },
  title: {
    color: '#171615',
    fontSize: 34,
    fontWeight: '700',
  },
  copy: {
    marginTop: 10,
    color: '#68625D',
    fontSize: 16,
    lineHeight: 23,
  },
  panel: {
    borderTopWidth: 1,
    borderTopColor: '#E5E1DA',
    paddingTop: 18,
  },
  panelTitle: {
    color: '#171615',
    fontSize: 18,
    fontWeight: '700',
  },
  panelText: {
    marginTop: 8,
    color: '#68625D',
    fontSize: 15,
    lineHeight: 22,
  },
});
