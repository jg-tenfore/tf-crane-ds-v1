import type { ReactNode } from "react";
import { WebFrame, type WebWidth } from "@/components/web/web-frame";
import type { WebOrg } from "@/components/web/web-org";
import { useWebRouter, WebRouterProvider } from "@/components/web/web-router";
import { CartProvider, type CartLine } from "@/screens/web/cart-store";
import { WebSessionProvider } from "@/screens/web/web-shell";

export interface WebScreenProps {
    /** Path shown in the address bar and the router's starting route, e.g. "/shop/golf-balls/dozens". */
    path: string;
    width?: WebWidth;
    cart?: CartLine[];
    signedIn?: boolean;
    /** Course the session starts on (default Sagamore Spring). */
    courseId?: string;
    dark?: boolean;
    height?: number;
    /** Organization site (e.g. MCG_ORG): org header, nav, course picker and footer. */
    org?: WebOrg | null;
    /** Address-bar host (default crane.tenfore.golf; an org's `host` when given). */
    host?: string;
    children: ReactNode;
}

/** Address bar follows the router, so clicking a link inside a screen shows the new deep link. */
const FrameWithRoute = ({ width, dark, height, host = "crane.tenfore.golf", children }: Omit<WebScreenProps, "path" | "cart" | "signedIn" | "org">) => {
    const { path } = useWebRouter();
    return (
        <WebFrame width={width} dark={dark} height={height} url={`${host}${path}`}>
            {children}
        </WebFrame>
    );
};

/** One Crane Web screen in a browser frame, with router + session + cart providers. */
export const WebScreen = ({ path, width = "desktop", cart = [], signedIn = true, courseId, dark, height, org, host, children }: WebScreenProps) => (
    <div className="p-6">
        <WebRouterProvider initialPath={path}>
            <WebSessionProvider signedIn={signedIn} courseId={courseId} org={org}>
                <CartProvider initial={cart}>
                    <FrameWithRoute width={width} dark={dark} height={height} host={host ?? org?.host}>
                        {children}
                    </FrameWithRoute>
                </CartProvider>
            </WebSessionProvider>
        </WebRouterProvider>
    </div>
);
