import { useState } from "react";
import { Radio as AriaRadio, RadioGroup as AriaRadioGroup } from "react-aria-components";
import { AlertCircle, CheckCircle, Wallet02 } from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { Card, IconTile } from "@/components/base/card";
import { Screen } from "@/components/device/screen";
import { TextField } from "@/components/forms/text-field";
import { KeyValueRow } from "@/components/lists/list";
import { useStack } from "@/components/prototype/stack-navigator";
import { PAYMENT_CARDS, currency } from "@/data/crane";
import { cx } from "@/utils/cx";
import { ProfileNav } from "./profile-shared";

const DollarPrefix = ({ className }: { className?: string }) => (
    <span className={cx(className, "flex w-auto items-center justify-center text-ios-body text-placeholder")} aria-hidden="true">
        $
    </span>
);

export interface AccountBalanceScreenProps {
    /** Statement balance. 0 (the reference) disables the Pay form. */
    statementBalance?: number;
    /** Today's running balance. */
    todayBalance?: number;
}

/**
 * Account Balance (IMG_2180 / 2181) — balance summary card plus a Pay Balance form.
 * With nothing owed the whole form is shown disabled, like the native app.
 */
export const AccountBalanceScreen = ({ statementBalance = 0, todayBalance = statementBalance }: AccountBalanceScreenProps) => {
    const { pop } = useStack();
    const due = Math.max(statementBalance, todayBalance);
    const noBalance = due <= 0;
    const [amount, setAmount] = useState(noBalance ? "" : due.toFixed(2));
    const [cardId, setCardId] = useState(PAYMENT_CARDS[0]?.id ?? "");
    const [paying, setPaying] = useState(false);

    const amountValue = Number.parseFloat(amount);
    const canPay = !noBalance && amountValue > 0 && !!cardId;
    const labelClass = cx("px-0.5 text-ios-subheadline font-medium", noBalance ? "text-quaternary" : "text-secondary");

    return (
        <Screen nav={<ProfileNav title="Account Balance" />}>
            <div className="flex flex-col gap-4 px-gutter pt-4">
                <Card padding="none">
                    <div className="flex flex-col items-center px-4 pt-6 pb-5">
                        <IconTile icon={Wallet02} shape="circle" size="lg" className="size-16 [&>svg]:size-7" />
                        <div className="mt-3 text-ios-subheadline text-tertiary">Today's Balance</div>
                        <div className="text-[34px] leading-[41px] font-bold tracking-[0.4px] text-fg-brand-secondary tabular-nums">{currency(todayBalance)}</div>
                    </div>
                    <div className="h-px bg-border-secondary" />
                    <div className="px-4 py-2.5">
                        <KeyValueRow label="Statement Balance" value={currency(statementBalance)} className="py-1" />
                        <KeyValueRow label="Today's Balance" value={currency(todayBalance)} className="py-1" />
                    </div>
                </Card>

                <Card padding="md" className="flex flex-col">
                    <h2 className="text-ios-headline text-primary">Pay Balance</h2>

                    <div
                        role="status"
                        className={cx(
                            "mt-3 flex h-[44px] items-center gap-2 rounded-ios-control px-3.5 text-ios-body",
                            noBalance ? "bg-secondary text-tertiary" : "bg-warning-primary text-warning-primary",
                        )}
                    >
                        {noBalance ? <CheckCircle className="size-4 shrink-0" aria-hidden="true" /> : <AlertCircle className="size-4 shrink-0" aria-hidden="true" />}
                        {noBalance ? "No balance due" : `${currency(due)} due`}
                    </div>

                    <span id="pay-amount-label" className={cx(labelClass, "mt-4 mb-1.5")}>
                        Amount
                    </span>
                    <TextField
                        aria-labelledby="pay-amount-label"
                        icon={DollarPrefix}
                        placeholder="0.00"
                        inputMode="decimal"
                        value={amount}
                        onChange={setAmount}
                        isDisabled={noBalance}
                    />

                    <span id="pay-method-label" className={cx(labelClass, "mt-4 mb-1.5")}>
                        Payment Method
                    </span>
                    <AriaRadioGroup aria-labelledby="pay-method-label" value={cardId} onChange={setCardId} isDisabled={noBalance} className="flex flex-col gap-2">
                        {PAYMENT_CARDS.map((card) => (
                            <AriaRadio
                                key={card.id}
                                value={card.id}
                                className="group flex cursor-pointer items-center gap-3 rounded-ios-control bg-secondary px-4 py-3 outline-none ring-1 ring-transparent transition duration-100 ease-linear ring-inset data-[focus-visible]:ring-4 data-[focus-visible]:ring-brand-300/60 data-[selected]:bg-brand-primary_alt data-[selected]:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-primary ring-1 ring-primary group-data-[selected]:ring-2 group-data-[selected]:ring-fg-brand-primary">
                                    <span className="size-3 rounded-full bg-fg-brand-primary opacity-0 group-data-[selected]:opacity-100" />
                                </span>
                                <span className="flex min-w-0 flex-1 flex-col">
                                    <span className="flex items-baseline justify-between gap-2">
                                        <span className="text-ios-headline text-primary uppercase">{card.brand}</span>
                                        <span className="text-ios-subheadline text-tertiary tabular-nums">•••• {card.last4}</span>
                                    </span>
                                    <span className="text-ios-subheadline text-secondary">{card.name}</span>
                                    <span className="text-ios-footnote text-tertiary">
                                        Exp {card.exp} &nbsp;·&nbsp; ZIP {card.zip}
                                    </span>
                                </span>
                            </AriaRadio>
                        ))}
                    </AriaRadioGroup>

                    <Button
                        fullWidth
                        color={canPay ? "filled" : "gray"}
                        className="mt-6"
                        isDisabled={!canPay}
                        isLoading={paying}
                        onPress={() => {
                            setPaying(true);
                            window.setTimeout(() => {
                                setPaying(false);
                                pop();
                            }, 900);
                        }}
                    >
                        {canPay ? `Pay ${currency(amountValue)}` : "Pay"}
                    </Button>
                </Card>
            </div>
        </Screen>
    );
};
