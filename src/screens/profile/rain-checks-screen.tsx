import { CloudRaining01 } from "@untitledui/icons";
import { Screen } from "@/components/device/screen";
import { EmptyState } from "@/components/feedback/empty-state";
import { ProfileNav } from "./profile-shared";

/** Rain Checks (IMG_2188) — empty state. */
export const RainChecksScreen = () => (
    <Screen nav={<ProfileNav title="Rain Checks" />}>
        <EmptyState icon={CloudRaining01} title="No rain checks found" />
    </Screen>
);
