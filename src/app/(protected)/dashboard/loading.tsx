import { LoadingSkeleton } from "@/components/feedback";
import { PageContainer } from "@/components/layout";

export default function DashboardLoading() {
  return (
    <PageContainer>
      <LoadingSkeleton rows={10} />
    </PageContainer>
  );
}
