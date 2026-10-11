import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { DataTableColumn } from "@metacentrum/design-system";
import type { Project } from "./types";

/** Columns for the projects list (keys are the API sort columns). */
export function useProjectsTableColumns(
  isCompact: boolean
): DataTableColumn<Project>[] {
  const { t } = useTranslation();

  const columns: (DataTableColumn<Project> | false)[] = [
    {
      key: "status",
      header: t("projects.status"),
      sortable: true,
      width: "8rem",
      render: (project) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
            project.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {project.status === "active"
            ? t("projects.statusActive")
            : t("projects.statusExpired")}
        </span>
      ),
    },
    {
      key: "name",
      header: t("projects.name"),
      sortable: true,
      render: (project) => (
        <div className="flex items-center min-w-0">
          <Icon icon="mdi:folder" className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
          <div className="min-w-0">
            <Link
              to={`/projects/${project.id}`}
              title={project.name}
              className="inline-block max-w-[10rem] sm:max-w-xs align-bottom truncate text-sm font-medium text-primary-600 hover:text-primary-800"
            >
              {project.name}
            </Link>
            {project.isPersonal && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                <Icon icon="mdi:account" className="w-3 h-3 mr-1" />
                {t("projects.personal")}
              </span>
            )}
            {project.isMyProject && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                <Icon icon="mdi:star" className="w-3 h-3 mr-1" />
                {t("projects.myProject")}
              </span>
            )}
          </div>
        </div>
      ),
    },
    !isCompact && {
      key: "vmCount",
      header: t("projects.reservedResources"),
      sortable: true,
      firstSortDirection: "desc",
      render: (project) => (
        <div className="text-sm text-gray-900 flex gap-2 whitespace-nowrap">
          <div>
            {t("projects.vms")}: {project.reservedResources.vmCount}
          </div>
          <div className="text-gray-500">
            {t("projects.vcpus")}: {project.reservedResources.vcpus}
          </div>
          <div className="text-gray-500">
            {t("projects.memory")}: {project.reservedResources.memoryGb} GB
          </div>
        </div>
      ),
    },
  ];

  return columns.filter((c): c is DataTableColumn<Project> => Boolean(c));
}
