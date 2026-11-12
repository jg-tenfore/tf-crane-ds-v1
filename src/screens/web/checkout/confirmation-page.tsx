import { ArrowRight, Building07, CheckCircle, Download01, LifeBuoy01, Phone, RefreshCcw01, Truck01 } from "@untitledui/icons";
import type { ReactNode } from "react";
import { cx } from "@/utils/cx";
import { StatusBadge } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { WebPage } from "@/components/web/web-layout";
import { useWebFrame } from "@/components/web/web-frame";
import { useWebRouter } from "@/components/web/web-router";
import { USER } from "@/data/crane";
import { useWebSession, WebShell } from "../web-shell";
import { ARRIVAL, itemsLabel, money, ORDER_DATE, paymentLabel, PICKUP } from "./checkout-data";
import { BrandChip, OrderLines, TotalsBlock } from "./checkout-ui";
import { orderById } from "./orders";

export interface ConfirmationPageProps {
    orderId: string;
}

const Section = ({ title, right, children, className }: { title: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) => (
    <section className={cx("border-t border-secondary px-5 py-7 @tablet:px-8", className)}>
        <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-primary">{title}</h2>
            {right}
        </div>
        <div className="mt-4">{children}</div>
    </section>
);

const Label = ({ children }: { children: ReactNode }) => <p className="caps text-quaternary">{children}</p>;

/**
 * Confirmation — Fox "Shop Checkout / 4. Confirmation - Purchase" as a Crane Web receipt:
 * order number, items, delivery or pickup, payment details with the destination tax line,
 * returns and help. Shipped and pickup (pro shop / snack bar) variants.
 */
export const ConfirmationPage = ({ orderId }: ConfirmationPageProps) => {
    const order = orderById(orderId);
    const { course } = useWebSession();
    const { navigate } = useWebRouter();
    const { scrollToTop } = useWebFrame();
    const ship = order.fulfillment === "ship";
    const food = order.kind === "food";
    const pickup = PICKUP[food ? "food" : "retail"];
    const t = order.totals;

    const go = (path: string) => {
        navigate(path);
        scrollToTop();
    };

    return (
        <WebShell active="shop">
            <WebPage width="content">
                <div className="mx-auto max-w-[720px] overflow-hidden rounded-2xl bg-primary ring-1 ring-secondary ring-inset">
                    {/* Hero */}
                    <div className="flex flex-col items-center px-5 pt-9 pb-8 text-center @tablet:px-8">
                        <span className="flex size-14 items-center justify-center rounded-full bg-success-secondary ring-8 ring-bg-success-primary">
                            <CheckCircle className="size-7 text-fg-success-primary" aria-hidden="true" />
                        </span>
                        <p className="caps mt-6 text-brand-secondary">Order confirmed</p>
                        <p className="mt-1 text-md font-semibold text-tertiary tabular-nums">#{order.id}</p>
                        <h1 className="mt-3 text-display-xs font-bold tracking-[-0.3px] text-primary @tablet:text-display-sm">Thank you, {USER.firstName}!</h1>
                        <p className="mt-2 max-w-md text-md text-tertiary">
                            {ship
                                ? "Your Pro Shop order is confirmed. We'll email tracking when it ships."
                                : food
                                  ? "Your Snack Bar order is in. We'll text you when it's ready at the clubhouse window."
                                  : "Your Pro Shop order is confirmed. We'll text you when it's ready to pick up."}
                        </p>
                        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary">
                            {ship ? <Truck01 className="size-4 text-fg-quaternary" aria-hidden="true" /> : <Building07 className="size-4 text-fg-quaternary" aria-hidden="true" />}
                            {ship ? `Estimated arrival ${ARRIVAL}` : `${pickup.ready} · ${course.shortName} ${pickup.place}`}
                        </p>
                    </div>

                    <Section
                        title={
                            <>
                                Items <span className="text-tertiary">({t.count})</span>
                            </>
                        }
                        right={<StatusBadge tone={order.plan === "installments" ? "warning" : "success"} className="text-sm">{order.plan === "installments" ? "Plan started" : "Paid"}</StatusBadge>}
                    >
                        <OrderLines lines={order.lines} />
                    </Section>

                    <Section title={ship ? "Delivery" : "Pickup"}>
                        <div className="grid grid-cols-1 gap-5 @tablet:grid-cols-2">
                            {ship && order.address ? (
                                <div>
                                    <Label>Ship to</Label>
                                    <p className="mt-1.5 text-md font-medium text-primary">{order.address.name}</p>
                                    {order.address.company && <p className="text-sm text-tertiary">{order.address.company}</p>}
                                    <p className="text-sm text-tertiary">
                                        {order.address.street}
                                        {order.address.apt ? `, ${order.address.apt}` : ""}
                                    </p>
                                    <p className="text-sm text-tertiary">
                                        {order.address.city}, {order.address.state} {order.address.zip}, US
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <Label>Pick up at</Label>
                                    <p className="mt-1.5 text-md font-medium text-primary">
                                        {course.name} · {pickup.place}
                                    </p>
                                    <p className="text-sm text-tertiary">{course.address}</p>
                                    <p className="text-sm text-tertiary">{pickup.hours}</p>
                                </div>
                            )}
                            <div>
                                <Label>{ship ? "Method" : "When"}</Label>
                                <p className="mt-1.5 text-md font-medium text-primary">{ship ? "Ground Shipping" : pickup.ready}</p>
                                <p className="text-sm text-tertiary">{ship ? "4 to 7 business days" : `We'll text ${USER.phone}`}</p>
                                <p className="text-sm text-tertiary">{ship ? `Arrives ${ARRIVAL}` : "Bring your order number or show this page"}</p>
                            </div>
                        </div>
                    </Section>

                    <Section title="Payment details">
                        <TotalsBlock totals={t} totalLabel={order.plan === "installments" ? "Order total" : "Total charged"} pickupLabel={ship ? undefined : `Pickup · ${pickup.place}`} />
                        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-secondary px-4 py-3">
                            <span className="flex min-w-0 items-center gap-2.5 text-sm text-secondary">
                                <BrandChip brand={order.payment.brand} />
                                <span className="truncate">{paymentLabel(order.payment)}</span>
                            </span>
                            <span className="shrink-0 text-sm font-semibold text-primary tabular-nums">
                                {order.plan === "installments" ? `${money(t.total / 4)} today` : money(t.total)}
                            </span>
                        </div>
                        <p className="mt-3 text-sm text-tertiary">
                            Paid online on {ORDER_DATE}
                            {order.promo ? ` · ${order.promo} applied` : ""} · {itemsLabel(t.count)}
                        </p>
                        <Button size="lg" color="outline" fullWidth iconLeading={Download01} className="mt-6 h-12 rounded-lg text-md">
                            Download PDF receipt
                        </Button>
                    </Section>

                    {!food && (
                        <Section title="Returns & exchanges">
                            <p className="text-md leading-relaxed text-tertiary">
                                Unworn items with tags can be returned within 30 days for a full refund. Custom-fit and personalized items are final sale. Bring your receipt to the Pro Shop or
                                start a return online.
                            </p>
                            <div className="mt-5 grid grid-cols-1 gap-3 @tablet:grid-cols-2">
                                {ship && (
                                    <Button size="lg" color="outline" iconLeading={Truck01} className="h-12 rounded-lg text-md">
                                        Track order
                                    </Button>
                                )}
                                <Button size="lg" color="outline" iconLeading={RefreshCcw01} className={cx("h-12 rounded-lg text-md", !ship && "@tablet:col-span-2")}>
                                    Start a return
                                </Button>
                            </div>
                        </Section>
                    )}

                    <Section title="Where to find help">
                        <div className="flex flex-col gap-5">
                            <div className="flex gap-3">
                                <Phone className="mt-0.5 size-5 shrink-0 text-fg-brand-primary" aria-hidden="true" />
                                <div>
                                    <p className="text-md font-semibold text-primary">Questions about your order</p>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Contact the {course.name} {food ? "Snack Bar" : "Pro Shop"} at{" "}
                                        <a href={`tel:${course.phone ?? ""}`} className="font-medium text-brand-secondary hover:underline">
                                            {course.phone}
                                        </a>
                                        {course.email && (
                                            <>
                                                {" "}
                                                or{" "}
                                                <a href={`mailto:${course.email}`} className="font-medium text-brand-secondary hover:underline">
                                                    {course.email}
                                                </a>
                                            </>
                                        )}
                                        .
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <LifeBuoy01 className="mt-0.5 size-5 shrink-0 text-fg-brand-primary" aria-hidden="true" />
                                <div>
                                    <p className="text-md font-semibold text-primary">Help with this receipt or your account</p>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Reach TenFore support 24/7 —{" "}
                                        <a href="#" onClick={(e) => e.preventDefault()} className="font-medium text-brand-secondary hover:underline">
                                            get support
                                        </a>
                                        .
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Section>

                    <div className="border-t border-secondary px-5 py-6 @tablet:px-8">
                        <Button size="lg" fullWidth iconTrailing={ArrowRight} onPress={() => go("/shop")} className="caps h-14 rounded-lg text-[13px]">
                            Continue shopping
                        </Button>
                    </div>
                </div>
            </WebPage>
        </WebShell>
    );
};
