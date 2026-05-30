import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useI18n } from '@/src/lib/i18n/I18nProvider';
import { localePreferences, type LocalePreference } from '@/src/lib/i18n/messages';

type LanguageSwitcherProps = {
  variant?: 'light' | 'dark';
};

export function LanguageSwitcher({ variant = 'light' }: LanguageSwitcherProps) {
  const { preference, setPreference, t } = useI18n();
  const isDark = variant === 'dark';

  return (
    <View accessibilityLabel={t('language.accessibilityLabel')} style={[styles.container, isDark && styles.darkContainer]}>
      {localePreferences.map((option) => {
        const selected = preference === option;
        return (
          <Pressable
            accessibilityRole="button"
            key={option}
            onPress={() => void setPreference(option)}
            style={({ pressed }) => [
              styles.option,
              isDark && styles.darkOption,
              selected && styles.optionSelected,
              isDark && selected && styles.darkOptionSelected,
              pressed && styles.pressed,
            ]}>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={[
                styles.optionText,
                isDark && styles.darkOptionText,
                selected && styles.optionTextSelected,
                isDark && selected && styles.darkOptionTextSelected,
              ]}>
              {labelFor(option, t)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function labelFor(option: LocalePreference, t: ReturnType<typeof useI18n>['t']) {
  switch (option) {
    case 'system':
      return t('common.language.system');
    case 'en':
      return t('common.language.en');
    case 'ja':
      return t('common.language.ja');
    case 'ko':
      return t('common.language.ko');
  }
}

const styles = StyleSheet.create({
  container: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8E9F5',
    borderRadius: 14,
    padding: 4,
    backgroundColor: '#FFFFFF',
  },
  darkContainer: {
    borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'rgba(0,0,0,0.26)',
  },
  option: {
    minWidth: 58,
    minHeight: 34,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  darkOption: {
    backgroundColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: '#2F80ED',
  },
  darkOptionSelected: {
    backgroundColor: '#FFFFFF',
  },
  optionText: {
    color: '#4E6A80',
    fontSize: 12,
    fontWeight: '900',
  },
  darkOptionText: {
    color: '#D8E9F5',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  darkOptionTextSelected: {
    color: '#102033',
  },
  pressed: {
    opacity: 0.84,
  },
});
