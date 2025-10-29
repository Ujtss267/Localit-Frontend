// src/lib/helpers/date.helper.ts
import dayjs from "dayjs";

/** 날짜를 'YYYY-MM-DD' 형식으로 포맷 */
export const formatDate = (date: Date | string) => {
  return dayjs(date).format("YYYY-MM-DD");
};

/** 두 날짜 사이의 일수 계산 */
export const daysBetween = (start: Date | string, end: Date | string) => {
  return dayjs(end).diff(dayjs(start), "day");
};

/** 현재 날짜 이후인지 확인 */
export const isFutureDate = (date: Date | string) => {
  return dayjs(date).isAfter(dayjs());
};
