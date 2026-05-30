import { Link, type Href, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import {
  createGroupInvite,
  getGroup,
  listGroupInvites,
  listGroupMembers,
  recordGroupActivity,
} from '@/src/features/groups/groupService';
import type { GroupInvite, GroupMemberProfile } from '@/src/features/groups/types';
import { listPostableGroups, type PostableGroup } from '@/src/features/posts/postService';
import { previousDateString } from '@/src/features/reels/reelService';
import { currentWeekStartStringInTimeZone, yearMonthInTimeZone } from '@/src/lib/groupTime';
import { resolveErrorMessage } from '@/src/lib/i18n/errors';
import { useI18n, type TranslateFn } from '@/src/lib/i18n/I18nProvider';

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { t } = useI18n();
  const [group, setGroup] = useState<PostableGroup | null>(null);
  const [members, setMembers] = useState<GroupMemberProfile[]>([]);
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingInvite, setCreatingInvite] = useState(false);

  const load = async () => {
    if (!groupId) {
      return;
    }

    const [nextGroup, nextMembers, nextInvites] = await Promise.all([
      getGroup(groupId),
      listGroupMembers(groupId),
      listGroupInvites(groupId),
    ]);

    const [postableGroup] = nextGroup ? await listPostableGroups([nextGroup]) : [];
    setGroup(postableGroup ?? null);
    setMembers(nextMembers);
    setInvites(nextInvites);
  };

  useEffect(() => {
    if (!groupId) {
      return;
    }

    load()
      .catch((error) => Alert.alert(t('groupDetail.alert.loadFailed'), resolveErrorMessage(error, t)))
      .finally(() => setLoading(false));

    recordGroupActivity(groupId, 'open').catch(() => undefined);
  }, [groupId, t]);

  const addInvite = async () => {
    if (!groupId) {
      return;
    }

    try {
      setCreatingInvite(true);
      const invite = await createGroupInvite(groupId);
      setInvites((current) => [invite, ...current]);
    } catch (error) {
      Alert.alert(t('groupDetail.alert.inviteFailed'), resolveErrorMessage(error, t));
    } finally {
      setCreatingInvite(false);
    }
  };

  const shareInvite = async () => {
    const invite = invites[0];
    if (!invite || !group) {
      Alert.alert(t('groupDetail.alert.createCodeFirst'), t('groupDetail.alert.createCodeFirstBody'));
      return;
    }

    await Share.share({
      message: t('groupDetail.shareMessage', { code: invite.code, groupName: group.name }),
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#102033" />
      </View>
    );
  }

  if (!group) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t('groupDetail.notFoundTitle')}</Text>
        <Text style={styles.copy}>{t('groupDetail.notFoundCopy')}</Text>
      </ScrollView>
    );
  }

  const canManageInvites = group.member_role === 'owner' || group.member_role === 'admin';
  const yesterday = previousDateString(group.timezone);
  const weekStart = currentWeekStartStringInTimeZone(group.timezone);
  const { month: currentMonth, year: currentYear } = yearMonthInTimeZone(group.timezone);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>{t('groupDetail.kicker')}</Text>
        <Text style={styles.title}>{group.name}</Text>
        <Text style={styles.copy}>
          {t('groupDetail.friendsWithLimit', {
            count: members.length,
            limit: group.member_limit,
            timezone: group.timezone,
          })}
        </Text>
        <View style={styles.friendStrip}>
          {members.slice(0, 5).map((member) => (
            <View key={member.id} style={styles.friendBubble}>
              <Text style={styles.friendInitial}>{member.display_name.slice(0, 1).toUpperCase()}</Text>
            </View>
          ))}
          {members.length > 5 ? (
            <View style={styles.friendBubble}>
              <Text style={styles.friendInitial}>+{members.length - 5}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.todayPanel}>
        <Text style={styles.panelKicker}>{t('groupDetail.today')}</Text>
        <Text style={styles.todayTitle}>
          {group.posted_today ? t('groupDetail.postedTodayTitle') : t('groupDetail.keepTodayTitle')}
        </Text>
        <Text style={styles.panelText}>
          {group.posted_today
            ? t('groupDetail.postedTodayCopy')
            : t('groupDetail.keepTodayCopy')}
        </Text>
        <View style={styles.action}>
          {group.posted_today ? (
            <Link
              href={{
                pathname: '/daily/[groupId]/[date]',
                params: { groupId: group.id, date: yesterday },
              }}
              asChild>
              <PrimaryButton onPress={() => undefined} variant="light">
                {t('groupDetail.openYesterday')}
              </PrimaryButton>
            </Link>
          ) : (
            <Link href={'/camera' as Href} asChild>
              <PrimaryButton onPress={() => undefined} variant="accent">
                {t('home.keepToday')}
              </PrimaryButton>
            </Link>
          )}
        </View>
      </View>

      {members.length <= 1 && canManageInvites ? (
        <View style={styles.inviteNudge}>
          <Text style={styles.inviteNudgeTitle}>{t('groupDetail.inviteNudgeTitle')}</Text>
          <Text style={styles.panelText}>{t('groupDetail.inviteNudgeCopy')}</Text>
          <View style={styles.action}>
            {invites[0] ? (
              <PrimaryButton onPress={() => void shareInvite()} variant="accent">
                {t('groupDetail.sendInvite')}
              </PrimaryButton>
            ) : (
              <PrimaryButton loading={creatingInvite} onPress={() => void addInvite()} variant="accent">
                {t('groupDetail.createInviteCode')}
              </PrimaryButton>
            )}
          </View>
        </View>
      ) : null}

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.panelTitle}>{t('groupDetail.yesterdayTitle')}</Text>
            <Text style={styles.panelText}>{t('groupDetail.yesterdayCopy')}</Text>
          </View>
          <Link
            href={{
              pathname: '/daily/[groupId]/[date]',
              params: { groupId: group.id, date: yesterday },
            }}
            asChild>
            <Text style={styles.inlineAction}>{t('common.open')}</Text>
          </Link>
        </View>
      </View>

      <View style={styles.panel}>
        <View style={styles.memoryPreview}>
          <Text style={styles.memoryKicker}>{t('groupDetail.ourMonth')}</Text>
          <Text style={styles.memoryTitle}>{group.name.toUpperCase()}</Text>
          <Text style={styles.memoryCopy}>{t('groupDetail.monthCopy')}</Text>
          <Link
            href={{
              pathname: '/monthly/[groupId]/[year]/[month]',
              params: { groupId: group.id, year: String(currentYear), month: String(currentMonth) },
            }}
            asChild>
            <Text style={styles.memoryAction}>{t('groupDetail.openThisMonth')}</Text>
          </Link>
        </View>
      </View>

      <View style={styles.subtlePanel}>
        <Text style={styles.subtleTitle}>{t('groupDetail.weekTitle')}</Text>
        <Text style={styles.panelText}>{t('groupDetail.weekCopy')}</Text>
        <View style={styles.action}>
          <Link
            href={{
              pathname: '/weekly/[groupId]/[weekStart]',
              params: { groupId: group.id, weekStart },
            }}
            asChild>
            <PrimaryButton onPress={() => undefined} variant="light">
              {t('groupDetail.peekWeek')}
            </PrimaryButton>
          </Link>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{t('groupDetail.members')}</Text>
        <View style={styles.list}>
          {members.map((member) => (
            <View key={member.id} style={styles.row}>
              <View>
                <Text style={styles.rowTitle}>{member.display_name}</Text>
                <Text style={styles.rowMeta}>{roleLabel(member.role, t)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {canManageInvites ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{t('groupDetail.inviteFriends')}</Text>
          <Text style={styles.panelText}>{t('groupDetail.inviteCopy')}</Text>
          {invites[0] ? (
            <View style={styles.codeBox}>
              <Text style={styles.code}>{invites[0].code}</Text>
              <Text style={styles.rowMeta}>
                {t('groupDetail.uses', {
                  max: invites[0].max_uses ? `/${invites[0].max_uses}` : '',
                  used: invites[0].used_count,
                })}
              </Text>
            </View>
          ) : null}
          <View style={styles.action}>
            <PrimaryButton loading={creatingInvite} onPress={() => void addInvite()} variant="light">
              {t('groupDetail.newInviteCode')}
            </PrimaryButton>
            {invites[0] ? (
              <PrimaryButton onPress={() => void shareInvite()} variant="light">
                {t('groupDetail.sendLatestCode')}
              </PrimaryButton>
            ) : null}
          </View>
        </View>
      ) : null}

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{t('groupDetail.settings')}</Text>
        <Text style={styles.panelText}>
          {t('groupDetail.settingsCopy', {
            downloadState: group.download_enabled ? t('common.on') : t('common.off'),
            plan: group.plan,
          })}
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{t('groupDetail.safety')}</Text>
        <Text style={styles.panelText}>{t('groupDetail.safetyCopy')}</Text>
        <View style={styles.action}>
          <Link
            href={{ pathname: '/safety/report', params: { groupId: group.id } } as unknown as Href}
            asChild>
            <PrimaryButton onPress={() => undefined} variant="light">
              {t('groupDetail.reportSomething')}
            </PrimaryButton>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

function roleLabel(role: GroupMemberProfile['role'] | PostableGroup['member_role'], t: TranslateFn) {
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  container: {
    gap: 18,
    paddingHorizontal: 22,
    paddingBottom: 40,
    paddingTop: 72,
    backgroundColor: '#F7FBFF',
  },
  hero: {
    minHeight: 178,
    justifyContent: 'flex-end',
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#EAF4FF',
  },
  kicker: {
    marginBottom: 9,
    color: '#2F80ED',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#102033',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  copy: {
    marginTop: 10,
    color: '#4E6A80',
    fontSize: 16,
    lineHeight: 23,
  },
  friendStrip: {
    flexDirection: 'row',
    marginTop: 16,
  },
  friendBubble: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BAD4EC',
    borderRadius: 19,
    marginRight: -8,
    backgroundColor: '#F6FAFF',
  },
  friendInitial: {
    color: '#102033',
    fontSize: 12,
    fontWeight: '900',
  },
  panel: {
    borderTopWidth: 1,
    borderTopColor: '#D8E9F5',
    paddingTop: 18,
  },
  todayPanel: {
    borderWidth: 1,
    borderColor: '#2F80ED',
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#FFFFFF',
  },
  panelKicker: {
    marginBottom: 9,
    color: '#2F80ED',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  inviteNudge: {
    borderWidth: 1,
    borderColor: '#BAD4EC',
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#F1F7FF',
  },
  inviteNudgeTitle: {
    color: '#102033',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  todayTitle: {
    color: '#102033',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 33,
  },
  panelHeader: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  inlineAction: {
    color: '#2F80ED',
    fontSize: 15,
    fontWeight: '900',
  },
  memoryPreview: {
    minHeight: 174,
    justifyContent: 'flex-end',
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#EAF4FF',
  },
  memoryKicker: {
    color: '#2F80ED',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  memoryTitle: {
    marginTop: 8,
    color: '#102033',
    fontSize: 28,
    fontWeight: '900',
  },
  memoryCopy: {
    marginTop: 8,
    color: '#4E6A80',
    fontSize: 14,
    lineHeight: 20,
  },
  memoryAction: {
    marginTop: 18,
    color: '#2F80ED',
    fontSize: 15,
    fontWeight: '900',
  },
  subtlePanel: {
    borderTopWidth: 1,
    borderTopColor: '#D8E9F5',
    paddingTop: 16,
  },
  panelTitle: {
    color: '#102033',
    fontSize: 18,
    fontWeight: '700',
  },
  subtleTitle: {
    color: '#617B8F',
    fontSize: 15,
    fontWeight: '800',
  },
  panelText: {
    marginTop: 8,
    color: '#4E6A80',
    fontSize: 15,
    lineHeight: 22,
  },
  list: {
    marginTop: 12,
    gap: 8,
  },
  row: {
    minHeight: 58,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8E9F5',
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: '#F3F8FC',
  },
  rowTitle: {
    color: '#102033',
    fontSize: 16,
    fontWeight: '700',
  },
  rowMeta: {
    marginTop: 5,
    color: '#617B8F',
    fontSize: 13,
  },
  codeBox: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#B8C9DA',
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#F3F8FC',
  },
  code: {
    color: '#102033',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
  },
  action: {
    gap: 10,
    marginTop: 14,
  },
});
