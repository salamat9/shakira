import type { Metadata } from "next";
import { connection } from "next/server";
import { RideForm } from "@/components/RideForm";
import { EVENT } from "@/lib/config";
import { listRides } from "@/lib/db";

export const metadata: Metadata = { title: "Предложить поездку" };

export default async function NewRidePage() {
  await connection();
  const cities = [...new Set((await listRides()).map((r) => r.city))];
  // Подставляем день концерта, чтобы водителю оставалось поменять только время
  const day = EVENT.date.slice(0, 10);
  const defaultDate = /^\d{4}-\d{2}-\d{2}$/.test(day) ? `${day}T12:00` : "";

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold">Предложить места в машине</h1>
        <p className="mt-1 text-stone-600">
          Едете на концерт на своей машине? Укажите, откуда и когда выезжаете — пассажиры
          забронируют места и свяжутся с вами.
        </p>
      </div>
      <RideForm cities={cities} defaultDate={defaultDate} />
    </div>
  );
}
