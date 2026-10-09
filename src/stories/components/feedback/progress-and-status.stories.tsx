import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusBadge } from "@/components/base/badge";
import { ProgressBar } from "@/components/base/progress-bar";

/** Usage bars and sentence-case status badges used by Punch Cards, Rain Checks, Gift Cards and Memberships. */
const meta: Meta = {
    title: "Components/Feedback/Progress & Status",
    parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj;

export const Progress: Story = {
    render: () => (
        <div className="flex w-[360px] flex-col gap-6 rounded-ios-card bg-primary p-5 shadow-ios-card">
            <ProgressBar label="Green Fees" value={3} max={20} valueLabel="3/20 used" />
            <ProgressBar label="Balance: $0.00 of $91.63" value={91.63} max={91.63} valueLabel="$91.63 used" />
            <ProgressBar label="Balance: $31.85 of $31.85" value={0} max={31.85} valueLabel="$0.00 used" />
            <ProgressBar aria-label="Bar only" value={12} max={20} />
        </div>
    ),
};

export const StatusBadges: Story = {
    name: "Status badges",
    render: () => (
        <div className="flex flex-wrap gap-2 rounded-ios-card bg-primary p-5 shadow-ios-card">
            <StatusBadge tone="success">Active</StatusBadge>
            <StatusBadge tone="success">Available</StatusBadge>
            <StatusBadge tone="gray">Used Up</StatusBadge>
            <StatusBadge tone="error">Expired</StatusBadge>
            <StatusBadge tone="warning">Expiring Soon</StatusBadge>
        </div>
    ),
};
