import type { Meta, StoryObj } from "@storybook/react-vite";
import { linesFrom } from "@/screens/web/cart-store";
import { at, RestaurantPage } from "@/screens/web/restaurant";
import { WebScreen } from "../web-story-kit";

const FOX = "Ports Fox's **Global Nav / Restaurant** story (`tenfore-restaurant.stories.tsx`, Today / Tomorrow variants): the wide dining-room hero with the venue name and rating, the party/seating bar (here: Order for · Pickup time · Hours) and the \"no availability today\" notice — re-cut from dinner reservations to order-ahead food & drinks, with Fox MCG Grill's ordering edge cases (pickup at the turn timed off a hole, breakfast cut-off, 21+ notice, sold-out items).";

const meta: Meta = {
    title: "Crane Web/Restaurant/Restaurant",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component: `${FOX} The menu is the snack-bar slice of the shop catalog (sections = its subgroups, real photos). Food orders are pickup-only and check out separately from pro shop items; Checkout goes to /cart.`,
            },
        },
    },
};
export default meta;
type Story = StoryObj;

/** A food order already started: burger with modifiers (priced copy), fries, two Transfusions. */
const ORDER = linesFrom([
    ["food-bacon-cheeseburger", "Medium · Add bacon · Fresh-cut fries", 1],
    ["food-turn-dog", "Mustard · Relish", 2],
    ["food-links-transfusion-classic", "", 2],
]).map((l) => (l.product.id === "food-bacon-cheeseburger" ? { ...l, product: { ...l.product, price: l.product.price + 2 } } : l));

export const Desktop: Story = {
    render: () => (
        <WebScreen path="/restaurant">
            <RestaurantPage />
        </WebScreen>
    ),
};

export const Laptop: Story = {
    render: () => (
        <WebScreen path="/restaurant" width="laptop">
            <RestaurantPage />
        </WebScreen>
    ),
};

export const MobileWeb: Story = {
    name: "Mobile web",
    render: () => (
        <WebScreen path="/restaurant" width="mobile">
            <RestaurantPage />
        </WebScreen>
    ),
};

export const CategoryDeepLink: Story = {
    name: "Category deep link",
    parameters: { docs: { description: { story: "`/restaurant/burgers-and-dogs` — one menu section. The Double Eagle is on today's 86 list (\"Sold out today\")." } } },
    render: () => (
        <WebScreen path="/restaurant/burgers-and-dogs">
            <RestaurantPage />
        </WebScreen>
    ),
};

export const WithOrderInProgress: Story = {
    name: "With order in progress",
    render: () => (
        <WebScreen path="/restaurant" cart={ORDER}>
            <RestaurantPage />
        </WebScreen>
    ),
};

export const WithOrderMobile: Story = {
    name: "With order in progress (mobile web)",
    parameters: { docs: { description: { story: "The rail becomes a sticky \"View order\" bar; it opens the order as a bottom sheet." } } },
    render: () => (
        <WebScreen path="/restaurant" cart={ORDER} width="mobile">
            <RestaurantPage />
        </WebScreen>
    ),
};

export const OrderSheetMobile: Story = {
    name: "Order sheet (mobile web)",
    render: () => (
        <WebScreen path="/restaurant" cart={ORDER} width="mobile">
            <RestaurantPage orderSheetOpen />
        </WebScreen>
    ),
};

export const ClosedOrderAhead: Story = {
    name: "Closed / order ahead",
    parameters: { docs: { description: { story: "9:15 PM — Fox's \"Tomorrow\" variant. Today is closed, so the page orders for tomorrow and the pickup defaults to 8:00 AM." } } },
    render: () => (
        <WebScreen path="/restaurant">
            <RestaurantPage now={at(21, 15)} />
        </WebScreen>
    ),
};

export const ClosedMobile: Story = {
    name: "Closed / order ahead (mobile web)",
    render: () => (
        <WebScreen path="/restaurant" width="mobile">
            <RestaurantPage now={at(21, 15)} />
        </WebScreen>
    ),
};

export const AfterBreakfast: Story = {
    name: "After breakfast (12:40 PM)",
    parameters: { docs: { description: { story: "Breakfast items show \"Until 11 AM\" and can't be added for a pickup after 11." } } },
    render: () => (
        <WebScreen path="/restaurant/breakfast">
            <RestaurantPage now={at(12, 40)} />
        </WebScreen>
    ),
};

export const PickupTime: Story = {
    name: "Pickup time picker",
    render: () => (
        <WebScreen path="/restaurant">
            <RestaurantPage pickupOpen />
        </WebScreen>
    ),
};

export const PickupTimeMobile: Story = {
    name: "Pickup time picker (mobile web)",
    render: () => (
        <WebScreen path="/restaurant" width="mobile">
            <RestaurantPage pickupOpen />
        </WebScreen>
    ),
};
