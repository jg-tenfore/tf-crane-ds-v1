import { useState } from "react";
import { Mail01, UserPlus01, Users01 } from "@untitledui/icons";
import { TextField } from "@/components/forms/text-field";
import { WebDialog } from "@/components/web/web-dialog";
import { BUDDIES, BUDDY_REQUESTS, type Buddy } from "@/data/crane";
import { AccountLayout } from "./account-layout";
import { AccountPanel, AccountTitle, EmptyBlock, Flash, Initials, Pill, TextAction, WebButton, useFlash } from "./account-ui";

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const BuddyRow = ({ buddy, pending, onRemove }: { buddy: Buddy; pending?: boolean; onRemove: () => void }) => (
    <li className="flex items-center gap-4 border-t border-secondary py-4 first:border-t-0">
        <Initials name={buddy.name} email={buddy.email} />
        <div className="min-w-0 flex-1">
            <p className="truncate text-md font-semibold text-primary">
                {buddy.name || buddy.email}
                {buddy.handicap != null && <span className="font-normal text-tertiary"> · {buddy.handicap} hcp</span>}
            </p>
            {buddy.name ? <p className="truncate text-sm text-tertiary">{buddy.email}</p> : <p className="text-sm text-quaternary">Hasn't added a name yet</p>}
            {pending && <p className="text-sm text-quaternary italic @tablet:hidden">Waiting for response…</p>}
        </div>
        {pending && (
            <span className="hidden @tablet:block">
                <Pill tone="warning">Waiting for response</Pill>
            </span>
        )}
        <TextAction onPress={onRemove} tone={pending ? "gray" : "error"}>
            {pending ? "Cancel" : "Remove"}
        </TextAction>
    </li>
);

export interface AccountBuddiesScreenProps {
    buddies?: Buddy[];
    /** Invites you've sent that haven't been accepted. */
    requests?: Buddy[];
    defaultInviteOpen?: boolean;
}

/**
 * Golf Buddies — ports Fox "Profile ∕ Account/Golf Buddies" with the app's data: pending
 * invites, accepted buddies, an invite dialog and a remove confirmation.
 */
export const AccountBuddiesScreen = ({ buddies: initialBuddies = BUDDIES, requests: initialRequests = BUDDY_REQUESTS, defaultInviteOpen = false }: AccountBuddiesScreenProps) => {
    const flash = useFlash();
    const [buddies, setBuddies] = useState(initialBuddies);
    const [requests, setRequests] = useState(initialRequests);
    const [inviteOpen, setInviteOpen] = useState(defaultInviteOpen);
    const [email, setEmail] = useState("");
    const [removing, setRemoving] = useState<{ buddy: Buddy; pending: boolean } | null>(null);
    const empty = buddies.length === 0 && requests.length === 0;

    const invite = () => {
        const e = email.trim();
        setRequests((r) => [{ id: `r-${Date.now()}`, name: "", email: e }, ...r]);
        flash.show(`Invite sent to ${e}`);
        setEmail("");
        setInviteOpen(false);
    };
    const confirmRemove = () => {
        if (!removing) return;
        const drop = (l: Buddy[]) => l.filter((b) => b.id !== removing.buddy.id);
        if (removing.pending) setRequests(drop);
        else setBuddies(drop);
        flash.show(removing.pending ? `Invite to ${removing.buddy.email} cancelled` : `${removing.buddy.name || removing.buddy.email} removed`);
        setRemoving(null);
    };
    const who = removing ? removing.buddy.name || removing.buddy.email : "";

    return (
        <AccountLayout active="buddies">
            <div className="flex flex-col gap-8">
                <AccountTitle
                    title="Golf Buddies"
                    subtitle="Add the people you play with, then add them to a tee time in one click."
                    actions={
                        !empty && (
                            <WebButton iconLeading={UserPlus01} onPress={() => setInviteOpen(true)}>
                                Invite a buddy
                            </WebButton>
                        )
                    }
                />
                <Flash message={flash.message} />

                {empty ? (
                    <AccountPanel>
                        <EmptyBlock
                            icon={Users01}
                            title="No golf buddies yet"
                            description="Invite your friends to quickly add them to tee times."
                            action={
                                <WebButton iconLeading={UserPlus01} onPress={() => setInviteOpen(true)}>
                                    Invite a buddy
                                </WebButton>
                            }
                        />
                    </AccountPanel>
                ) : (
                    <>
                        {requests.length > 0 && (
                            <AccountPanel title="Pending invites" description="They'll show up under My buddies once they accept.">
                                <ul>
                                    {requests.map((b) => (
                                        <BuddyRow key={b.id} buddy={b} pending onRemove={() => setRemoving({ buddy: b, pending: true })} />
                                    ))}
                                </ul>
                            </AccountPanel>
                        )}
                        <AccountPanel title={`My buddies · ${buddies.length}`}>
                            {buddies.length ? (
                                <ul>
                                    {buddies.map((b) => (
                                        <BuddyRow key={b.id} buddy={b} onRemove={() => setRemoving({ buddy: b, pending: false })} />
                                    ))}
                                </ul>
                            ) : (
                                <p className="py-6 text-md text-tertiary">No one has accepted yet.</p>
                            )}
                        </AccountPanel>
                    </>
                )}
            </div>

            <WebDialog
                isOpen={inviteOpen}
                onOpenChange={setInviteOpen}
                size="sm"
                title="Invite a buddy"
                description="They'll get an email to join Crane. Once they accept, you can add them to tee times in one click."
                footer={
                    <>
                        <WebButton color="outline" onPress={() => setInviteOpen(false)}>
                            Cancel
                        </WebButton>
                        <WebButton isDisabled={!isEmail(email)} onPress={invite}>
                            Send invite
                        </WebButton>
                    </>
                }
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (isEmail(email)) invite();
                    }}
                >
                    <TextField label="Email" type="email" icon={Mail01} placeholder="friend@tenfore.golf" value={email} onChange={setEmail} autoFocus />
                </form>
            </WebDialog>

            <WebDialog
                isOpen={!!removing}
                onOpenChange={(o) => !o && setRemoving(null)}
                size="sm"
                title={removing?.pending ? "Cancel invite?" : `Remove ${who}?`}
                description={removing?.pending ? `${who} won't be able to accept your invite.` : `${who} will no longer be suggested when you add players to a tee time.`}
                footer={
                    <>
                        <WebButton color="outline" onPress={() => setRemoving(null)}>
                            Keep
                        </WebButton>
                        <WebButton color="destructive" onPress={confirmRemove}>
                            {removing?.pending ? "Cancel invite" : "Remove"}
                        </WebButton>
                    </>
                }
            />
        </AccountLayout>
    );
};
