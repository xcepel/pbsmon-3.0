import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useMachineDetail } from "@/hooks/useMachineDetail";
import { MachineDetailContent } from "@/components/infrastructure/MachineDetailContent";
import type { InfrastructureDetailDTO } from "@/lib/generated-api";
import { PageContainer, PageHeader } from "@metacentrum/design-system";

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
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">{t("common.loading")}</div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.machineDetail")} />
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

  if (!data || data.type !== "Node" || !data.node) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.machineDetail")} />
        <div className="text-center text-gray-500 py-12">
          {t("machines.nodeNotFound")}
        </div>
      </PageContainer>
    );
  }

  // Extract node from InfrastructureDetailDTO
  // The generated type uses Record<string, any> for nested types,
  // so we assert the type based on the API response structure
  const node = data.node as NonNullable<InfrastructureDetailDTO["node"]>;

  return <MachineDetailContent node={node} />;
}
