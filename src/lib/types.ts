export type Direction = "to" | "back" | "both";

export const DIRECTION_LABEL: Record<Direction, string> = {
  to: "Только на концерт",
  back: "Только обратно",
  both: "Туда и обратно",
};

export type Booking = {
  id: string;
  name: string;
  phone: string;
  seats: number;
  createdAt: string;
};

export type Ride = {
  id: string;
  createdAt: string;
  // Секрет водителя: по нему открывается страница управления поездкой
  token: string;
  driverName: string;
  phone: string;
  telegram: string;
  city: string;
  pickupPoint: string;
  direction: Direction;
  // Время выезда из города к арене (YYYY-MM-DDTHH:mm)
  departAt: string;
  // Время выезда от арены обратно (YYYY-MM-DDTHH:mm), "" если обратно не едет
  returnAt: string;
  seats: number;
  price: number;
  car: string;
  comment: string;
  bookings: Booking[];
};

// То, что можно отдавать любому посетителю: без контактов и секрета
export type PublicRide = Omit<Ride, "token" | "phone" | "telegram" | "bookings"> & {
  seatsLeft: number;
};
