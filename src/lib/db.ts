import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { DATA_DIR } from "./config";
import type { Booking, PublicRide, Ride } from "./types";

// Все записи хранятся в одном JSON-файле. Для сотен поездок этого с запасом
// хватает, а выгрузка в Excel доступна через /api/export.
const FILE = path.resolve(process.cwd(), DATA_DIR, "rides.json");

async function load(): Promise<Ride[]> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as Ride[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function save(rides: Ride[]) {
  await mkdir(path.dirname(FILE), { recursive: true });
  // Пишем во временный файл и переименовываем, чтобы файл не побился при сбое
  const tmp = `${FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(rides, null, 2), "utf8");
  await rename(tmp, FILE);
}

// Изменения выполняются строго по очереди, чтобы два одновременных
// бронирования не заняли одно и то же место.
let queue: Promise<unknown> = Promise.resolve();

function mutate<T>(fn: (rides: Ride[]) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const rides = await load();
    const result = await fn(rides);
    await save(rides);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

export function seatsLeft(ride: Ride) {
  return ride.seats - ride.bookings.reduce((sum, b) => sum + b.seats, 0);
}

export function toPublic(ride: Ride): PublicRide {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { token, phone, telegram, bookings, ...rest } = ride;
  return { ...rest, seatsLeft: seatsLeft(ride) };
}

export async function listRides(): Promise<Ride[]> {
  const rides = await load();
  const when = (r: Ride) => r.departAt || r.returnAt;
  return rides.sort((a, b) => when(a).localeCompare(when(b)));
}

export async function getRide(id: string): Promise<Ride | undefined> {
  return (await load()).find((r) => r.id === id);
}

export function createRide(
  data: Omit<Ride, "id" | "createdAt" | "token" | "bookings">,
): Promise<Ride> {
  return mutate((rides) => {
    const ride: Ride = {
      ...data,
      id: randomUUID().slice(0, 8),
      createdAt: new Date().toISOString(),
      token: randomBytes(16).toString("hex"),
      bookings: [],
    };
    rides.push(ride);
    return ride;
  });
}

export class BookingError extends Error {}

export function addBooking(
  rideId: string,
  data: Omit<Booking, "id" | "createdAt">,
): Promise<{ ride: Ride; booking: Booking }> {
  return mutate((rides) => {
    const ride = rides.find((r) => r.id === rideId);
    if (!ride) throw new BookingError("Поездка не найдена или удалена");
    const left = seatsLeft(ride);
    if (left <= 0) throw new BookingError("Свободных мест уже нет");
    if (data.seats > left) {
      throw new BookingError(`Осталось мест: ${left}`);
    }
    const booking: Booking = {
      ...data,
      id: randomUUID().slice(0, 8),
      createdAt: new Date().toISOString(),
    };
    ride.bookings.push(booking);
    return { ride, booking };
  });
}

function findOwned(rides: Ride[], rideId: string, token: string) {
  const ride = rides.find((r) => r.id === rideId);
  if (!ride || ride.token !== token) throw new Error("Нет доступа");
  return ride;
}

export function cancelBooking(rideId: string, token: string, bookingId: string) {
  return mutate((rides) => {
    const ride = findOwned(rides, rideId, token);
    ride.bookings = ride.bookings.filter((b) => b.id !== bookingId);
  });
}

export function deleteRide(rideId: string, token: string) {
  return mutate((rides) => {
    findOwned(rides, rideId, token);
    rides.splice(
      rides.findIndex((r) => r.id === rideId),
      1,
    );
  });
}
