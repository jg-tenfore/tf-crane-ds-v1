import type { Meta, StoryObj } from "@storybook/react-vite";
import {
    Award02,
    Bell01,
    CreditCard02,
    FileShield02,
    Gift01,
    HelpCircle,
    MessageChatCircle,
    Ticket01,
    Trophy01,
    User01,
    Users01,
} from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { CountBadge, Pill, Tag } from "@/components/base/badge";
import { Switch } from "@/components/base/switch";
import { Divider } from "@/components/base/card";
import { Screen } from "@/components/device/screen";
import { KeyValueRow, ListGroup, ListRow } from "@/components/lists/list";
import { NavigationBar } from "@/components/navigation/navigation-bar";
import { APP_VERSION, USER } from "@/data/crane";

/**
 * List — iOS inset-grouped lists. **ListGroup** is the white rounded card (with optional
 * header / footer captions); **ListRow** is one row (icon tile, title + subtitle, title
 * accessory, trailing value / badge / switch, chevron when pressable); **KeyValueRow**
 * is a label/value pair for details tables and order summaries.
 */
const meta: Meta<typeof ListRow> = {
    title: "Components/Lists & Cards/List",
    component: ListRow,
    parameters: { phone: true },
};
export default meta;
type Story = StoryObj<typeof ListRow>;

const noop = () => {};

/** Modeled on Crane's Profile tab. */
export const Profile: Story = {
    render: () => (
        <Screen nav={<NavigationBar title="Profile" />}>
            <div className="flex flex-col items-center gap-1 px-gutter pt-4 pb-6">
                <span className="text-ios-title1 text-primary">
                    {USER.firstName} {USER.lastName}
                </span>
                <Pill tone="brand" icon={Trophy01}>
                    {USER.rewardsPoints}
                </Pill>
            </div>
            <div className="space-y-6">
                <ListGroup header="Account">
                    <ListRow icon={User01} title="Edit Profile" subtitle={USER.email} onPress={noop} />
                    <ListRow icon={CreditCard02} title="Payment Methods" trailing="Visa •• 2521" onPress={noop} />
                    <ListRow icon={Users01} title="Golf Buddies" trailing={<CountBadge count={1} />} onPress={noop} />
                    <ListRow icon={Award02} title="Memberships" titleAccessory={<Tag tone="brand" variant="soft">New</Tag>} onPress={noop} />
                    <ListRow icon={Ticket01} title="Punch Cards" onPress={noop} />
                    <ListRow icon={Gift01} title="Gift Cards" onPress={noop} />
                </ListGroup>
                <ListGroup header="Preferences" footer="We'll remind you the day before every tee time.">
                    <ListRow icon={Bell01} title="Tee Time Reminders" trailing={<Switch aria-label="Tee time reminders" defaultSelected />} />
                </ListGroup>
                <ListGroup header="Support">
                    <ListRow icon={HelpCircle} title="Help Center" onPress={noop} />
                    <ListRow icon={MessageChatCircle} title="Community" onPress={noop} />
                    <ListRow icon={FileShield02} title="Privacy Policy" onPress={noop} />
                </ListGroup>
                <div className="flex flex-col items-center gap-1 pb-4">
                    <Button color="plain-destructive">Sign Out</Button>
                    <span className="text-ios-footnote text-quaternary">{APP_VERSION}</span>
                </div>
            </div>
        </Screen>
    ),
};

/** Each ListRow option on its own. */
export const RowVariants: Story = {
    name: "Row variants",
    render: () => (
        <Screen nav={<NavigationBar backLabel="Components" title="ListRow" />}>
            <div className="space-y-6 pt-4">
                <ListGroup header="Pressable · icon · chevron">
                    <ListRow icon={User01} title="Edit Profile" onPress={noop} />
                    <ListRow icon={User01} title="With subtitle" subtitle="justin.girard@tenfore.golf" onPress={noop} />
                </ListGroup>
                <ListGroup header="Trailing">
                    <ListRow icon={CreditCard02} title="Value text" trailing="Visa •• 2521" onPress={noop} />
                    <ListRow icon={Users01} title="Count badge" trailing={<CountBadge count={9} />} onPress={noop} />
                    <ListRow icon={Bell01} title="Switch" trailing={<Switch aria-label="Switch example" />} />
                </ListGroup>
                <ListGroup header="Title accessory">
                    <ListRow icon={Award02} title="Tag" titleAccessory={<Tag tone="error">Full</Tag>} onPress={noop} />
                    <ListRow icon={Trophy01} title="Pill" titleAccessory={<Pill tone="brand" icon={Trophy01}>0</Pill>} onPress={noop} />
                </ListGroup>
                <ListGroup header="Not pressable" footer="No onPress → no chevron and no press highlight.">
                    <ListRow icon={Ticket01} title="Static row" subtitle="Informational only" />
                    <ListRow title="No icon" subtitle="Text column starts at the edge" />
                    <ListRow icon={Gift01} title="Disabled" onPress={noop} isDisabled />
                </ListGroup>
            </div>
        </Screen>
    ),
};

/** KeyValueRow tones: default, emphasis (totals), brand (balances). */
export const KeyValueRows: Story = {
    name: "Key / value rows",
    render: () => (
        <Screen nav={<NavigationBar backLabel="Bookings" title="Order #4243305" />}>
            <div className="space-y-6 pt-4">
                <ListGroup header="Course Details">
                    <div className="px-4">
                        <KeyValueRow label="Course" value="Sagamore Hampton" />
                        <Divider />
                        <KeyValueRow label="Date" value="Sun, Oct 11, 2026" />
                        <Divider />
                        <KeyValueRow label="Tee Time" value="9:03 AM" />
                        <Divider />
                        <KeyValueRow label="Holes" value="18" />
                    </div>
                </ListGroup>
                <ListGroup header="Order Summary">
                    <div className="px-4">
                        <KeyValueRow label="Weekday Non Resident ×2" value="$68.00" />
                        <KeyValueRow label="Walking ×2" value="$0.00" />
                        <Divider />
                        <KeyValueRow label="Total" value="$68.00" tone="emphasis" />
                    </div>
                </ListGroup>
                <ListGroup header="Balance">
                    <div className="px-4">
                        <KeyValueRow label="Gift card balance" value="$125.00" tone="brand" />
                    </div>
                </ListGroup>
            </div>
        </Screen>
    ),
};
