import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useProjects } from "@/hooks/useProjects";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useProjectsTableColumns } from "@/components/projects/projectsTableColumns";
import type { SortColumn, Project } from "@/components/projects/types";
import { usePaginationLabels } from "@/lib/paginationLabels";
import {
  DataTable,
  PageContainer,
  PageHeader,
  type DataTableSort,
} from "@metacentrum/design-system";

// The projects list always used a fixed page size of 20.
const PROJECTS_PAGE_SIZES = [20];

export function ProjectsPage() {
  const { t } = useTranslation();
  const paginationLabels = usePaginationLabels();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState<SortColumn>("status");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Compact view covers narrow-width phones (portrait) as well as short-height
  // phones in landscape.
  const isCompact = useMediaQuery(
    "(max-width: 639px), (max-height: 500px) and (orientation: landscape)"
  );

  // Debounce search input - update debouncedSearch after 300ms of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useProjects({
    page,
    limit,
    sort,
    order,
    search: debouncedSearch.trim() || undefined,
  });

  // DataTable picks the direction: toggles on the same column, desc first for
  // the numeric (reserved resources) column, asc otherwise.
  const handleSortChange = (next: DataTableSort) => {
    setSort(next.key as SortColumn);
    setOrder(next.direction);
    setPage(1);
  };

  const handlePaginationChange = (next: { page: number; pageSize: number }) => {
    setPage(next.page);
    setLimit(next.pageSize);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalCount =
    data && typeof data === "object" && "meta" in data
      ? (data.meta as { totalCount?: number })?.totalCount || 0
      : 0;

  const projects: Project[] = data?.data?.projects || [];
  const columns = useProjectsTableColumns(isCompact);

  return (
    <PageContainer>
      <PageHeader title={t("pages.projects")} />
      <DataTable
        columns={columns}
        rows={projects}
        rowKey={(project) => project.id}
        sort={{ key: sort, direction: order }}
        onSortChange={handleSortChange}
        search={{
          value: search,
          // Page resets in the debounce effect above.
          onChange: setSearch,
          placeholder: t("projects.searchPlaceholder"),
        }}
        toolbar={
          <span className="self-center px-4 text-sm text-gray-600 whitespace-nowrap">
            {t("projects.totalProjects", { count: totalCount })}
          </span>
        }
        loading={isLoading}
        loadingLabel={t("common.loading")}
        error={
          error
            ? {
                title: t("common.errorLoading"),
                description:
                  error instanceof Error ? error.message : t("common.unknownError"),
              }
            : undefined
        }
        emptyTitle={t("projects.noProjects")}
        pagination={{
          page,
          pageSize: limit,
          totalItems: totalCount,
          onChange: handlePaginationChange,
          pageSizes: PROJECTS_PAGE_SIZES,
          labels: paginationLabels,
        }}
      />
    </PageContainer>
  );
}
