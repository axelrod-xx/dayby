import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { listDailyMoments, type DailyMoment } from '@/src/features/reels/reelService';
import { getMyVote, voteForPost } from '@/src/features/votes/voteService';

export default function VoteScreen() {
  const { groupId, date } = useLocalSearchParams<{ groupId: string; date: string }>();
  const [moments, setMoments] = useState<DailyMoment[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [existingVote, setExistingVote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!groupId || !date) {
      return;
    }

    Promise.all([listDailyMoments(groupId, date), getMyVote(groupId, date)])
      .then(([nextMoments, vote]) => {
        setMoments(nextMoments);
        setExistingVote(vote);
        setSelectedPostId(vote);
      })
      .catch((error) => Alert.alert('Could not load vote', error.message))
      .finally(() => setLoading(false));
  }, [date, groupId]);

  const save = async () => {
    if (!groupId || !date || !selectedPostId) {
      return;
    }

    try {
      setSaving(true);
      await voteForPost({ groupId, postId: selectedPostId, targetDate: date });
      setExistingVote(selectedPostId);
    } catch (error) {
      Alert.alert('Vote failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.title}>Best 2 sec</Text>
        <Text style={styles.copy}>Pick the one moment your group should keep from {date}.</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#171615" />
      ) : (
        <View style={styles.list}>
          {moments.map((moment) => {
            const selected = selectedPostId === moment.post_id;
            return (
              <Pressable
                disabled={Boolean(existingVote)}
                key={moment.post_id}
                onPress={() => setSelectedPostId(moment.post_id)}
                style={({ pressed }) => [
                  styles.voteCard,
                  selected && styles.voteCardSelected,
                  pressed && styles.pressed,
                  existingVote && !selected && styles.dimmed,
                ]}>
                <View>
                  <Text style={styles.time}>{moment.time_label}</Text>
                  <Text style={styles.name}>{moment.display_name}</Text>
                </View>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  <Text style={styles.radioText}>{selected ? '✓' : ''}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {existingVote ? (
        <View style={styles.locked}>
          <Text style={styles.lockedTitle}>Vote saved</Text>
          <Text style={styles.lockedCopy}>Results unlock after the deadline.</Text>
        </View>
      ) : (
        <PrimaryButton disabled={!selectedPostId || moments.length === 0} loading={saving} onPress={() => void save()}>
          Keep this moment
        </PrimaryButton>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 22,
    paddingHorizontal: 22,
    paddingBottom: 42,
    paddingTop: 84,
    backgroundColor: '#FFFEFB',
  },
  title: {
    color: '#171615',
    fontSize: 34,
    fontWeight: '900',
  },
  copy: {
    marginTop: 10,
    color: '#68625D',
    fontSize: 16,
    lineHeight: 23,
  },
  list: {
    gap: 10,
  },
  voteCard: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E1DA',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FBFAF7',
  },
  voteCardSelected: {
    borderColor: '#171615',
    backgroundColor: '#F5F1EA',
  },
  pressed: {
    opacity: 0.75,
  },
  dimmed: {
    opacity: 0.42,
  },
  time: {
    color: '#171615',
    fontSize: 22,
    fontWeight: '900',
  },
  name: {
    marginTop: 4,
    color: '#78716C',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  radio: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8D2C8',
    borderRadius: 16,
  },
  radioSelected: {
    borderColor: '#171615',
    backgroundColor: '#171615',
  },
  radioText: {
    color: '#FFFEFB',
    fontSize: 16,
    fontWeight: '900',
  },
  locked: {
    borderTopWidth: 1,
    borderTopColor: '#E5E1DA',
    paddingTop: 18,
  },
  lockedTitle: {
    color: '#171615',
    fontSize: 18,
    fontWeight: '800',
  },
  lockedCopy: {
    marginTop: 8,
    color: '#68625D',
    fontSize: 15,
  },
});
