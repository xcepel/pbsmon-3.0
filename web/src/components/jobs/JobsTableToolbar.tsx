import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { JobsStateFilter, type JobFilterableState } from "./JobsFilterableHeader";

const formatTimestamp = (timestamp: number | null): string => {
  if (!timestamp || typeof timestamp !== "number") return "-";
  const date = new Date(timestamp * 1000);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
};

export function useJobsSearchPlaceholder() {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 639px)");
  return isMobile ? t("jobs.searchPlaceholderShort") : t("jobs.searchPlaceholder");
}

interface JobsTableToolbarProps {
  totalJobs: number;
  lastRunningCompletedBy?: number | null;
  /** Omit onStateFilterChange to hide the state filter. */
  filterableStates?: Record<string, string> | null;
  stateFilter?: JobFilterableState;
  onStateFilterChange?: (state: JobFilterableState) => void;
}

export function JobsTableToolbar({
  totalJobs,
  lastRunningCompletedBy,
  filterableStates,
  stateFilter,
  onStateFilterChange,
}: JobsTableToolbarProps) {
  const { t } = useTranslation();

  return (
    <>
      {onStateFilterChange && (
        <JobsStateFilter
          filterableStates={filterableStates}
          stateFilter={stateFilter}
          onStateFilterChange={onStateFilterChange}
        />
      )}
      <span className="self-center px-4 text-sm text-gray-600 whitespace-normal sm:whitespace-nowrap">
        {lastRunningCompletedBy
          ? t("jobs.totalJobsCompletedBy", {
              count: totalJobs,
              completedBy: formatTimestamp(lastRunningCompletedBy),
            })
          : t("jobs.totalJobs", { count: totalJobs })}
      </span>
    </>
  );
}
