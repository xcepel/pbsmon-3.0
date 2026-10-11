import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useProjectDetail } from "@/hooks/useProjectDetail";
import { ProjectBasicInfo } from "@/components/projects/ProjectBasicInfo";
import { ProjectVmsSection } from "@/components/projects/ProjectVmsSection";
import { ProjectUsersSection } from "@/components/projects/ProjectUsersSection";
import { PageContainer, PageHeader, EmptyState, ErrorState, LoadingState } from "@metacentrum/design-system";

export function ProjectDetailPage() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const { data, isLoading, error } = useProjectDetail(projectId || "");

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.projectDetail")} />
        <LoadingState label={t("common.loading")} />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.projectDetail")} />
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
        <PageHeader title={t("pages.projectDetail")} />
        <EmptyState title={t("projects.projectNotFound")} />
      </PageContainer>
    );
  }

  const project = data.data;

  return (
    <PageContainer>
      <PageHeader title={t("pages.projectDetail")} />
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <ProjectBasicInfo project={project} />
        <ProjectVmsSection vms={project.vms} />
        <ProjectUsersSection users={project.users} />
      </div>
    </PageContainer>
  );
}
