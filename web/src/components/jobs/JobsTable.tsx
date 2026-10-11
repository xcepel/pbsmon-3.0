import { useTranslation } from "react-i18next";
import { DataTable, type DataTableColumn } from "@metacentrum/design-system";
import type { JobListDTO, JobsListMetaDto } from "@/lib/generated-api";
import { JOBS_PAGE_SIZE_OPTIONS } from "@/hooks/useJobsPageSize";
import { usePaginationLabels } from "@/lib/paginationLabels";
import { useJobsTableColumns, useWaitingJobsTableColumns } from "./jobsTableColumns";
import { JobsTableToolbar, useJobsSearchPlaceholder } from "./JobsTableToolbar";
import type { JobFilterableState } from "./JobsFilterableHeader";

interface JobsDataTableBaseProps<S extends string> {
  jobs: JobListDTO[];
  meta?: JobsListMetaDto;
  isLoading?: boolean;
  error?: unknown;
  emptyTitle?: string;

  sortColumn: S;
  sortDirection: "asc" | "desc";
  /** Same contract as before: the caller toggles the order for the same column, new column starts desc. */
  onSort: (column: S) => void;

  search: string;
  onSearchChange: (query: string) => void;

  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  /** Omit for a fixed page size. */
  onPageSizeChange?: (pageSize: number) => void;
  pageSizes?: number[];
}

interface JobsDataTableProps<S extends string> extends JobsDataTableBaseProps<S> {
  columns: DataTableColumn<JobListDTO>[];
  filterableStates?: Record<string, string> | null;
  stateFilter?: JobFilterableState;
  onStateFilterChange?: (state: JobFilterableState) => void;
}

function JobsDataTable<S extends string>({
  columns,
  jobs,
  meta,
  isLoading,
  error,
  emptyTitle,
  sortColumn,
  sortDirection,
  onSort,
  search,
  onSearchChange,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizes = [...JOBS_PAGE_SIZE_OPTIONS],
  filterableStates,
  stateFilter,
  onStateFilterChange,
}: JobsDataTableProps<S>) {
  const { t } = useTranslation();
  const paginationLabels = usePaginationLabels();
  const searchPlaceholder = useJobsSearchPlaceholder();
  const totalJobs = meta?.totalCount || 0;

  return (
    <DataTable
      columns={columns}
      rows={jobs}
      rowKey={(job) => job.id}
      sort={{ key: sortColumn, direction: sortDirection }}
      onSortChange={(next) => onSort(next.key as S)}
      search={{
        value: search,
        onChange: onSearchChange,
        placeholder: searchPlaceholder,
      }}
      toolbar={
        <JobsTableToolbar
          totalJobs={totalJobs}
          lastRunningCompletedBy={meta?.lastRunningCompletedBy || null}
          filterableStates={filterableStates}
          stateFilter={stateFilter}
          onStateFilterChange={onStateFilterChange}
        />
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
      emptyTitle={emptyTitle ?? t("jobs.noJobsFound")}
      pagination={{
        page,
        pageSize,
        totalItems: totalJobs,
        onChange: (next) => {
          if (next.pageSize !== pageSize) onPageSizeChange?.(next.pageSize);
          else onPageChange(next.page);
        },
        pageSizes: onPageSizeChange ? pageSizes : [pageSize],
        labels: paginationLabels,
      }}
    />
  );
}

interface JobsTableProps<S extends string> extends JobsDataTableBaseProps<S> {
  hideMachineColumn?: boolean;
  hideUserColumn?: boolean;
  /** Omit onStateFilterChange to hide the state filter. */
  stateFilter?: JobFilterableState;
  onStateFilterChange?: (state: JobFilterableState) => void;
}

/** Job list (DataTable): state filter + total count in the toolbar, server-side sort/search/paging. */
export function JobsTable<S extends string>({
  hideMachineColumn,
  hideUserColumn,
  ...props
}: JobsTableProps<S>) {
  const columns = useJobsTableColumns({ hideMachineColumn, hideUserColumn });
  return (
    <JobsDataTable
      {...props}
      columns={columns}
      filterableStates={props.meta?.filterableStates || null}
    />
  );
}

/** Waiting (queued) jobs list: waiting-reason column, no state filter. */
export function WaitingJobsTable<S extends string>(props: JobsDataTableBaseProps<S>) {
  const columns = useWaitingJobsTableColumns();
  // Waiting jobs never showed the "completed by" estimate, just the plain total.
  return (
    <JobsDataTable
      {...props}
      meta={props.meta && { ...props.meta, lastRunningCompletedBy: null }}
      columns={columns}
    />
  );
}
