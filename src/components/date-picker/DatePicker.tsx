import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/src/components/ui/actionsheet";
import React from "react";

import { DatePickerContext } from "./datePickerContext";
import type { DatePickerProps } from "./interfaces";
import { Panel } from "./panel";
import { useDatePicker } from "./useDatePicker";

export function DatePicker({
  picker,
  value,
  onChange,
  isOpen,
  onClose,
  disabledDate,
  maxDate,
  minDate,
}: DatePickerProps) {
  const hookResult = useDatePicker({
    picker,
    value,
    onChange,
    isOpen,
    onClose,
    disabledDate,
    maxDate,
    minDate,
  });

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="gap-0 p-0 pt-0">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <DatePickerContext.Provider value={hookResult}>
          <Panel />
        </DatePickerContext.Provider>
      </ActionsheetContent>
    </Actionsheet>
  );
}
