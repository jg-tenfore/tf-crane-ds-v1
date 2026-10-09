import { createElement } from "react";
import type { ScreenRegistry } from "@/components/prototype/stack-navigator";
import { ChooseHomeCourseScreen } from "./choose-home-course-screen";
import { ForgotPasswordScreen } from "./forgot-password-screen";
import { SignInScreen } from "./sign-in-screen";
import { SignUpScreen } from "./sign-up-screen";
import { SignedInScreen, type SignedInScreenProps } from "./signed-in-screen";
import { VerifyEmailScreen } from "./verify-email-screen";
import { WelcomeScreen } from "./welcome-screen";

export { ChooseHomeCourseScreen, type ChooseHomeCourseScreenProps } from "./choose-home-course-screen";
export { ForgotPasswordScreen, type ForgotPasswordScreenProps } from "./forgot-password-screen";
export { SignInScreen, type SignInScreenProps } from "./sign-in-screen";
export { SignUpScreen, type SignUpScreenProps, type SignUpValues } from "./sign-up-screen";
export { SignedInScreen, type SignedInScreenProps } from "./signed-in-screen";
export { VerifyEmailScreen, type VerifyEmailScreenProps } from "./verify-email-screen";
export { WelcomeScreen, type WelcomeScreenProps } from "./welcome-screen";

/**
 * Sign in ∕ Sign up routes for StackNavigator.
 * welcome → sign-in → (forgot-password) → signed-in
 * welcome → sign-up → verify-email → home-course → signed-in
 */
export const authScreens: ScreenRegistry = {
    welcome: () => createElement(WelcomeScreen),
    "sign-in": () => createElement(SignInScreen),
    "sign-up": () => createElement(SignUpScreen),
    "verify-email": (p) => createElement(VerifyEmailScreen, { email: typeof p.email === "string" && p.email ? p.email : undefined }),
    "forgot-password": (p) => createElement(ForgotPasswordScreen, { initialEmail: typeof p.email === "string" ? p.email : "" }),
    "home-course": () => createElement(ChooseHomeCourseScreen),
    "signed-in": (p) =>
        createElement(SignedInScreen, {
            mode: p.mode as SignedInScreenProps["mode"],
            courses: Array.isArray(p.courses) ? (p.courses as string[]) : [],
        }),
};
