import { Check, Flag01 } from "@untitledui/icons";
import { Screen } from "@/components/device/screen";
import { Button } from "@/components/base/button";
import { useStack } from "@/components/prototype/stack-navigator";
import { COURSES, USER } from "@/data/crane";
import { AuthFooter } from "./auth-parts";

export interface SignedInScreenProps {
    /** `sign-up` greets a new member and lists their chosen courses. */
    mode?: "sign-in" | "sign-up";
    courses?: string[];
    /** "Go to tee times". Defaults to popping back to the start of the stack (restarts the prototype flow). */
    onDone?: () => void;
}

/** Signed In — the confirmation at the end of either path through the auth flow. */
export const SignedInScreen = ({ mode = "sign-in", courses = [], onDone }: SignedInScreenProps) => {
    const { popToRoot } = useStack();
    const chosen = COURSES.filter((c) => courses.includes(c.id));

    return (
        <Screen
            background="plain"
            footer={
                <AuthFooter surface="plain">
                    <Button color="filled" fullWidth onPress={onDone ?? popToRoot}>
                        Go to Tee Times
                    </Button>
                </AuthFooter>
            }
        >
            <div className="flex min-h-full flex-col items-center justify-center px-gutter pb-16 text-center">
                <span className="flex size-24 items-center justify-center rounded-full bg-brand-solid text-white shadow-ios-float">
                    <Check className="size-12" strokeWidth={2.6} aria-hidden="true" />
                </span>
                <h1 className="mt-7 text-ios-large-title text-primary">You’re all set</h1>
                <p className="mt-2 max-w-[320px] text-ios-body text-tertiary">
                    {mode === "sign-up"
                        ? `Welcome to Crane, ${USER.firstName}. Let’s find you a tee time.`
                        : `Welcome back, ${USER.firstName}. Your bookings and courses are ready.`}
                </p>

                {chosen.length > 0 && (
                    <div className="mt-8 w-full max-w-[340px] text-left">
                        <div className="mb-1.5 px-1 text-ios-footnote text-tertiary uppercase">Your courses</div>
                        <ul className="divide-y divide-border-secondary overflow-hidden rounded-ios-card bg-secondary">
                            {chosen.map((c) => (
                                <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                                    <Flag01 className="size-5 shrink-0 text-fg-brand-primary" aria-hidden="true" />
                                    <span className="min-w-0 flex-1 truncate text-ios-body text-primary">{c.name}</span>
                                    <span className="text-ios-subheadline text-tertiary">{c.state}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </Screen>
    );
};
