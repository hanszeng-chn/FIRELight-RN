import { createContext, useContext } from "react";

import type { UseDatePickerReturn } from "./useDatePicker";

export const DatePickerContext = createContext<UseDatePickerReturn | null>(
  null,
);

export function useDatePickerContext(): UseDatePickerReturn {
  const ctx = useContext(DatePickerContext);
  if (!ctx) {
    throw new Error(
      "useDatePickerContext must be used within a DatePickerContext.Provider",
    );
  }
  return ctx;
}
