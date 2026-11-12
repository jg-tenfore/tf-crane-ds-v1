import type { ReactNode } from "react";
import { matchPath } from "@/components/web/web-router";
import { ActivitiesPage } from "./activities-page";
import { CalendarPage } from "./calendar-page";
import { ClinicDetailPage } from "./clinic-detail-page";
import { ClinicsBrowsePage } from "./clinics-browse-page";
import { EventDetailPage } from "./event-detail-page";
import { EventsBrowsePage } from "./events-browse-page";
import { LeagueDetailPage } from "./league-detail-page";
import { LeaguesBrowsePage } from "./leagues-browse-page";

export interface WebRoute {
    /** matchPath() pattern, e.g. "/events/:id". */
    pattern: string;
    /** Short name for prototype menus. */
    label: string;
    render: (params: Record<string, string>) => ReactNode;
}

/**
 * Every Events / Clinics / Leagues / Activities / Calendar route, most specific first.
 * The `key` on detail pages resets their local state when the id changes.
 */
export const eventRoutes: WebRoute[] = [
    { pattern: "/events/:id", label: "Event details", render: ({ id }) => <EventDetailPage key={id} id={id} /> },
    { pattern: "/events", label: "Events", render: () => <EventsBrowsePage /> },
    { pattern: "/clinics/:id", label: "Clinic details", render: ({ id }) => <ClinicDetailPage key={id} id={id} /> },
    { pattern: "/clinics", label: "Clinics", render: () => <ClinicsBrowsePage /> },
    { pattern: "/leagues/:id", label: "League details", render: ({ id }) => <LeagueDetailPage key={id} id={id} /> },
    { pattern: "/leagues", label: "Leagues", render: () => <LeaguesBrowsePage /> },
    { pattern: "/activities", label: "Activities", render: () => <ActivitiesPage /> },
    { pattern: "/calendar", label: "Calendar", render: () => <CalendarPage /> },
];

/** Render the first matching event route for `path`, or null. */
export const renderEventRoute = (path: string): ReactNode => {
    for (const r of eventRoutes) {
        const params = matchPath(r.pattern, path);
        if (params) return r.render(params);
    }
    return null;
};
