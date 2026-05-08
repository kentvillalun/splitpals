import { haptics } from "bzzz";

export const haptic = {
  light: () => haptics.selection(), // casual navigation, Next, back buttons
  medium: () => haptics.snap(), // confirmations, Continue, form submit
  success: () => haptics.success(), // bill created, share sent, settled
  error: () => haptics.error(), // validation error, network fail
  warning: () => haptics.toggle(), // confirmation modal, destructive action
};