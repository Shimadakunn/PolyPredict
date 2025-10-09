import { formatInTimeZone } from "date-fns-tz";

export const time = formatInTimeZone(
  new Date(),
  "America/New_York",
  "MMMM-d-haa"
).toLowerCase();

export const day = formatInTimeZone(
  new Date(),
  "America/New_York",
  "dd-MMM"
).toLowerCase();

export const hour = formatInTimeZone(
  new Date(),
  "America/New_York",
  "ha"
).toLowerCase();

export const timestamp = formatInTimeZone(
  new Date(),
  "America/New_York",
  "hh:mm:ss.SSS"
);
