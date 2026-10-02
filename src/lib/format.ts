const MONTHS = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

// "2026-11-14T17:30" -> "14 ноября, 17:30". Разбираем строку вручную, чтобы
// время не сдвигалось из-за часового пояса сервера.
export function formatDateTime(value: string) {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (!m) return value;
  const [, , month, day, hh, mm] = m;
  return `${Number(day)} ${MONTHS[Number(month) - 1]}, ${hh}:${mm}`;
}

export function formatPrice(price: number) {
  return price > 0 ? `${price.toLocaleString("ru-RU")} за место` : "Бесплатно";
}

export function telegramLink(handle: string) {
  return `https://t.me/${handle.replace(/^@/, "").replace(/^https?:\/\/t\.me\//, "")}`;
}

export function phoneLink(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
