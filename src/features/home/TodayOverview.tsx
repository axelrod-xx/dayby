import { StyleSheet, Text, View } from 'react-native';

const items = [
  { label: 'Capture', value: '10 sec' },
  { label: 'Keep', value: '2 sec' },
  { label: 'Month', value: '1 min' },
];

export function TodayOverview() {
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
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
    borderColor: '#E5E1DA',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#FBFAF7',
  },
  value: {
    color: '#171615',
    fontSize: 20,
    fontWeight: '700',
  },
  label: {
    marginTop: 6,
    color: '#78716C',
    fontSize: 12,
    textTransform: 'uppercase',
  },
});
