import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs, usePathname, useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { useI18n } from '@/src/lib/i18n/I18nProvider';

function TabItem({
  active,
  href,
  icon,
  label,
}: {
  active: boolean;
  href: '/(tabs)' | '/(tabs)/groups';
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
}) {
  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="tab" style={({ pressed }) => [styles.tabItem, active && styles.tabItemActive, pressed && styles.pressed]}>
        <FontAwesome color={active ? '#FFFFFF' : '#4E6A80'} name={icon} size={16} />
        <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.tabLabel, active && styles.tabLabelActive]}>
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}

function FloatingTabBar() {
  const { bottom } = useSafeAreaInsets();
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const isGroups = pathname.includes('/groups');

  return (
    <View pointerEvents={Platform.OS === 'web' ? undefined : 'box-none'} style={[styles.floatingWrap, { bottom: Math.max(bottom + 10, 20) }]}>
      <View style={styles.floatingBar}>
        <TabItem active={!isGroups} href="/(tabs)" icon="home" label={t('tabs.home')} />
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/camera')}
          style={({ pressed }) => [styles.keepButton, pressed && styles.keepButtonPressed]}>
          <FontAwesome color="#FFFFFF" name="circle" size={10} />
          <Text adjustsFontSizeToFit numberOfLines={1} style={styles.keepText}>
            {t('tabs.keep')}
          </Text>
        </Pressable>
        <TabItem active={isGroups} href="/(tabs)/groups" icon="users" label={t('tabs.groups')} />
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { status } = useAuth();
  const { t } = useI18n();
  const isSignedIn = status === 'signed-in';

  return (
    <Tabs
      tabBar={isSignedIn ? () => <FloatingTabBar /> : () => null}
      screenOptions={{
        headerShown: useClientOnlyValue(false, false),
      }}>
      <Tabs.Screen name="index" options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="groups" options={{ title: t('tabs.groups') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  floatingBar: {
    minHeight: 64,
    width: 326,
    maxWidth: '88%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(141, 169, 197, 0.32)',
    borderRadius: 32,
    padding: 7,
    backgroundColor: 'rgba(255,255,255,0.94)',
    shadowColor: '#102033',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  tabItem: {
    minWidth: 80,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 24,
  },
  tabItemActive: {
    backgroundColor: '#2F80ED',
  },
  tabLabel: {
    color: '#4E6A80',
    fontSize: 12,
    fontWeight: '800',
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  keepButton: {
    minWidth: 86,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 25,
    backgroundColor: '#2F80ED',
  },
  keepButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }],
  },
  keepText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }],
  },
});
