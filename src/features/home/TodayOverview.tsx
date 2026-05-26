import { StyleSheet, Text, View } from 'react-native';

const items = [
  { accent: '#E65A3C', label: 'Today', value: '2 sec' },
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
    borderColor: '#E4DED5',
    borderRadius: 8,
    padding: 13,
    backgroundColor: '#FFFEFB',
  },
  accent: {
    width: 22,
    height: 3,
    borderRadius: 2,
    marginBottom: 12,
  },
  value: {
    color: '#141312',
    fontSize: 19,
    fontWeight: '900',
  },
  label: {
    marginTop: 6,
    color: '#78716C',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
