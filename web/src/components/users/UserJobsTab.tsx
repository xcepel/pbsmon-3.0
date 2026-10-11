import { JobsTable } from "@/components/jobs/JobsTable";
import type { JobsListDTO, JobsListMetaDto } from "@/lib/generated-api";
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

interface UserJobsTabProps {
  jobsData?: {
    data: JobsListDTO;
    meta?: JobsListMetaDto;
  };
  isLoading: boolean;
  error: Error | null;
  jobsPage: number;
  jobsLimit: number;
  jobsSort: SortColumn;
  jobsOrder: "asc" | "desc";
  jobsSearch: string;
  stateFilter: JobFilterableState;
  onSort: (column: SortColumn) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearchChange: (query: string) => void;
  onStateFilterChange: (state: JobFilterableState) => void;
}

export function UserJobsTab({
  jobsData,
  isLoading,
  error,
  jobsPage,
  jobsLimit,
  jobsSort,
  jobsOrder,
  jobsSearch,
  stateFilter,
  onSort,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onStateFilterChange,
}: UserJobsTabProps) {
  return (
    <JobsTable
      jobs={jobsData?.data?.jobs ?? []}
      meta={jobsData?.meta}
      isLoading={isLoading}
      error={error}
      sortColumn={jobsSort}
      sortDirection={jobsOrder}
      onSort={onSort}
      search={jobsSearch}
      onSearchChange={onSearchChange}
      stateFilter={stateFilter}
      onStateFilterChange={onStateFilterChange}
      page={jobsPage}
      pageSize={jobsLimit}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
}
