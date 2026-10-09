import { Award03 } from "@untitledui/icons";
import { Screen } from "@/components/device/screen";
import { EmptyState } from "@/components/feedback/empty-state";
import { ProfileNav } from "./profile-shared";

/** Memberships (IMG_2185) — empty state. */
export const MembershipsScreen = () => (
    <Screen nav={<ProfileNav title="Memberships" />}>
        <EmptyState icon={Award03} title="No memberships found" />
    </Screen>
);
