import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

type PrimaryButtonProps = PropsWithChildren<{
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'dark' | 'light' | 'accent';
}>;

export function PrimaryButton({
  children,
  disabled = false,
  loading = false,
  onPress,
  variant = 'dark',
}: PrimaryButtonProps) {
  const isLight = variant === 'light';
  const isAccent = variant === 'accent';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        buttonStyles.button,
        isLight ? buttonStyles.light : isAccent ? buttonStyles.accent : buttonStyles.dark,
        (disabled || loading) && (isLight ? buttonStyles.lightDisabled : buttonStyles.disabled),
        pressed && buttonStyles.pressed,
      ]}>
      {loading ? (
        <ActivityIndicator color={isLight ? '#102033' : '#FFFFFF'} />
      ) : (
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={[textStyles.label, isLight ? textStyles.lightLabel : textStyles.darkLabel]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const buttonStyles = StyleSheet.create({
  button: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  dark: {
    backgroundColor: '#102033',
  },
  accent: {
    backgroundColor: '#2F80ED',
  },
  light: {
    borderWidth: 1,
    borderColor: '#BAD4EC',
    backgroundColor: '#FFFFFF',
  },
  disabled: {
    backgroundColor: '#C8D6E3',
  },
  lightDisabled: {
    opacity: 0.62,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }],
  },
});

const textStyles = StyleSheet.create({
  label: {
    fontSize: 15,
    fontWeight: '800',
  },
  darkLabel: {
    color: '#FFFFFF',
  },
  lightLabel: {
    color: '#102033',
  },
});
