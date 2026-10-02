import { ADMIN_KEY } from "@/lib/config";
import { listRides, seatsLeft } from "@/lib/db";
import { DIRECTION_LABEL } from "@/lib/types";

// Выгрузка всех поездок и бронирований в CSV, который открывается в Excel:
// /api/export?key=ADMIN_KEY
export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (!ADMIN_KEY || key !== ADMIN_KEY) {
    return new Response("Forbidden", { status: 403 });
  }

  const header = [
    "ID поездки", "Создана", "Город", "Где забирает", "Направление", "Выезд к арене",
    "Выезд обратно", "Мест всего", "Мест свободно", "Цена", "Машина", "Водитель",
    "Телефон водителя", "Telegram", "Комментарий", "Пассажир", "Телефон пассажира",
    "Мест забронировано", "Дата брони",
  ];

  const rows: (string | number)[][] = [];
  for (const r of await listRides()) {
    const base = [
      r.id, r.createdAt, r.city, r.pickupPoint, DIRECTION_LABEL[r.direction], r.departAt,
      r.returnAt, r.seats, seatsLeft(r), r.price, r.car, r.driverName, r.phone, r.telegram,
      r.comment,
    ];
    if (r.bookings.length === 0) rows.push([...base, "", "", "", ""]);
    for (const b of r.bookings) rows.push([...base, b.name, b.phone, b.seats, b.createdAt]);
  }

  // Excel с русской локалью ждёт ";" как разделитель, а BOM нужен для кириллицы
  const cell = (v: string | number) => {
    const s = String(v);
    // Не даём ячейке начинаться с формулы (=, +, -, @)
    const safe = /^[=+\-@]/.test(s) && !/^[+\-]?\d/.test(s) ? `'${s}` : s;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const csv = "﻿" + [header, ...rows].map((row) => row.map(cell).join(";")).join("\r\n");

  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rides-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
