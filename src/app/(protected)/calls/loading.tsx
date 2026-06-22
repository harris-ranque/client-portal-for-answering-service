import { LoadingSkeleton } from "@/components/feedback";
import { PageContainer } from "@/components/layout";

export default function CallsLoading() {
  return (
    <PageContainer>
      <LoadingSkeleton rows={10} />
    </PageContainer>
  );
}
