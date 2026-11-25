import { Gift01 } from "@untitledui/icons";
import { CLUB_SHORT, designById, money0 } from "@/data/gift-cards";
import { cx } from "@/utils/cx";

/**
 * The gift card face, shared by every surface (builder summary, cart line, checkout, confirmation,
 * emails, wallet, iPhone): a 3:2 card of the chosen art under a dark gradient, with the club name, a
 * "Gift card" pill and the value. `value` 0 hides the amount (nothing chosen yet).
 */
export const GiftArtCard = ({ designId, value, clubName = CLUB_SHORT, className }: { designId: string; value: number; clubName?: string; className?: string }) => {
    const design = designById(designId);
    return (
        <div className={cx("relative isolate aspect-[3/2] w-full overflow-hidden rounded-xl shadow-md ring-1 ring-black/10", className)}>
            <img src={design.art} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
            <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/75 via-black/25 to-black/10" />
            <div className="flex h-full flex-col justify-between p-4 text-white">
                <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold drop-shadow">{clubName}</span>
                    <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold backdrop-blur-sm">
                        <Gift01 className="size-3.5" aria-hidden="true" />
                        Gift card
                    </span>
                </div>
                {value > 0 && <span className="text-display-sm font-bold tracking-tight drop-shadow tabular-nums">{money0(value)}</span>}
            </div>
        </div>
    );
};

/** A small 3:2 thumbnail of a design (cart lines, wallet rows, emails). */
export const GiftArtThumb = ({ designId, className }: { designId: string; className?: string }) => (
    <img src={designById(designId).art} alt="" className={cx("aspect-[3/2] w-16 shrink-0 rounded-md object-cover ring-1 ring-black/10", className)} />
);
