import { haptic as iosHaptic } from "ios-haptics";

function fire(fn) {
  try {
    fn();
  } catch {
    // unsupported browser/iOS version (e.g. iOS 26.5+ patched the trick) — no-op
  }
}

export const haptic = {
  light: () => fire(() => iosHaptic()), // casual navigation, Next, back buttons
  medium: () => fire(() => iosHaptic()), // confirmations, Continue, form submit
  success: () => fire(() => iosHaptic.confirm()), // bill created, share sent, settled
  error: () => fire(() => iosHaptic.error()), // validation error, network fail
  warning: () => fire(() => iosHaptic.confirm()), // confirmation modal, destructive action
};