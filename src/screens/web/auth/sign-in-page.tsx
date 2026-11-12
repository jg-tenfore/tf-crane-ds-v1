import { useState } from "react";
import { Lock01, Mail01 } from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { Notice } from "@/components/feedback/notice";
import { TextField } from "@/components/forms/text-field";
import { useWebRouter } from "@/components/web/web-router";
import { USER } from "@/data/crane";
import { useWebSession } from "@/screens/web/web-shell";
import { AuthHeading, AuthLayout, AuthLink, AuthModeSwitch, SocialSignIn, WebCheckbox, authPrimary, useFakeRequest, useNextPath, withQuery } from "./auth-web-parts";

export interface SignInPageProps {
    initialEmail?: string;
    initialPassword?: string;
    /** Open in the "incorrect email or password" state. */
    initialError?: boolean;
    initialRemember?: boolean;
}

/**
 * Sign In (/sign-in) — Fox's Log in card on the Crane Web split layout: Sign up | Log in
 * switch, email + password, Remember me, Forgot password?, green Sign in, Google / Apple.
 * On success it signs the session in and goes to `?next=` or /account.
 */
export const SignInPage = ({ initialEmail = "", initialPassword = "", initialError = false, initialRemember = true }: SignInPageProps) => {
    const { navigate } = useWebRouter();
    const { setUserName } = useWebSession();
    const next = useNextPath();
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState(initialPassword);
    const [remember, setRemember] = useState(initialRemember);
    const [error, setError] = useState(initialError);
    const { isLoading, run } = useFakeRequest(900);

    const done = () => {
        setUserName(USER.firstName);
        navigate(next ?? "/account");
    };
    const canSubmit = email.trim().length > 0 && password.length > 0;

    return (
        <AuthLayout>
            <AuthHeading
                title="Welcome back"
                subtitle={next ? "Sign in to continue. Your cart is saved." : "Sign in with your TenFore account, the same one you use in the Crane app."}
            />
            <AuthModeSwitch mode="sign-in" className="mt-7" />

            <form
                className="mt-6 flex flex-col gap-5"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (canSubmit) run(done);
                }}
            >
                {error && (
                    <Notice tone="error" title="Incorrect email or password">
                        Check your details and try again, or reset your password.
                    </Notice>
                )}
                <TextField
                    label="Email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    icon={Mail01}
                    value={email}
                    onChange={(v) => {
                        setEmail(v);
                        setError(false);
                    }}
                    isInvalid={error}
                />
                <TextField
                    label="Password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="Your password"
                    icon={Lock01}
                    revealable
                    value={password}
                    onChange={(v) => {
                        setPassword(v);
                        setError(false);
                    }}
                    isInvalid={error}
                />
                <div className="flex items-center justify-between gap-4">
                    <WebCheckbox isSelected={remember} onChange={setRemember}>
                        Remember me
                    </WebCheckbox>
                    <AuthLink href={withQuery("/forgot-password", { email: email.trim(), next })}>Forgot password?</AuthLink>
                </div>
                <Button type="submit" fullWidth isDisabled={!canSubmit} isLoading={isLoading} className={authPrimary}>
                    {isLoading ? "Signing in…" : "Sign in"}
                </Button>
            </form>

            <SocialSignIn className="mt-7" onPress={() => run(done)} />
        </AuthLayout>
    );
};
