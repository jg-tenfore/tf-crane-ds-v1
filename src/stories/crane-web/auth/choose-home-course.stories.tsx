import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChooseHomeCoursePage } from "@/screens/web/auth";
import { WebScreen } from "../web-story-kit";

const meta: Meta = {
    title: "Crane Web/Sign in ∕ Sign up/Choose Home Course",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "No Fox equivalent: ports the Crane app's **Choose Home Course** step (`src/screens/auth/choose-home-course-screen.tsx`). The app's list becomes a 1 / 2 / 3-column grid of course cards (`COURSES` + `CourseLogo`), nearest first, with search and a sticky Skip · Continue bar. Continue signs the session in and goes to /welcome.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const Desktop: Story = {
    render: () => (
        <WebScreen path="/welcome/home-course" signedIn={false}>
            <ChooseHomeCoursePage initialSelected={["sagamore-spring", "mount-hood"]} />
        </WebScreen>
    ),
};

export const MobileWeb: Story = {
    name: "Mobile web",
    render: () => (
        <WebScreen path="/welcome/home-course" width="mobile" signedIn={false}>
            <ChooseHomeCoursePage initialSelected={["sagamore-spring"]} />
        </WebScreen>
    ),
};

export const NoResults: Story = {
    name: "No results",
    render: () => (
        <WebScreen path="/welcome/home-course" signedIn={false}>
            <ChooseHomeCoursePage initialQuery="Pebble" />
        </WebScreen>
    ),
};
