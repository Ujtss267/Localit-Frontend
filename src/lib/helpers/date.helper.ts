// src/lib/helpers/date.helper.ts
/** 날짜를 'YYYY-MM-DD' 형식으로 포맷 */
export const formatDate = (date: Date | string) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/** 두 날짜 사이의 일수 계산 */
export const daysBetween = (start: Date | string, end: Date | string) => {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
  return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
};

/** 현재 날짜 이후인지 확인 */
export const isFutureDate = (date: Date | string) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() > Date.now();
};
