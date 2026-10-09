import { Award03 } from "@untitledui/icons";
import { Screen } from "@/components/device/screen";
import { EmptyState } from "@/components/feedback/empty-state";
import { MEMBERSHIPS, type Membership } from "@/data/crane";
import { ProfileNav } from "./profile-shared";
import { MembershipItem } from "./wallet-cards";

export interface MembershipsScreenProps {
    /** Defaults to the sample memberships (IMG_8578). Pass [] for the empty state (IMG_2185). */
    memberships?: Membership[];
}

/** Memberships — active memberships with ID and expiry; flags ones ending within 30 days. */
export const MembershipsScreen = ({ memberships = MEMBERSHIPS }: MembershipsScreenProps) => (
    <Screen nav={<ProfileNav title="Memberships" />}>
        {memberships.length === 0 ? (
            <EmptyState icon={Award03} title="No memberships found" />
        ) : (
            <div className="flex flex-col gap-3 px-gutter pt-4">
                {memberships.map((m) => (
                    <MembershipItem key={m.id} membership={m} />
                ))}
            </div>
        )}
    </Screen>
);
