import { useTranslation } from "react-i18next";
import type { UserInfoDTO, UserUsageDTO } from "@/lib/generated-api";
import {
  DataTable,
  LoadingState,
  ErrorState,
  EmptyState,
  type DataTableColumn,
} from "@metacentrum/design-system";


interface UserAccountingSectionProps {
  accountingData: UserInfoDTO | null;
  isLoading: boolean;
  error: Error | null;
}

function formatCpuTime(seconds: number, t: any): string {
  if (seconds === 0) return "0";

  const secondsYear = 365 * 24 * 3600;
  const secondsDay = 24 * 3600;
  const years = Math.floor(seconds / secondsYear);
  const days = Math.floor((seconds % secondsYear) / secondsDay);
  const hours = Math.floor(((seconds % secondsYear) % secondsDay) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (years > 0) {
    return `${years} ${
      years === 1
        ? t("users.accounting.year1")
        : (years < 5 ? t("users.accounting.years4") : t("users.accounting.years5plus"))
      } ${days} ${
      days === 1
        ? t("users.accounting.day1")
        : (days < 5 ? t("users.accounting.days4") : t("users.accounting.days5plus"))
      } ${hours}h ${minutes}m ${secs}s`;
  } else if (days > 0){
    return `${days} ${
      days === 1
        ? t("users.accounting.day1")
        : (days < 5 ? t("users.accounting.days4") : t("users.accounting.days5plus"))
    } ${hours}h ${minutes}m ${secs}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + "K";
  }
  return num.toFixed(0);
}

export function UserAccountingSection({
  accountingData,
  isLoading,
  error,
}: UserAccountingSectionProps) {
  const { t } = useTranslation();

  const usageColumns: DataTableColumn<UserUsageDTO>[] = [
    {
      key: "year",
      header: t("users.accounting.year"),
      render: (usage) => (
        <span className="whitespace-nowrap text-sm font-medium text-gray-900">
          {usage.year}
        </span>
      ),
    },
    {
      key: "jobCount",
      header: t("users.accounting.jobs"),
      render: (usage) => (
        <span className="whitespace-nowrap text-sm text-gray-600">
          {formatLargeNumber(usage.jobCount)}
        </span>
      ),
    },
    {
      key: "cpuTime",
      header: t("users.accounting.cpuTime"),
      render: (usage) => (
        <span className="text-sm text-gray-600 sm:whitespace-nowrap">
          {formatCpuTime(usage.cpuTime, t)}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
        <LoadingState label={t("common.loading")} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
        <ErrorState
          title={t("common.errorLoading")}
          description={error.message}
        />
      </div>
    );
  }

  if (!accountingData) {
    return (
      <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
        <EmptyState title={t("users.accounting.notAvailable")} />
      </div>
    );
  }

  return (
    <div className="px-6 py-4 border-t border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {t("users.accounting.title")}
      </h2>
      
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">
            {t("users.accounting.totalJobs")}
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatLargeNumber(accountingData.jobCount)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">
            {t("users.accounting.totalCpuTime")}
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCpuTime(accountingData.totalCpuTime, t)}
          </div>
        </div>
      </div>

      {/* Yearly Usage Breakdown */}
      {accountingData.usages && accountingData.usages.length > 0 && (
        <div>
          <h3 className="text-md font-semibold text-gray-900 mb-3">
            {t("users.accounting.yearlyUsage")}
          </h3>
          <DataTable
            columns={usageColumns}
            rows={accountingData.usages}
            rowKey={(usage) => usage.year}
          />
        </div>
      )}
    </div>
  );
}

