import { createElement } from "react";
import type { ScreenRegistry } from "@/components/prototype/stack-navigator";
import { BookingsScreen } from "./bookings-screen";
import { PurchaseDetailsScreen, TeeTimeDetailsScreen } from "./booking-details-screens";

export { BookingsScreen } from "./bookings-screen";
export { PurchaseDetailsScreen, TeeTimeDetailsScreen } from "./booking-details-screens";

/** Bookings tab stack. Root: "bookings". */
export const bookingsScreens: ScreenRegistry = {
    bookings: () => createElement(BookingsScreen),
    "tee-time-details": (p) => createElement(TeeTimeDetailsScreen, { id: p.id as string }),
    "purchase-details": (p) => createElement(PurchaseDetailsScreen, { id: p.id as string }),
};
