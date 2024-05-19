export function getEnumKeyByEnumValue<T extends { [index: string]: string }>(
  customEnum: T,
  enumValue: string,
): keyof T | null {
  const keys = Object.keys(customEnum).filter(
    (x) => customEnum[x] == enumValue,
  );
  return keys.length > 0 ? keys[0] : null;
}
