import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useClusterDetail } from "@/hooks/useClusterDetail";
import { ClusterDetailContent } from "@/components/infrastructure/ClusterDetailContent";
import { PageContainer, PageHeader } from "@metacentrum/design-system";

export function ClusterDetailPage() {
  const { t } = useTranslation();
  const { clusterId } = useParams<{ clusterId: string }>();
  const { data, isLoading, error } = useClusterDetail(clusterId || "");

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.clusterDetail")} />
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">{t("common.loading")}</div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.clusterDetail")} />
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

  if (!data || data.type !== "Cluster" || !data.cluster) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.clusterDetail")} />
        <div className="text-center text-gray-500 py-12">
          {t("machines.clusterNotFound")}
        </div>
      </PageContainer>
    );
  }

  return <ClusterDetailContent cluster={data.cluster as any} />;
}
