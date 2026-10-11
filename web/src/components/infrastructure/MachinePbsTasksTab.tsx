import { useTranslation } from "react-i18next";
import { useJobs } from "@/hooks/useJobs";
import { JobsTable } from "@/components/jobs/JobsTable";
import type { JobFilterableState } from "@/components/jobs/JobsFilterableHeader";

type SortColumn =
  | "id"
  | "name"
  | "queue"
  | "state"
  | "owner"
  | "node"
  | "cpuReserved"
  | "gpuReserved"
  | "memoryReserved"
  | "createdAt";

interface MachinePbsTasksTabProps {
  nodeName: string | null;
  jobsPage: number;
  jobsLimit: number;
  jobsSort: SortColumn;
  jobsOrder: "asc" | "desc";
  jobsSearch: string;
  stateFilter: JobFilterableState;
  onJobsPageChange: (page: number) => void;
  onJobsPageSizeChange: (pageSize: number) => void;
  onJobsSort: (column: SortColumn) => void;
  onJobsSearchChange: (query: string) => void;
  onStateFilterChange: (state: JobFilterableState) => void;
}

export function MachinePbsTasksTab({
  nodeName,
  jobsPage,
  jobsLimit,
  jobsSort,
  jobsOrder,
  jobsSearch,
  stateFilter,
  onJobsPageChange,
  onJobsPageSizeChange,
  onJobsSort,
  onJobsSearchChange,
  onStateFilterChange,
}: MachinePbsTasksTabProps) {
  const { t } = useTranslation();

  const {
    data: jobsData,
    isLoading: jobsLoading,
    error: jobsError,
  } = useJobs({
    page: jobsPage,
    limit: jobsLimit,
    sort: jobsSort,
    order: jobsOrder,
    search: jobsSearch.trim() || undefined,
    node: nodeName || undefined,
    state: stateFilter === "all" ? undefined : stateFilter,
    enabled: !!nodeName,
  });

  return (
    <JobsTable
      jobs={jobsData?.data?.jobs ?? []}
      meta={jobsData?.meta}
      isLoading={jobsLoading}
      error={jobsError}
      emptyTitle={t("machines.noJobs")}
      hideMachineColumn
      sortColumn={jobsSort}
      sortDirection={jobsOrder}
      onSort={onJobsSort}
      search={jobsSearch}
      onSearchChange={onJobsSearchChange}
      stateFilter={stateFilter}
      onStateFilterChange={onStateFilterChange}
      page={jobsPage}
      pageSize={jobsLimit}
      onPageChange={onJobsPageChange}
      onPageSizeChange={onJobsPageSizeChange}
    />
  );
}
