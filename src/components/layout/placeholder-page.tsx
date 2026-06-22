import { PageContainer, PageHeader } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PlaceholderPageProps {
  title: string;
  description: string;
  milestone: string;
}

export function PlaceholderPage({ title, description, milestone }: PlaceholderPageProps) {
  return (
    <PageContainer>
      <PageHeader title={title} description={description} />
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>This section will be implemented in {milestone}.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Navigation and layout are ready. Feature functionality is up next.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
