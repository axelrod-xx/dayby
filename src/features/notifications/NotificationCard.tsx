import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';

import {
  getNotificationPermissionState,
  requestNotificationPermission,
  scheduleLocalReminderPreview,
  type NotificationPermissionState,
} from './notificationService';

export function NotificationCard() {
  const [permission, setPermission] = useState<NotificationPermissionState>('undetermined');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getNotificationPermissionState()
      .then(setPermission)
      .catch(() => setPermission('undetermined'));
  }, []);

  const enable = async () => {
    try {
      setLoading(true);
      const next = await requestNotificationPermission();
      setPermission(next);
      if (next === 'granted') {
        Alert.alert('Reminders on', 'dayby will keep reminders quiet and useful.');
      }
    } catch (error) {
      Alert.alert('Notifications failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const preview = async () => {
    try {
      setLoading(true);
      const next = await scheduleLocalReminderPreview();
      setPermission(next);
    } catch (error) {
      Alert.alert('Preview failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>Reminders</Text>
      <Text style={styles.title}>{permission === 'granted' ? 'Quiet reminders are on.' : 'Never miss today.'}</Text>
      <Text style={styles.copy}>
        A gentle nudge helps the group keep the habit. No noisy streaks, no guilt.
      </Text>
      <View style={styles.actions}>
        {permission === 'granted' ? (
          <PrimaryButton loading={loading} onPress={() => void preview()} variant="light">
            Preview reminder
          </PrimaryButton>
        ) : (
          <PrimaryButton loading={loading} onPress={() => void enable()} variant="accent">
            Turn on reminders
          </PrimaryButton>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#DCEAF8',
    borderRadius: 8,
    padding: 18,
    backgroundColor: '#F1F7FF',
  },
  kicker: {
    color: '#2F80ED',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 8,
    color: '#102033',
    fontSize: 22,
    fontWeight: '900',
  },
  copy: {
    marginTop: 8,
    color: '#5D6974',
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    marginTop: 14,
  },
});
