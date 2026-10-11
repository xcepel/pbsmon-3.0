import { useTranslation } from "react-i18next";
import { DataTable, type PaginationProps } from "@metacentrum/design-system";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useProjectsTableColumns } from "./projectsTableColumns";
import type { SortColumn, Project } from "./types";

interface ProjectsTableProps {
  projects: Project[];
  sortColumn: SortColumn;
  sortDirection: "asc" | "desc";
  /** The caller decides the sort direction. */
  onSort: (column: SortColumn) => void;
  pagination?: PaginationProps;
}

/** No search box; callers render their own. */
export function ProjectsTable({
  projects,
  sortColumn,
  sortDirection,
  onSort,
  pagination,
}: ProjectsTableProps) {
  const { t } = useTranslation();
  const isCompact = useMediaQuery(
    "(max-width: 639px), (max-height: 500px) and (orientation: landscape)"
  );
  const columns = useProjectsTableColumns(isCompact);

  return (
    <DataTable
      columns={columns}
      rows={projects}
      rowKey={(project) => project.id}
      sort={{ key: sortColumn, direction: sortDirection }}
      onSortChange={(next) => onSort(next.key as SortColumn)}
      emptyTitle={t("projects.noProjects")}
      pagination={pagination}
    />
  );
}
