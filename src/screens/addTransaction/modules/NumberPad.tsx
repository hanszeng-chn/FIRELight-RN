import { DatePicker } from "@/src/components/date-picker";
import { Icon } from "@/src/components/ui/icon";
import { Input, InputField } from "@/src/components/ui/input";
import { Calendar, Delete } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type NumberPadProps = {
  categoryName: string;
  amountStr: string;
  note: string;
  date: string;
  submitLabel?: string;
  onAmountChange: (str: string) => void;
  onNoteChange: (str: string) => void;
  onDateChange: (date: string) => void;
  onSubmit: () => void;
};

function formatDateLabel(dateStr: string): string {
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  if (dateStr === todayISO) return "今天";
  const parts = dateStr.split("-");
  return `${parts[1]}-${parts[2]}`;
}

function applyAmountKey(current: string, key: string): string {
  if (key === "backspace") {
    return current.slice(0, -1);
  }

  if (key === ".") {
    if (current.includes(".")) return current;
    return current === "" ? "0." : current + ".";
  }

  // Digit — enforce max 2 decimal places
  const dotIndex = current.indexOf(".");
  if (dotIndex !== -1 && current.length - dotIndex > 2) {
    return current;
  }

  // Prevent leading zeros like "00", "01" but allow "0."
  if (current === "0") {
    return key;
  }

  return current + key;
}

function DigitKey({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      className="h-14 flex-1 items-center justify-center rounded-md active:bg-background-100"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text className="text-xl font-medium text-typography-900">{label}</Text>
    </Pressable>
  );
}

export function NumberPad({
  categoryName,
  amountStr,
  note,
  date,
  submitLabel = "完成",
  onAmountChange,
  onNoteChange,
  onDateChange,
  onSubmit,
}: NumberPadProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const displayAmount = amountStr === "" ? "0" : amountStr;
  const canSubmit = parseFloat(amountStr) > 0;

  const handleKey = useCallback(
    (key: string) => {
      onAmountChange(applyAmountKey(amountStr, key));
    },
    [amountStr, onAmountChange],
  );

  const dateValue = new Date(date + "T00:00:00");

  const handleDateChange = useCallback(
    (selectedDate: Date) => {
      const iso = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
      onDateChange(iso);
    },
    [onDateChange],
  );

  return (
    <SafeAreaView
      edges={["bottom"]}
      className="rounded-tl-lg rounded-tr-lg bg-background-0 shadow-hard-3"
    >
      {/* Amount display */}
      <View className="px-5 pb-2 pt-3">
        <Text className="text-3xl font-bold text-typography-900">
          {displayAmount}
        </Text>
      </View>

      {/* Note input */}
      <View className="border-b border-outline-100 px-5 pb-3">
        <Input variant="underlined" size="md" className="border-b-0">
          <InputField
            placeholder="备注..."
            value={note}
            onChangeText={onNoteChange}
            returnKeyType="done"
          />
        </Input>
      </View>

      {/* Keypad: left 3 columns + right action column */}
      <View className="flex-row px-2 pb-2 pt-1">
        {/* Left: 3-column digit grid */}
        <View className="flex-1">
          <View className="flex-row">
            <DigitKey label="1" onPress={() => handleKey("1")} />
            <DigitKey label="2" onPress={() => handleKey("2")} />
            <DigitKey label="3" onPress={() => handleKey("3")} />
          </View>
          <View className="flex-row">
            <DigitKey label="4" onPress={() => handleKey("4")} />
            <DigitKey label="5" onPress={() => handleKey("5")} />
            <DigitKey label="6" onPress={() => handleKey("6")} />
          </View>
          <View className="flex-row">
            <DigitKey label="7" onPress={() => handleKey("7")} />
            <DigitKey label="8" onPress={() => handleKey("8")} />
            <DigitKey label="9" onPress={() => handleKey("9")} />
          </View>
          <View className="flex-row">
            <DigitKey label="." onPress={() => handleKey(".")} />
            <DigitKey label="0" onPress={() => handleKey("0")} />
            {/* Date key */}
            <Pressable
              className="h-14 flex-1 items-center justify-center rounded-md active:bg-background-100"
              onPress={() => setShowDatePicker(true)}
              accessibilityRole="button"
              accessibilityLabel="选择日期"
            >
              <Icon className="text-typography-500" as={Calendar} size="sm" />
              <Text className="mt-0.5 text-xs text-typography-500">
                {formatDateLabel(date)}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Right: action column */}
        <View className="w-20 gap-1 pl-1">
          {/* Backspace */}
          <Pressable
            className="h-14 items-center justify-center rounded-md active:bg-background-100"
            onPress={() => handleKey("backspace")}
            accessibilityRole="button"
            accessibilityLabel="退格"
          >
            <Icon className="text-typography-700" as={Delete} size="xl" />
          </Pressable>

          {/* Submit — fills remaining height (3 rows) */}
          <Pressable
            className={`flex-1 items-center justify-center rounded-lg ${
              canSubmit
                ? "bg-primary-600 active:bg-primary-700"
                : "bg-background-200"
            }`}
            onPress={canSubmit ? onSubmit : undefined}
            disabled={!canSubmit}
            accessibilityRole="button"
            accessibilityLabel={submitLabel}
          >
            <Text
              className={`text-lg font-semibold ${
                canSubmit ? "text-white" : "text-typography-400"
              }`}
            >
              {submitLabel}
            </Text>
          </Pressable>
        </View>
      </View>

      <DatePicker
        picker="date"
        value={dateValue}
        onChange={handleDateChange}
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
      />
    </SafeAreaView>
  );
}
