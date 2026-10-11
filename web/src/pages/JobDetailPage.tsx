import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useJobDetail } from "@/hooks/useJobDetail";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { JobBasicInfo } from "@/components/jobs/JobBasicInfo";
import { JobTimestampsSection } from "@/components/jobs/JobTimestampsSection";
import { JobResourcesSection } from "@/components/jobs/JobResourcesSection";
import { JobSubjobsSection } from "@/components/jobs/JobSubjobsSection";
import { JobSystemInfoSection } from "@/components/jobs/JobSystemInfoSection";
import { JobMessagesSection } from "@/components/jobs/JobMessagesSection";
import { PageContainer, PageHeader } from "@metacentrum/design-system";

export function JobDetailPage() {
  const { t } = useTranslation();
  const { jobId } = useParams<{ jobId: string }>();
  const { data, isLoading, error } = useJobDetail(jobId || "");
  const isMobile = useMediaQuery("(max-width: 639px)");

  // Set browser tab title to job
  useEffect(() => {
    if (jobId) {
      document.title = jobId;
    }

    return () => {
      document.title = 'MetaCentrum';
    };
  }, [jobId]);


  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.jobDetail")} />
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">{t("common.loading")}</div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.jobDetail")} />
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

  if (!data) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.jobDetail")} />
        <div className="text-center text-gray-500 py-12">
          {t("jobs.jobNotFound")}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title={t("pages.jobDetail")} />
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {data.messages && data.messages.length > 0 && (
          <JobMessagesSection messages={data.messages} />
        )}
        <JobBasicInfo job={data} />
        <JobTimestampsSection job={data} />
        <JobResourcesSection job={data} />
        {data.subjobs && data.subjobs.length > 0 && (
          <JobSubjobsSection subjobs={data.subjobs} />
        )}
        {/* System information isn't shown on phones */}
        {!isMobile && <JobSystemInfoSection job={data} />}
      </div>
    </PageContainer>
  );
}
