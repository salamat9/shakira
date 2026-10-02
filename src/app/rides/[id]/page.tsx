import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/BookingForm";
import { RideTimes, SeatsBadge } from "@/components/RideCard";
import { EVENT } from "@/lib/config";
import { getRide, toPublic } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { DIRECTION_LABEL } from "@/lib/types";

const ARROW = { to: "→", back: "←", both: "⇄" } as const;

export default async function RidePage({ params }: PageProps<"/rides/[id]">) {
  const { id } = await params;
  const found = await getRide(id);
  if (!found) notFound();
  const ride = toPublic(found);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-800">← Все поездки</Link>

      <div className="card space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-3xl font-extrabold">
              {ride.city} {ARROW[ride.direction]} {EVENT.arena}
            </h1>
            <p className="text-stone-500">{DIRECTION_LABEL[ride.direction]}</p>
          </div>
          <SeatsBadge left={ride.seatsLeft} />
        </div>

        <RideTimes ride={ride} />

        <dl className="grid gap-3 border-t border-stone-100 pt-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-stone-500">Цена</dt>
            <dd className="text-lg font-bold text-fuchsia-700">{formatPrice(ride.price)}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Водитель</dt>
            <dd className="font-semibold">{ride.driverName}</dd>
          </div>
          {ride.car && (
            <div>
              <dt className="text-stone-500">Машина</dt>
              <dd className="font-semibold">{ride.car}</dd>
            </div>
          )}
          {ride.pickupPoint && (
            <div>
              <dt className="text-stone-500">Где забирает</dt>
              <dd className="font-semibold">{ride.pickupPoint}</dd>
            </div>
          )}
          <div>
            <dt className="text-stone-500">Всего мест</dt>
            <dd className="font-semibold">{ride.seats}</dd>
          </div>
        </dl>

        {ride.comment && (
          <p className="whitespace-pre-line rounded-xl bg-stone-50 p-3 text-sm">{ride.comment}</p>
        )}
      </div>

      <BookingForm rideId={ride.id} seatsLeft={ride.seatsLeft} />
    </div>
  );
}
