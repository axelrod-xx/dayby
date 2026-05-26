import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type NotificationPermissionState = 'granted' | 'denied' | 'undetermined';

function toPermissionState(response: unknown): NotificationPermissionState {
  const permission = response as {
    canAskAgain?: boolean;
    granted?: boolean;
    ios?: { status?: number };
    status?: string;
  };

  if (
    permission.granted ||
    permission.status === 'granted' ||
    permission.ios?.status === 2 ||
    permission.ios?.status === 3 ||
    permission.ios?.status === 4
  ) {
    return 'granted';
  }

  if (permission.status === 'denied' || permission.canAskAgain === false || permission.ios?.status === 1) {
    return 'denied';
  }

  return 'undetermined';
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function configureNotificationChannels() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync('dayby-reminders', {
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: '#F26A4B',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    name: 'dayby reminders',
    sound: undefined,
    vibrationPattern: [0, 180, 120, 180],
  });
}

export async function getNotificationPermissionState(): Promise<NotificationPermissionState> {
  const permissions = await Notifications.getPermissionsAsync();
  return toPermissionState(permissions);
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  await configureNotificationChannels();
  const existing = await Notifications.getPermissionsAsync();

  if (toPermissionState(existing) === 'granted') {
    return 'granted';
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: false,
    },
  });

  return toPermissionState(requested);
}

export async function getExpoPushToken() {
  const permission = await requestNotificationPermission();

  if (permission !== 'granted') {
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  if (!projectId) {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}

export async function scheduleLocalReminderPreview() {
  const permission = await requestNotificationPermission();

  if (permission !== 'granted') {
    return permission;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      body: 'Keep one tiny moment with your friends today.',
      sound: false,
      title: 'dayby',
    },
    trigger: {
      channelId: 'dayby-reminders',
      seconds: 3,
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    },
  });

  return permission;
}
