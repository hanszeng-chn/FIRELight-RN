import {
  addDays,
  addMonths,
  addYears,
  endOfMonth,
  getDate,
  getMonth,
  getYear,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  DateCell,
  MonthCell,
  PanelType,
  UseDatePickerOptions,
  YearCell,
} from "./interfaces";

function getDecadeStart(year: number): number {
  return Math.floor(year / 10) * 10;
}

export function useDatePicker({
  picker,
  value,
  onChange,
  isOpen,
  onClose,
  disabledDate,
  maxDate,
  minDate,
}: UseDatePickerOptions) {
  const [panelType, setPanelType] = useState<PanelType>(picker);
  const [panelDate, setPanelDate] = useState<Date>(value ?? new Date());

  // Reset panel state when ActionSheet opens
  useEffect(() => {
    if (isOpen) {
      setPanelType(picker);
      setPanelDate(value ?? new Date());
    }
  }, [isOpen, picker, value]);

  const isDateDisabled = useCallback(
    (date: Date): boolean => {
      if (minDate && date < startOfMonth(minDate)) return true;
      if (maxDate && date > endOfMonth(maxDate)) return true;
      if (disabledDate?.(date)) return true;
      return false;
    },
    [minDate, maxDate, disabledDate],
  );

  const isMonthDisabled = useCallback(
    (date: Date): boolean => {
      if (minDate && endOfMonth(date) < startOfMonth(minDate)) return true;
      if (maxDate && startOfMonth(date) > endOfMonth(maxDate)) return true;
      return false;
    },
    [minDate, maxDate],
  );

  const isYearDisabled = useCallback(
    (year: number): boolean => {
      if (minDate && year < getYear(minDate)) return true;
      if (maxDate && year > getYear(maxDate)) return true;
      return false;
    },
    [minDate, maxDate],
  );

  // Navigation
  const goToPrevMonth = useCallback(() => {
    setPanelDate((prev) => addMonths(prev, -1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setPanelDate((prev) => addMonths(prev, 1));
  }, []);

  const goToPrevYear = useCallback(() => {
    setPanelDate((prev) => addYears(prev, -1));
  }, []);

  const goToNextYear = useCallback(() => {
    setPanelDate((prev) => addYears(prev, 1));
  }, []);

  const goToPrevDecade = useCallback(() => {
    setPanelDate((prev) => addYears(prev, -10));
  }, []);

  const goToNextDecade = useCallback(() => {
    setPanelDate((prev) => addYears(prev, 10));
  }, []);

  // Panel switching
  const switchToYearPanel = useCallback(() => {
    setPanelType("year");
  }, []);

  const switchToMonthPanel = useCallback(() => {
    setPanelType("month");
  }, []);

  // Cell generators
  const dateCells = useMemo((): DateCell[] => {
    const today = new Date();
    const monthStart = startOfMonth(panelDate);
    // Week starts on Monday (weekStartsOn: 1)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const cells: DateCell[] = [];

    for (let i = 0; i < 42; i++) {
      const day = addDays(calendarStart, i);
      cells.push({
        value: day,
        text: String(getDate(day)),
        isToday: isSameDay(day, today),
        isSelected: value ? isSameDay(day, value) : false,
        isCurrentMonth: isSameMonth(day, panelDate),
        disabled: isDateDisabled(day),
      });
    }
    return cells;
  }, [panelDate, value, isDateDisabled]);

  const monthCells = useMemo((): MonthCell[] => {
    const today = new Date();
    const year = getYear(panelDate);
    const cells: MonthCell[] = [];

    for (let m = 0; m < 12; m++) {
      const monthDate = new Date(year, m, 1);
      cells.push({
        value: monthDate,
        text: `${m + 1}月`,
        isToday:
          getYear(today) === year && getMonth(today) === m,
        isSelected: value
          ? getYear(value) === year && getMonth(value) === m
          : false,
        disabled: isMonthDisabled(monthDate),
      });
    }
    return cells;
  }, [panelDate, value, isMonthDisabled]);

  const yearCells = useMemo((): YearCell[] => {
    const currentYear = getYear(panelDate);
    const decadeStart = getDecadeStart(currentYear);
    const cells: YearCell[] = [];

    // Show decade range with 1 year before and after (12 total)
    for (let i = -1; i <= 10; i++) {
      const year = decadeStart + i;
      cells.push({
        value: year,
        text: String(year),
        isCurDecade: i >= 0 && i <= 9,
        isSelected: value ? getYear(value) === year : false,
        disabled: isYearDisabled(year),
      });
    }
    return cells;
  }, [panelDate, value, isYearDisabled]);

  const decadeRange = useMemo(() => {
    const decadeStart = getDecadeStart(getYear(panelDate));
    return `${decadeStart}-${decadeStart + 9}`;
  }, [panelDate]);

  // Click handlers with cascade logic
  const onDateSelect = useCallback(
    (date: Date) => {
      if (isDateDisabled(date)) return;
      onChange?.(date);
      onClose();
    },
    [onChange, onClose, isDateDisabled],
  );

  const onMonthSelect = useCallback(
    (date: Date) => {
      if (isMonthDisabled(date)) return;
      if (picker === "month") {
        onChange?.(date);
        onClose();
      } else {
        // Cascade back to date panel
        setPanelDate(date);
        setPanelType("date");
      }
    },
    [picker, onChange, onClose, isMonthDisabled],
  );

  const onYearSelect = useCallback(
    (year: number) => {
      if (isYearDisabled(year)) return;
      if (picker === "year") {
        onChange?.(new Date(year, 0, 1));
        onClose();
      } else {
        // Cascade back to month or date panel
        setPanelDate(new Date(year, getMonth(panelDate), 1));
        setPanelType(picker === "date" ? "month" : "month");
      }
    },
    [picker, onChange, onClose, panelDate, isYearDisabled],
  );

  return {
    panelType,
    panelDate,
    dateCells,
    monthCells,
    yearCells,
    decadeRange,
    goToPrevMonth,
    goToNextMonth,
    goToPrevYear,
    goToNextYear,
    goToPrevDecade,
    goToNextDecade,
    switchToYearPanel,
    switchToMonthPanel,
    onDateSelect,
    onMonthSelect,
    onYearSelect,
  };
}

export type UseDatePickerReturn = ReturnType<typeof useDatePicker>;
