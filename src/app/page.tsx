import Link from "next/link";
import { RideCard } from "@/components/RideCard";
import { EVENT } from "@/lib/config";
import { listRides, toPublic } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { DIRECTION_LABEL, type Direction } from "@/lib/types";

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const city = typeof params.city === "string" ? params.city : "";
  const dir = typeof params.dir === "string" ? params.dir : "";
  const onlyFree = params.free === "1";

  const all = (await listRides()).map(toPublic);
  const cities = [...new Set(all.map((r) => r.city))].sort((a, b) => a.localeCompare(b, "ru"));

  const rides = all.filter((r) => {
    if (city && r.city.toLowerCase() !== city.toLowerCase()) return false;
    // "Туда и обратно" подходит и тем, кому нужно только в одну сторону
    if (dir === "to" && r.direction === "back") return false;
    if (dir === "back" && r.direction === "to") return false;
    if (dir === "both" && r.direction !== "both") return false;
    if (onlyFree && r.seatsLeft <= 0) return false;
    return true;
  });
  const freeSeats = all.reduce((sum, r) => sum + Math.max(r.seatsLeft, 0), 0);

  return (
    <div className="space-y-6">
      {params.deleted === "1" && (
        <div className="rounded-xl bg-stone-100 px-4 py-3 text-sm">Поездка удалена.</div>
      )}

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-fuchsia-600 via-pink-500 to-orange-400 p-6 text-white shadow-lg sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-widest opacity-80">
          Попутчики на концерт
        </p>
        <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">{EVENT.title}</h1>
        <p className="mt-2 text-white/90">
          📍 {EVENT.arena}
          {EVENT.arenaAddress && `, ${EVENT.arenaAddress}`}
          {EVENT.date && <> · 🗓 {formatDateTime(EVENT.date.replace(" ", "T"))}</>}
        </p>
        <p className="mt-4 max-w-xl text-white/90">
          Едешь из другого города? Найди машину до арены и обратно. Есть свободные места в
          машине? Возьми попутчиков и раздели расходы на бензин.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href="#rides" className="btn bg-white text-fuchsia-700 hover:bg-fuchsia-50">
            Найти поездку
          </a>
          <Link href="/rides/new" className="btn border border-white/60 text-white hover:bg-white/10">
            Предложить места в машине
          </Link>
        </div>
        <p className="mt-5 text-sm text-white/80">
          Поездок: {all.length} · Городов: {cities.length} · Свободных мест: {freeSeats}
        </p>
      </section>

      <section id="rides" className="space-y-4">
        <form className="card grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
          <div>
            <label className="label" htmlFor="city">Откуда</label>
            <select id="city" name="city" defaultValue={city} className="input">
              <option value="">Все города</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="dir">Куда нужно</label>
            <select id="dir" name="dir" defaultValue={dir} className="input">
              <option value="">Любое направление</option>
              {(Object.keys(DIRECTION_LABEL) as Direction[]).map((d) => (
                <option key={d} value={d}>{DIRECTION_LABEL[d]}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 py-2.5 text-sm">
            <input type="checkbox" name="free" value="1" defaultChecked={onlyFree} className="size-4 accent-fuchsia-600" />
            Есть места
          </label>
          <button className="btn-primary">Показать</button>
        </form>

        {rides.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {rides.map((r) => (
              <RideCard key={r.id} ride={r} />
            ))}
          </div>
        ) : (
          <div className="card text-center">
            <p className="text-lg font-semibold">
              {all.length ? "По этим условиям поездок пока нет" : "Поездок пока нет"}
            </p>
            <p className="mt-1 text-stone-500">
              Едешь на машине? Добавь поездку — пассажиры найдут тебя сами.
            </p>
            <Link href="/rides/new" className="btn-primary mt-4">
              Добавить поездку
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
