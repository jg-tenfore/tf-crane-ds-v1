import { createElement, type ReactNode } from "react";
import { RestaurantPage } from "./restaurant-page";

export { RestaurantPage, type RestaurantPageProps } from "./restaurant-page";
export { MenuItemDialog, type MenuItemDialogProps } from "./menu-item-dialog";
export { PickupDialog, type PickupDialogProps } from "./pickup-dialog";
export { MixedCartDialog, type MixedCartDialogProps } from "./restaurant-ui";
export { at, menuItems, menuSections, restaurantPath } from "./restaurant-data";

export interface RestaurantRoute {
    /** matchPath() pattern. */
    pattern: string;
    render: (params: Record<string, string>) => ReactNode;
}

/**
 * Crane Web Restaurant routes. Every page includes WebShell (active="restaurant").
 *   /restaurant            → full menu
 *   /restaurant/:subgroup  → one menu section (snack-bar subgroup slug, e.g. burgers-and-dogs)
 * One optional-segment pattern, so switching sections keeps the page (pickup, search) mounted.
 * Checkout buttons navigate to /cart (owned by the cart/checkout area).
 */
export const restaurantRoutes: RestaurantRoute[] = [
    { pattern: "/restaurant/:subgroup?", render: (p) => createElement(RestaurantPage, { subgroup: p.subgroup }) },
];
