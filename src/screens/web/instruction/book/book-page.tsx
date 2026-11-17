import { ArrowRight, SearchLg } from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { Panel, PageHeader, WebPage } from "@/components/web/web-layout";
import { useWebRouter, WebLink } from "@/components/web/web-router";
import { WebShell } from "../../web-shell";
import { clinicsHref, coachById, instructorsHref, packagesHref, PRIVATE_SERVICES, serviceById } from "../data";
import { focusRing } from "../pro/instructor-ui";
import { useInstructionQuery } from "../use-instruction-query";
import { ANY, programFor } from "./book-model";
import { LessonBooking } from "./lesson-booking";
import { ProgramRegistration } from "./program-registration";

/**
 * `/instruction/book` — the back half of the instructor-first path (Fox P3 `book-screen.tsx`).
 * By the time a golfer lands here they've chosen **who** and **what**; this page owns time,
 * details, account and payment. A private lesson gets the time board; a group program (Academy
 * clinic/camp or county clinic) gets registration. Opened without a lesson, it says so and sends
 * the golfer back to choose one rather than booking something nobody picked.
 */
export const BookPage = () => {
    const { query } = useInstructionQuery();
    const program = query.service ? programFor(query.service) : undefined;
    if (program) return <ProgramRegistration key={program.id} program={program} />;

    const service = query.service ? serviceById(query.service) : undefined;
    const coachId = query.coach && coachById(query.coach) && !coachById(query.coach)?.comingSoon ? query.coach : ANY;
    if (!service || service.kind !== "private") return <PickALessonFirst />;
    return <LessonBooking key={`${service.id}|${coachId}`} service={service} coachId={coachId} />;
};

/** Nothing was chosen — say so, and point back at the step that was skipped. */
export const PickALessonFirst = () => {
    const { navigate } = useWebRouter();
    return (
        <WebShell active="instruction">
            <WebPage>
                <PageHeader
                    eyebrow="Montgomery County Golf"
                    title="Pick a lesson first"
                    subtitle="Booking starts with a pro: choose one, pick the lesson you want from their menu, and we'll bring you back here for a time."
                />
                <Panel className="mx-auto mt-10 max-w-3xl" bodyClassName="flex flex-col items-center gap-5 px-6 py-14 text-center">
                    <span className="flex size-12 items-center justify-center rounded-full bg-secondary">
                        <SearchLg className="size-6 text-fg-quaternary" aria-hidden="true" />
                    </span>
                    <p className="max-w-md text-md text-tertiary">
                        This page books a lesson you&rsquo;ve already chosen. It looks like you arrived without one — probably a link that lost its details.
                    </p>
                    <div className="flex flex-col gap-3 @tablet:flex-row">
                        <Button size="web-lg" iconTrailing={ArrowRight} onPress={() => navigate(instructorsHref())}>
                            Choose an instructor
                        </Button>
                        <Button size="web-lg" color="outline" onPress={() => navigate(clinicsHref())}>
                            Browse clinics instead
                        </Button>
                    </div>
                    <p className="text-sm text-tertiary">
                        {PRIVATE_SERVICES.length} lesson types across the Academy ·{" "}
                        <WebLink href={packagesHref()} className={`rounded font-semibold text-brand-secondary hover:underline ${focusRing}`}>
                            lesson packages
                        </WebLink>
                    </p>
                </Panel>
            </WebPage>
        </WebShell>
    );
};
