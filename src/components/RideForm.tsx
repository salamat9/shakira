"use client";

import { useActionState, useState } from "react";
import { createRideAction, type FormState } from "@/lib/actions";
import { DIRECTION_LABEL, type Direction } from "@/lib/types";

export function RideForm({ cities, defaultDate }: { cities: string[]; defaultDate: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createRideAction, {});
  const v = state.values ?? {};
  const [direction, setDirection] = useState<Direction>((v.direction as Direction) || "both");

  return (
    <form action={action} className="space-y-5">
      <fieldset className="card space-y-4">
        <h2 className="text-lg font-bold">Маршрут</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="city">Город, откуда выезжаете *</label>
            <input id="city" name="city" required list="cities" defaultValue={v.city} className="input" placeholder="Например, Алматы" />
            <datalist id="cities">
              {cities.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div>
            <label className="label" htmlFor="pickupPoint">Где забираете</label>
            <input id="pickupPoint" name="pickupPoint" defaultValue={v.pickupPoint} className="input" placeholder="ТЦ, вокзал, станция метро…" />
          </div>
        </div>

        <div>
          <span className="label">Направление *</span>
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(DIRECTION_LABEL) as Direction[]).map((d) => (
              <label
                key={d}
                className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-medium transition ${
                  direction === d
                    ? "border-fuchsia-500 bg-fuchsia-50 text-fuchsia-800"
                    : "border-stone-300 bg-white hover:bg-stone-50"
                }`}
              >
                <input
                  type="radio"
                  name="direction"
                  value={d}
                  checked={direction === d}
                  onChange={() => setDirection(d)}
                  className="sr-only"
                />
                {DIRECTION_LABEL[d]}
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {direction !== "back" && (
            <div>
              <label className="label" htmlFor="departAt">Выезд из города к арене *</label>
              <input id="departAt" name="departAt" type="datetime-local" required defaultValue={v.departAt ?? defaultDate} className="input" />
            </div>
          )}
          {direction !== "to" && (
            <div>
              <label className="label" htmlFor="returnAt">Выезд от арены обратно *</label>
              <input id="returnAt" name="returnAt" type="datetime-local" required defaultValue={v.returnAt ?? defaultDate} className="input" />
            </div>
          )}
        </div>
      </fieldset>

      <fieldset className="card space-y-4">
        <h2 className="text-lg font-bold">Машина и места</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="seats">Свободных мест *</label>
            <input id="seats" name="seats" type="number" min={1} max={50} required defaultValue={v.seats ?? "3"} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="price">Цена за место</label>
            <input id="price" name="price" type="number" min={0} step={1} defaultValue={v.price} className="input" placeholder="0 — бесплатно" />
          </div>
          <div>
            <label className="label" htmlFor="car">Машина</label>
            <input id="car" name="car" defaultValue={v.car} className="input" placeholder="Белая Camry" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="comment">Комментарий</label>
          <textarea id="comment" name="comment" rows={3} defaultValue={v.comment} className="input" placeholder="Багаж, остановки по пути, можно ли с детьми…" />
        </div>
      </fieldset>

      <fieldset className="card space-y-4">
        <h2 className="text-lg font-bold">Водитель</h2>
        <p className="text-sm text-stone-500">
          Контакты видят только пассажиры, которые забронировали место.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="driverName">Имя *</label>
            <input id="driverName" name="driverName" required defaultValue={v.driverName} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="phone">Телефон / WhatsApp</label>
            <input id="phone" name="phone" type="tel" defaultValue={v.phone} className="input" placeholder="+7 700 000 00 00" />
          </div>
          <div>
            <label className="label" htmlFor="telegram">Telegram</label>
            <input id="telegram" name="telegram" defaultValue={v.telegram} className="input" placeholder="@username" />
          </div>
        </div>
      </fieldset>

      {state.error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{state.error}</div>
      )}

      <button className="btn-primary w-full py-3 text-lg" disabled={pending}>
        {pending ? "Сохраняем…" : "Опубликовать поездку"}
      </button>
    </form>
  );
}
