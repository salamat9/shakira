"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  addBooking,
  BookingError,
  cancelBooking,
  createRide,
  deleteRide,
} from "./db";
import type { Direction } from "./types";

export type FormState = {
  error?: string;
  values?: Record<string, string>;
};

export type BookingState = FormState & {
  success?: {
    seats: number;
    driverName: string;
    phone: string;
    telegram: string;
    pickupPoint: string;
  };
};

function text(formData: FormData, name: string, max = 200) {
  return String(formData.get(name) ?? "").trim().slice(0, max);
}

function int(formData: FormData, name: string) {
  const n = Number(formData.get(name));
  return Number.isFinite(n) ? Math.floor(n) : NaN;
}

const DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export async function createRideAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = Object.fromEntries(
    [...formData.entries()]
      .filter(([k]) => !k.startsWith("$ACTION"))
      .map(([k, v]) => [k, String(v)]),
  );
  const fail = (error: string) => ({ error, values });

  const direction = text(formData, "direction") as Direction;
  const data = {
    driverName: text(formData, "driverName", 60),
    phone: text(formData, "phone", 30),
    telegram: text(formData, "telegram", 60),
    city: text(formData, "city", 60),
    pickupPoint: text(formData, "pickupPoint", 200),
    direction,
    departAt: direction === "back" ? "" : text(formData, "departAt"),
    returnAt: direction === "to" ? "" : text(formData, "returnAt"),
    seats: int(formData, "seats"),
    price: int(formData, "price") || 0,
    car: text(formData, "car", 80),
    comment: text(formData, "comment", 500),
  };

  if (!data.driverName) return fail("Укажите имя");
  if (!data.phone && !data.telegram) {
    return fail("Укажите телефон или Telegram, чтобы пассажиры могли связаться");
  }
  if (!data.city) return fail("Укажите город, откуда выезжаете");
  if (!["to", "back", "both"].includes(direction)) return fail("Выберите направление");
  if (direction !== "back" && !DATETIME.test(data.departAt)) {
    return fail("Укажите время выезда к арене");
  }
  if (direction !== "to" && !DATETIME.test(data.returnAt)) {
    return fail("Укажите время выезда обратно");
  }
  if (!(data.seats >= 1 && data.seats <= 50)) return fail("Количество мест: от 1 до 50");
  if (data.price < 0) return fail("Цена не может быть отрицательной");

  const ride = await createRide(data);
  revalidatePath("/");
  redirect(`/rides/${ride.id}/manage?token=${ride.token}&new=1`);
}

export async function bookAction(
  rideId: string,
  _prev: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const values = { name: text(formData, "name"), phone: text(formData, "phone") };
  const name = text(formData, "name", 60);
  const phone = text(formData, "phone", 30);
  const seats = int(formData, "seats");

  if (!name) return { error: "Укажите имя", values };
  if (!phone) return { error: "Укажите телефон, чтобы водитель мог связаться", values };
  if (!(seats >= 1)) return { error: "Выберите количество мест", values };

  try {
    const { ride } = await addBooking(rideId, { name, phone, seats });
    revalidatePath("/");
    revalidatePath(`/rides/${rideId}`);
    return {
      success: {
        seats,
        driverName: ride.driverName,
        phone: ride.phone,
        telegram: ride.telegram,
        pickupPoint: ride.pickupPoint,
      },
    };
  } catch (err) {
    if (err instanceof BookingError) return { error: err.message, values };
    throw err;
  }
}

export async function cancelBookingAction(
  rideId: string,
  token: string,
  bookingId: string,
) {
  await cancelBooking(rideId, token, bookingId);
  revalidatePath("/");
  revalidatePath(`/rides/${rideId}`);
  revalidatePath(`/rides/${rideId}/manage`);
}

export async function deleteRideAction(rideId: string, token: string) {
  await deleteRide(rideId, token);
  revalidatePath("/");
  redirect("/?deleted=1");
}
