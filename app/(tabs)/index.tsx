import { StyleSheet, Text, View } from 'react-native';
import { Link, type Href } from 'expo-router';

import { TodayOverview } from '@/src/features/home/TodayOverview';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useAuth } from '@/src/features/auth/AuthProvider';

export default function TabOneScreen() {
  const { isProfileComplete, isSupabaseConfigured, profile, signOut, status } = useAuth();
  const isSignedIn = status === 'signed-in';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>dayby</Text>
        <Text style={styles.copy}>Shoot 10 sec. Keep 2 sec.</Text>
        <Text style={styles.copy}>Your month becomes 1 minute.</Text>
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

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>
          {isSignedIn ? `Hi${profile?.display_name ? `, ${profile.display_name}` : ''}` : 'Start'}
        </Text>
        <Text style={styles.panelText}>{getNextAction(status, isProfileComplete)}</Text>
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
          ) : (
            <View style={styles.signedInActions}>
              <Link href={'/camera' as Href} asChild>
                <PrimaryButton onPress={() => undefined}>Capture today</PrimaryButton>
              </Link>
              <PrimaryButton onPress={() => void signOut()} variant="light">
                Log out
              </PrimaryButton>
            </View>
          )}
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Next up</Text>
        <Text style={styles.panelText}>
          Apple and Google login, profile setup, then group creation.
        </Text>
      </View>
    </View>
  );
}

function getNextAction(status: string, isProfileComplete: boolean) {
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

  return 'Create your first group, then capture the first 10 seconds worth remembering.';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 22,
    paddingHorizontal: 22,
    paddingTop: 84,
    backgroundColor: '#FFFEFB',
  },
  header: {
    gap: 8,
  },
  wordmark: {
    color: '#171615',
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: 0,
  },
  copy: {
    color: '#57534E',
    fontSize: 18,
    lineHeight: 25,
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
