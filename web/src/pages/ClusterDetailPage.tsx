import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useClusterDetail } from "@/hooks/useClusterDetail";
import { ClusterDetailContent } from "@/components/infrastructure/ClusterDetailContent";
import { PageContainer, PageHeader, EmptyState, ErrorState, LoadingState } from "@metacentrum/design-system";

export function ClusterDetailPage() {
  const { t } = useTranslation();
  const { clusterId } = useParams<{ clusterId: string }>();
  const { data, isLoading, error } = useClusterDetail(clusterId || "");

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.clusterDetail")} />
        <LoadingState label={t("common.loading")} />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.clusterDetail")} />
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

  if (!data || data.type !== "Cluster" || !data.cluster) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.clusterDetail")} />
        <EmptyState title={t("machines.clusterNotFound")} />
      </PageContainer>
    );
  }

  return <ClusterDetailContent cluster={data.cluster as any} />;
}
