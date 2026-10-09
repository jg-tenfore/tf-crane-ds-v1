import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChooseHomeCourseScreen } from "@/screens/auth";

const meta: Meta<typeof ChooseHomeCourseScreen> = {
    title: "Sign in ∕ Sign up/Choose Home Course",
    component: ChooseHomeCourseScreen,
    parameters: { phone: true },
};
export default meta;

type Story = StoryObj<typeof ChooseHomeCourseScreen>;

export const Default: Story = {};
export const Selected: Story = { args: { initialSelected: ["mount-hood", "sagamore-spring"] } };
export const Search: Story = { args: { initialQuery: "Sagamore", initialSelected: ["sagamore-spring"] } };
