export function dateStringInTimeZone(input: Date | string = new Date(), timeZone = 'UTC') {
  const date = input instanceof Date ? input : new Date(input);

  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: '2-digit',
      timeZone,
      year: 'numeric',
    }).formatToParts(date);
    const year = parts.find((part) => part.type === 'year')?.value;
    const month = parts.find((part) => part.type === 'month')?.value;
    const day = parts.find((part) => part.type === 'day')?.value;

    if (year && month && day) {
      return `${year}-${month}-${day}`;
    }
  } catch {
    return date.toISOString().slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

export function addDaysToDateString(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function previousDateStringInTimeZone(timeZone: string, date = new Date()) {
  return addDaysToDateString(dateStringInTimeZone(date, timeZone), -1);
}

export function currentWeekStartStringInTimeZone(timeZone: string, date = new Date()) {
  const currentDateString = dateStringInTimeZone(date, timeZone);
  const current = new Date(`${currentDateString}T00:00:00.000Z`);
  const day = current.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  current.setUTCDate(current.getUTCDate() + diff);
  return current.toISOString().slice(0, 10);
}

export function yearMonthInTimeZone(timeZone: string, date = new Date()) {
  const [year, month] = dateStringInTimeZone(date, timeZone).split('-');
  return {
    month: Number(month),
    year: Number(year),
  };
}

export function monthDateBounds(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const endYear = month === 12 ? year + 1 : year;
  const endMonth = month === 12 ? 1 : month + 1;
  const end = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
  return { end, start };
}
