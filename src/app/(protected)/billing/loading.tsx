import { LoadingSkeleton } from "@/components/feedback";
import { PageContainer } from "@/components/layout";

export default function BillingLoading() {
  return (
    <PageContainer>
      <LoadingSkeleton rows={8} />
    </PageContainer>
  );
}
