import { useState } from "react";
import { Lock01, Mail01, Phone, User01 } from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { TextField } from "@/components/forms/text-field";
import { useWebRouter } from "@/components/web/web-router";
import {
    AuthHeading,
    AuthLayout,
    AuthModeSwitch,
    SocialSignIn,
    WebCheckbox,
    WebPasswordChecklist,
    authPrimary,
    isEmail,
    isPasswordValid,
    useFakeRequest,
    useNextPath,
    withQuery,
} from "./auth-web-parts";

export interface SignUpValues {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    agreed: boolean;
}

const EMPTY: SignUpValues = { firstName: "", lastName: "", email: "", phone: "", password: "", agreed: false };

export interface SignUpPageProps {
    initialValues?: Partial<SignUpValues>;
}

/**
 * Sign Up (/sign-up) — the Crane app's fields (first/last, email, optional phone, password
 * with a live checklist, terms) in Fox's Sign up card. "Create account" stays disabled until
 * everything required is valid; it then goes to /verify-email.
 */
export const SignUpPage = ({ initialValues }: SignUpPageProps) => {
    const { navigate } = useWebRouter();
    const next = useNextPath();
    const [v, setV] = useState<SignUpValues>({ ...EMPTY, ...initialValues });
    const set =
        <K extends keyof SignUpValues>(key: K) =>
        (value: SignUpValues[K]) =>
            setV((prev) => ({ ...prev, [key]: value }));
    const { isLoading, run } = useFakeRequest(900);

    // Validate email on blur, not per keystroke.
    const [emailTouched, setEmailTouched] = useState(false);
    const emailInvalid = emailTouched && v.email.length > 0 && !isEmail(v.email);
    const isValid = v.firstName.trim() !== "" && v.lastName.trim() !== "" && isEmail(v.email) && isPasswordValid(v.password) && v.agreed;

    const create = () => run(() => navigate(withQuery("/verify-email", { email: v.email.trim(), next })));

    return (
        <AuthLayout panelEyebrow="Join">
            <AuthHeading title="Create your account" subtitle="One account to book and pay at every TenFore course." />
            <AuthModeSwitch mode="sign-up" className="mt-7" />

            <form
                className="mt-6 flex flex-col gap-5"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (isValid) create();
                }}
            >
                <div className="grid grid-cols-2 gap-3">
                    <TextField label="First name" autoComplete="given-name" placeholder="First" icon={User01} value={v.firstName} className="min-w-0" onChange={set("firstName")} />
                    <TextField label="Last name" autoComplete="family-name" placeholder="Last" icon={User01} value={v.lastName} className="min-w-0" onChange={set("lastName")} />
                </div>
                <TextField
                    label="Email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    icon={Mail01}
                    value={v.email}
                    onChange={set("email")}
                    onBlur={() => setEmailTouched(true)}
                    isInvalid={emailInvalid}
                    errorMessage="Enter a valid email address."
                />
                <TextField label="Phone (optional)" type="tel" autoComplete="tel" placeholder="(555) 555-0100" icon={Phone} value={v.phone} onChange={set("phone")} />
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
                    <WebPasswordChecklist password={v.password} />
                </div>
                <WebCheckbox isSelected={v.agreed} onChange={set("agreed")}>
                    I agree to the <span className="font-semibold text-brand-secondary">Terms of Service</span> and{" "}
                    <span className="font-semibold text-brand-secondary">Privacy Policy</span>
                </WebCheckbox>
                <Button type="submit" fullWidth isDisabled={!isValid} isLoading={isLoading} className={authPrimary}>
                    {isLoading ? "Creating account…" : "Create account"}
                </Button>
            </form>

            <SocialSignIn label="Or sign up with" className="mt-7" onPress={() => run(() => navigate(withQuery("/welcome/home-course", { next })))} />
        </AuthLayout>
    );
};
