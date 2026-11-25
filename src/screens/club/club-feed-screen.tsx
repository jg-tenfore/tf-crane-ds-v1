import { useEffect, useRef } from "react";
import { Announcement02 } from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { Screen, useNavChromeHeight } from "@/components/device/screen";
import { EmptyState } from "@/components/feedback/empty-state";
import { useToast } from "@/components/feedback/toast";
import { NavigationBar } from "@/components/navigation/navigation-bar";
import { useStack } from "@/components/prototype/stack-navigator";
import { clubProfileFor, type ClubProfile, type FeedPost } from "@/data/club-profiles";
import { useCourse } from "@/screens/chrome/course-context";
import { cx } from "@/utils/cx";
import { clubName } from "./club-home-header";
import { endsLabel, FeedKindTag, PinnedMark, postedLabel, visibleFeed } from "./club-feed-strip";

export interface ClubFeedScreenProps {
    /** Defaults to the profile for the current course. */
    profile?: ClubProfile;
    today?: Date;
    /** Scroll to this post (opened from a card in the home strip). */
    focusPostId?: string;
    backLabel?: string;
}

const FeedPostCard = ({ post, onCta, focused }: { post: FeedPost; onCta: (post: FeedPost) => void; focused?: boolean }) => (
    <article
        data-feed-post={post.id}
        className={cx("overflow-hidden rounded-ios-card bg-primary shadow-ios-card ring-1 ring-secondary/60", focused && "ring-2 ring-brand")}
    >
        {post.image && <img src={post.image} alt="" draggable={false} className="aspect-[3/2] w-full object-cover" />}
        <div className="flex flex-col gap-1.5 p-4">
            <div className="flex items-center gap-1.5">
                <FeedKindTag kind={post.kind} />
                {post.pinned && <PinnedMark />}
                <span className="ml-auto text-ios-footnote text-quaternary">{postedLabel(post)}</span>
            </div>
            <h2 className="text-ios-title3 text-primary">{post.title}</h2>
            <p className="text-ios-body text-secondary">{post.body}</p>
            {endsLabel(post) && <p className="text-ios-footnote text-tertiary">{endsLabel(post)}</p>}
            {post.cta && (
                <Button size="sm" className="mt-2 self-start" onPress={() => onCta(post)}>
                    {post.cta.label}
                </Button>
            )}
        </div>
    </article>
);

/**
 * ClubFeedScreen: "News & updates", pushed from the club home. Every live post (pinned first, expired
 * hidden), with its image and call to action. A CTA to the tee sheet pops back home; others would deep
 * link into the app (or out of it, as other club apps do).
 */
export const ClubFeedScreen = ({ profile, today, focusPostId, backLabel = "Home" }: ClubFeedScreenProps) => {
    const { course } = useCourse();
    const club = profile ?? clubProfileFor(course.id);
    const posts = visibleFeed(club.feed, today);
    const stack = useStack();
    const toast = useToast();
    const navHeight = useNavChromeHeight();
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!focusPostId) return;
        const el = listRef.current?.querySelector<HTMLElement>(`[data-feed-post="${focusPostId}"]`);
        // Screen's scroll area is the card's offsetParent, so offsetTop already includes the nav inset.
        const scroller = el?.closest<HTMLElement>(".overflow-y-auto");
        if (el && scroller) scroller.scrollTop = el.offsetTop - navHeight - 12;
    }, [focusPostId, navHeight]);

    const onCta = (post: FeedPost) => {
        if (post.cta?.href === "/home") stack.popToRoot();
        else toast.show({ title: `Opens ${post.cta?.label ?? post.title}` });
    };

    return (
        <Screen nav={<NavigationBar title="News & updates" backLabel={backLabel} onBack={stack.pop} />}>
            {posts.length ? (
                <div ref={listRef} className="flex flex-col gap-3 px-gutter pt-3">
                    <p className="px-1 text-ios-footnote text-tertiary">From {clubName(club)}</p>
                    {posts.map((p) => (
                        <FeedPostCard key={p.id} post={p} onCta={onCta} focused={p.id === focusPostId} />
                    ))}
                </div>
            ) : (
                <EmptyState icon={Announcement02} title="No news yet" description="Announcements from the club will show up here." />
            )}
        </Screen>
    );
};
