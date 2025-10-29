// src/lib/helpers/string.helper.ts
/** 문자열의 첫 글자를 대문자로 */
export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

/** 문자열이 비어있는지 체크 */
export const isEmpty = (str?: string | null): boolean => {
  return !str || str.trim().length === 0;
};
