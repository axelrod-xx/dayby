import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Link, type Href, useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { TodayOverview } from '@/src/features/home/TodayOverview';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { listMyGroups } from '@/src/features/groups/groupService';
import { listPostableGroups, type PostableGroup } from '@/src/features/posts/postService';

const demoMoments = [
  {
    accent: '#E65A3C',
    date: '05.03 SAT',
    name: 'RYO',
    scene: '#2C332D',
    shade: '#1D211E',
    time: '18:42',
  },
  {
    accent: '#D9B36D',
    date: '05.11 SUN',
    name: 'MIKA',
    scene: '#35302A',
    shade: '#221F1C',
    time: '21:08',
  },
  {
    accent: '#8DAA91',
    date: '05.20 WED',
    name: 'YUN',
    scene: '#26343B',
    shade: '#171F23',
    time: '07:31',
  },
  {
    accent: '#C96E56',
    date: '05.28 THU',
    name: 'SORA',
    scene: '#40302E',
    shade: '#241C1B',
    time: '22:14',
  },
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
              <PrimaryButton disabled={!isSupabaseConfigured} onPress={() => undefined} variant="accent">
                Start with friends
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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % demoMoments.length);
    }, 1700);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.signedOutScreen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={[styles.demoVideo, { backgroundColor: activeMoment.shade }]}>
        <View style={[styles.demoWash, { backgroundColor: activeMoment.shade }]} />
        <View
          style={[
            styles.demoFrame,
            {
              backgroundColor: activeMoment.scene,
              height: Math.max(height * 0.82, 620),
              left: 0,
              right: Math.max(width * 0.12, 44),
              top: isCompact ? 252 : 282,
            },
          ]}
        />
        <View
          style={[
            styles.demoSideFrame,
            {
              backgroundColor: activeMoment.accent,
              top: isCompact ? 420 : 464,
              transform: [{ translateX: Math.max(width * 0.18, 72) }],
              width: Math.max(width * 0.38, 150),
            },
          ]}
        />
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

      <View style={styles.demoProgress}>
        {demoMoments.map((moment, index) => (
          <View
            key={moment.date}
            style={[styles.demoProgressDot, index === activeIndex && styles.demoProgressDotActive]}
          />
        ))}
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
    paddingBottom: 40,
    paddingTop: 84,
    backgroundColor: '#FFFDF8',
  },
  header: {
    gap: 9,
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
    fontSize: 40,
    fontWeight: '800',
    lineHeight: 44,
    letterSpacing: 0,
  },
  copy: {
    color: '#57514B',
    fontSize: 17,
    lineHeight: 24,
  },
  signedOutScreen: {
    flex: 1,
    minHeight: '100%',
    backgroundColor: '#141312',
    overflow: 'hidden',
  },
  demoVideo: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#171615',
  },
  demoWash: {
    position: 'absolute',
    left: -70,
    right: -70,
    top: -40,
    bottom: -40,
    transform: [{ rotate: '-7deg' }],
  },
  demoFrame: {
    position: 'absolute',
    bottom: 0,
    borderRadius: 8,
    opacity: 0.88,
  },
  demoSideFrame: {
    position: 'absolute',
    right: 0,
    height: 270,
    borderRadius: 8,
    opacity: 0.62,
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
    color: '#FFFEFB',
    fontSize: 19,
    fontWeight: '900',
  },
  demoTime: {
    marginTop: 6,
    color: '#FFFEFB',
    fontSize: 34,
    fontWeight: '900',
  },
  demoName: {
    marginTop: 5,
    color: '#D8D2C8',
    fontSize: 13,
    fontWeight: '900',
  },
  signedOutBrand: {
    position: 'absolute',
    left: 22,
    right: 22,
  },
  signedOutWordmark: {
    color: '#FFFEFB',
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
  demoProgress: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 176,
    flexDirection: 'row',
    gap: 6,
  },
  demoProgressDot: {
    flex: 1,
    height: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 254, 251, 0.24)',
  },
  demoProgressDotActive: {
    backgroundColor: 'rgba(255, 254, 251, 0.92)',
  },
  signedOutFooter: {
    position: 'absolute',
    left: 22,
    width: '88%',
  },
  signedOutCta: {
    minHeight: 52,
    width: '84%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#E65A3C',
  },
  signedOutCtaDisabled: {
    opacity: 0.5,
  },
  signedOutCtaPressed: {
    opacity: 0.82,
  },
  signedOutCtaText: {
    color: '#FFFEFB',
    fontSize: 16,
    fontWeight: '800',
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
