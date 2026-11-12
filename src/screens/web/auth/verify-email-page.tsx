import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Mail01 } from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { CodeField } from "@/components/forms/code-field";
import { useWebRouter } from "@/components/web/web-router";
import { USER } from "@/data/crane";
import { AuthHeading, AuthLayout, AuthLink, authPrimary, formatSeconds, useCountdown, useNextPath, useQuery, withQuery } from "./auth-web-parts";

export interface VerifyEmailPageProps {
    /** Defaults to `?email=`, then the sample user. */
    email?: string;
    initialCode?: string;
    /** Seconds before "Resend code" unlocks. */
    resendAfter?: number;
}

const CODE_LENGTH = 6;

/**
 * Verify Email (/verify-email) — Fox's "Enter verification code" page with the app's
 * behaviour: six digits auto-submit after a short "Verifying…" beat, resend is locked
 * behind a countdown. Then on to /welcome/home-course.
 */
export const VerifyEmailPage = ({ email: emailProp, initialCode = "", resendAfter = 30 }: VerifyEmailPageProps) => {
    const { navigate } = useWebRouter();
    const query = useQuery();
    const next = useNextPath();
    const email = emailProp ?? (query.get("email") || USER.email);
    const [code, setCode] = useState(initialCode);
    const [verifying, setVerifying] = useState(false);
    const [resent, setResent] = useState(false);
    const { left, restart } = useCountdown(resendAfter);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(() => () => clearTimeout(timer.current), []);

    const verify = () => {
        setVerifying(true);
        timer.current = setTimeout(() => navigate(withQuery("/welcome/home-course", { next })), 800);
    };

    const resend = () => {
        setCode("");
        setResent(true);
        restart();
    };

    return (
        <AuthLayout panelEyebrow="Join">
            <AuthHeading
                icon={Mail01}
                title="Check your email"
                subtitle={
                    <>
                        We sent a 6-digit code to <span className="font-semibold break-words text-primary">{email}</span>. Enter it below to confirm your account.
                    </>
                }
            />

            <form
                className="mt-8 flex flex-col gap-6"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (code.length === CODE_LENGTH && !verifying) verify();
                }}
            >
                <CodeField
                    length={CODE_LENGTH}
                    label="6-digit verification code"
                    value={code}
                    onChange={(c) => {
                        setCode(c);
                        setResent(false);
                    }}
                    onComplete={() => !verifying && verify()}
                />
                <Button type="submit" fullWidth isDisabled={code.length < CODE_LENGTH} isLoading={verifying} className={authPrimary}>
                    {verifying ? "Verifying…" : "Verify email"}
                </Button>
            </form>

            <p className="mt-6 flex min-h-6 flex-wrap items-center gap-x-1.5 text-sm text-tertiary" aria-live="polite">
                {left > 0 ? (
                    <>
                        {resent ? "New code sent." : "Didn’t get it?"} Resend in <span className="text-secondary tabular-nums">{formatSeconds(left)}</span>
                    </>
                ) : (
                    <>
                        Didn’t get it? Check spam, or
                        <button type="button" onClick={resend} className="cursor-pointer rounded-md font-semibold text-brand-secondary outline-none hover:underline focus-visible:ring-4 focus-visible:ring-brand-300/60">
                            resend the code
                        </button>
                    </>
                )}
            </p>

            <div className="mt-8 border-t border-secondary pt-6">
                <AuthLink href={withQuery("/sign-up", { next })}>
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Use a different email
                </AuthLink>
            </div>
        </AuthLayout>
    );
};
