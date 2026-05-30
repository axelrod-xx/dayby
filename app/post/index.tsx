import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { listMyGroups } from '@/src/features/groups/groupService';
import { createDailyPosts, listPostableGroups, type PostableGroup } from '@/src/features/posts/postService';
import { resolveErrorMessage } from '@/src/lib/i18n/errors';
import { useI18n, type TranslateFn } from '@/src/lib/i18n/I18nProvider';

export default function PostToGroupsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { isNativeTrimmed, muted, processedAt, trimDurationMs, trimStartMs, uri } = useLocalSearchParams<{
    isNativeTrimmed?: string;
    muted?: string;
    processedAt?: string;
    trimDurationMs?: string;
    trimStartMs?: string;
    uri?: string;
  }>();
  const [groups, setGroups] = useState<PostableGroup[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    listMyGroups()
      .then(listPostableGroups)
      .then(setGroups)
      .catch((error) => Alert.alert(t('post.alert.loadGroupsFailed'), resolveErrorMessage(error, t)))
      .finally(() => setLoading(false));
  }, [t]);

  const availableGroups = useMemo(() => groups.filter((group) => !group.posted_today), [groups]);
  const postButtonLabel = useMemo(() => {
    if (posting) {
      return t('post.button.posting');
    }

    if (selectedIds.size > 0) {
      return t('post.button.postTo', { count: selectedIds.size });
    }

    if (groups.length === 0) {
      return t('post.button.createGroupFirst');
    }

    if (availableGroups.length === 0) {
      return t('post.button.alreadyPosted');
    }

    return t('post.button.selectGroup');
  }, [availableGroups.length, groups.length, posting, selectedIds.size, t]);

  const toggle = (group: PostableGroup) => {
    if (group.posted_today) {
      return;
    }

    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(group.id)) {
        next.delete(group.id);
      } else {
        next.add(group.id);
      }
      return next;
    });
  };

  const post = async () => {
    if (!uri) {
      Alert.alert(t('post.alert.noVideoTitle'), t('post.alert.noVideoBody'));
      return;
    }

    try {
      setPosting(true);
      await createDailyPosts({
        uri,
        groupIds: Array.from(selectedIds),
        hasAudio: muted !== '1',
        capturedAt: new Date().toISOString(),
        trimStartMs: Number(trimStartMs ?? 0),
        trimDurationMs: Number(trimDurationMs ?? 2000),
        isNativeTrimmed: isNativeTrimmed === '1',
        processedAt: processedAt || null,
      });
      const selectedGroups = groups.filter((group) => selectedIds.has(group.id));
      router.replace({
        pathname: '/post/success',
        params: {
          count: String(selectedGroups.length),
          groupId: selectedGroups.length === 1 ? selectedGroups[0].id : '',
          groupName: selectedGroups.length === 1 ? selectedGroups[0].name : '',
        },
      } as unknown as Href);
    } catch (error) {
      Alert.alert(t('post.alert.failed'), resolveErrorMessage(error, t));
    } finally {
      setPosting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <Text style={styles.backText}>{t('post.back')}</Text>
        </Pressable>

        <View>
          <Text style={styles.kicker}>{t('post.kicker')}</Text>
          <Text style={styles.title}>{t('post.title')}</Text>
          <Text style={styles.copy}>{t('post.copy')}</Text>
        </View>

        <View style={styles.momentCard}>
          <Text style={styles.momentKicker}>{t('post.readyToPost')}</Text>
          <Text style={styles.momentTitle}>{muted === '1' ? t('common.mutedExport') : t('common.originalSound')}</Text>
          <Text style={styles.momentMeta}>
            {t('post.momentMeta', { start: Number(trimStartMs ?? 0) / 1000 })}
          </Text>
        </View>

        {isNativeTrimmed !== '1' ? (
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>{t('post.devPreviewTitle')}</Text>
            <Text style={styles.noticeCopy}>{t('post.devPreviewCopy')}</Text>
          </View>
        ) : null}

        {loading ? (
          <ActivityIndicator color="#102033" />
        ) : groups.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{t('post.emptyTitle')}</Text>
            <Text style={styles.emptyCopy}>{t('post.emptyCopy')}</Text>
            <View style={styles.emptyAction}>
              <PrimaryButton onPress={() => router.push('/groups/create' as Href)} variant="light">
                {t('post.createGroup')}
              </PrimaryButton>
            </View>
          </View>
        ) : (
          <View style={styles.list}>
            {groups.map((group) => {
              const selected = selectedIds.has(group.id);
              return (
                <Pressable
                  key={group.id}
                  onPress={() => toggle(group)}
                  style={({ pressed }) => [
                    styles.groupCard,
                    selected && styles.groupCardSelected,
                    group.posted_today && styles.groupCardDisabled,
                    pressed && !group.posted_today && styles.pressed,
                  ]}>
                  <View style={styles.groupHeader}>
                    <View style={styles.groupMark}>
                      <Text style={styles.groupInitial}>{group.name.slice(0, 1).toUpperCase()}</Text>
                    </View>
                    <View style={styles.groupText}>
                      <Text style={styles.groupName}>{group.name}</Text>
                      <Text style={styles.groupMeta}>
                        {group.posted_today
                          ? t('post.groupMeta.posted')
                          : t('post.groupMeta.ready', { role: roleLabel(group.member_role, t) })}
                      </Text>
                    </View>
                    <View style={[styles.check, selected && styles.checkSelected]}>
                      {selected ? <View style={styles.checkDot} /> : null}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          disabled={selectedIds.size === 0 || availableGroups.length === 0 || !uri}
          loading={posting}
          onPress={() => void post()}
          variant={selectedIds.size > 0 ? 'accent' : 'dark'}>
          {postButtonLabel}
        </PrimaryButton>
      </View>
    </View>
  );
}

function roleLabel(role: PostableGroup['member_role'], t: TranslateFn) {
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
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    gap: 22,
    paddingHorizontal: 22,
    paddingBottom: 120,
    paddingTop: 74,
    backgroundColor: '#F7FBFF',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  backText: {
    color: '#617B8F',
    fontSize: 15,
    fontWeight: '800',
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
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 44,
  },
  copy: {
    marginTop: 10,
    color: '#4E6A80',
    fontSize: 16,
    lineHeight: 23,
  },
  momentCard: {
    minHeight: 132,
    justifyContent: 'flex-end',
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#102033',
    shadowColor: '#102033',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  momentKicker: {
    color: '#B8C9DA',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  momentTitle: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
  },
  momentMeta: {
    marginTop: 8,
    color: '#9FB8CC',
    fontSize: 14,
    fontWeight: '800',
  },
  notice: {
    borderWidth: 1,
    borderColor: '#D8E9F5',
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#F3F8FC',
  },
  noticeTitle: {
    color: '#102033',
    fontSize: 15,
    fontWeight: '800',
  },
  noticeCopy: {
    marginTop: 6,
    color: '#4E6A80',
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    gap: 10,
  },
  groupCard: {
    borderWidth: 1,
    borderColor: '#D8E9F5',
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  groupCardSelected: {
    borderColor: '#2F80ED',
    backgroundColor: '#DCEEFF',
  },
  groupCardDisabled: {
    opacity: 0.42,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }],
  },
  groupHeader: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  groupMark: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#DCEEFF',
  },
  groupInitial: {
    color: '#1B4A7A',
    fontSize: 17,
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
  check: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#B8C9DA',
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
  },
  checkSelected: {
    borderColor: '#2F80ED',
    backgroundColor: '#2F80ED',
  },
  checkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  empty: {
    borderTopWidth: 1,
    borderTopColor: '#D8E9F5',
    paddingTop: 18,
  },
  emptyTitle: {
    color: '#102033',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyCopy: {
    marginTop: 8,
    color: '#4E6A80',
    fontSize: 15,
    lineHeight: 22,
  },
  emptyAction: {
    marginTop: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#D8E9F5',
    paddingHorizontal: 22,
    paddingBottom: 28,
    paddingTop: 14,
    backgroundColor: '#FFFFFF',
  },
});
