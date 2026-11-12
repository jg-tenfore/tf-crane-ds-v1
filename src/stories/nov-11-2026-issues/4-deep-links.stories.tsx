import type { Meta, StoryObj } from "@storybook/react-vite";
import type { WebWidth } from "@/components/web/web-frame";
import { productById, productPath } from "@/data/shop";
import { CraneWebRoutes, webRoutes } from "@/screens/web/web-app";
import { WebScreen } from "../crane-web/web-story-kit";

const caption = (story: string) => ({ docs: { description: { story } } });

const routes = webRoutes();
const sidebarRoutes = webRoutes({ shopNav: "sidebar" });

/**
 * The whole Crane Web app, opened at a URL. Nothing is set up by hand: the app's own router
 * resolves the path, exactly as it would when someone taps a link in an email.
 */
const OpenAt = ({ path, width, sidebar, height }: { path: string; width?: WebWidth; sidebar?: boolean; height?: number }) => (
    <WebScreen path={path} width={width} height={height}>
        <CraneWebRoutes routes={sidebar ? sidebarRoutes : routes} />
    </WebScreen>
);

const PRO_V1 = productPath(productById("ball-titleist-pro-v1-dozen")!);

const meta: Meta = {
    title: "Nov 11, 2026 Issues/4. Deep links",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "**Issue:** keep Fox's deep links, so a button on the course website or in an email can open a specific page (for example Beer, or `/shop/golf-balls/dozens`). " +
                    "**Status: built in Crane Web.** Every level has its own URL: group, subgroup, product, menu section, cart and checkout. " +
                    "Each story opens the **whole app** at a URL and lets the app's router pick the page; the address bar shows the link. " +
                    "Try them in the prototype too: `http://localhost:6024/web/#/shop/golf-balls/dozens`.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const GolfBallsDozens: Story = {
    name: "/shop/golf-balls/dozens",
    parameters: caption("A subgroup link: Shop › Golf Balls › Dozens, with the Dozens tab selected."),
    render: () => <OpenAt path="/shop/golf-balls/dozens" />,
};

export const GolfBallsDozensSidebar: Story = {
    name: "/shop/golf-balls/dozens · sidebar nav",
    parameters: caption("The same link with the Fox-style sidebar nav. Both nav variants use the same URLs."),
    render: () => <OpenAt path="/shop/golf-balls/dozens" sidebar />,
};

export const GolfBalls: Story = {
    name: "/shop/golf-balls",
    parameters: caption("A group link: every golf ball."),
    render: () => <OpenAt path="/shop/golf-balls" />,
};

export const ProductLink: Story = {
    name: "Product link",
    parameters: caption(`A single product: \`${PRO_V1}\`. Good for a \"Buy now\" button in an email.`),
    render: () => <OpenAt path={PRO_V1} />,
};

export const RestaurantBeer: Story = {
    name: "/restaurant/beer",
    parameters: caption("The Beer & Seltzer section of the Restaurant menu, for a \"Cold beer at the turn\" button."),
    render: () => <OpenAt path="/restaurant/beer" />,
};

export const RestaurantBeerMobile: Story = {
    name: "/restaurant/beer · mobile web",
    parameters: caption("The same Beer link on a phone, which is where most email taps happen."),
    render: () => <OpenAt path="/restaurant/beer" width="mobile" height={1500} />,
};

export const LiveQueryStyle: Story = {
    name: "/shop?category=golf-balls&subcategory=dozens",
    parameters: caption("Live CraneWeb's query-string links still work, so links already out there keep landing on the right page."),
    render: () => <OpenAt path="/shop?category=golf-balls&subcategory=dozens" />,
};

export const GiftCards: Story = {
    name: "/shop/gift-cards",
    parameters: caption("Club Offerings have links too, for a holiday gift-card email."),
    render: () => <OpenAt path="/shop/gift-cards" />,
};

export const StaleLink: Story = {
    name: "Old or mistyped link",
    parameters: caption("A link to a category that no longer exists lands on a friendly Not found page inside the shop, not an error."),
    render: () => <OpenAt path="/shop/rain-gear" />,
};
