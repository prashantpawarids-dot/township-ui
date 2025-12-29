export class DateTimeUtil {
  /**
   * Formats a date or datetime string to DD-MM-YYYY HH:MM (24-hour)
   */
  static formatDateTime(dateTime: string | Date | null | undefined): string {
    if (!dateTime) return '';

    const d = dateTime instanceof Date ? dateTime : new Date(dateTime);
    if (isNaN(d.getTime())) return '';

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}
