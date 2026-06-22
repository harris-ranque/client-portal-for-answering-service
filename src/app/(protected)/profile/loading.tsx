import { LoadingSkeleton } from "@/components/feedback";
import { PageContainer } from "@/components/layout";

export default function ProfileLoading() {
  return (
    <PageContainer>
      <LoadingSkeleton rows={6} />
    </PageContainer>
  );
}
