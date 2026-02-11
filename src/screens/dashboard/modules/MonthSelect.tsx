import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/src/components/ui/actionsheet";
import { Icon } from "@/src/components/ui/icon";
import { ChevronDown, ChevronsLeft, ChevronsRight } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

const MIN_YEAR = 1970;
const MAX_YEAR = 2100;
const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
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
  const [pickerYear, setPickerYear] = useState(initialDate.year);

  useEffect(() => {
    setSelectedYear(initialDate.year);
    setSelectedMonth(initialDate.month);
    setPickerYear(initialDate.year);
  }, [initialDate.month, initialDate.year]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openPicker = useCallback(() => {
    onPress?.();
    setPickerYear(selectedYear);
    setIsOpen(true);
  }, [onPress, selectedYear]);

  const displayLabel = `${selectedYear}年 ${selectedMonth}月`;

  const handleChangeYear = useCallback((delta: number) => {
    setPickerYear((prev) => clamp(prev + delta, MIN_YEAR, MAX_YEAR));
  }, []);

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

      <Actionsheet isOpen={isOpen} onClose={close}>
        <ActionsheetBackdrop onPress={close} />
        <ActionsheetContent className="gap-0 p-0 pt-0">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <View className="w-full border-b border-outline-100">
            <View className="h-12 w-full flex-row items-center">
              <Pressable
                className="h-full w-14 items-center justify-center"
                onPress={() => handleChangeYear(-1)}
                accessibilityRole="button"
                accessibilityLabel="上一年"
              >
                <Icon className="text-typography-500" as={ChevronsLeft} size="lg" />
              </Pressable>

              <View className="flex-1 items-center">
                <Text className="text-lg font-semibold text-typography-900">{pickerYear} 年</Text>
              </View>

              <Pressable
                className="h-full w-14 items-center justify-center"
                onPress={() => handleChangeYear(1)}
                accessibilityRole="button"
                accessibilityLabel="下一年"
              >
                <Icon className="text-typography-500" as={ChevronsRight} size="lg" />
              </Pressable>
            </View>
          </View>

          <View className="px-3 py-1.5">
            <View className="flex-row flex-wrap">
              {monthOptions.map((month) => {
                const isActive = month === selectedMonth && pickerYear === selectedYear;
                return (
                  <View key={month} className="w-1/3 p-1">
                    <Pressable
                      className={`h-14 items-center justify-center rounded-md ${
                        isActive ? "bg-primary-50" : "bg-transparent"
                      }`}
                      onPress={() => {
                        setSelectedYear(pickerYear);
                        setSelectedMonth(month);
                        onConfirm?.(pickerYear, month);
                        close();
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`选择${month}月`}
                    >
                      <Text
                        className={
                          isActive
                            ? "text-xl font-semibold text-primary-700"
                            : "text-xl font-medium text-typography-900"
                        }
                      >
                        {month}月
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
