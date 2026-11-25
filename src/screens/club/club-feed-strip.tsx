import type { FC } from "react";
import { Announcement02, Calendar, ChevronRight, Flag01, Pin02, Tag01 } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { Tag } from "@/components/base/badge";
import type { FeedPost } from "@/data/club-profiles";
import { TODAY } from "@/data/crane";
import { cx } from "@/utils/cx";

/* ------------------------------------------------------------------ */
/* Feed rules                                                          */
/* ------------------------------------------------------------------ */

export const FEED_KINDS: Record<FeedPost["kind"], { label: string; icon: FC<{ className?: string }> }> = {
    news: { label: "News", icon: Announcement02 },
    event: { label: "Event", icon: Calendar },
    offer: { label: "Offer", icon: Tag01 },
    course: { label: "Course", icon: Flag01 },
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/**
 * What golfers see, in order: posts that are live today (posted on or before today, not past their
 * `expiresOn` day), pinned first, then newest first.
 */
export const visibleFeed = (feed: FeedPost[], today: Date = TODAY): FeedPost[] => {
    const day = startOfDay(today);
    return feed
        .filter((p) => startOfDay(p.postedOn) <= day && (!p.expiresOn || startOfDay(p.expiresOn) >= day))
        .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.postedOn.getTime() - a.postedOn.getTime());
};

const shortDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
/** "Posted Oct 6". */
export const postedLabel = (p: FeedPost) => `Posted ${shortDate(p.postedOn)}`;
/** "Ends Oct 31" for posts with an end date. */
export const endsLabel = (p: FeedPost) => (p.expiresOn ? `Ends ${shortDate(p.expiresOn)}` : undefined);

/** The kind of post as a small brand-tinted badge: News, Event, Offer, Course. */
export const FeedKindTag = ({ kind, className }: { kind: FeedPost["kind"]; className?: string }) => (
    <Tag tone="brand" variant="soft" icon={FEED_KINDS[kind].icon} className={className}>
        {FEED_KINDS[kind].label}
    </Tag>
);

/** Pin glyph for pinned posts (they also sort first). */
export const PinnedMark = () => (
    <span className="inline-flex items-center text-fg-brand-primary" aria-label="Pinned" role="img">
        <Pin02 className="size-3.5" aria-hidden="true" />
    </span>
);

/* ------------------------------------------------------------------ */
/* ClubFeedStrip                                                       */
/* ------------------------------------------------------------------ */

export interface ClubFeedStripProps {
    feed: FeedPost[];
    /** "Today" for the expiry rules (Crane's sample TODAY by default). */
    today?: Date;
    /** Most cards in the strip. */
    max?: number;
    title?: string;
    onSeeAll?: () => void;
    onOpenPost?: (post: FeedPost) => void;
    className?: string;
}

/**
 * ClubFeedStrip: the latest announcements on the club home, as a horizontal strip of cards (pinned first,
 * expired hidden). Each card shows the kind, the title, one line of the body and when it was posted.
 * Renders nothing when there's nothing live, so a course that never posts loses nothing.
 */
export const ClubFeedStrip = ({ feed, today, max = 5, title = "News & updates", onSeeAll, onOpenPost, className }: ClubFeedStripProps) => {
    const posts = visibleFeed(feed, today).slice(0, max);
    if (!posts.length) return null;
    const single = posts.length === 1;

    return (
        <section aria-label={title} className={cx("flex flex-col gap-2", className)}>
            <div className="flex items-center justify-between px-gutter">
                <h2 className="text-ios-headline text-primary">{title}</h2>
                {onSeeAll && (
                    <AriaButton
                        onPress={onSeeAll}
                        className="-mr-1 flex cursor-pointer items-center gap-0.5 rounded-md px-1 text-ios-subheadline font-medium text-brand-secondary outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-brand-300 data-[pressed]:opacity-60"
                    >
                        See all
                        <ChevronRight className="size-4" aria-hidden="true" />
                    </AriaButton>
                )}
            </div>
            <div className="scrollbar-hide flex snap-x snap-mandatory scroll-px-gutter gap-2.5 overflow-x-auto px-gutter pb-1">
                {posts.map((p) => (
                    <AriaButton
                        key={p.id}
                        data-feed-card={p.id}
                        onPress={() => onOpenPost?.(p)}
                        aria-label={`${FEED_KINDS[p.kind].label}: ${p.title}`}
                        className={cx(
                            "press-scale flex shrink-0 cursor-pointer snap-start items-stretch gap-3 rounded-ios-card bg-primary p-3 text-left shadow-ios-card ring-1 ring-secondary/60 outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60",
                            single ? "w-full" : "w-[300px]",
                        )}
                    >
                        {p.image && <img src={p.image} alt="" draggable={false} className="size-[64px] shrink-0 self-center rounded-lg object-cover" />}
                        <span className="flex min-w-0 flex-1 flex-col gap-1">
                            <span className="flex items-center gap-1.5">
                                <FeedKindTag kind={p.kind} />
                                {p.pinned && <PinnedMark />}
                                <span className="ml-auto shrink-0 text-ios-caption1 text-quaternary">{postedLabel(p)}</span>
                            </span>
                            <span className="truncate text-ios-headline text-primary">{p.title}</span>
                            <span className="truncate text-ios-subheadline text-tertiary">{p.body}</span>
                        </span>
                    </AriaButton>
                ))}
            </div>
        </section>
    );
};
