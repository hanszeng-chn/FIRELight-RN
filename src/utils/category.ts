const ENGLISH_LETTER_REGEX = /^[A-Za-z]$/;

export const getAutoCategoryIcon = (name: string): string => {
  const firstChar = name.trim().charAt(0);
  if (!firstChar) {
    return "?";
  }

  return ENGLISH_LETTER_REGEX.test(firstChar)
    ? firstChar.toUpperCase()
    : firstChar;
};

