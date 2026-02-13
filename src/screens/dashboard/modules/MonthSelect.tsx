import { DatePicker } from "@/src/components/date-picker";
import { Icon } from "@/src/components/ui/icon";
import { ChevronDown } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

function parseMonthLabel(monthLabel: string | undefined) {
  const now = new Date();
  const fallback = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };

  if (!monthLabel) {
    return fallback;
  }

  const matches = monthLabel.match(/(\d{4})\D+(\d{1,2})/);
  if (!matches) {
    return fallback;
  }

  const year = Number(matches[1]);
  const month = Number(matches[2]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return fallback;
  }

  return { year, month };
}

type MonthSelectProps = {
  monthLabel: string;
  onPress?: () => void;
  onConfirm?: (year: number, month: number) => void;
};

export function MonthSelect({
  monthLabel,
  onPress,
  onConfirm,
}: MonthSelectProps) {
  const initialDate = useMemo(() => parseMonthLabel(monthLabel), [monthLabel]);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(initialDate.year);
  const [selectedMonth, setSelectedMonth] = useState(initialDate.month);

  useEffect(() => {
    setSelectedYear(initialDate.year);
    setSelectedMonth(initialDate.month);
  }, [initialDate.month, initialDate.year]);

  const openPicker = useCallback(() => {
    onPress?.();
    setIsOpen(true);
  }, [onPress]);

  const displayLabel = `${selectedYear}年 ${selectedMonth}月`;

  const pickerValue = useMemo(
    () => new Date(selectedYear, selectedMonth - 1, 1),
    [selectedYear, selectedMonth],
  );

  const handleChange = useCallback(
    (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      setSelectedYear(year);
      setSelectedMonth(month);
      onConfirm?.(year, month);
    },
    [onConfirm],
  );

  return (
    <>
      <Pressable
        onPress={openPicker}
        className="flex-row items-center gap-1.5 px-5 py-2.5"
        accessibilityRole="button"
        accessibilityLabel="选择月份"
      >
        <Text className="text-3xl font-bold text-typography-900">
          {displayLabel}
        </Text>
        <View className="pt-0.5">
          <Icon className="text-typography-500" as={ChevronDown} />
        </View>
      </Pressable>

      <DatePicker
        picker="month"
        value={pickerValue}
        onChange={handleChange}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
