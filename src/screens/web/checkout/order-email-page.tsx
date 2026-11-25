import { ArrowLeft, Mail01 } from "@untitledui/icons";
import { GiftCardEmail, giftCardEmailSubject } from "@/components/gift-cards/gift-card-email";
import { useWebFrame } from "@/components/web/web-frame";
import { WebPage } from "@/components/web/web-layout";
import { useWebRouter, WebLink } from "@/components/web/web-router";
import { BUYER } from "@/data/gift-cards";
import { cx } from "@/utils/cx";
import { useWebSession, WebShell } from "../web-shell";
import { GIFT_ORDER_DATE, giftOrdersIn, paymentLabel } from "./checkout-data";
import { focusRing } from "./checkout-ui";
import { giftCardIdAt, orderById } from "./orders";

export interface OrderEmailPageProps {
    orderId: string;
}

/**
 * `/order/<id>/email` — the purchase email for a gift card order, opened from "View the email" on
 * the confirmation (deep-linkable, so a reviewer can share it). Self Email for a card bought for
 * yourself, Gift Email for a gift. Shown as the inbox would: who it's from, to and the subject,
 * above the email itself. "Manage gift cards →" opens the Wallet.
 */
export const OrderEmailPage = ({ orderId }: OrderEmailPageProps) => {
    const order = orderById(orderId);
    const { course } = useWebSession();
    const { navigate } = useWebRouter();
    const { scrollToTop } = useWebFrame();
    const gift = order.kind === "gift-card" ? giftOrdersIn(order.lines)[0]?.order : undefined;
    const wallet = `/account/wallet?bought=${order.id}`;

    const back = (
        <WebLink href={`/order/${order.id}`} className={cx("inline-flex items-center gap-1.5 rounded text-sm font-semibold text-brand-secondary hover:underline", focusRing)}>
            <ArrowLeft className="size-4" aria-hidden="true" /> Back to order #{order.id}
        </WebLink>
    );

    // Only gift card orders have a purchase email designed so far.
    if (!gift) {
        return (
            <WebShell active="shop">
                <WebPage width="content">
                    {back}
                    <p className="mt-6 text-md text-tertiary">The email for order #{order.id} is a shop receipt. Only gift card purchase emails are designed so far.</p>
                </WebPage>
            </WebShell>
        );
    }

    return (
        <div className="min-h-full bg-tertiary">
            <div className="mx-auto flex w-full max-w-[632px] flex-col gap-3 px-4 pt-6">
                {back}
                <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 rounded-xl bg-primary px-4 py-3 text-sm ring-1 ring-secondary ring-inset">
                    <dt className="text-quaternary">From</dt>
                    <dd className="truncate text-secondary">
                        {course.name} <span className="text-tertiary">&lt;{course.email ?? "proshop@tenfore.golf"}&gt;</span>
                    </dd>
                    <dt className="text-quaternary">To</dt>
                    <dd className="truncate text-secondary">{BUYER.email}</dd>
                    <dt className="text-quaternary">Subject</dt>
                    <dd className="flex min-w-0 items-center gap-1.5 font-semibold text-primary">
                        <Mail01 className="size-4 shrink-0 text-fg-quaternary" aria-hidden="true" />
                        <span className="truncate">{giftCardEmailSubject(gift)}</span>
                    </dd>
                </dl>
            </div>
            <GiftCardEmail
                order={gift}
                orderNumber={order.id}
                code={giftCardIdAt(0)}
                purchasedOn={GIFT_ORDER_DATE}
                paidWith={paymentLabel(order.payment)}
                club={course}
                manageHref={wallet}
                onManage={() => {
                    navigate(wallet);
                    scrollToTop();
                }}
                className="pt-4 pb-16"
            />
        </div>
    );
};
