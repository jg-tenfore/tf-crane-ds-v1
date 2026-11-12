import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConfirmationPage } from "@/screens/web/checkout";
import { WebScreen } from "../web-story-kit";

const meta: Meta = {
    title: "Crane Web/Shop/7. Confirmation",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Ports Fox **Shop Checkout / 4. Confirmation - Purchase**: green check, order number, items, delivery, payment details, returns and help. " +
                    "**CraneWeb adds:** the destination tax line on the receipt (\"Tax · Athens-Clarke County, GA (8.00%)\"), Fees + Surcharge, pickup variants for pro shop and snack-bar orders " +
                    "(where, when, \"we'll text you\"), course contact from the course record, and Continue shopping. Place order on Checkout lands here at `/order/<id>` with the cart cleared.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const Shipped: Story = {
    name: "Shipped order",
    render: () => (
        <WebScreen path="/order/SG-100482">
            <ConfirmationPage orderId="SG-100482" />
        </WebScreen>
    ),
};

export const Pickup: Story = {
    name: "Pickup order",
    render: () => (
        <WebScreen path="/order/SG-100483">
            <ConfirmationPage orderId="SG-100483" />
        </WebScreen>
    ),
};

export const SnackBarPickup: Story = {
    name: "Snack-bar pickup",
    render: () => (
        <WebScreen path="/order/SG-100484">
            <ConfirmationPage orderId="SG-100484" />
        </WebScreen>
    ),
};

export const MobileWeb: Story = {
    name: "Mobile web",
    render: () => (
        <WebScreen path="/order/SG-100482" width="mobile">
            <ConfirmationPage orderId="SG-100482" />
        </WebScreen>
    ),
};
