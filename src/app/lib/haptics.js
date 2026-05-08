export const haptics = {
  light: () => navigator.vibrate?.(10), // casual navigation, Next, back buttons
  medium: () => navigator.vibrate?.(20), // confirmations, Continue, form submit
  success: () => navigator.vibrate?.([10, 50, 10]), // bill created, share sent, settled
  error: () => navigator.vibrate?.([50, 30, 50]), // validation error, network fail
  warning: () => navigator.vibrate?.([30, 20, 30]), // confirmation modal, destructive action
};