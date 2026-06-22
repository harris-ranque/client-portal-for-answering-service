"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { updateCompanyProfileAction } from "@/features/profile/actions/update-company-profile";
import type { ProfileActionState } from "@/features/profile/lib/action-helpers";
import type { ProfileCompany } from "@/features/profile/types/profile.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const initialState: ProfileActionState = {};

interface CompanyProfileFormProps {
  company: ProfileCompany;
}

export function CompanyProfileForm({ company }: CompanyProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateCompanyProfileAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("Company profile updated.");
    }
  }, [state.success]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company profile</CardTitle>
        <CardDescription>Business details used for your answering service account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <FieldGroup>
            <Field data-invalid={Boolean(state.fieldErrors?.name)}>
              <FieldLabel htmlFor="name">Business name</FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={company.name}
                required
                aria-invalid={Boolean(state.fieldErrors?.name)}
              />
              <FieldError errors={state.fieldErrors?.name?.map((message) => ({ message }))} />
            </Field>

            <Field data-invalid={Boolean(state.fieldErrors?.email)}>
              <FieldLabel htmlFor="companyEmail">Email</FieldLabel>
              <Input
                id="companyEmail"
                name="email"
                type="email"
                defaultValue={company.email ?? ""}
                aria-invalid={Boolean(state.fieldErrors?.email)}
              />
              <FieldError errors={state.fieldErrors?.email?.map((message) => ({ message }))} />
            </Field>

            <Field data-invalid={Boolean(state.fieldErrors?.phone)}>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={company.phone ?? ""}
                aria-invalid={Boolean(state.fieldErrors?.phone)}
              />
              <FieldError errors={state.fieldErrors?.phone?.map((message) => ({ message }))} />
            </Field>

            <Field data-invalid={Boolean(state.fieldErrors?.address)}>
              <FieldLabel htmlFor="address">Address</FieldLabel>
              <textarea
                id="address"
                name="address"
                rows={3}
                defaultValue={company.address ?? ""}
                aria-invalid={Boolean(state.fieldErrors?.address)}
                className={cn(
                  "w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
                )}
              />
              <FieldError errors={state.fieldErrors?.address?.map((message) => ({ message }))} />
            </Field>
          </FieldGroup>

          {state.error ? (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}

          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save company profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
