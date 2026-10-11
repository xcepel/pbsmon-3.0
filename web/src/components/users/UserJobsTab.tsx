import { useTranslation } from "react-i18next";
import { JobsTable } from "@/components/jobs/JobsTable";
import { Pagination } from "@/components/common/Pagination";
import { JobsSearchBar } from "@/components/jobs/JobsSearchBar";
import type { JobsListDTO, JobsListMetaDto } from "@/lib/generated-api";
import type { JobFilterableState } from "@/components/jobs/JobsFilterableHeader";
import { ErrorState, LoadingState } from "@metacentrum/design-system";

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
  const { t } = useTranslation();

  const jobsTotalPages = jobsData?.meta?.totalCount
    ? Math.ceil(jobsData.meta.totalCount / jobsLimit)
    : 0;

  return (
    <div>
      <JobsSearchBar
        searchQuery={jobsSearch}
        onSearchChange={onSearchChange}
        totalJobs={jobsData?.meta?.totalCount || 0}
        lastRunningCompletedBy={jobsData?.meta?.lastRunningCompletedBy || null}
      />

      {isLoading && (
        <LoadingState label={t("common.loading")} />
      )}

      {error && (
        <ErrorState
          className="mb-4"
          title={t("common.errorLoading")}
          description={
            error instanceof Error
              ? error.message
              : t("common.unknownError")
          }
        />
      )}

      {jobsData && jobsData.data && (
        <>
          <JobsTable
            jobs={jobsData.data.jobs}
            sortColumn={jobsSort}
            sortDirection={jobsOrder}
            onSort={onSort}
            filterableStates={jobsData.meta?.filterableStates || null}
            stateFilter={stateFilter}
            onStateFilterChange={onStateFilterChange}
          />
          <Pagination
            currentPage={jobsPage}
            totalPages={jobsTotalPages}
            onPageChange={onPageChange}
            pageSize={jobsLimit}
            onPageSizeChange={onPageSizeChange}
          />
        </>
      )}
    </div>
  );
}
