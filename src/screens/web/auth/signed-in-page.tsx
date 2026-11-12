import { useEffect } from "react";
import { Check } from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { useWebRouter } from "@/components/web/web-router";
import { COURSES, USER } from "@/data/crane";
import { CourseLogo } from "@/screens/chrome/course-logo";
import { useWebSession } from "@/screens/web/web-shell";
import { AuthHeading, AuthLayout, authPrimary, useNextPath, useQuery } from "./auth-web-parts";

export interface SignedInPageProps {
    /** `sign-up` greets a new member and lists their chosen courses. Defaults to `?mode=`, then sign-up. */
    mode?: "sign-in" | "sign-up";
    /** Course ids. Defaults to `?courses=a,b`. */
    courses?: string[];
}

/**
 * Signed In (/welcome) — the confirmation at the end of sign-up (or a "welcome back"),
 * listing chosen home courses, then on to the account (or `?next=`) or tee times.
 */
export const SignedInPage = ({ mode: modeProp, courses: coursesProp }: SignedInPageProps) => {
    const { navigate } = useWebRouter();
    const { userName, setUserName } = useWebSession();
    const query = useQuery();
    const next = useNextPath();
    const mode = modeProp ?? (query.get("mode") === "sign-in" ? "sign-in" : "sign-up");
    const ids = coursesProp ?? (query.get("courses") ?? "").split(",").filter(Boolean);
    const chosen = COURSES.filter((c) => ids.includes(c.id));

    // Landing here means the session is signed in (covers deep links to /welcome).
    useEffect(() => {
        if (!userName) setUserName(USER.firstName);
    }, [userName, setUserName]);

    return (
        <AuthLayout panelEyebrow="Welcome to">
            <AuthHeading
                icon={Check}
                tone="success"
                title={mode === "sign-up" ? "You’re all set" : `Welcome back, ${USER.firstName}`}
                subtitle={
                    mode === "sign-up"
                        ? `Welcome to Crane, ${USER.firstName}. Your account works here, at every TenFore course, and in the Crane app.`
                        : "Your bookings, purchases and courses are ready."
                }
            />

            {chosen.length > 0 && (
                <div className="mt-8">
                    <div className="caps mb-3 text-quaternary">Your courses</div>
                    <ul className="divide-y divide-border-secondary overflow-hidden rounded-xl ring-1 ring-secondary ring-inset">
                        {chosen.map((c) => (
                            <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                                <CourseLogo course={c} size={36} className="rounded-lg" />
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-md font-semibold text-primary">{c.name}</span>
                                    <span className="block text-sm text-tertiary">
                                        {c.city}, {c.state}
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="mt-8 flex flex-col gap-3">
                <Button fullWidth onPress={() => navigate(next ?? "/account")} className={authPrimary}>
                    {next ? "Continue" : "Go to my account"}
                </Button>
                <Button color="outline" fullWidth onPress={() => navigate("/tee-times")} className={`${authPrimary} text-secondary`}>
                    Book a tee time
                </Button>
            </div>
        </AuthLayout>
    );
};
