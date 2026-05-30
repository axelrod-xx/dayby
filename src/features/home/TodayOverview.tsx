import { StyleSheet, Text, View } from 'react-native';

import { useI18n } from '@/src/lib/i18n/I18nProvider';

export function TodayOverview() {
  const { t } = useI18n();
  const items = [
    { accent: '#2F80ED', label: t('home.overview.today.label'), value: t('home.overview.today.value') },
    { accent: '#8DAA91', label: t('home.overview.together.label'), value: t('home.overview.together.value') },
    { accent: '#D9B36D', label: t('home.overview.month.label'), value: t('home.overview.month.value') },
  ];

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
