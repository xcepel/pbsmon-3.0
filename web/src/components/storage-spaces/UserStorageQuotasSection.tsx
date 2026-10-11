import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type {
  UserStorageQuota,
  UserStorageQuotasData,
} from "@/hooks/useUserStorageQuotas";
import { DataTable, EmptyState, type DataTableColumn } from "@metacentrum/design-system";

interface UserStorageQuotasSectionProps {
  data: UserStorageQuotasData;
}

function formatNumber(n: number | null): string {
  if (n === null) return "—";
  return n.toLocaleString();
}

function formatQuota(v: string | null): string {
  return v ?? "—";
}

function formatGrace(v: string | null): string {
  if (!v) return "—";
  return v;
}

export function UserStorageQuotasSection({
  data,
}: UserStorageQuotasSectionProps) {
  const { t } = useTranslation();

  // Compact view covers narrow-width phones (portrait) as well as short-height
  // phones in landscape, where a width-only breakpoint would otherwise show
  // the full desktop column set on a screen too short to comfortably use it.
  const isCompact = useMediaQuery(
    "(max-width: 639px), (max-height: 500px) and (orientation: landscape)"
  );

  // DataTable can't centre, so grace columns are start-aligned.
  const allColumns: (DataTableColumn<UserStorageQuota> | false)[] = [
    {
      key: "directory",
      header: t("storageSpaces.userQuotas.directory"),
      render: (quota) => (
        <span
          title={quota.directory}
          className="block font-mono text-xs text-gray-700 max-w-[10rem] sm:max-w-xs truncate"
        >
          {quota.directory}
        </span>
      ),
    },
    {
      key: "used",
      header: t("storageSpaces.userQuotas.used"),
      align: "end",
      render: (quota) => <span className="text-sm text-gray-800">{quota.used}</span>,
    },
    !isCompact && {
      key: "softQuota",
      header: t("storageSpaces.userQuotas.softQuota"),
      align: "end",
      render: (quota) => (
        <span className="text-sm text-gray-500">{formatQuota(quota.softQuota)}</span>
      ),
    },
    {
      key: "hardQuota",
      header: t("storageSpaces.userQuotas.hardQuota"),
      align: "end",
      render: (quota) => (
        <span className="text-sm text-gray-500">{formatQuota(quota.hardQuota)}</span>
      ),
    },
    !isCompact && {
      key: "grace",
      header: t("storageSpaces.userQuotas.grace"),
      render: (quota) => (
        <span className="text-sm text-gray-500">{formatGrace(quota.grace)}</span>
      ),
    },
    !isCompact && {
      key: "filesUsed",
      header: t("storageSpaces.userQuotas.filesUsed"),
      align: "end",
      render: (quota) => (
        <span className="text-sm text-gray-800">{formatNumber(quota.filesUsed)}</span>
      ),
    },
    !isCompact && {
      key: "filesLimit",
      header: t("storageSpaces.userQuotas.filesLimit"),
      align: "end",
      render: (quota) => (
        <span className="text-sm text-gray-500 whitespace-nowrap">
          {quota.filesSoftLimit !== null || quota.filesHardLimit !== null
            ? `${formatNumber(quota.filesSoftLimit)} / ${formatNumber(quota.filesHardLimit)}`
            : "—"}
        </span>
      ),
    },
    !isCompact && {
      key: "filesGrace",
      header: t("storageSpaces.userQuotas.filesGrace"),
      render: (quota) => (
        <span className="text-sm text-gray-500">{formatGrace(quota.filesGrace)}</span>
      ),
    },
  ];
  const columns = allColumns.filter(
    (c): c is DataTableColumn<UserStorageQuota> => Boolean(c)
  );

  if (!data.quotas || data.quotas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t("storageSpaces.userQuotas.title")}
        </h2>
        <EmptyState title={t("storageSpaces.userQuotas.noData")} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("storageSpaces.userQuotas.title")}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {t("storageSpaces.userQuotas.username")}: <span className="font-medium text-gray-700">{data.username}</span>
        </p>
      </div>

      <DataTable
        columns={columns}
        rows={data.quotas}
        rowKey={(quota) => quota.directory}
      />
    </div>
  );
}
