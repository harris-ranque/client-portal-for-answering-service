import { Building2, Mail, MapPin, Phone } from "lucide-react";

import type {
  DashboardCompany,
  DashboardOnboarding,
} from "@/features/dashboard/types/dashboard.types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardCompanyCardProps {
  company: DashboardCompany;
  onboarding: DashboardOnboarding | null;
}

export function DashboardCompanyCard({ company, onboarding }: DashboardCompanyCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="size-4" />
          Company
        </CardTitle>
        <CardDescription>Your organization details on file.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <p className="font-medium">{company.name}</p>
          {onboarding ? (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-muted-foreground">Onboarding:</span>
              <Badge variant="secondary" className="capitalize">
                {onboarding.status.replace(/_/g, " ")}
              </Badge>
            </div>
          ) : null}
        </div>

        {company.email ? (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Mail className="size-4 shrink-0" />
            {company.email}
          </p>
        ) : null}
        {company.phone ? (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Phone className="size-4 shrink-0" />
            {company.phone}
          </p>
        ) : null}
        {company.address ? (
          <p className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            {company.address}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
