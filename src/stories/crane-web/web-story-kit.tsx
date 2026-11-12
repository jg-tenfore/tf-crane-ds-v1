import type { ReactNode } from "react";
import { WebFrame, type WebWidth } from "@/components/web/web-frame";
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
    children: ReactNode;
}

/** Address bar follows the router, so clicking a link inside a screen shows the new deep link. */
const FrameWithRoute = ({ width, dark, height, children }: Omit<WebScreenProps, "path" | "cart" | "signedIn">) => {
    const { path } = useWebRouter();
    return (
        <WebFrame width={width} dark={dark} height={height} url={`crane.tenfore.golf${path}`}>
            {children}
        </WebFrame>
    );
};

/** One Crane Web screen in a browser frame, with router + session + cart providers. */
export const WebScreen = ({ path, width = "desktop", cart = [], signedIn = true, courseId, dark, height, children }: WebScreenProps) => (
    <div className="p-6">
        <WebRouterProvider initialPath={path}>
            <WebSessionProvider signedIn={signedIn} courseId={courseId}>
                <CartProvider initial={cart}>
                    <FrameWithRoute width={width} dark={dark} height={height}>
                        {children}
                    </FrameWithRoute>
                </CartProvider>
            </WebSessionProvider>
        </WebRouterProvider>
    </div>
);
