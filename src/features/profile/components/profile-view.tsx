import { AccountProfileForm } from "@/features/profile/components/account-profile-form";
import { CompanyProfileForm } from "@/features/profile/components/company-profile-form";
import { ContactsSection } from "@/features/profile/components/contacts-section";
import type { ProfileData } from "@/features/profile/types/profile.types";
import { PageContainer, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileViewProps {
  data: ProfileData;
}

export function ProfileView({ data }: ProfileViewProps) {
  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your account, company details, and contacts."
      />

      <AccountProfileForm user={data.user} />

      {data.company ? (
        <>
          <CompanyProfileForm company={data.company} />
          <ContactsSection contacts={data.contacts} />
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No company assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your account is not linked to a company yet. Company profile and contact management
              will be available once membership is assigned.
            </p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
