import type { MouseEvent, ReactNode } from "react";
import { ArrowRight } from "@untitledui/icons";
import { Notice } from "@/components/feedback/notice";
import { courseById, type Course } from "@/data/crane";
import { BUYER, CLUB_SHORT, designById, GOOD_FOR, groupCode, maskCode, money, money0, orderBonus, orderPrice, orderValue, toName, type GiftCardOrder } from "@/data/gift-cards";
import { CourseLogo } from "@/screens/chrome/course-logo";
import { cx } from "@/utils/cx";
import { GiftArtCard, GiftArtThumb } from "./gift-art-card";
import { UpcBarcode } from "./upc-barcode";

/**
 * The gift card purchase emails, laid out like the tf-emails template "Gift Cards › Purchase":
 * a 600px card on a gray page with the club header, a GIFT CARD eyebrow and title, the card and
 * order stamps, then the card (Self) or a "Gift sent" note (Gift), the details table, "Manage gift
 * cards →" and the TenFore footer.
 *
 * - **Self Email** (bought for yourself): the card face with the full code, and the Gift Card ID
 *   right above a scannable UPC-A barcode (no QR in the emails, Nov 25).
 * - **Gift Email** (the buyer's copy of a gift): no code, barcode or QR. The recipient gets their
 *   own email (and, with a phone, a text) with the card.
 */
export interface GiftCardEmailProps {
    order: GiftCardOrder;
    /** "SG-100519". */
    orderNumber: string;
    /** The 12-digit Gift Card ID (also the barcode value). */
    code: string;
    /** "November 25, 2026". */
    purchasedOn: string;
    /** "American Express ···· 3005". */
    paidWith: string;
    /** Who bought it (defaults to the signed-in sample golfer). */
    buyer?: { name: string; firstName: string; email: string };
    /** The club the card is for (defaults to Sagamore Spring). */
    club?: Course;
    /** Where "Manage gift cards →" goes (the Wallet). `onManage` handles the click in-app. */
    manageHref?: string;
    onManage?: () => void;
    /** Classes for the gray page around the card. */
    className?: string;
}

const DetailRow = ({ label, children }: { label: string; children: ReactNode }) => (
    <div className="flex items-start justify-between gap-6 px-5 py-3 text-sm">
        <span className="shrink-0 text-tertiary">{label}</span>
        <span className="min-w-0 text-right text-secondary">{children}</span>
    </div>
);

/** A dashed "stamp" under the title: GIFT CARD ••••••••3352, ORDER #SG-100519. */
const Stamp = ({ label, value }: { label: string; value: string }) => (
    <span className="inline-flex items-center gap-2 rounded-md border border-dashed border-primary px-2.5 py-1.5">
        <span className="caps text-[10px] tracking-[1.5px] text-quaternary">{label}</span>
        <span className="font-mono text-sm font-medium text-primary tabular-nums">{value}</span>
    </span>
);

const EmailShell = ({
    title,
    stampCode,
    orderNumber,
    club,
    body,
    rows,
    manageHref = "/account/wallet",
    onManage,
    className,
}: {
    title: string;
    stampCode: string;
    orderNumber: string;
    club: Course;
    body: ReactNode;
    rows: ReactNode;
    manageHref?: string;
    onManage?: () => void;
    className?: string;
}) => {
    const manage = (e: MouseEvent) => {
        if (!onManage) return;
        e.preventDefault();
        onManage();
    };
    return (
        <div className={cx("bg-tertiary px-4 py-10", className)}>
            <article className="mx-auto w-full max-w-[600px] overflow-hidden rounded-2xl bg-primary shadow-xs ring-1 ring-secondary ring-inset">
                {/* Club header */}
                <header className="flex flex-col items-center gap-1 border-b border-secondary px-8 py-6 text-center">
                    <CourseLogo course={club} size={56} className="mb-2 rounded-lg" />
                    <p className="text-md font-semibold text-primary">{club.name}</p>
                    <p className="text-sm text-tertiary">{club.address}</p>
                </header>

                {/* Eyebrow, title, stamps */}
                <section className="px-6 pt-8 @tablet:px-8">
                    <p className="caps text-brand-secondary">Gift card</p>
                    <h1 className="mt-2 text-display-xs font-semibold tracking-[-0.3px] text-primary">{title}</h1>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Stamp label="Gift card" value={stampCode} />
                        <Stamp label="Order" value={`#${orderNumber}`} />
                    </div>
                </section>

                <section className="flex flex-col gap-4 px-6 pt-7 @tablet:px-8">{body}</section>

                {/* Details */}
                <section className="px-6 pt-8 @tablet:px-8">
                    <h2 className="text-lg font-semibold text-primary">Details</h2>
                    <div className="mt-4 flex flex-col divide-y divide-secondary rounded-xl ring-1 ring-secondary ring-inset">{rows}</div>
                </section>

                {/* Action */}
                <section className="flex flex-col items-center gap-4 px-6 pt-8 pb-8 @tablet:px-8">
                    <a
                        href={manageHref}
                        onClick={manage}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-solid px-5 text-md font-semibold text-white transition duration-100 ease-linear outline-none hover:bg-brand-solid_hover focus-visible:ring-4 focus-visible:ring-brand-300/60"
                    >
                        Manage gift cards <ArrowRight className="size-5" aria-hidden="true" />
                    </a>
                    <p className="text-sm text-tertiary">
                        Need help?{" "}
                        <a href={`mailto:${club.email ?? ""}`} className="font-semibold text-brand-secondary underline underline-offset-2">
                            Contact the pro shop
                        </a>
                        .
                    </p>
                </section>

                {/* TenFore footer */}
                <footer className="flex flex-col items-center gap-5 border-t border-secondary bg-secondary px-6 py-8 text-center @tablet:px-8">
                    <div>
                        <p className="text-sm font-semibold text-primary">{club.name}</p>
                        <p className="mt-1 text-sm text-tertiary">{club.address}</p>
                    </div>
                    <div className="w-12 border-t border-secondary" aria-hidden="true" />
                    <div className="max-w-md">
                        <p className="text-sm font-medium text-secondary">Powered by TenFore Golf.</p>
                        <p className="mt-1 text-sm text-tertiary">The next generation of golf course management. Simple, fast, cloud-based, and fully mobile. Built for golf. Built to last.</p>
                    </div>
                    <div className="flex gap-3">
                        {["Sales Inquiry", "Customer Support"].map((l) => (
                            <a key={l} href="#" onClick={(e) => e.preventDefault()} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-secondary ring-1 ring-primary ring-inset hover:bg-primary_hover">
                                {l}
                            </a>
                        ))}
                    </div>
                    <div className="w-full border-t border-secondary pt-5 text-xs text-quaternary">
                        <p>You're receiving this because you bought a {club.name} gift card.</p>
                        <p className="mt-1">
                            <span className="underline">Terms of Service</span> · <span className="underline">Privacy</span> · <span className="underline">Unsubscribe</span>
                        </p>
                        <p className="mt-1">© 2026 TenFore Technology LLC. All rights reserved.</p>
                    </div>
                </footer>
            </article>
        </div>
    );
};

/** Card value, You paid (deals only); then Design, Expiration, Use for, Purchased, Paid with. */
const valueRows = (o: GiftCardOrder) => (
    <>
        <DetailRow label="Card value">{money(orderValue(o))}</DetailRow>
        {orderBonus(o) > 0 && (
            <DetailRow label="You paid">
                {money(orderPrice(o))} (deal: +{money(orderBonus(o))} bonus)
            </DetailRow>
        )}
    </>
);

const closingRows = (o: GiftCardOrder, purchasedOn: string, paidWith: string) => (
    <>
        <DetailRow label="Design">{designById(o.designId).name}</DetailRow>
        <DetailRow label="Expiration">Doesn't expire</DetailRow>
        <DetailRow label="Use for">{GOOD_FOR}</DetailRow>
        <DetailRow label="Purchased">{purchasedOn}</DetailRow>
        <DetailRow label="Paid with">{paidWith}</DetailRow>
    </>
);

/** "$60 Sagamore Spring gift card", as on the cart line. */
const title = (o: GiftCardOrder) => `${money0(orderValue(o))} ${CLUB_SHORT} gift card`;

/** Self Email: the card for yourself, with the full code, the Gift Card ID and its barcode. */
export const GiftCardSelfEmail = ({ order, orderNumber, code, purchasedOn, paidWith, buyer = BUYER, club = courseById("sagamore-spring"), manageHref, onManage, className }: GiftCardEmailProps) => (
    <EmailShell
        title={`Your gift card is ready, ${buyer.firstName}.`}
        stampCode={code}
        orderNumber={orderNumber}
        club={club}
        manageHref={manageHref}
        onManage={onManage}
        className={className}
        body={
            <>
                <div className="relative mx-auto w-full max-w-[400px]">
                    <GiftArtCard designId={order.designId} value={orderValue(order)} />
                    <span className="absolute right-4 bottom-4 font-mono text-sm font-semibold tracking-wide text-white tabular-nums drop-shadow">{groupCode(code)}</span>
                </div>
                <p className="text-center text-sm text-tertiary">Scan the barcode at the Pro Shop, or enter the code at checkout online. It's also in your wallet.</p>
            </>
        }
        rows={
            <>
                <DetailRow label="Gift Card ID">
                    <span className="font-mono font-medium text-primary tabular-nums">{code}</span>
                </DetailRow>
                {/* Scannable UPC-A (11 digits + check digit), on white in both themes. Barcode only, no QR (Justin, Nov 25). */}
                <div className="flex flex-col items-center gap-3 px-5 py-5">
                    <div className="flex items-center justify-center rounded-lg bg-white px-5 py-4 ring-1 ring-secondary ring-inset">
                        <UpcBarcode value={code} className="text-black" />
                    </div>
                    <p className="text-xs text-tertiary">Scannable barcode for easy redemption</p>
                </div>
                {valueRows(order)}
                {closingRows(order, purchasedOn, paidWith)}
            </>
        }
    />
);

/** Gift Email: the buyer's copy of a gift. "Gift sent", and no code, barcode or QR. */
export const GiftCardGiftEmail = ({ order, orderNumber, code, purchasedOn, paidWith, buyer = BUYER, club = courseById("sagamore-spring"), manageHref, onManage, className }: GiftCardEmailProps) => {
    const name = toName(order);
    const byEmail = order.delivery === "email";
    const phone = byEmail ? order.toPhone.trim() : "";
    return (
        <EmailShell
            title="Your gift card is on its way."
            stampCode={maskCode(code)}
            orderNumber={orderNumber}
            club={club}
            manageHref={manageHref}
            onManage={onManage}
            className={className}
            body={
                <>
                    <div className="flex items-center gap-4 rounded-xl bg-secondary p-3">
                        <GiftArtThumb designId={order.designId} className="w-28 rounded-lg" />
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-primary">{title(order)}</p>
                            <p className="text-sm text-tertiary">{designById(order.designId).name} design</p>
                        </div>
                    </div>
                    <Notice tone="success" title="Gift sent" className="rounded-lg text-sm">
                        {byEmail
                            ? `We sent the ${money(orderValue(order))} gift card to ${name}. They'll get a separate email with the card and its code.`
                            : `We sent you a separate email with the ${money(orderValue(order))} card to print and give to ${name}.`}
                    </Notice>
                </>
            }
            rows={
                <>
                    {valueRows(order)}
                    <DetailRow label="Recipient">{name}</DetailRow>
                    {byEmail ? <DetailRow label="Recipient email">{order.toEmail.trim()}</DetailRow> : <DetailRow label="Delivery">Printable copy, emailed to you</DetailRow>}
                    {phone && <DetailRow label="Recipient phone">{phone}</DetailRow>}
                    {order.message.trim() && <DetailRow label="Message">“{order.message.trim()}”</DetailRow>}
                    <DetailRow label="From">{order.fromName.trim() || buyer.name}</DetailRow>
                    {closingRows(order, purchasedOn, paidWith)}
                </>
            }
        />
    );
};

/** The right purchase email for the order: Self when it's for the buyer, Gift otherwise. */
export const GiftCardEmail = (props: GiftCardEmailProps) => (props.order.recipient === "me" ? <GiftCardSelfEmail {...props} /> : <GiftCardGiftEmail {...props} />);

/** The email's subject line (the email page shows it above the card). */
export const giftCardEmailSubject = (o: GiftCardOrder, buyerFirstName = BUYER.firstName) =>
    o.recipient === "me" ? `Your gift card is ready, ${buyerFirstName}.` : `Your gift card for ${toName(o)} is on its way`;
