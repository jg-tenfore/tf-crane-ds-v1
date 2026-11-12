import type { Meta, StoryObj } from "@storybook/react-vite";
import { LeagueDetailPage } from "@/screens/web/events";
import { WebScreen } from "../web-story-kit";

/**
 * `/leagues/:id` — **new** for Crane Web. Hero, Overview / Schedule / Standings tabs and a sticky
 * join card that adapts: team signup (pick a partner and team name, or join solo and get paired),
 * mid-season prorated join for individual leagues, the waitlist when full, and "You're in" with
 * place, points and request-a-sub for a league the golfer already plays.
 */
const meta: Meta = {
    title: "Crane Web/Leagues/League Details",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

const at = (id: string) => `/leagues/${id}`;

export const YourLeagueStandings: Story = {
    name: "Your league · Standings",
    render: () => <WebScreen path={at("wednesday-9-and-dine")}><LeagueDetailPage id="wednesday-9-and-dine" initialTab="standings" /></WebScreen>,
};
export const YourLeagueSchedule: Story = {
    name: "Your league · Schedule",
    render: () => <WebScreen path={at("wednesday-9-and-dine")}><LeagueDetailPage id="wednesday-9-and-dine" initialTab="schedule" /></WebScreen>,
};
export const TeamSignup: Story = {
    name: "Registration open · Team signup",
    render: () => <WebScreen path={at("winter-simulator-league")}><LeagueDetailPage id="winter-simulator-league" /></WebScreen>,
};
export const TeamSignupDialog: Story = {
    name: "Team signup dialog",
    render: () => <WebScreen path={at("winter-simulator-league")}><LeagueDetailPage id="winter-simulator-league" initialStep="confirm" /></WebScreen>,
};
export const MidSeasonJoin: Story = {
    name: "In season · Prorated join",
    render: () => <WebScreen path={at("ladies-9-hole-league")}><LeagueDetailPage id="ladies-9-hole-league" /></WebScreen>,
};
export const FullWaitlist: Story = {
    name: "Full · Waitlist",
    render: () => <WebScreen path={at("couples-twilight-league")}><LeagueDetailPage id="couples-twilight-league" /></WebScreen>,
};
export const MobileWeb: Story = {
    name: "Mobile web",
    render: () => <WebScreen path={at("winter-simulator-league")} width="mobile"><LeagueDetailPage id="winter-simulator-league" /></WebScreen>,
};
export const MobileStandings: Story = {
    name: "Mobile web · Standings",
    render: () => <WebScreen path={at("wednesday-9-and-dine")} width="mobile"><LeagueDetailPage id="wednesday-9-and-dine" initialTab="standings" /></WebScreen>,
};
