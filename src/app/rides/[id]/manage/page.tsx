import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/ConfirmButton";
import { CopyLink } from "@/components/CopyLink";
import { RideTimes, SeatsBadge } from "@/components/RideCard";
import { cancelBookingAction, deleteRideAction } from "@/lib/actions";
import { getRide, toPublic } from "@/lib/db";
import { formatPrice, phoneLink } from "@/lib/format";

export const metadata: Metadata = {
  title: "Моя поездка",
  robots: { index: false },
};

export default async function ManagePage({
  params,
  searchParams,
}: PageProps<"/rides/[id]/manage">) {
  const { id } = await params;
  const { token, new: isNew } = await searchParams;
  const ride = await getRide(id);
  if (!ride || typeof token !== "string" || ride.token !== token) notFound();
  const pub = toPublic(ride);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {isNew === "1" && (
        <div className="card border-emerald-300 bg-emerald-50">
          <h1 className="text-xl font-bold text-emerald-800">🎉 Поездка опубликована!</h1>
          <p className="mt-1 text-sm">
            Пассажиры уже могут её найти и забронировать места.
          </p>
        </div>
      )}

      <div className="card space-y-3 border-amber-300 bg-amber-50">
        <h2 className="font-bold">🔑 Сохраните эту ссылку</h2>
        <p className="text-sm">
          Это ваша личная страница управления поездкой: здесь видно, кто забронировал места.
          Не отправляйте её пассажирам.
        </p>
        <CopyLink path={`/rides/${ride.id}/manage?token=${ride.token}`} />
        <p className="pt-2 text-sm">Ссылка для пассажиров (можно публиковать в чатах):</p>
        <CopyLink path={`/rides/${ride.id}`} />
      </div>

      <div className="card space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold">{ride.city}</h2>
            <p className="text-sm text-stone-500">{formatPrice(ride.price)}</p>
          </div>
          <SeatsBadge left={pub.seatsLeft} />
        </div>
        <RideTimes ride={pub} />
        <Link href={`/rides/${ride.id}`} className="inline-block text-sm text-fuchsia-700 underline">
          Как видят пассажиры →
        </Link>
      </div>

      <div className="card space-y-3">
        <h2 className="text-xl font-bold">
          Пассажиры ({ride.seats - pub.seatsLeft} из {ride.seats})
        </h2>
        {ride.bookings.length === 0 ? (
          <p className="text-stone-500">Пока никто не забронировал. Поделитесь ссылкой в чатах фанатов!</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {ride.bookings.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <div className="font-semibold">
                    {b.name} <span className="font-normal text-stone-500">· мест: {b.seats}</span>
                  </div>
                  <a href={phoneLink(b.phone)} className="text-fuchsia-700 underline">{b.phone}</a>
                </div>
                <form action={cancelBookingAction.bind(null, ride.id, ride.token, b.id)}>
                  <ConfirmButton
                    message={`Отменить бронь пассажира ${b.name}?`}
                    className="btn-ghost px-3 py-1.5 text-sm"
                  >
                    Отменить бронь
                  </ConfirmButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form action={deleteRideAction.bind(null, ride.id, ride.token)} className="text-center">
        <ConfirmButton
          message="Удалить поездку? Пассажиры больше не увидят её."
          className="btn border border-red-300 bg-white text-red-700 hover:bg-red-50"
        >
          Удалить поездку
        </ConfirmButton>
      </form>
    </div>
  );
}
