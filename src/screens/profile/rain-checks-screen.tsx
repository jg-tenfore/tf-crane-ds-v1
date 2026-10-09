import { CloudRaining01 } from "@untitledui/icons";
import { Screen } from "@/components/device/screen";
import { EmptyState } from "@/components/feedback/empty-state";
import { RAIN_CHECKS, type RainCheck } from "@/data/crane";
import { ProfileNav } from "./profile-shared";
import { RainCheckItem } from "./wallet-cards";

export interface RainChecksScreenProps {
    /** Defaults to the sample checks (IMG_8576). Pass [] for the empty state (IMG_2188). */
    checks?: RainCheck[];
}

/** Rain Checks — remaining balance per check; used-up checks stay listed until they expire. */
export const RainChecksScreen = ({ checks = RAIN_CHECKS }: RainChecksScreenProps) => (
    <Screen nav={<ProfileNav title="Rain Checks" />}>
        {checks.length === 0 ? (
            <EmptyState icon={CloudRaining01} title="No rain checks found" />
        ) : (
            <div className="flex flex-col gap-3 px-gutter pt-4">
                {checks.map((c) => (
                    <RainCheckItem key={c.id} check={c} />
                ))}
            </div>
        )}
    </Screen>
);
