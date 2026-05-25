import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, type Href, useFocusEffect } from 'expo-router';

import { TodayOverview } from '@/src/features/home/TodayOverview';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { listMyGroups } from '@/src/features/groups/groupService';
import { listPostableGroups, type PostableGroup } from '@/src/features/posts/postService';

export default function TabOneScreen() {
  const { isProfileComplete, isSupabaseConfigured, profile, signOut, status } = useAuth();
  const [groups, setGroups] = useState<PostableGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const isSignedIn = status === 'signed-in';
  const canLoadGroups = isSignedIn && isProfileComplete;
  const availableGroups = groups.filter((group) => !group.posted_today);
  const postedGroups = groups.filter((group) => group.posted_today);
  const todayLabel = new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    weekday: 'short',
  }).format(new Date());

  useFocusEffect(
    useCallback(() => {
      if (!canLoadGroups) {
        setGroups([]);
        return;
      }

      setLoadingGroups(true);
      listMyGroups()
        .then(listPostableGroups)
        .then(setGroups)
        .catch(() => setGroups([]))
        .finally(() => setLoadingGroups(false));
    }, [canLoadGroups]),
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.topline}>
          <Text style={styles.wordmark}>dayby</Text>
          <Text style={styles.date}>{todayLabel}</Text>
        </View>
        <Text style={styles.hero}>Two seconds a day.{'\n'}One minute a month.</Text>
        <Text style={styles.copy}>A quiet memory, made by your group.</Text>
      </View>

      <TodayOverview />

      {!isSupabaseConfigured ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Setup needed</Text>
          <Text style={styles.panelText}>
            Add Supabase values to `.env.local` when your project is ready. The app can keep moving locally meanwhile.
          </Text>
        </View>
      ) : null}

      <View style={styles.focusPanel}>
        <Text style={styles.kicker}>Today</Text>
        <Text style={styles.panelTitle}>
          {isSignedIn ? `Hi${profile?.display_name ? `, ${profile.display_name}` : ''}` : 'Start'}
        </Text>
        <Text style={styles.panelText}>
          {getNextAction({
            availableCount: availableGroups.length,
            groupCount: groups.length,
            isProfileComplete,
            postedCount: postedGroups.length,
            status,
          })}
        </Text>
        <View style={styles.actionRow}>
          {!isSignedIn ? (
            <Link href="/(auth)/sign-in" asChild>
              <PrimaryButton disabled={!isSupabaseConfigured} onPress={() => undefined}>
                Sign in
              </PrimaryButton>
            </Link>
          ) : !isProfileComplete ? (
            <Link href="/profile-setup" asChild>
              <PrimaryButton onPress={() => undefined}>Set profile</PrimaryButton>
            </Link>
          ) : loadingGroups ? (
            <ActivityIndicator color="#171615" />
          ) : groups.length === 0 ? (
            <View style={styles.signedInActions}>
              <Link href="/groups/create" asChild>
                <PrimaryButton onPress={() => undefined} variant="accent">
                  Create group
                </PrimaryButton>
              </Link>
              <Link href="/groups/join" asChild>
                <PrimaryButton onPress={() => undefined} variant="light">
                  Enter code
                </PrimaryButton>
              </Link>
            </View>
          ) : availableGroups.length > 0 ? (
            <View style={styles.signedInActions}>
              <Link href={'/camera' as Href} asChild>
                <PrimaryButton onPress={() => undefined} variant="accent">
                  Capture today
                </PrimaryButton>
              </Link>
              <Link href={'/(tabs)/groups' as Href} asChild>
                <PrimaryButton onPress={() => undefined} variant="light">
                  {availableGroups.length} group{availableGroups.length > 1 ? 's' : ''} open today
                </PrimaryButton>
              </Link>
            </View>
          ) : (
            <View style={styles.signedInActions}>
              <Link href={'/(tabs)/groups' as Href} asChild>
                <PrimaryButton onPress={() => undefined} variant="accent">
                  View groups
                </PrimaryButton>
              </Link>
              <PrimaryButton onPress={() => void signOut()} variant="light">
                Log out
              </PrimaryButton>
            </View>
          )}
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Memory rhythm</Text>
        <Text style={styles.panelText}>
          Tonight is for posting. Tomorrow is for voting. The month stays the main memory.
        </Text>
      </View>
    </ScrollView>
  );
}

function getNextAction(input: {
  availableCount: number;
  groupCount: number;
  isProfileComplete: boolean;
  postedCount: number;
  status: string;
}) {
  const { availableCount, groupCount, isProfileComplete, postedCount, status } = input;

  if (status === 'missing-config') {
    return 'Create Supabase, add environment values, then sign in with Apple or Google.';
  }

  if (status === 'checking') {
    return 'Checking your session.';
  }

  if (status !== 'signed-in') {
    return 'Sign in to create a group and keep one moment from today.';
  }

  if (!isProfileComplete) {
    return 'Set your display name before creating your first group.';
  }

  if (groupCount === 0) {
    return 'Create or join a group before keeping your first moment.';
  }

  if (availableCount > 0) {
    return `${availableCount} group${availableCount > 1 ? 's' : ''} can still receive today's 2 seconds.`;
  }

  return `You're done for today. ${postedCount} group${postedCount > 1 ? 's' : ''} kept your moment.`;
}

const styles = StyleSheet.create({
  container: {
    gap: 22,
    paddingHorizontal: 22,
    paddingBottom: 40,
    paddingTop: 84,
    backgroundColor: '#FFFDF8',
  },
  header: {
    gap: 10,
  },
  topline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordmark: {
    color: '#171615',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0,
  },
  date: {
    color: '#7A736B',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  hero: {
    color: '#141312',
    fontSize: 44,
    fontWeight: '800',
    lineHeight: 48,
    letterSpacing: 0,
  },
  copy: {
    color: '#57514B',
    fontSize: 18,
    lineHeight: 25,
  },
  focusPanel: {
    borderWidth: 1,
    borderColor: '#E4DED5',
    borderRadius: 8,
    padding: 18,
    backgroundColor: '#FFFFFF',
  },
  panel: {
    borderTopWidth: 1,
    borderTopColor: '#E5E1DA',
    paddingTop: 18,
  },
  notice: {
    borderWidth: 1,
    borderColor: '#E5E1DA',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FBFAF7',
  },
  noticeTitle: {
    color: '#171615',
    fontSize: 16,
    fontWeight: '700',
  },
  panelTitle: {
    color: '#171615',
    fontSize: 18,
    fontWeight: '700',
  },
  kicker: {
    marginBottom: 10,
    color: '#E65A3C',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  panelText: {
    marginTop: 8,
    color: '#68625D',
    fontSize: 15,
    lineHeight: 22,
  },
  actionRow: {
    marginTop: 16,
  },
  signedInActions: {
    gap: 10,
  },
});
