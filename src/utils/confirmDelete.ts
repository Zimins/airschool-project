import { Alert, Platform } from 'react-native';

/**
 * Single source of truth for the destructive-delete confirmation copy used by
 * the admin management screens. Always names the item so the admin can see
 * exactly what they are about to remove.
 */
export const deleteConfirmationMessage = (itemLabel: string): string =>
  `Are you sure you want to delete "${itemLabel}"? This action cannot be undone.`;

/**
 * Accessibility label for icon-only delete buttons.
 */
export const deleteAccessibilityLabel = (itemLabel: string): string => `Delete ${itemLabel}`;

/**
 * Ask the admin to confirm a delete, then run `onConfirm`.
 *
 * Alert.alert button callbacks do not fire on react-native-web, so the web
 * build falls back to window.confirm. Native platforms get a proper
 * destructive-style alert.
 */
export function confirmDelete(
  itemLabel: string,
  onConfirm: () => void,
  title: string = 'Confirm Delete',
): void {
  const message = deleteConfirmationMessage(itemLabel);

  if (Platform.OS === 'web') {
    if (window.confirm(message)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onConfirm },
  ]);
}
