import { useState } from "react";
import { Lock01, Mail01, Phone, User01 } from "@untitledui/icons";
import { Screen } from "@/components/device/screen";
import { Button } from "@/components/base/button";
import { NavigationBar } from "@/components/navigation/navigation-bar";
import { TextField } from "@/components/forms/text-field";
import { useStack } from "@/components/prototype/stack-navigator";
import { AuthFooter, AuthTitle, PasswordChecklist, TermsCheckbox, isEmail, isPasswordValid, useFakeRequest } from "./auth-parts";

export interface SignUpValues {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    agreed: boolean;
}

const EMPTY: SignUpValues = { firstName: "", lastName: "", email: "", phone: "", password: "", agreed: false };

export interface SignUpScreenProps {
    initialValues?: Partial<SignUpValues>;
    /** Called after the simulated account creation. Defaults to pushing "verify-email". */
    onCreated?: (values: SignUpValues) => void;
}

/**
 * Sign Up — name, email, optional phone and a password with live requirements.
 * "Create Account" stays disabled until every required field is valid and the terms are accepted.
 */
export const SignUpScreen = ({ initialValues, onCreated }: SignUpScreenProps) => {
    const { push, pop } = useStack();
    const [v, setV] = useState<SignUpValues>({ ...EMPTY, ...initialValues });
    const set = <K extends keyof SignUpValues>(key: K) => (value: SignUpValues[K]) => setV((prev) => ({ ...prev, [key]: value }));
    const { isLoading, run } = useFakeRequest(900);

    // Validate email on blur, not per keystroke — nobody wants red while still typing.
    const [emailTouched, setEmailTouched] = useState(false);
    const emailInvalid = emailTouched && v.email.length > 0 && !isEmail(v.email);
    const isValid = v.firstName.trim() !== "" && v.lastName.trim() !== "" && isEmail(v.email) && isPasswordValid(v.password) && v.agreed;

    const create = () => run(() => (onCreated ? onCreated(v) : push("verify-email", { email: v.email.trim() })));

    return (
        <Screen
            nav={<NavigationBar backIconOnly onBack={pop} surface="transparent" divider={false} />}
            footer={
                <AuthFooter>
                    <Button color="filled" fullWidth isDisabled={!isValid} isLoading={isLoading} onPress={create}>
                        {isLoading ? "Creating Account…" : "Create Account"}
                    </Button>
                </AuthFooter>
            }
        >
            <AuthTitle title="Create account" subtitle="One account to book and pay at every TenFore course." className="pt-1" />

            <div className="mt-7 flex flex-col gap-4 px-gutter">
                <div className="flex gap-3">
                    <TextField label="First Name" autoComplete="given-name" placeholder="First" icon={User01} value={v.firstName} className="min-w-0 flex-1" onChange={set("firstName")} />
                    <TextField label="Last Name" autoComplete="family-name" placeholder="Last" icon={User01} value={v.lastName} className="min-w-0 flex-1" onChange={set("lastName")} />
                </div>
                <TextField
                    label="Email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    icon={Mail01}
                    value={v.email}
                    onChange={set("email")}
                    onBlur={() => setEmailTouched(true)}
                    isInvalid={emailInvalid}
                    errorMessage="Enter a valid email address."
                />
                <TextField
                    label="Phone (Optional)"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(555) 555-0100"
                    icon={Phone}
                    value={v.phone}
                    onChange={set("phone")}
                />
                <div className="flex flex-col gap-2.5">
                    <TextField
                        label="Password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Create a password"
                        icon={Lock01}
                        revealable
                        value={v.password}
                        onChange={set("password")}
                    />
                    <PasswordChecklist password={v.password} />
                </div>

                <TermsCheckbox isSelected={v.agreed} onChange={set("agreed")} className="mt-1" />
            </div>
        </Screen>
    );
};
