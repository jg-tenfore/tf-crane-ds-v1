import { Ticket01 } from "@untitledui/icons";
import { Screen } from "@/components/device/screen";
import { EmptyState } from "@/components/feedback/empty-state";
import { ProfileNav } from "./profile-shared";

/** Punch Cards (IMG_2187) — empty state. */
export const PunchCardsScreen = () => (
    <Screen nav={<ProfileNav title="Punch Cards" />}>
        <EmptyState icon={Ticket01} title="No punch cards found" />
    </Screen>
);
