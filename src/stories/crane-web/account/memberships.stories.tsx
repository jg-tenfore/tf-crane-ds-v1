import type { Meta, StoryObj } from "@storybook/react-vite";
import { MEMBERSHIPS } from "@/data/crane";
import { AccountMembershipsScreen } from "@/screens/web/account";
import { WebScreen } from "../web-story-kit";

const meta: Meta = {
    title: "Crane Web/Profile ∕ Account/Memberships",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Members see the Crane app's membership cards (Gold Punch Membership, and the 30 Day booking window flagged Expiring Soon with a Renew notice) plus a dismissible Fox **Memberships/Ad Banners** upsell. Non-members get Fox **Profile ∕ Account/Memberships · Join (Non-member)**: the Annual plan as hero with an Individual / Family switch, other plans, and a perks dialog. Expired matches Fox **Expired**.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

const path = "/account/memberships";
const expiredOnly = [{ ...MEMBERSHIPS[0], expires: new Date(2026, 8, 1) }];

export const Desktop: Story = { name: "Member", render: () => <WebScreen path={path}><AccountMembershipsScreen /></WebScreen> };
export const NonMember: Story = { name: "Non-member", render: () => <WebScreen path={path}><AccountMembershipsScreen memberships={[]} /></WebScreen> };
export const Expired: Story = { render: () => <WebScreen path={path}><AccountMembershipsScreen memberships={expiredOnly} /></WebScreen> };
export const MobileWeb: Story = { name: "Mobile web", render: () => <WebScreen path={path} width="mobile"><AccountMembershipsScreen /></WebScreen> };
export const MobileNonMember: Story = { name: "Non-member · Mobile web", render: () => <WebScreen path={path} width="mobile"><AccountMembershipsScreen memberships={[]} /></WebScreen> };
