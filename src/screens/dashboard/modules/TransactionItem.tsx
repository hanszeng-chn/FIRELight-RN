import { Menu, MenuItem, MenuItemLabel } from "@/src/components/ui/menu";
import { useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";

export type TransactionItemProps = {
  title: string;
  subtitle?: string;
  amount: string;
  status?: string;
  icon: string;
  showDivider?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function TransactionItem({
  title,
  subtitle,
  amount,
  status,
  icon,
  showDivider = true,
  onEdit,
  onDelete,
}: TransactionItemProps) {
  const [menuInstanceKey, setMenuInstanceKey] = useState(0);
  const skipNextPressRef = useRef(false);
  const normalizedAmount = amount.trim();
  const amountTextClassName = normalizedAmount.startsWith("-")
    ? "text-error-700"
    : normalizedAmount.startsWith("+")
      ? "text-success-700"
      : "text-typography-900";

  return (
    <Menu
      key={menuInstanceKey}
      placement="bottom left"
      offset={5}
      closeOnSelect
      onClose={() => {
        skipNextPressRef.current = false;
      }}
      trigger={(triggerProps) => {
        const { onPress: menuTriggerOnPress, ...restTriggerProps } =
          triggerProps;

        return (
          <Pressable
            {...restTriggerProps}
            className="bg-background-0 px-5"
            onPress={() => {
              if (skipNextPressRef.current) {
                skipNextPressRef.current = false;
                return;
              }
              onEdit?.();
            }}
            onLongPress={() => {
              skipNextPressRef.current = true;
              menuTriggerOnPress?.();
            }}
            delayLongPress={280}
            accessibilityRole="button"
          >
            <View className="flex-row items-center gap-3 py-3.5">
              <View className="h-10 w-10 items-center justify-center rounded-full border border-outline-200">
                <Text className="text-base font-semibold text-typography-700">
                  {icon}
                </Text>
              </View>

              <View className="flex-1 pr-2">
                <Text
                  numberOfLines={1}
                  className="text-base font-medium text-typography-900"
                >
                  {title}
                </Text>
                {subtitle ? (
                  <Text className="mt-0.5 text-sm leading-5 text-typography-500">
                    {subtitle}
                  </Text>
                ) : null}
              </View>

              <View className="items-end">
                <Text
                  className={`text-lg font-semibold ${amountTextClassName}`}
                >
                  {amount}
                </Text>
                {status ? (
                  <Text className="mt-0.5 text-sm text-warning-600">
                    {status}
                  </Text>
                ) : null}
              </View>
            </View>

            {showDivider ? <View className="h-px bg-outline-100" /> : null}
          </Pressable>
        );
      }}
    >
      <MenuItem
        key="edit"
        textValue="编辑"
        onPress={() => {
          setMenuInstanceKey((prev) => prev + 1);
          onEdit?.();
        }}
      >
        <MenuItemLabel>编辑</MenuItemLabel>
      </MenuItem>
      <MenuItem
        key="delete"
        textValue="删除"
        onPress={() => {
          setMenuInstanceKey((prev) => prev + 1);
          onDelete?.();
        }}
      >
        <MenuItemLabel className="text-error-700">删除</MenuItemLabel>
      </MenuItem>
    </Menu>
  );
}
