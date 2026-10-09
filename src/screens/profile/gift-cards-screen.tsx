import { Gift01 } from "@untitledui/icons";
import { Screen } from "@/components/device/screen";
import { EmptyState } from "@/components/feedback/empty-state";
import { ProfileNav } from "./profile-shared";

/** Gift Cards (IMG_2189) — empty state. */
export const GiftCardsScreen = () => (
    <Screen nav={<ProfileNav title="Gift Cards" />}>
        <EmptyState icon={Gift01} title="No gift cards found" />
    </Screen>
);
