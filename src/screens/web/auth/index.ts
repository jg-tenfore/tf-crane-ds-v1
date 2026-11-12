import { createElement, type ReactNode } from "react";
import { ChooseHomeCoursePage } from "./choose-home-course-page";
import { ForgotPasswordPage } from "./forgot-password-page";
import { SignInPage } from "./sign-in-page";
import { SignUpPage } from "./sign-up-page";
import { SignedInPage } from "./signed-in-page";
import { VerifyEmailPage } from "./verify-email-page";

export { ChooseHomeCoursePage, type ChooseHomeCoursePageProps } from "./choose-home-course-page";
export { ForgotPasswordPage, type ForgotPasswordPageProps } from "./forgot-password-page";
export { SignInPage, type SignInPageProps } from "./sign-in-page";
export { SignUpPage, type SignUpPageProps, type SignUpValues } from "./sign-up-page";
export { SignedInPage, type SignedInPageProps } from "./signed-in-page";
export { VerifyEmailPage, type VerifyEmailPageProps } from "./verify-email-page";

export interface AuthRoute {
    /** matchPath() pattern. Query strings (?next=, ?email=) are read inside the page. */
    pattern: string;
    render: (params: Record<string, string>) => ReactNode;
}

/**
 * Crane Web Sign in ∕ Sign up routes. Every page includes WebShell.
 *   /sign-in  → (/forgot-password) → ?next= or /account
 *   /sign-up  → /verify-email → /welcome/home-course → /welcome → ?next= or /account
 * `?next=/checkout` is carried through the whole flow.
 */
export const authRoutes: AuthRoute[] = [
    { pattern: "/sign-in", render: () => createElement(SignInPage) },
    { pattern: "/sign-up", render: () => createElement(SignUpPage) },
    { pattern: "/verify-email", render: () => createElement(VerifyEmailPage) },
    { pattern: "/forgot-password", render: () => createElement(ForgotPasswordPage) },
    { pattern: "/welcome/home-course", render: () => createElement(ChooseHomeCoursePage) },
    { pattern: "/welcome", render: () => createElement(SignedInPage) },
];
