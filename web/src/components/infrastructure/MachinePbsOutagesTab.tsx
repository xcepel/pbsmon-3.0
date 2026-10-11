import { useTranslation } from "react-i18next";
import { useNodeOutages } from "@/hooks/useNodeOutages";
import type { OutageRecordDTO } from "@/lib/generated-api";
import {
  DataTable,
  LoadingState,
  ErrorState,
  EmptyState,
  type DataTableColumn,
} from "@metacentrum/design-system";

interface MachinePbsOutagesTabProps {
  nodeName: string | null;
}

export function MachinePbsOutagesTab({ nodeName }: MachinePbsOutagesTabProps) {
  const { t } = useTranslation();
  const { data: outages, isLoading, error } = useNodeOutages(nodeName);

  const formatDateTime = (
    date: Date | string | Record<string, any> | null | undefined
  ): string => {
    if (!date) {
      return "<null>";
    }

    try {
      // Handle Date object
      if (date instanceof Date) {
        const d = date;
        if (isNaN(d.getTime())) {
          return "<null>";
        }
        // Format: YYYY-MM-DD HH:MM:SS.microseconds +00:00
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, "0");
        const day = String(d.getUTCDate()).padStart(2, "0");
        const hours = String(d.getUTCHours()).padStart(2, "0");
        const minutes = String(d.getUTCMinutes()).padStart(2, "0");
        const seconds = String(d.getUTCSeconds()).padStart(2, "0");
        const milliseconds = String(d.getUTCMilliseconds()).padStart(3, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}000 +00:00`;
      }

      // Handle string (ISO date string from JSON)
      if (typeof date === "string") {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
          return "<null>";
        }
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, "0");
        const day = String(d.getUTCDate()).padStart(2, "0");
        const hours = String(d.getUTCHours()).padStart(2, "0");
        const minutes = String(d.getUTCMinutes()).padStart(2, "0");
        const seconds = String(d.getUTCSeconds()).padStart(2, "0");
        const milliseconds = String(d.getUTCMilliseconds()).padStart(3, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}000 +00:00`;
      }

      // Handle Record<string, any> (shouldn't happen, but handle it)
      return "<null>";
    } catch {
      return "<null>";
    }
  };

  const formatComment = (
    comment: string | Record<string, any> | null | undefined
  ): string => {
    if (!comment) {
      return "-";
    }
    if (typeof comment === "string") {
      return comment;
    }
    // If it's an object, try to stringify it (shouldn't happen normally)
    return String(comment);
  };

  if (isLoading) {
    return <LoadingState label={t("common.loading")} />;
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 py-4">
        <ErrorState
          title={t("common.errorLoading")}
          description={
            error instanceof Error ? error.message : t("common.unknownError")
          }
        />
      </div>
    );
  }

  if (!outages || outages.length === 0) {
    return <EmptyState title={t("machines.noOutages")} />;
  }

  // Outages have no id; rows are keyed by API list index.
  const columns: DataTableColumn<OutageRecordDTO>[] = [
    {
      key: "type",
      header: "Type",
      render: (outage) => (
        <span className="whitespace-nowrap text-sm text-gray-900">
          {outage.type || "-"}
        </span>
      ),
    },
    {
      key: "startTime",
      header: "Start Time",
      render: (outage) => (
        <span className="whitespace-nowrap text-sm text-gray-900 font-mono">
          {formatDateTime(outage.startTime)}
        </span>
      ),
    },
    {
      key: "endTime",
      header: "End Time",
      render: (outage) => (
        <span className="whitespace-nowrap text-sm text-gray-900 font-mono">
          {formatDateTime(outage.endTime)}
        </span>
      ),
    },
    {
      key: "comment",
      header: "Comment",
      render: (outage) => (
        <span className="text-sm text-gray-900">{formatComment(outage.comment)}</span>
      ),
    },
  ];

  return (
    <div className="px-6 py-4">
      <DataTable
        columns={columns}
        rows={outages}
        rowKey={(outage) => outages.indexOf(outage)}
      />
    </div>
  );
}
