import { createElement } from "react";
import type { ScreenRegistry } from "@/components/prototype/stack-navigator";
import { TeeSheetScreen } from "./tee-sheet-screen";

export { TeeSheetScreen } from "./tee-sheet-screen";
export { ConfigureBookingSheet } from "./configure-booking-sheet";

/** Home tab stack. Root: "home" (the tee sheet). */
export const homeScreens: ScreenRegistry = {
    home: () => createElement(TeeSheetScreen),
};
