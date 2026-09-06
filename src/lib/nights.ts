// Single source of truth for the "number of nights" calculation.
// Uses calendar-day difference so DST changes can never shift the result,
// and never returns a negative value.

import { differenceInCalendarDays, parseISO } from "date-fns";

type DateInput = Date | string;

function toDate(value: DateInput): Date {
  return typeof value === "string" ? parseISO(value) : value;
}

/** Nights between check-in and check-out (0 when dates are missing or inverted). */
export function countNights(checkIn?: DateInput | null, checkOut?: DateInput | null): number {
  if (!checkIn || !checkOut) return 0;
  const inDate = toDate(checkIn);
  const outDate = toDate(checkOut);
  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) return 0;
  return Math.max(0, differenceInCalendarDays(outDate, inDate));
}
