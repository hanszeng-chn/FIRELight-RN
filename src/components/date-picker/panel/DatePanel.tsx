import { getMonth, getYear } from "date-fns";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { useDatePickerContext } from "../datePickerContext";
import { PanelHeader } from "./PanelHeader";

const WEEKDAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"];

export function DatePanel() {
  const {
    panelDate,
    dateCells,
    goToPrevMonth,
    goToNextMonth,
    goToPrevYear,
    goToNextYear,
    switchToYearPanel,
    switchToMonthPanel,
    onDateSelect,
  } = useDatePickerContext();

  const year = getYear(panelDate);
  const month = getMonth(panelDate) + 1;

  return (
    <View className="w-full">
      <PanelHeader
        title={`${year}年`}
        onTitlePress={switchToYearPanel}
        secondaryTitle={`${month}月`}
        onSecondaryTitlePress={switchToMonthPanel}
        onPrevYear={goToPrevYear}
        onNextYear={goToNextYear}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
      />
      {/* Weekday header */}
      <View className="flex-row px-2 pt-2">
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} className="flex-1 items-center py-1">
            <Text className="text-sm text-typography-500">{label}</Text>
          </View>
        ))}
      </View>
      {/* Date grid: 6 rows x 7 columns */}
      <View className="px-2 pb-2">
        {Array.from({ length: 6 }, (_, row) => (
          <View key={row} className="flex-row">
            {dateCells.slice(row * 7, row * 7 + 7).map((cell) => {
              const isSelected = cell.isSelected && cell.isCurrentMonth;
              const isToday = cell.isToday && !isSelected;
              return (
                <View key={cell.value.toISOString()} className="flex-1 p-0.5">
                  <Pressable
                    className={`aspect-square items-center justify-center rounded-md active:bg-background-100 ${
                      isSelected
                        ? "bg-primary-50"
                        : isToday
                          ? "border border-primary-600 bg-transparent"
                          : ""
                    } ${cell.disabled ? "opacity-30" : ""}`}
                    onPress={() => onDateSelect(cell.value)}
                    disabled={cell.disabled}
                    accessibilityRole="button"
                    accessibilityLabel={`${getYear(cell.value)}年${getMonth(cell.value) + 1}月${cell.text}日`}
                  >
                    <Text
                      className={
                        isSelected
                          ? "text-sm font-semibold text-primary-700"
                          : isToday
                            ? "text-sm font-semibold text-primary-700"
                            : !cell.isCurrentMonth
                              ? "text-sm text-typography-300"
                              : "text-sm text-typography-900"
                      }
                    >
                      {cell.text}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
