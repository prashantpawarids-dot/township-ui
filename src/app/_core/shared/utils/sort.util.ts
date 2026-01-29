export function sortByTimeOnly(
  data: any[],
  field: string,
  order: 'asc' | 'desc' = 'asc'
) {
  return data.sort((a, b) => {
    const t1 = extractTimeInMs(a[field]);
    const t2 = extractTimeInMs(b[field]);
    return order === 'asc' ? t1 - t2 : t2 - t1;
  });
}

function extractTimeInMs(dateTimeString: string): number {
  if (!dateTimeString) return 0;

  // Extract time part safely
  let time = dateTimeString.split('T')[1] || dateTimeString.split(' ')[1];
  if (!time) return 0;

  time = time.substring(0, 8); // HH:mm:ss

  // Convert to milliseconds since midnight
  const [h, m, s] = time.split(':').map(Number);
  return h * 3600000 + m * 60000 + s * 1000;
}
