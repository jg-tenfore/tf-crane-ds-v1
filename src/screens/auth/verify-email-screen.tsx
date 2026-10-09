import { useEffect, useRef, useState } from "react";
import { Mail01 } from "@untitledui/icons";
import { Screen } from "@/components/device/screen";
import { Button } from "@/components/base/button";
import { IconTile } from "@/components/base/card";
import { NavigationBar } from "@/components/navigation/navigation-bar";
import { CodeField } from "@/components/forms/code-field";
import { useStack } from "@/components/prototype/stack-navigator";
import { USER } from "@/data/crane";
import { AuthFooter, formatSeconds, useCountdown } from "./auth-parts";

export interface VerifyEmailScreenProps {
    email?: string;
    initialCode?: string;
    /** Seconds before "Resend code" unlocks. */
    resendAfter?: number;
    /** Called once all six digits are in. Defaults to replacing this screen with "home-course". */
    onComplete?: (code: string) => void;
}

/**
 * Verify Email — six-digit code entry. Completing the code auto-advances after a short
 * "Verifying…" beat; resend is locked behind a countdown like the native app.
 */
export const VerifyEmailScreen = ({ email = USER.email, initialCode = "", resendAfter = 30, onComplete }: VerifyEmailScreenProps) => {
    const { pop, replace } = useStack();
    const [code, setCode] = useState(initialCode);
    const [verifying, setVerifying] = useState(false);
    const [resent, setResent] = useState(false);
    const { left, restart } = useCountdown(resendAfter);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(() => () => clearTimeout(timer.current), []);

    const complete = (c: string) => {
        setVerifying(true);
        timer.current = setTimeout(() => {
            setVerifying(false);
            if (onComplete) onComplete(c);
            else replace("home-course");
        }, 800);
    };

    const resend = () => {
        setCode("");
        setResent(true);
        restart();
    };

    return (
        <Screen
            nav={<NavigationBar backIconOnly onBack={pop} surface="transparent" divider={false} />}
            footer={
                <AuthFooter>
                    <Button color="tinted" fullWidth iconLeading={Mail01}>
                        Open Mail
                    </Button>
                </AuthFooter>
            }
        >
            <div className="flex flex-col items-center px-gutter pt-6 text-center">
                <IconTile icon={Mail01} size="xl" shape="circle" />
                <h1 className="mt-5 text-ios-title1 text-primary">Check your email</h1>
                <p className="mt-2 max-w-[320px] text-ios-body text-tertiary">
                    We sent a 6-digit code to <span className="font-semibold whitespace-nowrap text-primary">{email}</span>
                </p>
            </div>

            <div className="mt-8 px-gutter">
                <CodeField
                    label="6-digit verification code"
                    value={code}
                    onChange={(c) => {
                        setCode(c);
                        setResent(false);
                    }}
                    onComplete={complete}
                />

                <div className="mt-5 flex min-h-[34px] items-center justify-center" aria-live="polite">
                    {verifying ? (
                        <span className="flex items-center gap-2 text-ios-subheadline text-tertiary">
                            <svg className="size-4 animate-spin text-fg-brand-primary" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                            Verifying…
                        </span>
                    ) : left > 0 ? (
                        <span className="text-ios-subheadline text-tertiary">
                            {resent ? "New code sent. " : "Didn’t get it? "}
                            Resend in <span className="text-secondary tabular-nums">{formatSeconds(left)}</span>
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-ios-subheadline text-tertiary">
                            Didn’t get it?
                            <Button color="plain" size="sm" onPress={resend}>
                                Resend code
                            </Button>
                        </span>
                    )}
                </div>
            </div>
        </Screen>
    );
};
