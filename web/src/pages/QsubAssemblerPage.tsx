import { useTranslation } from "react-i18next";
import { QsubForm } from "@/components/qsub/QsubForm";
import { QsubResults } from "@/components/qsub/QsubResults";
import { useQsubPreview } from "@/hooks/useQsubPreview";
import { PageContainer, PageHeader } from "@metacentrum/design-system";

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
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">Loading results...</div>
          </div>
        )}

        {previewMutation.isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">
              Error: {previewMutation.error?.message || "Unknown error"}
            </div>
          </div>
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
