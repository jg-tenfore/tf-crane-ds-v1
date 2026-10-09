import { Plus, Users01 } from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { GlassIconButton } from "@/components/base/glass-button";
import { Screen } from "@/components/device/screen";
import { EmptyState } from "@/components/feedback/empty-state";
import { ListRow } from "@/components/lists/list";
import { BUDDIES } from "@/data/crane";
import { ProfileNav, RowCard } from "./profile-shared";

export type GolfBuddy = (typeof BUDDIES)[number];

const initials = (name: string) =>
    name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

export interface GolfBuddiesScreenProps {
    /** Empty by default, matching the reference. Pass BUDDIES for the populated state. */
    buddies?: GolfBuddy[];
    onInvite?: () => void;
}

/** Golf Buddies (IMG_2184) — empty state with "Invite a Buddy", or the saved buddy list. */
export const GolfBuddiesScreen = ({ buddies = [], onInvite }: GolfBuddiesScreenProps) => (
    <Screen nav={<ProfileNav title="Golf Buddies" trailing={<GlassIconButton icon={Plus} aria-label="Invite a buddy" onPress={onInvite} />} />}>
        {buddies.length === 0 ? (
            <EmptyState
                icon={Users01}
                title="No golf buddies yet"
                description="Invite your friends to quickly add them to tee times"
                action={
                    <Button size="md" onPress={onInvite} className="h-[42px] px-5">
                        Invite a Buddy
                    </Button>
                }
                className="px-6"
            />
        ) : (
            <div className="flex flex-col gap-2 pt-4">
                <RowCard>
                    {buddies.map((b) => (
                        <ListRow
                            key={b.id}
                            leading={
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-primary_alt text-ios-subheadline font-semibold text-brand-secondary">
                                    {initials(b.name)}
                                </span>
                            }
                            title={b.name}
                            subtitle={b.email}
                            trailing={<span className="text-ios-subheadline tabular-nums">HCP {b.handicap.toFixed(1)}</span>}
                        />
                    ))}
                </RowCard>
                <p className="px-gutter pt-1 text-center text-ios-footnote text-quaternary">Buddies can be added to your tee times in one tap.</p>
            </div>
        )}
    </Screen>
);
