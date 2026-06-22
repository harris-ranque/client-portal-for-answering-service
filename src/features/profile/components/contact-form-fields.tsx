import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ProfileContact } from "@/features/profile/types/profile.types";

interface ContactFormFieldsProps {
  contact?: ProfileContact;
  fieldErrors?: Record<string, string[] | undefined>;
  idPrefix?: string;
}

export function ContactFormFields({
  contact,
  fieldErrors,
  idPrefix = "contact",
}: ContactFormFieldsProps) {
  return (
    <FieldGroup>
      <Field data-invalid={Boolean(fieldErrors?.name)}>
        <FieldLabel htmlFor={`${idPrefix}-name`}>Name</FieldLabel>
        <Input
          id={`${idPrefix}-name`}
          name="name"
          defaultValue={contact?.name ?? ""}
          required
          aria-invalid={Boolean(fieldErrors?.name)}
        />
        <FieldError errors={fieldErrors?.name?.map((message) => ({ message }))} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={Boolean(fieldErrors?.email)}>
          <FieldLabel htmlFor={`${idPrefix}-email`}>Email</FieldLabel>
          <Input
            id={`${idPrefix}-email`}
            name="email"
            type="email"
            defaultValue={contact?.email ?? ""}
            aria-invalid={Boolean(fieldErrors?.email)}
          />
          <FieldError errors={fieldErrors?.email?.map((message) => ({ message }))} />
        </Field>

        <Field data-invalid={Boolean(fieldErrors?.phone)}>
          <FieldLabel htmlFor={`${idPrefix}-phone`}>Phone</FieldLabel>
          <Input
            id={`${idPrefix}-phone`}
            name="phone"
            type="tel"
            defaultValue={contact?.phone ?? ""}
            aria-invalid={Boolean(fieldErrors?.phone)}
          />
          <FieldError errors={fieldErrors?.phone?.map((message) => ({ message }))} />
        </Field>
      </div>

      <Field data-invalid={Boolean(fieldErrors?.title)}>
        <FieldLabel htmlFor={`${idPrefix}-title`}>Title</FieldLabel>
        <Input
          id={`${idPrefix}-title`}
          name="title"
          defaultValue={contact?.title ?? ""}
          aria-invalid={Boolean(fieldErrors?.title)}
        />
        <FieldError errors={fieldErrors?.title?.map((message) => ({ message }))} />
      </Field>

      <Field orientation="horizontal">
        <input
          id={`${idPrefix}-isPrimary`}
          name="isPrimary"
          type="checkbox"
          defaultChecked={contact?.is_primary ?? false}
          className="size-4 rounded border border-input"
        />
        <FieldLabel htmlFor={`${idPrefix}-isPrimary`} className="font-normal">
          Primary contact
        </FieldLabel>
      </Field>
    </FieldGroup>
  );
}
