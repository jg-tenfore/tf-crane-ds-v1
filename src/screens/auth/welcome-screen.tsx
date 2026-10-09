import { Screen } from "@/components/device/screen";
import { Button } from "@/components/base/button";
import { CraneLockup, TfLogo } from "@/components/foundations/logos";
import { useStack } from "@/components/prototype/stack-navigator";
import { SocialButtons } from "./auth-parts";

export interface WelcomeScreenProps {
    /** Apple / Google sign-in. Defaults to skipping straight to the signed-in confirmation. */
    onSocial?: (provider: "apple" | "google") => void;
}

/**
 * Welcome — the first screen of a fresh install. App icon lockup and value prop
 * up top, every way in stacked at the bottom within thumb reach.
 */
export const WelcomeScreen = ({ onSocial }: WelcomeScreenProps) => {
    const { push } = useStack();
    const social = (provider: "apple" | "google") => (onSocial ? onSocial(provider) : push("signed-in", { mode: "sign-in" }));

    return (
        <Screen background="plain">
            {/* Soft brand wash behind the hero; fades to the plain background. */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-linear-to-b from-bg-brand-primary to-transparent dark:opacity-50" />

            <div className="relative flex min-h-full flex-col px-gutter">
                <div className="flex flex-1 flex-col items-center justify-center pb-6 text-center">
                    <CraneLockup size={96} />
                    <h1 className="mt-9 max-w-[320px] text-ios-title1 text-primary">Book tee times at your favorite courses</h1>
                    <p className="mt-3 max-w-[310px] text-ios-body text-tertiary">Reserve, pay and check in at TenFore courses, all from your iPhone.</p>
                </div>

                <div className="flex flex-col gap-3">
                    <SocialButtons onApple={() => social("apple")} onGoogle={() => social("google")} />
                    <Button color="filled" fullWidth onPress={() => push("sign-up")}>
                        Sign up with email
                    </Button>
                    <Button color="plain" size="md" fullWidth onPress={() => push("sign-in")}>
                        I already have an account
                    </Button>
                </div>

                <div className="mt-5 flex items-center justify-center gap-2 pb-2">
                    <span className="text-ios-caption1 text-quaternary">Powered by</span>
                    <TfLogo height={16} className="dark:hidden" />
                    <TfLogo height={16} tone="white" className="hidden dark:block" />
                </div>
            </div>
        </Screen>
    );
};
