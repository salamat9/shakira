"use client";

import { useActionState } from "react";
import { bookAction, type BookingState } from "@/lib/actions";
import { phoneLink, telegramLink } from "@/lib/format";

export function BookingForm({ rideId, seatsLeft }: { rideId: string; seatsLeft: number }) {
  const [state, action, pending] = useActionState<BookingState, FormData>(
    bookAction.bind(null, rideId),
    {},
  );

  if (state.success) {
    const s = state.success;
    return (
      <div className="card space-y-3 border-emerald-300 bg-emerald-50">
        <h2 className="text-xl font-bold text-emerald-800">
          ✅ Место забронировано ({s.seats})
        </h2>
        <p>Свяжитесь с водителем, чтобы договориться о месте и времени встречи:</p>
        <div className="space-y-1 text-lg">
          <div className="font-semibold">{s.driverName}</div>
          {s.phone && (
            <div>
              📞 <a className="font-semibold text-fuchsia-700 underline" href={phoneLink(s.phone)}>{s.phone}</a>
            </div>
          )}
          {s.telegram && (
            <div>
              ✈️ <a className="font-semibold text-fuchsia-700 underline" href={telegramLink(s.telegram)} target="_blank" rel="noreferrer">{s.telegram}</a>
            </div>
          )}
          {s.pickupPoint && <div className="text-base text-stone-600">📍 {s.pickupPoint}</div>}
        </div>
        <p className="text-sm text-stone-600">
          Сохраните контакты — после обновления страницы они больше не покажутся.
        </p>
      </div>
    );
  }

  if (seatsLeft <= 0) {
    return (
      <div className="card text-center">
        <p className="font-semibold">Все места заняты 😔</p>
        <p className="text-sm text-stone-500">Посмотрите другие поездки из вашего города.</p>
      </div>
    );
  }

  const v = state.values ?? {};
  return (
    <form action={action} className="card space-y-4">
      <h2 className="text-xl font-bold">Забронировать место</h2>
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_8rem]">
        <div>
          <label className="label" htmlFor="name">Ваше имя *</label>
          <input id="name" name="name" required defaultValue={v.name} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Телефон *</label>
          <input id="phone" name="phone" type="tel" required defaultValue={v.phone} className="input" placeholder="+7 700 000 00 00" />
        </div>
        <div>
          <label className="label" htmlFor="seats">Мест</label>
          <select id="seats" name="seats" className="input" defaultValue="1">
            {Array.from({ length: Math.min(seatsLeft, 10) }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>
      {state.error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{state.error}</div>
      )}
      <button className="btn-primary w-full" disabled={pending}>
        {pending ? "Бронируем…" : "Забронировать и получить контакты водителя"}
      </button>
    </form>
  );
}
