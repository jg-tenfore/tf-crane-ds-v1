import { useState } from "react";
import { Mail01, Plus, Users01, XClose } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { Button } from "@/components/base/button";
import { GlassIconButton } from "@/components/base/glass-button";
import { Section } from "@/components/base/card";
import { Screen } from "@/components/device/screen";
import { AlertDialog } from "@/components/feedback/alert-dialog";
import { EmptyState } from "@/components/feedback/empty-state";
import { useToast } from "@/components/feedback/toast";
import { TextField } from "@/components/forms/text-field";
import { BottomSheet } from "@/components/overlays/bottom-sheet";
import { BUDDIES, BUDDY_REQUESTS, type Buddy } from "@/data/crane";
import { ProfileNav } from "./profile-shared";

export type GolfBuddy = Buddy;

export interface GolfBuddiesScreenProps {
    /** Accepted buddies. Defaults to the sample list (IMG_8581); pass [] with no requests for the empty state (IMG_2184). */
    buddies?: Buddy[];
    /** Invites waiting for a response. */
    requests?: Buddy[];
    /** Open the Invite sheet on mount (stories). */
    defaultInviteOpen?: boolean;
}

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/** One buddy card: name (or just the email if they haven't set a name) and a red remove button. */
const BuddyCard = ({ buddy, pending, onRemove }: { buddy: Buddy; pending?: boolean; onRemove: () => void }) => (
    <li className="flex items-center gap-3 rounded-ios-card bg-primary px-4 py-3 shadow-ios-card ring-1 ring-secondary/60">
        <div className="min-w-0 flex-1">
            <div className="truncate text-ios-headline text-primary">{buddy.name || buddy.email}</div>
            {buddy.name && <div className="truncate text-ios-subheadline text-tertiary">{buddy.email}</div>}
            {pending && <div className="mt-0.5 text-ios-footnote text-quaternary italic">Waiting for response…</div>}
        </div>
        <AriaButton
            aria-label={pending ? `Cancel request to ${buddy.name || buddy.email}` : `Remove ${buddy.name || buddy.email}`}
            onPress={onRemove}
            className="press-scale flex size-[36px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-error-primary text-fg-error-primary outline-none focus-visible:ring-4 focus-visible:ring-error_subtle"
        >
            <XClose className="size-[18px]" aria-hidden="true" />
        </AriaButton>
    </li>
);

/**
 * Golf Buddies — pending invites and accepted buddies (IMG_8581), or the empty state
 * (IMG_2184). "+" opens an invite sheet; removing asks for confirmation first.
 */
export const GolfBuddiesScreen = ({ buddies: initialBuddies = BUDDIES, requests: initialRequests = BUDDY_REQUESTS, defaultInviteOpen = false }: GolfBuddiesScreenProps) => {
    const toast = useToast();
    const [buddies, setBuddies] = useState(initialBuddies);
    const [requests, setRequests] = useState(initialRequests);
    const [removing, setRemoving] = useState<{ buddy: Buddy; pending: boolean } | null>(null);
    const [inviteOpen, setInviteOpen] = useState(defaultInviteOpen);
    const [email, setEmail] = useState("");
    const empty = buddies.length === 0 && requests.length === 0;

    const sendInvite = () => {
        setRequests((r) => [{ id: `r-${Date.now()}`, name: "", email: email.trim() }, ...r]);
        toast.show({ title: `Invite sent to ${email.trim()}`, icon: Mail01 });
        setEmail("");
        setInviteOpen(false);
    };

    return (
        <Screen nav={<ProfileNav title="Golf Buddies" trailing={<GlassIconButton icon={Plus} aria-label="Invite a buddy" onPress={() => setInviteOpen(true)} />} />}>
            {empty ? (
                <EmptyState
                    icon={Users01}
                    title="No golf buddies yet"
                    description="Invite your friends to quickly add them to tee times"
                    action={
                        <Button size="md" onPress={() => setInviteOpen(true)} className="h-[42px] px-5">
                            Invite a Buddy
                        </Button>
                    }
                    className="px-6"
                />
            ) : (
                <div className="flex flex-col gap-6 pt-4">
                    {requests.length > 0 && (
                        <Section title="Pending Requests">
                            <ul className="flex flex-col gap-2.5">
                                {requests.map((b) => (
                                    <BuddyCard key={b.id} buddy={b} pending onRemove={() => setRemoving({ buddy: b, pending: true })} />
                                ))}
                            </ul>
                        </Section>
                    )}
                    {buddies.length > 0 && (
                        <Section title="My Buddies">
                            <ul className="flex flex-col gap-2.5">
                                {buddies.map((b) => (
                                    <BuddyCard key={b.id} buddy={b} onRemove={() => setRemoving({ buddy: b, pending: false })} />
                                ))}
                            </ul>
                        </Section>
                    )}
                </div>
            )}

            <AlertDialog
                isOpen={!!removing}
                onOpenChange={(o) => !o && setRemoving(null)}
                title={removing?.pending ? "Cancel invite?" : "Remove buddy?"}
                message={
                    removing?.pending
                        ? `${removing.buddy.email} won't be able to accept your invite.`
                        : `${removing?.buddy.name || removing?.buddy.email} will no longer be suggested when you add players to a tee time.`
                }
                actions={[
                    { label: "Keep", style: "cancel" },
                    {
                        label: removing?.pending ? "Cancel Invite" : "Remove",
                        style: "destructive",
                        onPress: () => {
                            if (!removing) return;
                            const drop = (list: Buddy[]) => list.filter((b) => b.id !== removing.buddy.id);
                            if (removing.pending) setRequests(drop);
                            else setBuddies(drop);
                        },
                    },
                ]}
            />

            <BottomSheet
                isOpen={inviteOpen}
                onOpenChange={setInviteOpen}
                title="Invite a Buddy"
                detent="medium"
                footer={
                    <Button fullWidth isDisabled={!isEmail(email)} onPress={sendInvite}>
                        Send Invite
                    </Button>
                }
            >
                <div className="flex flex-col gap-3 px-5 pt-4">
                    <p className="text-ios-subheadline text-tertiary">They'll get an email to join Crane. Once they accept, you can add them to tee times in one tap.</p>
                    <TextField label="Email" type="email" icon={Mail01} placeholder="friend@example.com" value={email} onChange={setEmail} autoFocus />
                </div>
            </BottomSheet>
        </Screen>
    );
};
