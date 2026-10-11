import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useQueueDetail } from "@/hooks/useQueueDetail";
import { QueueDetailContent } from "@/components/queues/QueueDetailContent";
import { PageContainer, PageHeader } from "@metacentrum/design-system";

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
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">{t("common.loading")}</div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.queueDetail")} />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">
            {t("common.errorLoading")}{" "}
            {error instanceof Error
              ? error.message
              : t("common.unknownError")}
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!data || !data.data) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.queueDetail")} />
        <div className="text-center text-gray-500 py-12">
          {t("queues.queueNotFound")}
        </div>
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
