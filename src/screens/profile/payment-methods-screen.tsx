import { useState } from "react";
import { Button as AriaButton } from "react-aria-components";
import { CreditCard02, Plus, Trash01 } from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { Card, IconTile } from "@/components/base/card";
import { GlassIconButton } from "@/components/base/glass-button";
import { Screen } from "@/components/device/screen";
import { AlertDialog } from "@/components/feedback/alert-dialog";
import { EmptyState } from "@/components/feedback/empty-state";
import { useStack } from "@/components/prototype/stack-navigator";
import { PAYMENT_CARDS, type PaymentCard } from "@/data/crane";
import { ProfileNav } from "./profile-shared";

export interface PaymentMethodsScreenProps {
    cards?: PaymentCard[];
}

/** Payment Methods (IMG_2182) — saved cards with a trash button; "+" adds a card. */
export const PaymentMethodsScreen = ({ cards: initialCards = PAYMENT_CARDS }: PaymentMethodsScreenProps) => {
    const { push } = useStack();
    const [cards, setCards] = useState(initialCards);
    const [removing, setRemoving] = useState<PaymentCard | null>(null);

    return (
        <Screen nav={<ProfileNav title="Payment Methods" trailing={<GlassIconButton icon={Plus} aria-label="Add payment method" onPress={() => push("add-payment-method")} />} />}>
            {cards.length === 0 ? (
                <EmptyState
                    icon={CreditCard02}
                    title="No payment methods"
                    description="Add a card to pay for tee times and balances."
                    action={
                        <Button size="md" iconLeading={Plus} onPress={() => push("add-payment-method")}>
                            Add a Card
                        </Button>
                    }
                />
            ) : (
                <div className="flex flex-col gap-3 px-gutter pt-4">
                    {cards.map((card) => (
                        <Card key={card.id} padding="none" className="flex items-center gap-3.5 py-3 pr-2 pl-4">
                            <IconTile icon={CreditCard02} className="size-12 [&>svg]:size-6" />
                            <div className="min-w-0 flex-1">
                                <div className="text-ios-headline text-primary">{card.brand}</div>
                                <div className="text-ios-subheadline text-secondary tabular-nums">•••• {card.last4}</div>
                                <div className="text-ios-footnote text-tertiary">Expires {card.exp}</div>
                                <div className="truncate text-ios-footnote text-tertiary">
                                    {card.name} · ZIP {card.zip}
                                </div>
                            </div>
                            <AriaButton
                                aria-label={`Remove ${card.brand} ending in ${card.last4}`}
                                onPress={() => setRemoving(card)}
                                className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-fg-error-secondary outline-none transition duration-100 ease-linear data-[focus-visible]:ring-4 data-[focus-visible]:ring-brand-300/60 data-[pressed]:bg-error-primary"
                            >
                                <Trash01 className="size-5" aria-hidden="true" />
                            </AriaButton>
                        </Card>
                    ))}
                    <p className="mt-2 text-center text-ios-subheadline text-quaternary">Use the trash icon to remove a card.</p>
                </div>
            )}

            <AlertDialog
                isOpen={!!removing}
                onOpenChange={(open) => !open && setRemoving(null)}
                title="Remove Card"
                message={removing ? `Remove ${removing.brand} ending in ${removing.last4} from your account?` : undefined}
                actions={[
                    { label: "Cancel", style: "cancel" },
                    { label: "Remove", style: "destructive", onPress: () => removing && setCards((cs) => cs.filter((c) => c.id !== removing.id)) },
                ]}
            />
        </Screen>
    );
};
