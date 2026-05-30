import { Link, type Href, useLocalSearchParams } from 'expo-router';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';

export default function PostSuccessScreen() {
  const { count, groupId, groupName } = useLocalSearchParams<{
    count?: string;
    groupId?: string;
    groupName?: string;
  }>();
  const postedCount = Math.max(Number(count ?? 0), 1);
  const hasSingleGroup = Boolean(groupId);
  const shareText = hasSingleGroup
    ? `I kept today's 2 seconds in ${groupName || 'our group'} on dayby.`
    : `I kept today's 2 seconds in ${postedCount} groups on dayby.`;

  const shareMoment = async () => {
    await Share.share({
      message: `${shareText}\nTwo seconds a day. One minute a month.`,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Posted</Text>
        <Text style={styles.title}>Kept for today.</Text>
        <Text style={styles.copy}>
          {hasSingleGroup
            ? `Your 2 seconds are now in ${groupName || 'this group'}.`
            : `Your 2 seconds are now in ${postedCount} groups.`}
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Tell the group</Text>
        <Text style={styles.panelText}>The habit spreads best when one friend makes the first move.</Text>
        <View style={styles.panelAction}>
          <PrimaryButton onPress={() => void shareMoment()} variant="light">
            Share this
          </PrimaryButton>
        </View>
      </View>

      <View style={styles.panelSoft}>
        <Text style={styles.panelTitle}>Tomorrow</Text>
        <Text style={styles.panelText}>Watch the group day. Save anything you want to find again.</Text>
      </View>

      <View style={styles.actions}>
        {hasSingleGroup ? (
          <Link href={{ pathname: '/groups/[groupId]', params: { groupId } } as unknown as Href} asChild>
            <PrimaryButton onPress={() => undefined} variant="accent">
            Open group
            </PrimaryButton>
          </Link>
        ) : (
          <Link href={'/(tabs)/groups' as Href} asChild>
            <PrimaryButton onPress={() => undefined} variant="accent">
            Open groups
            </PrimaryButton>
          </Link>
        )}
        <Link href={'/(tabs)' as Href} asChild>
          <PrimaryButton onPress={() => undefined} variant="light">
            Home
          </PrimaryButton>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 22,
    paddingBottom: 42,
    paddingTop: 84,
    backgroundColor: '#F6FAFF',
  },
  hero: {
    paddingVertical: 8,
  },
  kicker: {
    color: '#2F80ED',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 12,
    color: '#102033',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 47,
  },
  copy: {
    marginTop: 12,
    color: '#4E6A80',
    fontSize: 17,
    lineHeight: 25,
  },
  panel: {
    borderWidth: 1,
    borderColor: '#BAD4EC',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  panelSoft: {
    borderTopWidth: 1,
    borderTopColor: '#D8E9F5',
    paddingTop: 18,
  },
  panelTitle: {
    color: '#102033',
    fontSize: 18,
    fontWeight: '800',
  },
  panelText: {
    marginTop: 8,
    color: '#4E6A80',
    fontSize: 15,
    lineHeight: 22,
  },
  panelAction: {
    marginTop: 14,
  },
  actions: {
    gap: 10,
  },
});
