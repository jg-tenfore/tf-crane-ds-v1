import { useState } from "react";
import { Mail01, Phone, User01 } from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { Screen } from "@/components/device/screen";
import { TextField } from "@/components/forms/text-field";
import { useStack } from "@/components/prototype/stack-navigator";
import { USER } from "@/data/crane";
import { ProfileNav } from "./profile-shared";

type ProfileForm = { firstName: string; lastName: string; email: string; phone: string };

const initialForm = (): ProfileForm => ({ firstName: USER.firstName, lastName: USER.lastName, email: USER.email, phone: USER.phone });

/** Edit Profile (IMG_2179) — "Save Changes" stays disabled until a field changes. */
export const EditProfileScreen = () => {
    const { pop } = useStack();
    const [saved, setSaved] = useState<ProfileForm>(initialForm);
    const [form, setForm] = useState<ProfileForm>(initialForm);
    const [saving, setSaving] = useState(false);

    const dirty = (Object.keys(form) as (keyof ProfileForm)[]).some((k) => form[k] !== saved[k]);
    const set = (key: keyof ProfileForm) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

    const save = () => {
        setSaving(true);
        window.setTimeout(() => {
            setSaved(form);
            setSaving(false);
            pop();
        }, 700);
    };

    return (
        <Screen nav={<ProfileNav title="Edit Profile" />}>
            <form
                className="flex flex-col gap-4 px-gutter pt-3"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (dirty) save();
                }}
            >
                <TextField label="First Name" icon={User01} value={form.firstName} onChange={set("firstName")} autoComplete="given-name" />
                <TextField label="Last Name" icon={User01} value={form.lastName} onChange={set("lastName")} autoComplete="family-name" />
                <TextField label="Email" type="email" icon={Mail01} value={form.email} onChange={set("email")} autoComplete="email" />
                <TextField label="Phone (Optional)" type="tel" icon={Phone} value={form.phone} onChange={set("phone")} autoComplete="tel" />

                <Button type="submit" fullWidth className="mt-6" isDisabled={!dirty} isLoading={saving}>
                    Save Changes
                </Button>
            </form>
        </Screen>
    );
};
