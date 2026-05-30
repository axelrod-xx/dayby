import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, type Href, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { isArchiveCandidate, listMyGroups } from '@/src/features/groups/groupService';
import type { GroupWithMembership } from '@/src/features/groups/types';
import { resolveErrorMessage } from '@/src/lib/i18n/errors';
import { useI18n, type TranslateFn } from '@/src/lib/i18n/I18nProvider';

export default function GroupsScreen() {
  const { isProfileComplete, isSupabaseConfigured, status } = useAuth();
  const { t } = useI18n();
  const [groups, setGroups] = useState<GroupWithMembership[]>([]);
  const [loading, setLoading] = useState(false);
  const canCreateGroup = status === 'signed-in' && isProfileComplete;
  const activeGroups = groups.filter((group) => !isArchiveCandidate(group));
  const archivedGroups = groups.filter(isArchiveCandidate);

  useFocusEffect(
    useCallback(() => {
      if (!canCreateGroup) {
        setGroups([]);
        return;
      }

      setLoading(true);
      listMyGroups()
        .then(setGroups)
        .catch((error) => Alert.alert(t('groups.alert.loadFailed'), resolveErrorMessage(error, t)))
        .finally(() => setLoading(false));
    }, [canCreateGroup, t]),
  );

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>{t('groups.kicker')}</Text>
        <Text style={styles.title}>{t('groups.title')}</Text>
        <Text style={styles.body}>
          {t('groups.copy')}
        </Text>
      </View>

      <View style={styles.action}>
        {status !== 'signed-in' ? (
          <Link href="/(auth)/sign-in" asChild>
            <PrimaryButton disabled={!isSupabaseConfigured} onPress={() => undefined}>
              {t('groups.signInFirst')}
            </PrimaryButton>
          </Link>
        ) : !isProfileComplete ? (
          <Link href="/profile-setup" asChild>
            <PrimaryButton onPress={() => undefined}>{t('home.setProfile')}</PrimaryButton>
          </Link>
        ) : (
          <View style={styles.actionGrid}>
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
        )}
      </View>

      {loading ? (
        <ActivityIndicator color="#102033" />
      ) : groups.length > 0 ? (
        <View style={styles.list}>
          <View style={styles.monthPreview}>
            <Text style={styles.previewKicker}>{t('groups.thisMonth')}</Text>
            <Text style={styles.previewTitle}>{t('groups.activeGroups', { count: activeGroups.length })}</Text>
            <Text style={styles.previewCopy}>{t('groups.previewCopy')}</Text>
          </View>
          {activeGroups.map((group) => (
            <Link
              key={group.id}
              href={{ pathname: '/groups/[groupId]', params: { groupId: group.id } } as unknown as Href}
              asChild>
              <Pressable style={({ pressed }) => [styles.groupRow, pressed && styles.pressed]}>
                <View style={styles.groupMark}>
                  <Text style={styles.groupInitial}>{group.name.slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={styles.groupText}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupMeta}>
                    {groupActivityLabel(group, t)} / {roleLabel(group.member_role, t)}
                  </Text>
                </View>
                <FontAwesome color="#8FAFC2" name="chevron-right" size={14} />
              </Pressable>
            </Link>
          ))}
          {archivedGroups.length > 0 ? (
            <Link href={'/archive' as Href} asChild>
              <Pressable style={({ pressed }) => [styles.archiveLink, pressed && styles.pressed]}>
                <Text style={styles.archiveText}>
                  {t('groups.quietGroups', { count: archivedGroups.length })}
                </Text>
                <FontAwesome color="#8FAFC2" name="chevron-right" size={14} />
              </Pressable>
            </Link>
          ) : null}
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{t('groups.emptyTitle')}</Text>
          <Text style={styles.emptyCopy}>{t('groups.emptyCopy')}</Text>
        </View>
      )}
    </View>
  );
}

function groupActivityLabel(
  group: Pick<GroupWithMembership, 'last_posted_at' | 'last_viewed_at' | 'last_downloaded_at'>,
  t: TranslateFn,
) {
  const dates = [group.last_posted_at, group.last_viewed_at, group.last_downloaded_at]
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value));

  if (dates.length === 0) {
    return t('groups.activity.none');
  }

  const latest = new Date(Math.max(...dates.map((date) => date.getTime())));
  const days = Math.floor((Date.now() - latest.getTime()) / 86_400_000);

  if (days <= 0) {
    return t('groups.activity.today');
  }

  if (days === 1) {
    return t('groups.activity.yesterday');
  }

  return t('groups.activity.daysAgo', { count: days });
}

function roleLabel(role: GroupWithMembership['member_role'], t: TranslateFn) {
  switch (role) {
    case 'owner':
      return t('groups.role.owner');
    case 'admin':
      return t('groups.role.admin');
    case 'member':
      return t('groups.role.member');
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    paddingHorizontal: 22,
    paddingBottom: 116,
    paddingTop: 78,
    backgroundColor: '#F7FBFF',
  },
  hero: {
    minHeight: 146,
    justifyContent: 'flex-end',
  },
  kicker: {
    marginBottom: 10,
    color: '#2F80ED',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#102033',
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  body: {
    marginTop: 10,
    color: '#4E6A80',
    fontSize: 16,
    lineHeight: 24,
  },
  action: {
    marginTop: 4,
  },
  actionGrid: {
    gap: 10,
  },
  list: {
    gap: 12,
  },
  monthPreview: {
    minHeight: 154,
    justifyContent: 'flex-end',
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#EAF4FF',
    shadowColor: '#102033',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  previewKicker: {
    color: '#2F80ED',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  previewTitle: {
    marginTop: 8,
    color: '#102033',
    fontSize: 26,
    fontWeight: '900',
  },
  previewCopy: {
    marginTop: 8,
    color: '#4E6A80',
    fontSize: 14,
    lineHeight: 20,
  },
  groupRow: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8E9F5',
    borderRadius: 16,
    gap: 14,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }],
  },
  groupMark: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#DCEEFF',
  },
  groupInitial: {
    color: '#1B4A7A',
    fontSize: 18,
    fontWeight: '900',
  },
  groupText: {
    flex: 1,
  },
  groupName: {
    color: '#102033',
    fontSize: 18,
    fontWeight: '900',
  },
  groupMeta: {
    marginTop: 6,
    color: '#617B8F',
    fontSize: 13,
  },
  archiveLink: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#D8E9F5',
    paddingHorizontal: 4,
  },
  archiveText: {
    color: '#617B8F',
    fontSize: 14,
    fontWeight: '800',
  },
  empty: {
    minHeight: 172,
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: '#D8E9F5',
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#FFFFFF',
  },
  emptyTitle: {
    color: '#102033',
    fontSize: 22,
    fontWeight: '900',
  },
  emptyCopy: {
    marginTop: 8,
    color: '#4E6A80',
    fontSize: 15,
    lineHeight: 22,
  },
});
