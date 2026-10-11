import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useQueueDetail } from "@/hooks/useQueueDetail";
import { QueueDetailContent } from "@/components/queues/QueueDetailContent";
import { PageContainer, PageHeader, EmptyState, ErrorState, LoadingState } from "@metacentrum/design-system";

export function QueueDetailPage() {
  const { t } = useTranslation();
  const { queueId } = useParams<{ queueId: string }>();
  const { data, isLoading, error } = useQueueDetail(queueId || "");

  // Set browser tab title to queue
  useEffect(() => {
    if (queueId) {
      document.title = queueId;
    }

    return () => {
      document.title = 'MetaCentrum';
    };
  }, [queueId]);

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.queueDetail")} />
        <LoadingState label={t("common.loading")} />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.queueDetail")} />
        <ErrorState
          title={t("common.errorLoading")}
          description={
            error instanceof Error
              ? error.message
              : t("common.unknownError")
          }
        />
      </PageContainer>
    );
  }

  if (!data || !data.data) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.queueDetail")} />
        <EmptyState title={t("queues.queueNotFound")} />
      </PageContainer>
    );
  }

  const queueDisplayName = data.data.server
    ? `${data.data.name}@${data.data.server}.metacentrum.cz`
    : data.data.name;

  return (
    <PageContainer>
      <PageHeader title={`${t("pages.queueDetail")}: ${queueDisplayName}`} />
      <QueueDetailContent queue={data.data} queueId={queueId || ""} />
    </PageContainer>
  );
}
