import Link from "next/link";
import { formatDateTime, formatPrice } from "@/lib/format";
import { DIRECTION_LABEL, type PublicRide } from "@/lib/types";

export function RideTimes({ ride }: { ride: PublicRide }) {
  return (
    <div className="space-y-1 text-sm">
      {ride.departAt && (
        <div>
          <span className="text-stone-500">→ К арене:</span>{" "}
          <b>{formatDateTime(ride.departAt)}</b>
        </div>
      )}
      {ride.returnAt && (
        <div>
          <span className="text-stone-500">← Обратно:</span>{" "}
          <b>{formatDateTime(ride.returnAt)}</b>
        </div>
      )}
    </div>
  );
}

export function SeatsBadge({ left }: { left: number }) {
  return left > 0 ? (
    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
      Свободно мест: {left}
    </span>
  ) : (
    <span className="rounded-full bg-stone-200 px-2.5 py-1 text-xs font-semibold text-stone-600">
      Мест нет
    </span>
  );
}

export function RideCard({ ride }: { ride: PublicRide }) {
  return (
    <Link
      href={`/rides/${ride.id}`}
      className={`card block transition hover:border-fuchsia-300 hover:shadow-md ${
        ride.seatsLeft <= 0 ? "opacity-60" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-xl font-bold">{ride.city}</div>
          <div className="text-sm text-stone-500">{DIRECTION_LABEL[ride.direction]}</div>
        </div>
        <SeatsBadge left={ride.seatsLeft} />
      </div>
      <div className="mt-3">
        <RideTimes ride={ride} />
      </div>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-stone-100 pt-3">
        <div className="text-lg font-bold text-fuchsia-700">{formatPrice(ride.price)}</div>
        <div className="text-sm text-stone-500">
          {ride.driverName}
          {ride.car && ` · ${ride.car}`}
        </div>
      </div>
    </Link>
  );
}
