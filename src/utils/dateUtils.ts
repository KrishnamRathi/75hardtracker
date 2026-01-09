/**
 * Returns the current date in YYYY-MM-DD format specifically for India Standard Time (UTC+5:30)
 * This avoids the common issue where .toISOString() returns the previous day in the late evening in India.
 */
export function getIndiaDate(date: Date = new Date()): string {
    // If date is invalid (NaN), return empty string to avoid RangeError in formatter
    if (isNaN(date.getTime())) return '';

    // Use Intl.DateTimeFormat to get the date in Asia/Kolkata
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    // en-CA format is YYYY-MM-DD
    return formatter.format(date);
}

/**
 * Normalizes a date string or Date object to a YYYY-MM-DD string in Asia/Kolkata timezone
 */
export function formatToIndiaDate(input: string | Date): string {
    const date = typeof input === 'string' ? new Date(input) : input;
    return getIndiaDate(date);
}
