import { useTranslation } from "react-i18next";
import { QsubForm } from "@/components/qsub/QsubForm";
import { QsubResults } from "@/components/qsub/QsubResults";
import { useQsubPreview } from "@/hooks/useQsubPreview";
import { PageContainer, PageHeader, LoadingState, ErrorState } from "@metacentrum/design-system";

export function QsubAssemblerPage() {
  const { t } = useTranslation();
  const previewMutation = useQsubPreview();

  const handleSubmit = (values: any) => {
    previewMutation.mutate(values);
  };

  return (
    <PageContainer>
      <PageHeader title={t("pages.qsubAssembler")} />
      <div className="space-y-4 sm:space-y-6">
        <QsubForm onSubmit={handleSubmit} />

        {previewMutation.isPending && (
          <LoadingState label="Loading results..." />
        )}

        {previewMutation.isError && (
          <ErrorState
            title="Error"
            description={previewMutation.error?.message || "Unknown error"}
          />
        )}

        {previewMutation.isSuccess && previewMutation.data && (
          <QsubResults
            qsubCommand={previewMutation.data.qsubCommand}
            qsubScript={previewMutation.data.qsubScript}
            qualifiedNodes={previewMutation.data.qualifiedNodes as any}
            totalCount={previewMutation.data.totalCount}
            immediatelyAvailableCount={
              previewMutation.data.immediatelyAvailableCount
            }
          />
        )}
      </div>
    </PageContainer>
  );
}
