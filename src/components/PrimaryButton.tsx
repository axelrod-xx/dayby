import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

type PrimaryButtonProps = PropsWithChildren<{
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'dark' | 'light';
}>;

export function PrimaryButton({
  children,
  disabled = false,
  loading = false,
  onPress,
  variant = 'dark',
}: PrimaryButtonProps) {
  const isLight = variant === 'light';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isLight ? styles.light : styles.dark,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}>
      {loading ? (
        <ActivityIndicator color={isLight ? '#171615' : '#FFFEFB'} />
      ) : (
        <Text style={[styles.label, isLight ? styles.lightLabel : styles.darkLabel]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 18,
  },
  dark: {
    backgroundColor: '#171615',
  },
  light: {
    borderWidth: 1,
    borderColor: '#D8D2C8',
    backgroundColor: '#FFFEFB',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.82,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  darkLabel: {
    color: '#FFFEFB',
  },
  lightLabel: {
    color: '#171615',
  },
});
