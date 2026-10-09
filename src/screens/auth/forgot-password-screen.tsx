import { useState } from "react";
import { Check, Mail01 } from "@untitledui/icons";
import { Screen } from "@/components/device/screen";
import { Button } from "@/components/base/button";
import { IconTile } from "@/components/base/card";
import { NavigationBar } from "@/components/navigation/navigation-bar";
import { TextField } from "@/components/forms/text-field";
import { useStack } from "@/components/prototype/stack-navigator";
import { AuthFooter, AuthTitle, isEmail, useFakeRequest } from "./auth-parts";

export interface ForgotPasswordScreenProps {
    initialEmail?: string;
    /** Open on the "Check your inbox" confirmation. */
    initialSent?: boolean;
}

/** Forgot Password — one email field; on send, the same screen flips to a confirmation. */
export const ForgotPasswordScreen = ({ initialEmail = "", initialSent = false }: ForgotPasswordScreenProps) => {
    const { pop } = useStack();
    const [email, setEmail] = useState(initialEmail);
    const [sent, setSent] = useState(initialSent);
    const { isLoading, run } = useFakeRequest(800);

    if (sent) {
        return (
            <Screen
                nav={<NavigationBar backIconOnly onBack={pop} surface="transparent" divider={false} />}
                footer={
                    <AuthFooter>
                        <Button color="filled" fullWidth onPress={pop}>
                            Back to Sign In
                        </Button>
                    </AuthFooter>
                }
            >
                <div className="flex min-h-full flex-col items-center justify-center px-gutter pb-20 text-center">
                    <span className="flex size-20 items-center justify-center rounded-full bg-brand-solid text-white shadow-ios-float">
                        <Check className="size-10" strokeWidth={2.6} aria-hidden="true" />
                    </span>
                    <h1 className="mt-6 text-ios-title1 text-primary">Check your inbox</h1>
                    <p className="mt-2 max-w-[320px] text-ios-body text-tertiary">
                        We sent a password reset link to{" "}
                        <span className="font-semibold whitespace-nowrap text-primary">{email || "your email"}</span>. The link expires in 1 hour.
                    </p>
                    <div className="mt-6 flex flex-col items-center gap-1">
                        <Button color="plain" size="md" onPress={() => run(() => undefined)} isLoading={isLoading}>
                            Resend link
                        </Button>
                        <Button color="plain" size="md" onPress={() => setSent(false)} className="text-tertiary">
                            Use a different email
                        </Button>
                    </div>
                </div>
            </Screen>
        );
    }

    return (
        <Screen
            nav={<NavigationBar backIconOnly onBack={pop} surface="transparent" divider={false} />}
            footer={
                <AuthFooter>
                    <Button color="filled" fullWidth isDisabled={!isEmail(email)} isLoading={isLoading} onPress={() => run(() => setSent(true))}>
                        {isLoading ? "Sending…" : "Send Reset Link"}
                    </Button>
                </AuthFooter>
            }
        >
            <div className="px-gutter pt-3">
                <IconTile icon={Mail01} size="lg" shape="circle" />
            </div>
            <AuthTitle
                title="Reset password"
                subtitle="Enter the email you use for Crane and we’ll send you a link to reset your password."
                className="mt-4"
            />
            <div className="mt-7 px-gutter">
                <TextField
                    label="Email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    icon={Mail01}
                    value={email}
                    onChange={setEmail}
                />
            </div>
        </Screen>
    );
};
