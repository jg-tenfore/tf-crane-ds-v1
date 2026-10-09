import { Clock } from "@untitledui/icons";
import { GlassPillButton } from "@/components/base/glass-button";
import { Screen } from "@/components/device/screen";
import { EmptyState } from "@/components/feedback/empty-state";
import { ProfileNav } from "./profile-shared";

export interface WaitlistScreenProps {
    onJoin?: () => void;
}

/** Waitlist (IMG_2186) — "Join" in the nav bar, featured empty state centred on screen. */
export const WaitlistScreen = ({ onJoin }: WaitlistScreenProps) => (
    <Screen nav={<ProfileNav title="Waitlist" trailing={<GlassPillButton onPress={onJoin}>Join</GlassPillButton>} />}>
        <div className="flex min-h-full flex-col">
            <EmptyState variant="featured" icon={Clock} title="No Waitlists" description="You haven't joined any waitlists yet." />
        </div>
    </Screen>
);
