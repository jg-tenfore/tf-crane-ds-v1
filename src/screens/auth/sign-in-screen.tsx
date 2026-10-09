import { useState } from "react";
import { Lock01, Mail01 } from "@untitledui/icons";
import { Screen } from "@/components/device/screen";
import { Button } from "@/components/base/button";
import { NavigationBar } from "@/components/navigation/navigation-bar";
import { TextField } from "@/components/forms/text-field";
import { Notice } from "@/components/feedback/notice";
import { useStack } from "@/components/prototype/stack-navigator";
import { AuthFooter, AuthTitle, OrDivider, SocialButtons, useFakeRequest } from "./auth-parts";

export interface SignInScreenProps {
    initialEmail?: string;
    initialPassword?: string;
    /** Open in the "incorrect email or password" state. */
    initialError?: boolean;
    /** Called after the simulated sign-in. Defaults to pushing the "signed-in" confirmation. */
    onSignedIn?: () => void;
}

/** Sign In — email + password with a pinned primary action; Apple / Google below the fold line. */
export const SignInScreen = ({ initialEmail = "", initialPassword = "", initialError = false, onSignedIn }: SignInScreenProps) => {
    const { push, pop } = useStack();
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState(initialPassword);
    const [error, setError] = useState(initialError);
    const { isLoading, run } = useFakeRequest(900);

    const done = () => (onSignedIn ? onSignedIn() : push("signed-in", { mode: "sign-in" }));
    const canSubmit = email.trim().length > 0 && password.length > 0;

    return (
        <Screen
            nav={<NavigationBar backIconOnly onBack={pop} surface="transparent" divider={false} />}
            footer={
                <AuthFooter>
                    <Button color="filled" fullWidth isDisabled={!canSubmit} isLoading={isLoading} onPress={() => run(done)}>
                        {isLoading ? "Signing In…" : "Sign In"}
                    </Button>
                </AuthFooter>
            }
        >
            <AuthTitle title="Welcome back" subtitle="Sign in to book tee times and manage your rounds." className="pt-1" />

            <div className="mt-7 flex flex-col gap-4 px-gutter">
                {error && (
                    <Notice tone="error" title="Incorrect email or password">
                        Check your details and try again, or reset your password.
                    </Notice>
                )}

                <TextField
                    label="Email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    icon={Mail01}
                    value={email}
                    onChange={(v) => {
                        setEmail(v);
                        setError(false);
                    }}
                    isInvalid={error}
                />
                <div className="flex flex-col gap-1">
                    <TextField
                        label="Password"
                        type="password"
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
                    <div className="flex justify-end">
                        <Button color="plain" size="sm" onPress={() => push("forgot-password", { email })} className="-mr-1">
                            Forgot password?
                        </Button>
                    </div>
                </div>

                <OrDivider className="mt-1" />
                <SocialButtons verb="Sign in" onApple={done} onGoogle={done} />
            </div>
        </Screen>
    );
};
