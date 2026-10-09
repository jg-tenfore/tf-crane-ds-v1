import { useState } from "react";
import { Button } from "@/components/base/button";
import { Screen } from "@/components/device/screen";
import { FieldCell, FieldGroup, FieldRow } from "@/components/forms/field-group";
import { useStack } from "@/components/prototype/stack-navigator";
import { courseById } from "@/data/crane";
import { ProfileNav } from "./profile-shared";

export interface AddPaymentMethodScreenProps {
    /** The course whose processor stores the card (cards are tokenised per course). */
    courseName?: string;
    processorVersion?: string;
}

/** Add Payment Method (IMG_2183) — CardConnect hosted card entry for one course. */
export const AddPaymentMethodScreen = ({ courseName = courseById("mount-hood").name, processorVersion = "V3-12" }: AddPaymentMethodScreenProps) => {
    const { pop } = useStack();
    const [submitting, setSubmitting] = useState(false);

    return (
        <Screen nav={<ProfileNav title="Add Payment Method" backIconOnly />}>
            <div className="border-b border-secondary bg-primary px-gutter py-2.5 text-center text-ios-body text-primary">{courseName}</div>

            <form
                className="px-gutter"
                onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitting(true);
                    window.setTimeout(() => {
                        setSubmitting(false);
                        pop();
                    }, 900);
                }}
            >
                <p className="pt-3 pb-2 text-right text-ios-caption1 font-medium tracking-[0.06em] text-tertiary uppercase">
                    Powered by CardConnect · {processorVersion}
                </p>

                <FieldGroup>
                    <FieldCell label="Name on Card" placeholder="Name on Card" autoComplete="cc-name" />
                    <FieldCell label="Card Number" placeholder="Card Number" inputMode="numeric" autoComplete="cc-number" />
                    <FieldRow>
                        <FieldCell label="Expiration" placeholder="MM/YY" inputMode="numeric" autoComplete="cc-exp" />
                        <FieldCell label="CVV" placeholder="CVV" inputMode="numeric" autoComplete="cc-csc" />
                    </FieldRow>
                    <FieldCell label="ZIP" placeholder="ZIP" inputMode="numeric" autoComplete="postal-code" />
                </FieldGroup>

                <Button type="submit" fullWidth size="md" className="mt-8" isLoading={submitting}>
                    Submit
                </Button>
            </form>
        </Screen>
    );
};
