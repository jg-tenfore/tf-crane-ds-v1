import { useState } from "react";
import { ArrowLeft, Check, Key01, Mail01 } from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { TextField } from "@/components/forms/text-field";
import { useWebRouter } from "@/components/web/web-router";
import { AuthHeading, AuthLayout, AuthLink, authPrimary, isEmail, useFakeRequest, useNextPath, useQuery, withQuery } from "./auth-web-parts";

export interface ForgotPasswordPageProps {
    /** Defaults to `?email=` (carried over from Sign in). */
    initialEmail?: string;
    /** Open on the "Check your inbox" confirmation. */
    initialSent?: boolean;
}

/**
 * Forgot Password (/forgot-password) — Fox's Forgot password → Check your email pair on
 * one route: request a reset link, then the same card flips to a confirmation.
 */
export const ForgotPasswordPage = ({ initialEmail, initialSent = false }: ForgotPasswordPageProps) => {
    const { navigate } = useWebRouter();
    const query = useQuery();
    const next = useNextPath();
    const [email, setEmail] = useState(initialEmail ?? query.get("email") ?? "");
    const [sent, setSent] = useState(initialSent);
    const send = useFakeRequest(800);
    const resend = useFakeRequest(800);
    const signInHref = withQuery("/sign-in", { next });

    if (sent) {
        return (
            <AuthLayout>
                <AuthHeading
                    icon={Check}
                    tone="success"
                    title="Check your inbox"
                    subtitle={
                        <>
                            We sent a password reset link to <span className="font-semibold break-words text-primary">{email || "your email"}</span>. The link expires in 1 hour.
                        </>
                    }
                />
                <div className="mt-8 flex flex-col gap-3">
                    <Button fullWidth onPress={() => navigate(signInHref)} className={authPrimary}>
                        Back to sign in
                    </Button>
                    <Button color="outline" fullWidth isLoading={resend.isLoading} onPress={() => resend.run(() => undefined)} className={authPrimary}>
                        Resend link
                    </Button>
                </div>
                <p className="mt-6 text-sm text-tertiary">
                    Wrong address?{" "}
                    <button type="button" onClick={() => setSent(false)} className="cursor-pointer rounded-md font-semibold text-brand-secondary outline-none hover:underline focus-visible:ring-4 focus-visible:ring-brand-300/60">
                        Use a different email
                    </button>
                </p>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <AuthHeading icon={Key01} title="Forgot password?" subtitle="No worries. Enter the email you use for Crane and we’ll send you a link to reset it." />
            <form
                className="mt-8 flex flex-col gap-5"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (isEmail(email)) send.run(() => setSent(true));
                }}
            >
                <TextField label="Email" type="email" autoComplete="email" placeholder="you@example.com" icon={Mail01} value={email} onChange={setEmail} />
                <Button type="submit" fullWidth isDisabled={!isEmail(email)} isLoading={send.isLoading} className={authPrimary}>
                    {send.isLoading ? "Sending…" : "Send reset link"}
                </Button>
            </form>
            <div className="mt-8 border-t border-secondary pt-6">
                <AuthLink href={signInHref}>
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Back to log in
                </AuthLink>
            </div>
        </AuthLayout>
    );
};
