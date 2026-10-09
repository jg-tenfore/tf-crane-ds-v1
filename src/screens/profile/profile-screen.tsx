import { useState } from "react";
import {
    Award03,
    Clock,
    CloudRaining01,
    CreditCard02,
    Gift01,
    LogOut01,
    MessageChatCircle,
    Palette,
    QrCode01,
    Ticket01,
    Trash01,
    Trophy01,
    User01,
    Users01,
    Wallet02,
} from "@untitledui/icons";
import { CountBadge, Pill } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { Screen } from "@/components/device/screen";
import { AlertDialog } from "@/components/feedback/alert-dialog";
import { NavigationBar } from "@/components/navigation/navigation-bar";
import { useStack } from "@/components/prototype/stack-navigator";
import { APP_VERSION, PAYMENT_CARDS, USER, currency } from "@/data/crane";
import { ProfileRow, RowCard } from "./profile-shared";

/** Apple logo for the "Add to Wallet" button (not in @untitledui/icons). */
const AppleLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 17 20" fill="currentColor" className={className} aria-hidden="true">
        <path d="M14.06 10.63c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.83.86-3.59 2.18-1.53 2.66-.39 6.6 1.1 8.75.73 1.05 1.6 2.24 2.73 2.2 1.1-.05 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.4 1.2-2.46-.03-.01-2.3-.88-2.33-3.5ZM11.88 4.16c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.54 1.31-.56.64-1.05 1.67-.92 2.66.97.08 1.96-.49 2.56-1.21Z" />
    </svg>
);

const WalletPassCard = ({ onAdd }: { onAdd?: () => void }) => (
    <div className="px-gutter">
        <div className="relative overflow-hidden rounded-ios-card bg-brand-solid shadow-ios-card">
            {/* Darken toward the left so the pass reads like the native gradient card. */}
            <div aria-hidden="true" className="absolute inset-0 bg-linear-to-r from-black/35 via-black/15 to-white/5" />
            <div className="relative flex min-h-[88px] items-center gap-3 px-4 py-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-white/15 text-white">
                    <Wallet02 className="size-6" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                    <div className="text-ios-headline text-white">Wallet Pass</div>
                    <div className="text-ios-subheadline text-white/80">Quick check-in at kiosk</div>
                </div>
                <Button size="sm" color="black" iconLeading={AppleLogo} onPress={onAdd} className="h-[36px] gap-1.5 rounded-[8px] px-3 text-ios-body font-semibold">
                    Add to Wallet
                </Button>
            </div>
        </div>
    </div>
);

export interface ProfileScreenProps {
    /** Unread Community posts — red badge on the Community row. */
    communityBadge?: number;
    onSignOut?: () => void;
    /** Called after the user confirms Delete in the alert. */
    onDeleteAccount?: () => void;
    onAddToWallet?: () => void;
    /** Open with the Delete Account alert showing (stories). */
    defaultDeleteOpen?: boolean;
}

/**
 * Profile — the root of the Profile tab (IMG_2170 / 2171). Wallet pass, Community,
 * kiosk sign-in, the account list, Appearance, Sign Out and Delete Account.
 */
export const ProfileScreen = ({ communityBadge = 1, onSignOut, onDeleteAccount, onAddToWallet, defaultDeleteOpen = false }: ProfileScreenProps) => {
    const { push } = useStack();
    const [deleteOpen, setDeleteOpen] = useState(defaultDeleteOpen);
    const cards = PAYMENT_CARDS.length;

    return (
        <Screen nav={<NavigationBar title="Profile" />}>
            <p className="pt-3.5 pb-3 text-center text-ios-footnote text-quaternary">
                Crane&nbsp;&nbsp;{APP_VERSION}
            </p>

            <div className="flex flex-col gap-4">
                <WalletPassCard onAdd={onAddToWallet} />

                <RowCard>
                    <ProfileRow
                        icon={MessageChatCircle}
                        title="Community"
                        subtitle="Ideas & feedback"
                        trailing={<CountBadge count={communityBadge} />}
                        onPress={() => push("community")}
                    />
                </RowCard>

                <RowCard>
                    <ProfileRow icon={QrCode01} title="Sign in to Kiosk" subtitle="Show a QR at the course's kiosk" onPress={() => push("kiosk-sign-in")} />
                </RowCard>

                <RowCard>
                    <ProfileRow
                        icon={User01}
                        title={`${USER.firstName} ${USER.lastName}`}
                        titleAccessory={
                            <Pill tone="brand" icon={Trophy01} className="h-[18px] gap-0.5 px-1.5 text-ios-caption1 font-semibold [&>svg]:size-3">
                                {USER.rewardsPoints}
                            </Pill>
                        }
                        subtitle={USER.email}
                        onPress={() => push("edit-profile")}
                    />
                    <ProfileRow icon={Wallet02} title="Account Balance" subtitle={currency(0)} onPress={() => push("account-balance")} />
                    <ProfileRow icon={CreditCard02} title="Payment Methods" subtitle={`${cards} card${cards === 1 ? "" : "s"}`} onPress={() => push("payment-methods")} />
                    <ProfileRow icon={Users01} title="Golf Buddies" subtitle="0 buddies" onPress={() => push("golf-buddies")} />
                    <ProfileRow icon={Award03} title="Memberships" subtitle="0 active memberships" onPress={() => push("memberships")} />
                    <ProfileRow icon={Clock} title="Waitlist" subtitle="0 active waitlists" onPress={() => push("waitlist")} />
                    <ProfileRow icon={Ticket01} title="Punch Cards" subtitle="0 active cards" onPress={() => push("punch-cards")} />
                    <ProfileRow icon={CloudRaining01} title="Rain Checks" subtitle="0 active rain checks" onPress={() => push("rain-checks")} />
                    <ProfileRow icon={Gift01} title="Gift Cards" subtitle="0 cards" onPress={() => push("gift-cards")} />
                </RowCard>

                <RowCard>
                    <ProfileRow icon={Palette} title="Appearance" subtitle="Light, dark, or follow system" onPress={() => push("appearance")} />
                </RowCard>

                <div className="flex flex-col items-center gap-3 px-gutter pb-2">
                    <Button fullWidth size="lg" color="filled" iconLeading={LogOut01} onPress={onSignOut}>
                        Sign Out
                    </Button>
                    <Button size="md" color="plain-destructive" iconLeading={Trash01} onPress={() => setDeleteOpen(true)}>
                        Delete Account
                    </Button>
                </div>
            </div>

            <AlertDialog
                isOpen={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete Account"
                message="Are you sure you want to delete your account? This action is irreversible and will result in the permanent loss of all your data."
                actions={[
                    { label: "Cancel", style: "cancel" },
                    { label: "Delete", style: "destructive", onPress: onDeleteAccount },
                ]}
            />
        </Screen>
    );
};
