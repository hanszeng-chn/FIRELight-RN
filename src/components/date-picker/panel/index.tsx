import React from "react";

import { useDatePickerContext } from "../datePickerContext";
import { DatePanel } from "./DatePanel";
import { MonthPanel } from "./MonthPanel";
import { YearPanel } from "./YearPanel";

export function Panel() {
  const { panelType } = useDatePickerContext();

  switch (panelType) {
    case "date":
      return <DatePanel />;
    case "month":
      return <MonthPanel />;
    case "year":
      return <YearPanel />;
  }
}
