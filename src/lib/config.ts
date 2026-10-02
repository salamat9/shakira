// Настройки события. Меняются через переменные окружения (.env.local),
// чтобы не трогать код перед каждым концертом.
export const EVENT = {
  artist: process.env.EVENT_ARTIST ?? "Shakira",
  title: process.env.EVENT_TITLE ?? "Концерт Shakira",
  arena: process.env.EVENT_ARENA ?? "Арена",
  arenaAddress: process.env.EVENT_ARENA_ADDRESS ?? "",
  // Дата и время начала, например "2026-11-14 20:00"
  date: process.env.EVENT_DATE ?? "",
};

// Ключ для выгрузки всех записей в Excel: /api/export?key=...
export const ADMIN_KEY = process.env.ADMIN_KEY ?? "";

// Папка, где лежит файл с записями (rides.json)
export const DATA_DIR = process.env.DATA_DIR ?? "data";
