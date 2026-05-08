import { haptics } from "bzzz";

export const haptics = {
  light: () => navigator.selection(), // casual navigation, Next, back buttons
  medium: () => navigator.snap(), // confirmations, Continue, form submit
  success: () => navigator.success(), // bill created, share sent, settled
  error: () => navigator.error(), // validation error, network fail
  warning: () => navigator.toggle(), // confirmation modal, destructive action
};