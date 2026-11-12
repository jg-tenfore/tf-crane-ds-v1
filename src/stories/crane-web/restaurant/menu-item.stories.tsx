import type { Meta, StoryObj } from "@storybook/react-vite";
import { RestaurantPage } from "@/screens/web/restaurant";
import { WebScreen } from "../web-story-kit";

const meta: Meta = {
    title: "Crane Web/Restaurant/Menu Item",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "`MenuItemDialog` over the Restaurant page (ports the item step of Fox's MCG Grill ordering, presented in Fox's Global Nav / Restaurant shell). Photo, description, required/optional modifiers with upcharges, special instructions and qty; **Add $X** puts a priced copy of the product in the cart with the choices encoded in the variant string (\"Medium · Add bacon · Fresh-cut fries\"). Press Add without a cook temp to see the required-group error.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const Burger: Story = {
    name: "Burger with modifiers",
    render: () => (
        <WebScreen path="/restaurant/burgers-and-dogs">
            <RestaurantPage openItemId="food-bacon-cheeseburger" />
        </WebScreen>
    ),
};

export const BurgerMobile: Story = {
    name: "Burger with modifiers (mobile web)",
    render: () => (
        <WebScreen path="/restaurant/burgers-and-dogs" width="mobile">
            <RestaurantPage openItemId="food-bacon-cheeseburger" />
        </WebScreen>
    ),
};

export const Drink: Story = {
    name: "Drink (wine, pour size, 21+)",
    render: () => (
        <WebScreen path="/restaurant/wine-and-cocktails">
            <RestaurantPage openItemId="food-house-wine" />
        </WebScreen>
    ),
};

export const Coffee: Story = {
    name: "Drink (coffee size)",
    render: () => (
        <WebScreen path="/restaurant/non-alcoholic">
            <RestaurantPage openItemId="food-hot-coffee" />
        </WebScreen>
    ),
};
