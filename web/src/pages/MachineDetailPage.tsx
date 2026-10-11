import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useMachineDetail } from "@/hooks/useMachineDetail";
import { MachineDetailContent } from "@/components/infrastructure/MachineDetailContent";
import type { InfrastructureDetailDTO } from "@/lib/generated-api";
import { PageContainer, PageHeader, EmptyState, ErrorState, LoadingState } from "@metacentrum/design-system";

export function MachineDetailPage() {
  const { t } = useTranslation();
  const { machineId } = useParams<{ machineId: string }>();
  const { data, isLoading, error } = useMachineDetail(machineId || "");

  // Set browser tab title to node name
  useEffect(() => {
    if (data && data.node) {
      const nodeName = node.pbs ? node.pbs.name : node.name;
      document.title = nodeName;
    }

    return () => {
      document.title = 'MetaCentrum';
    };
  }, [data]);

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.machineDetail")} />
        <LoadingState label={t("common.loading")} />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.machineDetail")} />
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

  if (!data || data.type !== "Node" || !data.node) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.machineDetail")} />
        <EmptyState title={t("machines.nodeNotFound")} />
      </PageContainer>
    );
  }

  // Extract node from InfrastructureDetailDTO
  // The generated type uses Record<string, any> for nested types,
  // so we assert the type based on the API response structure
  const node = data.node as NonNullable<InfrastructureDetailDTO["node"]>;

  return <MachineDetailContent node={node} />;
}
