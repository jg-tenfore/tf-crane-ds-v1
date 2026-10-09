import { Ticket01 } from "@untitledui/icons";
import { Screen } from "@/components/device/screen";
import { EmptyState } from "@/components/feedback/empty-state";
import { PUNCH_CARDS, type PunchCard } from "@/data/crane";
import { ProfileNav } from "./profile-shared";
import { PunchCardItem } from "./wallet-cards";

export interface PunchCardsScreenProps {
    /** Defaults to the sample cards (IMG_8575). Pass [] for the empty state (IMG_2187). */
    cards?: PunchCard[];
}

/** Punch Cards — each card with a usage bar per punchable product. */
export const PunchCardsScreen = ({ cards = PUNCH_CARDS }: PunchCardsScreenProps) => (
    <Screen nav={<ProfileNav title="Punch Cards" />}>
        {cards.length === 0 ? (
            <EmptyState icon={Ticket01} title="No punch cards found" />
        ) : (
            <div className="flex flex-col gap-3 px-gutter pt-4">
                {cards.map((c) => (
                    <PunchCardItem key={c.id} card={c} />
                ))}
            </div>
        )}
    </Screen>
);
