import { useTranslation } from "react-i18next";
import { ProjectsTableHeader } from "./ProjectsTableHeader";
import { ProjectsTableRow } from "./ProjectsTableRow";
import type { SortColumn, Project } from "./types";
import { EmptyState } from "@metacentrum/design-system";

interface ProjectsTableProps {
  projects: Project[];
  sortColumn: SortColumn;
  sortDirection: "asc" | "desc";
  onSort: (column: SortColumn) => void;
}

export function ProjectsTable({
  projects,
  sortColumn,
  sortDirection,
  onSort,
}: ProjectsTableProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <ProjectsTableHeader
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={onSort}
          />
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <EmptyState title={t("projects.noProjects")} />
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <ProjectsTableRow key={project.id} project={project} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
