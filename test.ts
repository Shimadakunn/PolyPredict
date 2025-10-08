import { formatInTimeZone } from "date-fns-tz";

function writeLog() {
  const time = formatInTimeZone(
    new Date(),
    "America/New_York",
    "MMMM-d-haa"
  ).toLowerCase();
}
