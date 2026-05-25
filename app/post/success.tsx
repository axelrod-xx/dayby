import { Link, type Href, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';

export default function PostSuccessScreen() {
  const { count, groupId, groupName } = useLocalSearchParams<{
    count?: string;
    groupId?: string;
    groupName?: string;
  }>();
  const postedCount = Math.max(Number(count ?? 0), 1);
  const hasSingleGroup = Boolean(groupId);

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
        <Text style={styles.panelTitle}>Tomorrow</Text>
        <Text style={styles.panelText}>Come back to watch yesterday's reel and vote for the moment worth keeping.</Text>
      </View>

      <View style={styles.actions}>
        {hasSingleGroup ? (
          <Link href={{ pathname: '/groups/[groupId]', params: { groupId } } as unknown as Href} asChild>
            <PrimaryButton onPress={() => undefined} variant="accent">
              View group
            </PrimaryButton>
          </Link>
        ) : (
          <Link href={'/(tabs)/groups' as Href} asChild>
            <PrimaryButton onPress={() => undefined} variant="accent">
              View groups
            </PrimaryButton>
          </Link>
        )}
        <Link href={'/(tabs)' as Href} asChild>
          <PrimaryButton onPress={() => undefined} variant="light">
            Back home
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
    backgroundColor: '#FFFEFB',
  },
  hero: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E1DA',
    paddingBottom: 26,
  },
  kicker: {
    color: '#E65A3C',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 12,
    color: '#171615',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 47,
  },
  copy: {
    marginTop: 12,
    color: '#57534E',
    fontSize: 17,
    lineHeight: 25,
  },
  panel: {
    borderWidth: 1,
    borderColor: '#E5E1DA',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FBFAF7',
  },
  panelTitle: {
    color: '#171615',
    fontSize: 18,
    fontWeight: '800',
  },
  panelText: {
    marginTop: 8,
    color: '#68625D',
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    gap: 10,
  },
});
