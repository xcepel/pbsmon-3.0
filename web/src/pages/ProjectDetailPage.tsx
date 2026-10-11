import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useProjectDetail } from "@/hooks/useProjectDetail";
import { ProjectBasicInfo } from "@/components/projects/ProjectBasicInfo";
import { ProjectVmsSection } from "@/components/projects/ProjectVmsSection";
import { ProjectUsersSection } from "@/components/projects/ProjectUsersSection";
import { PageContainer, PageHeader } from "@metacentrum/design-system";

export function ProjectDetailPage() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const { data, isLoading, error } = useProjectDetail(projectId || "");

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.projectDetail")} />
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">{t("common.loading")}</div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.projectDetail")} />
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
        <PageHeader title={t("pages.projectDetail")} />
        <div className="text-center text-gray-500 py-12">
          {t("projects.projectNotFound")}
        </div>
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
