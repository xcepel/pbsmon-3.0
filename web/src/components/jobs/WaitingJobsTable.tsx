import { useTranslation } from "react-i18next";
import type { JobListDTO } from "@/lib/generated-api";
import { WaitingJobsTableHeader } from "./WaitingJobsTableHeader";
import { WaitingJobsTableRow } from "./WaitingJobsTableRow";
import { EmptyState } from "@metacentrum/design-system";

type SortColumn =
  | "id"
  | "name"
  | "owner"
  | "node"
  | "cpuReserved"
  | "gpuReserved"
  | "memoryReserved"
  | "createdAt";

interface WaitingJobsTableProps {
  jobs: JobListDTO[];
  sortColumn: SortColumn;
  sortDirection: "asc" | "desc";
  onSort: (column: SortColumn) => void;
}

export function WaitingJobsTable({
  jobs,
  sortColumn,
  sortDirection,
  onSort,
}: WaitingJobsTableProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full overflow-x-auto">
      <div className="min-w-full sm:min-w-max">
        <WaitingJobsTableHeader
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={onSort}
        />

        {/* Table Body */}
        <div>
          {jobs.length === 0 ? (
            <EmptyState title={t("jobs.noJobsFound")} />
          ) : (
            jobs.map((job) => <WaitingJobsTableRow key={job.id} job={job} />)
          )}
        </div>
      </div>
    </div>
  );
}
