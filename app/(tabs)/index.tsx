import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Link, type Href, useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useVideoPlayer, VideoView } from 'expo-video';

import { TodayOverview } from '@/src/features/home/TodayOverview';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { listMyGroups } from '@/src/features/groups/groupService';
import { NotificationCard } from '@/src/features/notifications/NotificationCard';
import { listPostableGroups, type PostableGroup } from '@/src/features/posts/postService';

const homeDemoVideoUri = process.env.EXPO_PUBLIC_HOME_DEMO_VIDEO_URL ?? '';

const demoMoments = [
  { date: '05.01 FRI', name: 'RYO', time: '18:42' },
  { date: '05.02 SAT', name: 'MIKA', time: '21:08' },
  { date: '05.03 SUN', name: 'YUN', time: '07:31' },
  { date: '05.04 MON', name: 'SORA', time: '22:14' },
  { date: '05.05 TUE', name: 'NANA', time: '17:56' },
  { date: '05.06 WED', name: 'JIN', time: '20:11' },
  { date: '05.07 THU', name: 'AOI', time: '16:33' },
  { date: '05.08 FRI', name: 'REN', time: '23:02' },
  { date: '05.09 SAT', name: 'MIO', time: '19:27' },
  { date: '05.10 SUN', name: 'KAI', time: '12:44' },
  { date: '05.11 MON', name: 'RYO', time: '21:15' },
  { date: '05.12 TUE', name: 'MIKA', time: '18:03' },
  { date: '05.13 WED', name: 'YUN', time: '07:54' },
  { date: '05.14 THU', name: 'SORA', time: '22:30' },
  { date: '05.15 FRI', name: 'NANA', time: '17:19' },
  { date: '05.16 SAT', name: 'JIN', time: '20:48' },
  { date: '05.17 SUN', name: 'AOI', time: '15:06' },
  { date: '05.18 MON', name: 'REN', time: '23:11' },
  { date: '05.19 TUE', name: 'MIO', time: '19:52' },
  { date: '05.20 WED', name: 'KAI', time: '12:09' },
  { date: '05.21 THU', name: 'RYO', time: '18:37' },
  { date: '05.22 FRI', name: 'MIKA', time: '21:40' },
  { date: '05.23 SAT', name: 'YUN', time: '08:20' },
  { date: '05.24 SUN', name: 'SORA', time: '22:05' },
  { date: '05.25 MON', name: 'NANA', time: '17:45' },
  { date: '05.26 TUE', name: 'JIN', time: '20:14' },
  { date: '05.27 WED', name: 'AOI', time: '16:58' },
  { date: '05.28 THU', name: 'REN', time: '23:33' },
  { date: '05.29 FRI', name: 'MIO', time: '19:01' },
  { date: '05.30 SAT', name: 'KAI', time: '12:26' },
  { date: '05.31 SUN', name: 'ALL', time: '21:59' },
];

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

  if (!isSignedIn) {
    return <SignedOutHome isSupabaseConfigured={isSupabaseConfigured} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerCard}>
        <View style={styles.topline}>
          <Text style={styles.wordmark}>dayby</Text>
          <Text style={styles.date}>{todayLabel}</Text>
        </View>
        <View>
          <Text style={styles.hero}>A month,{'\n'}made by friends.</Text>
          <Text style={styles.copy}>Keep one tiny moment today. Vote tomorrow. Let the month become the memory.</Text>
        </View>
      </View>

      <TodayOverview />

      {isSignedIn && isProfileComplete ? <NotificationCard /> : null}

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
              <PrimaryButton disabled={!isSupabaseConfigured} onPress={() => undefined} variant="accent">
                Start with friends
              </PrimaryButton>
            </Link>
          ) : !isProfileComplete ? (
            <Link href="/profile-setup" asChild>
              <PrimaryButton onPress={() => undefined}>Set profile</PrimaryButton>
            </Link>
          ) : loadingGroups ? (
            <ActivityIndicator color="#102033" />
          ) : groups.length === 0 ? (
            <View style={styles.signedInActions}>
              <Link href="/groups/create" asChild>
                <PrimaryButton onPress={() => undefined} variant="accent">
                  Start a group
                </PrimaryButton>
              </Link>
              <Link href="/groups/join" asChild>
                <PrimaryButton onPress={() => undefined} variant="light">
                  Join friends
                </PrimaryButton>
              </Link>
            </View>
          ) : availableGroups.length > 0 ? (
            <View style={styles.signedInActions}>
              <Link href={'/camera' as Href} asChild>
                <PrimaryButton onPress={() => undefined} variant="accent">
                  Keep today
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
                  Open groups
                </PrimaryButton>
              </Link>
            </View>
          )}
        </View>
      </View>

      <View style={styles.rhythmPanel}>
        <Text style={styles.rhythmKicker}>How it flows</Text>
        <View style={styles.rhythmRow}>
          <Text style={styles.rhythmNumber}>01</Text>
          <Text style={styles.rhythmText}>Keep 2 seconds today.</Text>
        </View>
        <View style={styles.rhythmRow}>
          <Text style={styles.rhythmNumber}>02</Text>
          <Text style={styles.rhythmText}>Vote for yesterday.</Text>
        </View>
        <View style={styles.rhythmRow}>
          <Text style={styles.rhythmNumber}>03</Text>
          <Text style={styles.rhythmText}>Watch the month come together.</Text>
        </View>
      </View>

      {isSignedIn ? (
        <View style={styles.accountPanel}>
          <Text style={styles.accountText}>
            Signed in{profile?.display_name ? ` as ${profile.display_name}` : ''}
          </Text>
          <PrimaryButton onPress={() => void signOut()} variant="light">
            Log out
          </PrimaryButton>
        </View>
      ) : null}
    </ScrollView>
  );
}

function SignedOutHome({
  isSupabaseConfigured,
}: {
  isSupabaseConfigured: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMoment = demoMoments[activeIndex];
  const { height, width } = useWindowDimensions();
  const isCompact = height < 760;
  const router = useRouter();
  const demoPlayer = useVideoPlayer(homeDemoVideoUri, (instance) => {
    instance.loop = true;
    instance.muted = true;
    if (homeDemoVideoUri) {
      void instance.play();
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % demoMoments.length);
    }, 1900);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!homeDemoVideoUri) {
      return;
    }

    demoPlayer.play();
  }, [demoPlayer]);

  return (
    <View style={styles.signedOutScreen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={styles.demoVideo}>
        {homeDemoVideoUri ? (
          <VideoView contentFit="cover" nativeControls={false} player={demoPlayer} style={styles.homeDemoVideo} />
        ) : (
          <View style={styles.homeDemoFallback}>
            <View style={styles.demoWash} />
            <View
              style={[
                styles.demoFrame,
                {
                  height: Math.max(height * 0.82, 620),
                  left: 0,
                  right: Math.max(width * 0.12, 44),
                  top: isCompact ? 252 : 282,
                },
              ]}
            />
          </View>
        )}
        <View style={styles.demoShadowBand} />
        <View style={[styles.demoBottomMeta, { bottom: isCompact ? 194 : 214 }]}>
          <Text style={styles.demoDate}>{activeMoment.date}</Text>
          <Text style={styles.demoTime}>{activeMoment.time}</Text>
          <Text style={styles.demoName}>{activeMoment.name}</Text>
        </View>
      </View>

      <View style={[styles.signedOutBrand, { top: isCompact ? 104 : 126 }]}>
        <Text style={styles.signedOutWordmark}>dayby</Text>
        <Text style={styles.signedOutCopy}>Two seconds a day.{'\n'}One minute a month.</Text>
      </View>

      <View
        style={[
          styles.signedOutFooter,
          {
            bottom: isCompact ? 86 : 106,
          },
        ]}>
        <Pressable
          accessibilityRole="button"
          disabled={!isSupabaseConfigured}
          onPress={() => router.push('/(auth)/sign-in')}
          style={({ pressed }) => [
            styles.signedOutCta,
            !isSupabaseConfigured && styles.signedOutCtaDisabled,
            pressed && styles.signedOutCtaPressed,
          ]}>
          <Text style={styles.signedOutCtaText}>Start with friends</Text>
        </Pressable>
      </View>
    </View>
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
    gap: 20,
    paddingHorizontal: 22,
    paddingBottom: 116,
    paddingTop: 84,
    backgroundColor: '#F7FBFF',
  },
  headerCard: {
    minHeight: 248,
    justifyContent: 'space-between',
    borderRadius: 8,
    padding: 18,
    backgroundColor: '#EAF4FF',
  },
  topline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordmark: {
    color: '#102033',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
  },
  date: {
    color: '#5D7488',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  hero: {
    color: '#102033',
    fontSize: 42,
    fontWeight: '800',
    lineHeight: 46,
    letterSpacing: 0,
  },
  copy: {
    marginTop: 12,
    color: '#5D6974',
    fontSize: 17,
    lineHeight: 24,
  },
  signedOutScreen: {
    flex: 1,
    minHeight: '100%',
    backgroundColor: '#102033',
    overflow: 'hidden',
  },
  demoVideo: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#102033',
  },
  homeDemoVideo: {
    ...StyleSheet.absoluteFillObject,
  },
  homeDemoFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1D211E',
  },
  demoWash: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#1D211E',
  },
  demoFrame: {
    position: 'absolute',
    bottom: 0,
    borderRadius: 8,
    backgroundColor: '#2C332D',
    opacity: 0.88,
  },
  demoShadowBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 250,
    backgroundColor: 'rgba(12, 11, 10, 0.34)',
  },
  demoBottomMeta: {
    position: 'absolute',
    left: 22,
  },
  demoDate: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
  },
  demoTime: {
    marginTop: 6,
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },
  demoName: {
    marginTop: 5,
    color: '#B8C9DA',
    fontSize: 13,
    fontWeight: '900',
  },
  signedOutBrand: {
    position: 'absolute',
    left: 22,
    right: 22,
  },
  signedOutWordmark: {
    color: '#FFFFFF',
    fontSize: 54,
    fontWeight: '800',
    letterSpacing: 0,
  },
  signedOutCopy: {
    marginTop: 10,
    color: '#F1ECE4',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  signedOutFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  signedOutCta: {
    minHeight: 52,
    width: 300,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#2F80ED',
  },
  signedOutCtaDisabled: {
    opacity: 0.5,
  },
  signedOutCtaPressed: {
    opacity: 0.82,
  },
  signedOutCtaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  focusPanel: {
    borderWidth: 1,
    borderColor: '#102033',
    borderRadius: 8,
    padding: 18,
    backgroundColor: '#FFFFFF',
  },
  rhythmPanel: {
    gap: 12,
    borderRadius: 8,
    padding: 18,
    backgroundColor: '#EAF4FF',
  },
  rhythmKicker: {
    color: '#5D7488',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  rhythmRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rhythmNumber: {
    width: 34,
    color: '#2F80ED',
    fontSize: 15,
    fontWeight: '900',
  },
  rhythmText: {
    flex: 1,
    color: '#102033',
    fontSize: 16,
    fontWeight: '800',
  },
  notice: {
    borderWidth: 1,
    borderColor: '#E5E1DA',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FBFAF7',
  },
  noticeTitle: {
    color: '#102033',
    fontSize: 16,
    fontWeight: '700',
  },
  panelTitle: {
    color: '#102033',
    fontSize: 18,
    fontWeight: '700',
  },
  kicker: {
    marginBottom: 10,
    color: '#2F80ED',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  panelText: {
    marginTop: 8,
    color: '#5D6974',
    fontSize: 15,
    lineHeight: 22,
  },
  actionRow: {
    marginTop: 16,
  },
  signedInActions: {
    gap: 10,
  },
  accountPanel: {
    borderTopWidth: 1,
    borderTopColor: '#E5E1DA',
    gap: 10,
    paddingTop: 18,
  },
  accountText: {
    color: '#78716C',
    fontSize: 13,
    fontWeight: '700',
  },
});
