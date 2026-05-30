import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Link, type Href, useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useVideoPlayer, VideoView } from 'expo-video';

import { TodayOverview } from '@/src/features/home/TodayOverview';
import { LanguageSwitcher } from '@/src/features/i18n/LanguageSwitcher';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { listMyGroups } from '@/src/features/groups/groupService';
import { listPostableGroups, type PostableGroup } from '@/src/features/posts/postService';
import { useI18n, type TranslateFn } from '@/src/lib/i18n/I18nProvider';

const homeDemoVideoUri = process.env.EXPO_PUBLIC_HOME_DEMO_VIDEO_URL ?? '';

const demoMoments = [
  { date: '2026-05-01', name: 'RYO', time: '18:42' },
  { date: '2026-05-02', name: 'MIKA', time: '21:08' },
  { date: '2026-05-03', name: 'YUN', time: '07:31' },
  { date: '2026-05-04', name: 'SORA', time: '22:14' },
  { date: '2026-05-05', name: 'NANA', time: '17:56' },
  { date: '2026-05-06', name: 'JIN', time: '20:11' },
  { date: '2026-05-07', name: 'AOI', time: '16:33' },
  { date: '2026-05-08', name: 'REN', time: '23:02' },
  { date: '2026-05-09', name: 'MIO', time: '19:27' },
  { date: '2026-05-10', name: 'KAI', time: '12:44' },
  { date: '2026-05-11', name: 'RYO', time: '21:15' },
  { date: '2026-05-12', name: 'MIKA', time: '18:03' },
  { date: '2026-05-13', name: 'YUN', time: '07:54' },
  { date: '2026-05-14', name: 'SORA', time: '22:30' },
  { date: '2026-05-15', name: 'NANA', time: '17:19' },
  { date: '2026-05-16', name: 'JIN', time: '20:48' },
  { date: '2026-05-17', name: 'AOI', time: '15:06' },
  { date: '2026-05-18', name: 'REN', time: '23:11' },
  { date: '2026-05-19', name: 'MIO', time: '19:52' },
  { date: '2026-05-20', name: 'KAI', time: '12:09' },
  { date: '2026-05-21', name: 'RYO', time: '18:37' },
  { date: '2026-05-22', name: 'MIKA', time: '21:40' },
  { date: '2026-05-23', name: 'YUN', time: '08:20' },
  { date: '2026-05-24', name: 'SORA', time: '22:05' },
  { date: '2026-05-25', name: 'NANA', time: '17:45' },
  { date: '2026-05-26', name: 'JIN', time: '20:14' },
  { date: '2026-05-27', name: 'AOI', time: '16:58' },
  { date: '2026-05-28', name: 'REN', time: '23:33' },
  { date: '2026-05-29', name: 'MIO', time: '19:01' },
  { date: '2026-05-30', name: 'KAI', time: '12:26' },
  { date: '2026-05-31', name: 'ALL', time: '21:59' },
];

export default function TabOneScreen() {
  const { isProfileComplete, isSupabaseConfigured, profile, signOut, status } = useAuth();
  const { formatters, t } = useI18n();
  const [groups, setGroups] = useState<PostableGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const isSignedIn = status === 'signed-in';
  const canLoadGroups = isSignedIn && isProfileComplete;
  const availableGroups = groups.filter((group) => !group.posted_today);
  const postedGroups = groups.filter((group) => group.posted_today);
  const todayLabel = formatters.todayLabel();

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
          <Text style={styles.hero}>{t('home.heroTitle')}</Text>
          <Text style={styles.copy}>{t('home.heroCopy')}</Text>
        </View>
      </View>

      <TodayOverview />

      {!isSupabaseConfigured ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>{t('home.setupNeededTitle')}</Text>
          <Text style={styles.panelText}>
            {t('home.setupNeededCopy')}
          </Text>
        </View>
      ) : null}

      <View style={styles.focusPanel}>
        <Text style={styles.kicker}>{t('home.todayKicker')}</Text>
        <Text style={styles.panelTitle}>
          {isSignedIn
            ? profile?.display_name
              ? t('home.greetingWithName', { name: profile.display_name })
              : t('home.greeting')
            : t('home.startTitle')}
        </Text>
        <Text style={styles.panelText}>
          {getNextAction({
            availableCount: availableGroups.length,
            groupCount: groups.length,
            isProfileComplete,
            postedCount: postedGroups.length,
            status,
            t,
          })}
        </Text>
        <View style={styles.actionRow}>
          {!isSignedIn ? (
            <Link href="/(auth)/sign-in" asChild>
              <PrimaryButton disabled={!isSupabaseConfigured} onPress={() => undefined} variant="accent">
                {t('home.startWithFriends')}
              </PrimaryButton>
            </Link>
          ) : !isProfileComplete ? (
            <Link href="/profile-setup" asChild>
              <PrimaryButton onPress={() => undefined}>{t('home.setProfile')}</PrimaryButton>
            </Link>
          ) : loadingGroups ? (
            <ActivityIndicator color="#102033" />
          ) : groups.length === 0 ? (
            <View style={styles.signedInActions}>
              <Link href="/groups/create" asChild>
                <PrimaryButton onPress={() => undefined} variant="accent">
                  {t('home.startGroup')}
                </PrimaryButton>
              </Link>
              <Link href="/groups/join" asChild>
                <PrimaryButton onPress={() => undefined} variant="light">
                  {t('home.joinFriends')}
                </PrimaryButton>
              </Link>
            </View>
          ) : availableGroups.length > 0 ? (
            <View style={styles.signedInActions}>
              <Link href={'/camera' as Href} asChild>
                <PrimaryButton onPress={() => undefined} variant="accent">
                  {t('home.keepToday')}
                </PrimaryButton>
              </Link>
              <Link href={'/(tabs)/groups' as Href} asChild>
                <PrimaryButton onPress={() => undefined} variant="light">
                  {t('home.groupOpenToday', { count: availableGroups.length })}
                </PrimaryButton>
              </Link>
            </View>
          ) : (
            <View style={styles.signedInActions}>
              <Link href={'/(tabs)/groups' as Href} asChild>
                <PrimaryButton onPress={() => undefined} variant="accent">
                  {t('home.openGroups')}
                </PrimaryButton>
              </Link>
            </View>
          )}
        </View>
      </View>

      <View style={styles.rhythmPanel}>
        <Text style={styles.rhythmKicker}>{t('home.flowTitle')}</Text>
        <View style={styles.rhythmRow}>
          <Text style={styles.rhythmNumber}>01</Text>
          <Text style={styles.rhythmText}>{t('home.flowStep1')}</Text>
        </View>
        <View style={styles.rhythmRow}>
          <Text style={styles.rhythmNumber}>02</Text>
          <Text style={styles.rhythmText}>{t('home.flowStep2')}</Text>
        </View>
        <View style={styles.rhythmRow}>
          <Text style={styles.rhythmNumber}>03</Text>
          <Text style={styles.rhythmText}>{t('home.flowStep3')}</Text>
        </View>
      </View>

      {isSignedIn ? (
        <View style={styles.accountPanel}>
          <Text style={styles.accountText}>
            {profile?.display_name ? t('home.signedInAs', { name: profile.display_name }) : t('home.signedIn')}
          </Text>
          <LanguageSwitcher />
          <PrimaryButton onPress={() => void signOut()} variant="light">
            {t('home.logOut')}
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
  const { formatters, t } = useI18n();
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
          <Text style={styles.demoDate}>
            {formatters.monthDay(activeMoment.date)} {formatters.weekdayShort(activeMoment.date).toUpperCase()}
          </Text>
          <Text style={styles.demoTime}>{activeMoment.time}</Text>
          <Text style={styles.demoName}>{activeMoment.name}</Text>
        </View>
      </View>

      <View style={[styles.signedOutBrand, { top: isCompact ? 104 : 126 }]}>
        <Text style={styles.signedOutWordmark}>dayby</Text>
        <Text style={styles.signedOutCopy}>{t('home.signedOutCopy')}</Text>
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
          <Text adjustsFontSizeToFit numberOfLines={1} style={styles.signedOutCtaText}>
            {t('home.startWithFriends')}
          </Text>
        </Pressable>
        <View style={styles.signedOutLanguage}>
          <LanguageSwitcher variant="dark" />
        </View>
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
  t: TranslateFn;
}) {
  const { availableCount, groupCount, isProfileComplete, postedCount, status, t } = input;

  if (status === 'missing-config') {
    return t('home.nextAction.missingConfig');
  }

  if (status === 'checking') {
    return t('home.nextAction.checking');
  }

  if (status !== 'signed-in') {
    return t('home.nextAction.signedOut');
  }

  if (!isProfileComplete) {
    return t('home.nextAction.profile');
  }

  if (groupCount === 0) {
    return t('home.nextAction.noGroups');
  }

  if (availableCount > 0) {
    return t('home.nextAction.availableGroups', { count: availableCount });
  }

  return t('home.nextAction.doneToday', { count: postedCount });
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
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#EAF4FF',
    shadowColor: '#102033',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
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
    color: '#4E6A80',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  hero: {
    color: '#102033',
    fontSize: 42,
    fontWeight: '800',
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  copy: {
    marginTop: 12,
    color: '#4E6A80',
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
    borderRadius: 16,
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
    letterSpacing: -1,
  },
  signedOutCopy: {
    marginTop: 10,
    color: '#E4F0FB',
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
    borderRadius: 20,
    backgroundColor: '#2F80ED',
  },
  signedOutCtaDisabled: {
    opacity: 0.5,
  },
  signedOutCtaPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }],
  },
  signedOutCtaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  signedOutLanguage: {
    width: 326,
    maxWidth: '88%',
    marginTop: 12,
  },
  focusPanel: {
    borderWidth: 1,
    borderColor: '#2F80ED',
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#FFFFFF',
  },
  rhythmPanel: {
    gap: 12,
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#EAF4FF',
  },
  rhythmKicker: {
    color: '#2F80ED',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
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
    borderColor: '#D8E9F5',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#F3F8FC',
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
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  panelText: {
    marginTop: 8,
    color: '#4E6A80',
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
    borderTopColor: '#D8E9F5',
    gap: 10,
    paddingTop: 18,
  },
  accountText: {
    color: '#617B8F',
    fontSize: 13,
    fontWeight: '700',
  },
});
