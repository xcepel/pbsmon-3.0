import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import type { DataTableColumn } from "@metacentrum/design-system";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { JobListDTO } from "@/lib/generated-api";
import { ProgressBar } from "@/components/common/ProgressBar";

export type JobsSortColumn =
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

export type WaitingJobsSortColumn =
  | "id"
  | "name"
  | "owner"
  | "node"
  | "cpuReserved"
  | "gpuReserved"
  | "memoryReserved"
  | "createdAt";

// Compact view covers narrow-width phones (portrait) as well as short-height
// phones in landscape, where a width-only breakpoint would otherwise show
// the full desktop column set on a screen too short to comfortably use it.
export const JOBS_COMPACT_QUERY =
  "(max-width: 639px), (max-height: 500px) and (orientation: landscape)";

export function useJobsCompactView() {
  return useMediaQuery(JOBS_COMPACT_QUERY);
}

// Format date (DD.MM.YYYY)
export function formatDate(timestamp: number) {
  const date = new Date(timestamp * 1000);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

// Format time (HH:MM)
export function formatTime(timestamp: number) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Format seconds to HH:MM:SS
export function formatSecondsToTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

const toNumber = (value: unknown) =>
  typeof value === "number" ? value : Number(value) || 0;

const isRunningOrDone = (state: string) =>
  state === "R" || state === "C" || state === "F" || state === "X";

// In compact view, show just the numeric job number to save space
const shortJobId = (id: string) => id.match(/^\d+/)?.[0] || id;

// Keep the job number and the first host label, drop the rest of the domain:
// "21987122.pbs-m1.metacentrum.cz" -> "21987122.pbs-m1"
const serverJobId = (id: string) => id.match(/^[^.]+\.[^.]+/)?.[0] || id;

const jobUsername = (job: JobListDTO) => job.username || job.owner?.split("@")[0];

function CreatedCell({ job }: { job: JobListDTO }) {
  const createdAt = toNumber(job.createdAt);
  return (
    <div className="text-sm text-gray-600 text-right">
      {formatDate(createdAt)}
      <br />
      {formatTime(createdAt)}
    </div>
  );
}

function UsernameCell({ job }: { job: JobListDTO }) {
  const { t } = useTranslation();
  const username = jobUsername(job);
  // Show username if canSeeOwner, anonymized otherwise
  return (
    <div className="text-sm">
      {job.canSeeOwner && username ? (
        <Link
          to={`/users/${encodeURIComponent(username)}`}
          className="text-gray-900 hover:text-primary-600 underline cursor-pointer"
        >
          {String(username)}
        </Link>
      ) : (
        <span className="text-gray-900">{t("jobs.anonym")}</span>
      )}
    </div>
  );
}

interface JobsTableColumnsOptions {
  hideMachineColumn?: boolean;
  hideUserColumn?: boolean;
}

/**
 * In compact view only Status/ID/Created stay visible; the ID
 * cell then also carries the job name.
 */
export function useJobsTableColumns({
  hideMachineColumn = false,
  hideUserColumn = false,
}: JobsTableColumnsOptions = {}): DataTableColumn<JobListDTO>[] {
  const { t } = useTranslation();
  const isCompact = useJobsCompactView();

  const renderStatus = (job: JobListDTO) => {
    // Get state label and color from backend
    const stateName = String((job as any).stateName || job.state || "");
    const stateColor = String(
      (job as any).stateColor || "bg-gray-100 text-gray-800"
    );
    const stateLabel = String(
      t(`jobs.state.${stateName}`, { default: stateName })
    );
    return (
      <div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stateColor}`}
        >
          {stateLabel}
        </span>
        {typeof job.exitCode === "number" && (
          <div className="text-xs text-gray-500 mt-1">
            {t("jobs.exit")}: {String(job.exitCode)}
          </div>
        )}
      </div>
    );
  };

  const renderId = (job: JobListDTO) => {
    const jobState = String(job.state || "");
    // Parent jobs (array job controllers) have IDs like "14699148[].pbs-m1.metacentrum.cz"
    const isParentJob = /\[\]/.test(job.id);
    const parentJobTooltipId = `parent-job-${job.id}`;
    const runtime = (job as any).runtime;
    const walltimeReserved = (job as any).walltimeReserved;
    const estimStartTime = (job as any).estimStartTime;
    const endingSoon =
      jobState === "R" &&
      typeof walltimeReserved === "number" &&
      typeof runtime === "number" &&
      walltimeReserved * 0.85 - runtime < 0;
    const idText = isCompact ? (
      shortJobId(job.id)
    ) : (
      <span className="break-all">{serverJobId(job.id)}</span>
    );

    return (
      <div className="text-left min-w-0">
        <div className="flex items-center gap-2">
          {job.canSeeOwner ? (
            <Link
              to={`/jobs/${encodeURIComponent(job.id)}`}
              className="text-sm text-gray-900 font-mono hover:text-primary-600 underline cursor-pointer"
              title={job.id}
            >
              {idText}
            </Link>
          ) : (
            <span title={job.id} className="text-sm text-gray-900 font-mono">
              {idText}
            </span>
          )}
          {isParentJob && (
            <>
              <Icon
                icon="ph:tree-view-fill"
                className="w-4 h-4 text-primary-600 flex-shrink-0"
                data-tooltip-id={parentJobTooltipId}
                data-tooltip-content={t("jobs.parentJobTooltip")}
              />
              <Tooltip id={parentJobTooltipId} />
            </>
          )}
        </div>
        {/* Name shown here only in compact view; the dedicated Name column takes over otherwise */}
        {isCompact && (
          <div className="text-sm text-gray-900 break-all mt-0.5">
            {String(job.name || "")}
          </div>
        )}
        {isRunningOrDone(jobState) && typeof runtime === "number" && (
          <div
            className={`text-xs mt-1 ${endingSoon ? "text-red-600" : "text-gray-600"}`}
          >
            {t("jobs.runtime")}: {formatSecondsToTime(runtime)}
            {!isCompact && "/" + formatSecondsToTime(walltimeReserved)}
          </div>
        )}
        {job.canSeeOwner &&
          jobState === "Q" &&
          typeof estimStartTime === "number" &&
          estimStartTime > 0 && (
            <div className="text-xs mt-1 text-gray-600">
              {t("jobs.estimatedStartTime")}: {formatDate(estimStartTime)}{" "}
              {formatTime(estimStartTime)}
            </div>
          )}
      </div>
    );
  };

  const renderCpu = (job: JobListDTO) => {
    const jobState = String(job.state || "");
    const cpuReserved = toNumber(job.cpuReserved);
    if (
      isRunningOrDone(jobState) &&
      typeof job.cpuUsagePercentPerCpu === "number"
    ) {
      return (
        <div className="text-sm mb-1">
          <ProgressBar
            label={`CPU:`}
            value={cpuReserved}
            percent={job.cpuUsagePercentPerCpu}
            color={(percent) => (percent < 50 ? "#ef4444" : "#4b5563")}
            icon={<Icon icon="solar:cpu-bold" className="w-[14px] h-[14px]" />}
          />
        </div>
      );
    }
    // Same CPU count display whether or not CPU time is known (completed jobs)
    return (
      <div className={`text-sm flex items-center gap-1 ${job.cpuTimeUsed ? "mb-1" : ""}`}>
        <span className="text-gray-900">{cpuReserved}</span>
        <Icon icon="solar:cpu-bold" className="w-[14px] h-[14px]" />
      </div>
    );
  };

  const renderGpu = (job: JobListDTO) => {
    const jobState = String(job.state || "");
    const gpuReserved = toNumber(job.gpuReserved);
    const gpuUsagePercent =
      typeof job.gpuUsagePercent === "number" ? job.gpuUsagePercent : null;

    // Show "no GPU" in gray if gpuReserved is 0
    if (gpuReserved === 0) {
      return <div className="text-gray-400 text-sm">{t("jobs.noGpu")}</div>;
    }

    // Show progress bar if we have gpuUsagePercent and job is running or completed
    if (isRunningOrDone(jobState) && gpuUsagePercent !== null) {
      return (
        <div className="text-sm mb-1">
          {typeof job.gpuUsagePercentPerGpu === "number" && (
            <ProgressBar
              label=""
              value={gpuReserved}
              percent={job.gpuUsagePercentPerGpu}
              color="#4b5563"
              icon={<Icon icon="bi:gpu-card" className="w-[14px] h-[14px]" />}
            />
          )}
        </div>
      );
    }

    // Default: show gpu count
    return (
      <div className="text-sm flex items-center gap-1">
        <span className="text-gray-900">{gpuReserved}</span>
        <Icon icon="bi:gpu-card" className="w-[14px] h-[14px]" />
      </div>
    );
  };

  const renderRam = (job: JobListDTO) => {
    const jobState = String(job.state || "");
    const memoryReserved = toNumber(job.memoryReserved);
    if (isRunningOrDone(jobState) && typeof job.memoryUsagePercent === "number") {
      return (
        <div className="text-sm mb-1">
          <ProgressBar
            label="RAM"
            value={`${memoryReserved} ${t("jobs.gb")}`}
            percent={job.memoryUsagePercent}
            color="#4b5563"
          />
        </div>
      );
    }
    return (
      <div className="text-sm flex items-center gap-1">
        <span className="text-gray-900">
          {memoryReserved} {t("jobs.gb")}
        </span>
        <Icon icon="ph:memory" className="w-[14px] h-[14px]" />
      </div>
    );
  };

  const full = !isCompact;
  const columns: (DataTableColumn<JobListDTO> | false)[] = [
    {
      key: "state",
      header: t("jobs.status"),
      width: isCompact ? undefined : "7rem",
      render: renderStatus,
    },
    {
      key: "id",
      header: t("jobs.id"),
      sortable: true,
      firstSortDirection: "desc",
      render: renderId,
    },
    full && {
      key: "name",
      header: t("jobs.name"),
      sortable: true,
      firstSortDirection: "desc",
      render: (job) => (
        <div className="text-sm text-gray-900 break-all" title={String(job.name || "")}>
          {String(job.name || "")}
        </div>
      ),
    },
    full && {
      key: "queue",
      header: t("jobs.queue"),
      sortable: true,
      firstSortDirection: "desc",
      width: "6.5rem",
      render: (job) =>
        job.queue ? (
          <Link
            to={`/queues/${encodeURIComponent(String(job.queue))}`}
            className="text-sm text-gray-900 hover:text-primary-600 underline cursor-pointer"
          >
            {String(job.queue)}
          </Link>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        ),
    },
    full &&
      !hideUserColumn && {
        key: "owner",
        header: t("jobs.username"),
        sortable: true,
        firstSortDirection: "desc",
        width: "7rem",
        render: (job) => <UsernameCell job={job} />,
      },
    full &&
      !hideMachineColumn && {
        key: "node",
        header: t("jobs.machine"),
        sortable: true,
        firstSortDirection: "desc",
        width: "7rem",
        render: (job) =>
          job.node ? (
            <Link
              to={`/machines/${encodeURIComponent(String(job.node))}`}
              className="text-sm text-gray-900 hover:text-primary-600 underline cursor-pointer"
            >
              {String(job.node)}
            </Link>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          ),
      },
    full && {
      key: "cpuReserved",
      header: t("jobs.cpuReserved"),
      sortable: true,
      firstSortDirection: "desc",
      width: "7.5rem",
      render: renderCpu,
    },
    full && {
      key: "gpuReserved",
      header: t("jobs.gpuReserved"),
      sortable: true,
      firstSortDirection: "desc",
      width: "7.5rem",
      render: renderGpu,
    },
    full && {
      key: "memoryReserved",
      header: t("jobs.ram"),
      sortable: true,
      firstSortDirection: "desc",
      width: "7.5rem",
      render: renderRam,
    },
    {
      key: "createdAt",
      header: t("jobs.created"),
      sortable: true,
      firstSortDirection: "desc",
      align: "end",
      width: "7rem",
      render: (job) => <CreatedCell job={job} />,
    },
  ];

  return columns.filter((c): c is DataTableColumn<JobListDTO> => Boolean(c));
}

/**
 * Columns of the waiting (queued) jobs list. In compact view only ID (with the
 * name under it), the waiting reason (most important) and Created stay visible.
 */
export function useWaitingJobsTableColumns(): DataTableColumn<JobListDTO>[] {
  const { t } = useTranslation();
  const isCompact = useJobsCompactView();
  const full = !isCompact;

  const resourceCell = (count: number, icon: string, suffix?: string) => (
    <div className="text-sm flex items-center gap-1">
      <span className="text-gray-900">
        {count}
        {suffix && ` ${suffix}`}
      </span>
      <Icon icon={icon} className="w-[14px] h-[14px]" />
    </div>
  );

  const columns: (DataTableColumn<JobListDTO> | false)[] = [
    {
      key: "id",
      header: t("jobs.id"),
      sortable: true,
      firstSortDirection: "desc",
      width: isCompact ? undefined : "11rem",
      render: (job) => {
        const idText = isCompact ? (
          shortJobId(job.id)
        ) : (
          <span className="break-all">{serverJobId(job.id)}</span>
        );
        return (
          <div className="text-left min-w-0">
            {job.canSeeOwner ? (
              <Link
                to={`/jobs/${encodeURIComponent(job.id)}`}
                className="text-sm text-gray-900 font-mono hover:text-primary-600 underline cursor-pointer"
                title={job.id}
              >
                {idText}
              </Link>
            ) : (
              <span title={job.id}>{idText}</span>
            )}
            {/* Name shown here only in compact view; the dedicated Name column takes over otherwise */}
            {isCompact && (
              <div
                className="text-sm text-gray-900 line-clamp-1 break-all mt-0.5"
                title={String(job.name || "")}
              >
                {String(job.name || "")}
              </div>
            )}
          </div>
        );
      },
    },
    full && {
      key: "name",
      header: t("jobs.name"),
      sortable: true,
      firstSortDirection: "desc",
      width: "10rem",
      render: (job) => (
        <div
          className="text-sm text-gray-900 line-clamp-1 break-all"
          title={String(job.name || "")}
        >
          {String(job.name || "")}
        </div>
      ),
    },
    full && {
      key: "owner",
      header: t("jobs.username"),
      sortable: true,
      firstSortDirection: "desc",
      width: "7rem",
      render: (job) => <UsernameCell job={job} />,
    },
    full && {
      key: "cpuReserved",
      header: t("jobs.cpuReserved"),
      sortable: true,
      firstSortDirection: "desc",
      width: "7rem",
      render: (job) => resourceCell(toNumber(job.cpuReserved), "solar:cpu-bold"),
    },
    full && {
      key: "gpuReserved",
      header: t("jobs.gpuReserved"),
      sortable: true,
      firstSortDirection: "desc",
      width: "7rem",
      render: (job) => {
        const gpuReserved = toNumber(job.gpuReserved);
        // Show "no GPU" in gray if gpuReserved is 0
        return gpuReserved === 0 ? (
          <div className="text-gray-400 text-sm">{t("jobs.noGpu")}</div>
        ) : (
          resourceCell(gpuReserved, "bi:gpu-card")
        );
      },
    },
    full && {
      key: "memoryReserved",
      header: t("jobs.ram"),
      sortable: true,
      firstSortDirection: "desc",
      width: "7rem",
      render: (job) =>
        resourceCell(toNumber(job.memoryReserved), "ph:memory", t("jobs.gb")),
    },
    {
      // Most important column: the reason the job is waiting
      key: "comment",
      header: t("jobs.waitingReason"),
      render: (job) =>
        job.comment ? (
          <div
            className={`text-sm text-gray-900 break-words ${isCompact ? "line-clamp-2" : "line-clamp-1"}`}
            title={String(job.comment)}
          >
            {String(job.comment)}
          </div>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        ),
    },
    {
      key: "createdAt",
      header: t("jobs.created"),
      sortable: true,
      firstSortDirection: "desc",
      align: "end",
      width: "7rem",
      render: (job) => <CreatedCell job={job} />,
    },
  ];

  return columns.filter((c): c is DataTableColumn<JobListDTO> => Boolean(c));
}
