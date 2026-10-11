import { useTranslation } from "react-i18next";
import type { SubjobDTO } from "@/lib/generated-api";
import { Link } from "react-router-dom";
import { DataTable, type DataTableColumn } from "@metacentrum/design-system";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { formatSecondsToTime } from "./jobsTableColumns";

interface JobSubjobsSectionProps {
  subjobs: SubjobDTO[];
}

export function JobSubjobsSection({ subjobs }: JobSubjobsSectionProps) {
  const { t } = useTranslation();

  const isNarrow = useMediaQuery("(max-width: 639px)");

  const columns: DataTableColumn<SubjobDTO>[] = [
    {
      key: "id",
      header: t("jobs.subjobId"),
      render: (subjob) => (
        <Link
          to={`/jobs/${subjob.id}`}
          className="whitespace-nowrap text-sm font-medium font-mono text-primary-600 hover:text-primary-800"
        >
          {subjob.id}
        </Link>
      ),
    },
    {
      key: "state",
      header: t("jobs.stateLabel"),
      render: (subjob) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
            (subjob as any).stateColor || "bg-gray-100 text-gray-800"
          }`}
        >
          {String(
            t(
              `jobs.state.${String((subjob as any).stateName || subjob.state || "")}`,
              {
                default: String((subjob as any).stateName || subjob.state || ""),
              }
            )
          )}
        </span>
      ),
    },
  ];

  if (!isNarrow) {
    columns.push(
      {
        key: "node",
        header: t("jobs.node"),
        render: (subjob) =>
          subjob.node ? (
            <Link
              to={`/machines/${String(subjob.node)}`}
              className="whitespace-nowrap text-sm text-primary-600 hover:text-primary-800"
            >
              {String(subjob.node)}
            </Link>
          ) : (
            <span className="text-sm text-gray-600">-</span>
          ),
      },
      {
        key: "cpuReserved",
        header: t("jobs.cpu"),
        render: (subjob) => (
          <span className="text-sm text-gray-600">{Number(subjob.cpuReserved)}</span>
        ),
      },
      {
        key: "memoryReserved",
        header: t("jobs.memory"),
        render: (subjob) => (
          <span className="whitespace-nowrap text-sm text-gray-600">
            {Number(subjob.memoryReserved).toFixed(2)} GB
            {typeof subjob.memoryUsed === "number" && (
              <span className="text-gray-400 ml-1">
                ({Number(subjob.memoryUsed).toFixed(2)} GB)
              </span>
            )}
          </span>
        ),
      },
      {
        key: "cpuTimeUsed",
        header: t("jobs.cpuTimeUsed"),
        render: (subjob) => (
          <span className="whitespace-nowrap text-sm text-gray-600">
            {String(subjob.cpuTimeUsed || "-")}
          </span>
        ),
      },
      {
        key: "runtime",
        header: t("jobs.runtime"),
        render: (subjob) => (
          <span className="whitespace-nowrap text-sm text-gray-600">
            {typeof subjob.runtime === "number" && subjob.runtime > 0
              ? formatSecondsToTime(subjob.runtime)
              : "-"}
          </span>
        ),
      },
      {
        key: "exitCode",
        header: t("jobs.exitCode"),
        render: (subjob) =>
          typeof subjob.exitCode === "number" ? (
            <span
              className={`text-sm ${subjob.exitCode === 0 ? "text-green-600" : "text-red-600"}`}
            >
              {subjob.exitCode}
            </span>
          ) : (
            <span className="text-sm text-gray-600">-</span>
          ),
      }
    );
  }

  if (subjobs.length === 0) {
    return null;
  }

  return (
    <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {t("jobs.subjobs")} ({subjobs.length})
      </h2>
      <DataTable columns={columns} rows={subjobs} rowKey={(subjob) => subjob.id} />
    </div>
  );
}
