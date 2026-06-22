import { ContactAddForm } from "@/features/profile/components/contact-add-form";
import { ContactsList } from "@/features/profile/components/contacts-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProfileContact } from "@/features/profile/types/profile.types";

interface ContactsSectionProps {
  contacts: ProfileContact[];
}

export function ContactsSection({ contacts }: ContactsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contacts</CardTitle>
        <CardDescription>People we should reach for account and service updates.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ContactsList contacts={contacts} />
        <ContactAddForm />
      </CardContent>
    </Card>
  );
}
