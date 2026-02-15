import { create } from "zustand";

export type AppAlertAction = {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
};

type AlertDialogPayload = {
  title: string;
  message?: string;
  actions?: AppAlertAction[];
};

interface AlertDialogState {
  isOpen: boolean;
  title: string;
  message?: string;
  actions: AppAlertAction[];
  show: (payload: AlertDialogPayload) => void;
  close: () => void;
}

const DEFAULT_ACTION: AppAlertAction = { text: "确定", style: "default" };

export const useAlertDialogStore = create<AlertDialogState>((set) => ({
  isOpen: false,
  title: "",
  message: undefined,
  actions: [DEFAULT_ACTION],
  show: ({ title, message, actions }) => {
    set({
      isOpen: true,
      title,
      message,
      actions: actions && actions.length > 0 ? actions : [DEFAULT_ACTION],
    });
  },
  close: () => {
    set({
      isOpen: false,
      title: "",
      message: undefined,
      actions: [DEFAULT_ACTION],
    });
  },
}));

export const appAlert = (
  title: string,
  message?: string,
  actions?: AppAlertAction[],
) => {
  useAlertDialogStore.getState().show({ title, message, actions });
};
