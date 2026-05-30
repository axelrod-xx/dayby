import { StyleSheet, Text, View } from 'react-native';

const items = [
  { accent: '#2F80ED', label: 'Today', value: '2 sec' },
  { accent: '#8DAA91', label: 'Together', value: 'Group' },
  { accent: '#D9B36D', label: 'Month', value: '1 min' },
];

export function TodayOverview() {
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <View style={[styles.accent, { backgroundColor: item.accent }]} />
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
  },
  item: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D8E9F5',
    borderRadius: 14,
    padding: 13,
    backgroundColor: '#FFFFFF',
  },
  accent: {
    width: 22,
    height: 3,
    borderRadius: 2,
    marginBottom: 12,
  },
  value: {
    color: '#102033',
    fontSize: 19,
    fontWeight: '900',
  },
  label: {
    marginTop: 6,
    color: '#617B8F',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
