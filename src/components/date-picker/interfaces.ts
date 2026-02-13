export type PickerType = "date" | "month" | "year";

export type PanelType = "date" | "month" | "year";

export interface DatePickerProps {
  picker: PickerType;
  value?: Date;
  onChange?: (date: Date) => void;
  isOpen: boolean;
  onClose: () => void;
  disabledDate?: (date: Date) => boolean;
  maxDate?: Date;
  minDate?: Date;
}

export interface UseDatePickerOptions {
  picker: PickerType;
  value?: Date;
  onChange?: (date: Date) => void;
  isOpen: boolean;
  onClose: () => void;
  disabledDate?: (date: Date) => boolean;
  maxDate?: Date;
  minDate?: Date;
}

export interface DateCell {
  value: Date;
  text: string;
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
  disabled: boolean;
}

export interface MonthCell {
  value: Date;
  text: string;
  isToday: boolean;
  isSelected: boolean;
  disabled: boolean;
}

export interface YearCell {
  value: number;
  text: string;
  isCurDecade: boolean;
  isSelected: boolean;
  disabled: boolean;
}
