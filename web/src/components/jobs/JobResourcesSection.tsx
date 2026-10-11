import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import type { AllocatedResourceDTO, JobDetailDTO } from "@/lib/generated-api";
import { ProgressBar } from "@/components/common/ProgressBar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { DataTable, type DataTableColumn } from "@metacentrum/design-system";

interface JobResourcesSectionProps {
  job: JobDetailDTO;
}

export function JobResourcesSection({ job }: JobResourcesSectionProps) {
  const { t } = useTranslation();

  // GPU/RAM/scratch were hidden below Tailwind's sm breakpoint.
  const isNarrow = useMediaQuery("(max-width: 639px)");

  const allAllocatedColumns: (DataTableColumn<AllocatedResourceDTO> | false)[] = [
    {
      key: "machine",
      header: t("jobs.machine"),
      render: (resource) => (
        <Link
          to={`/machines/${resource.machine}`}
          className="whitespace-nowrap text-sm font-medium text-primary-600 hover:text-primary-800"
        >
          {resource.machine}
        </Link>
      ),
    },
    {
      key: "cpu",
      header: t("jobs.cpu"),
      render: (resource) => (
        <span className="whitespace-nowrap text-sm text-gray-600">{resource.cpu}</span>
      ),
    },
    !isNarrow && {
      key: "gpu",
      header: t("jobs.gpu"),
      render: (resource) => (
        <span className="whitespace-nowrap text-sm text-gray-600">
          {resource.gpu === 0 ? (
            <span className="text-gray-400">{t("jobs.noGpu")}</span>
          ) : (
            resource.gpu
          )}
        </span>
      ),
    },
    !isNarrow && {
      key: "ram",
      header: t("jobs.ram"),
      render: (resource) => (
        <span className="whitespace-nowrap text-sm text-gray-600">
          {resource.ram.toFixed(2)} GB
        </span>
      ),
    },
    !isNarrow && {
      key: "scratch",
      header: t("jobs.scratch"),
      render: (resource) => (
        <span className="whitespace-nowrap text-sm text-gray-600">
          {resource.scratch
            ? `${resource.scratch.toFixed(2)} GB (${resource.scratchType || "local"})`
            : "-"}
        </span>
      ),
    },
  ];
  const allocatedColumns = allAllocatedColumns.filter(
    (c): c is DataTableColumn<AllocatedResourceDTO> => Boolean(c)
  );

  // Show usage for running, exiting, and all completed states (C, F, X)
  const completedStates = ["C", "F", "X"];
  const showUsage =
    job.state === "R" ||
    job.state === "E" ||
    completedStates.includes(job.state);

  // Format seconds to HH:MM:SS
  const formatSecondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate GPU time from GPU percent
  // Note: gpuPercent represents the total percentage for all GPUs combined
  // With 2 GPUs, gpuPercent can be up to 200% (100% per GPU)
  // Formula: per-GPU percentage = gpuPercent / gpuReserved
  //         GPU time = (gpuPercent / gpuReserved) * runtime
  const calculateGpuTimeFromPercent = (
    gpuPercent: number,
    runtime: number | null | undefined,
    gpuReserved: number
  ): string | null => {
    if (!runtime || gpuReserved === 0) return null;
    if (runtime === 0) return null;
    // Calculate GPU time: (total percentage / number of GPUs) * runtime
    const perGpuPercent = gpuPercent / gpuReserved;
    const gpuTimeSeconds = (perGpuPercent / 100) * runtime;
    return formatSecondsToTime(gpuTimeSeconds);
  };

  return (
    <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {t("jobs.resources")}
      </h2>

      {/* Requested Resources */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          {t("jobs.requestedResources")}
        </h3>
        <div className="bg-gray-50 p-3 rounded font-mono text-sm break-all">
          {job.requestedResources || t("jobs.noResourcesRequested")}
        </div>
      </div>



      {/* Estimated Nodes */}
      {job.state == "Q" && job.estimNodes && (
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          {t("jobs.estimatedNodes")}
        </h3>
        <div className="bg-gray-50 p-3 rounded font-mono text-sm break-all">
          {String(job.estimNodes)}
        </div>
      </div>
      )}
      {/* Resource Reservation */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          {t("jobs.resourceReservation")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-500">{t("jobs.cpu")}</div>
            <div className="text-lg font-medium text-gray-900">
              {job.cpuReserved}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("jobs.gpu")}</div>
            {job.gpuReserved === 0 ? (
              <div className="text-lg font-medium text-gray-400">
                {t("jobs.noGpu")}
              </div>
            ) : (
              <div className="text-lg font-medium text-gray-900">
                {job.gpuReserved}
              </div>
            )}
          </div>
          <div>
            <div className="text-sm text-gray-500">{t("jobs.memory")}</div>
            <div className="text-lg font-medium text-gray-900">
              {job.memoryReserved.toFixed(2)} GB
            </div>
          </div>
          {job.scratchReserved && (
            <div>
              <div className="text-sm text-gray-500">{t("jobs.scratch")}</div>
              <div className="text-lg font-medium text-gray-900">
                {job.scratchReserved.toFixed(2)} GB
              </div>
            </div>
          )}
          {job.walltimeReserved && (
            <div>
              <div className="text-sm text-gray-500">{t("jobs.walltime")}</div>
              <div className="text-lg font-medium text-gray-900">
                {formatTimeFromSeconds(
                  typeof job.walltimeReserved === "number"
                    ? job.walltimeReserved
                    : Number(job.walltimeReserved) || 0
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resource Usage (only when running or finished) */}
      {showUsage && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            {t("jobs.resourceUsage")}
          </h3>
          <div className="space-y-4">
            {job.runtime && typeof job.runtime == "number" && (
              <div>
                {typeof job.walltimeReserved === "number" &&
                (typeof job.startedAt == "number" || typeof job.startedAt == "bigint") &&
                (typeof job.completedBy == "number" || typeof job.completedBy == "bigint") &&
                job.walltimeReserved !== null ? (
                  <ProgressBar
                    label={t("jobs.walltime")}
                    value={formatSecondsToTime(job.walltimeReserved)}
                    percent={(job.runtime/(job.completedBy - job.startedAt) * 100)}
                    color="#4b5563"
                  />
                ) : (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">
                        {t("jobs.walltime")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
            {job.cpuTimeUsed && (
              <div>
                {typeof job.cpuUsagePercentPerCpu === "number" &&
                job.cpuUsagePercentPerCpu !== null ? (
                  <ProgressBar
                    label={t("jobs.cpuTimeUsed")}
                    value={String(job.cpuTimeUsed)}
                    percent={job.cpuUsagePercentPerCpu}
                    color="#4b5563"
                  />
                ) : (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">
                        {t("jobs.cpuTimeUsed")}
                      </span>
                      <span className="text-gray-900 font-medium">
                        {String(job.cpuTimeUsed)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
            {job.gpuReserved > 0 && (
              <div>
                {typeof job.gpuUsagePercent === "number" &&
                job.gpuUsagePercent !== null &&
                typeof job.gpuUsagePercentPerGpu === "number" &&
                job.gpuUsagePercentPerGpu !== null? (
                  (() => {
                    // Calculate GPU time from GPU percent
                    const calculatedGpuTime = calculateGpuTimeFromPercent(
                      job.gpuUsagePercent,
                      typeof job.runtime === 'number' && job.runtime > 0 ? job.runtime : null,
                      job.gpuReserved
                    );
                    return (
                      <ProgressBar
                        label={t("jobs.gpu")}
                        value={
                          calculatedGpuTime
                            ? calculatedGpuTime
                            : `${job.gpuReserved} ${t("jobs.gpu")}`
                        }
                        percent={job.gpuUsagePercentPerGpu}
                        color="#4b5563"
                        icon={
                          <Icon
                            icon="bi:gpu-card"
                            className="w-[14px] h-[14px]"
                          />
                        }
                      />
                    );
                  })()
                ) : job.gpuTimeUsed ? (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">
                        {t("jobs.gpuTimeUsed")}
                      </span>
                      <span className="text-gray-900 font-medium">
                        {String(job.gpuTimeUsed)}
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
            {job.memoryUsed !== null && (
              <div>
                {typeof job.memoryUsagePercent === "number" &&
                job.memoryUsagePercent !== null ? (
                  <ProgressBar
                    label={t("jobs.memoryUsed")}
                    value={`${Number(job.memoryUsed).toFixed(2)} GB / ${Number(job.memoryReserved).toFixed(2)} GB`}
                    percent={job.memoryUsagePercent}
                    color="#4b5563"
                  />
                ) : (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">
                        {t("jobs.memoryUsed")}
                      </span>
                      <span className="text-gray-900 font-medium">
                        {Number(job.memoryUsed).toFixed(2)} GB /{" "}
                        {Number(job.memoryReserved).toFixed(2)} GB
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
            {typeof(job.runtime) === 'number' && job.runtime > 0 && (
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("jobs.runtime")}</span>
                  <span className="text-gray-900 font-medium">
                    {formatSecondsToTime(job.runtime)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Allocated Resources */}
      {job.allocatedResources.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            {t("jobs.allocatedResources")}
          </h3>
          <DataTable
            columns={allocatedColumns}
            rows={job.allocatedResources}
            rowKey={(resource) => job.allocatedResources.indexOf(resource)}
          />
        </div>
      )}
    </div>
  );
}

function formatTimeFromSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
