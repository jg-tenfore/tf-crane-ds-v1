import { Gift01 } from "@untitledui/icons";
import { Screen } from "@/components/device/screen";
import { EmptyState } from "@/components/feedback/empty-state";
import { GIFT_CARDS, type GiftCard } from "@/data/crane";
import { ProfileNav } from "./profile-shared";
import { GiftCardItem } from "./wallet-cards";

export interface GiftCardsScreenProps {
    /** Defaults to the sample cards (IMG_8577). Pass [] for the empty state (IMG_2189). */
    cards?: GiftCard[];
}

/** Gift Cards — balance, code and spend categories; expired cards are dimmed. */
export const GiftCardsScreen = ({ cards = GIFT_CARDS }: GiftCardsScreenProps) => (
    <Screen nav={<ProfileNav title="Gift Cards" />}>
        {cards.length === 0 ? (
            <EmptyState icon={Gift01} title="No gift cards found" />
        ) : (
            <div className="flex flex-col gap-3 px-gutter pt-4">
                {cards.map((c) => (
                    <GiftCardItem key={c.id} card={c} />
                ))}
            </div>
        )}
    </Screen>
);
