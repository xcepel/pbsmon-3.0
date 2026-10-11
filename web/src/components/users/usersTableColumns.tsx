import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button, type DataTableColumn } from "@metacentrum/design-system";
import type { UserListDTO } from "@/lib/generated-api";

interface UsersTableColumnsOptions {
  fairshareServers: string[];
  maxFairshare: Record<string, number>;
  isAdmin: boolean;
  isCompact: boolean;
  onImpersonate: (username: string) => void;
}

// Higher ranking = better (opposite ranking: higher numbers are better)
function getRankingIcon(ranking: number, maxRanking: number) {
  const percentage = (ranking / maxRanking) * 100;
  if (percentage >= 80) {
    return <Icon icon="mdi:check-circle" className="w-4 h-4 text-green-600" />;
  } else if (percentage >= 50) {
    return <Icon icon="mdi:alert" className="w-4 h-4 text-yellow-600" />;
  }
  return <Icon icon="mdi:alert-circle" className="w-4 h-4 text-red-600" />;
}

export function useUsersTableColumns({
  fairshareServers,
  maxFairshare,
  isAdmin,
  isCompact,
  onImpersonate,
}: UsersTableColumnsOptions): DataTableColumn<UserListDTO>[] {
  const { t } = useTranslation();

  const renderCounts = (
    queued: number | undefined,
    running: number | undefined,
    done: number | undefined,
    total: number | undefined
  ) => (
    <div className="flex gap-2 flex-wrap">
      <div>
        <span className="text-gray-500">{t("queues.queued")}</span>
        <span className="font-medium ml-1">{queued || 0}</span>
      </div>
      <div>
        <span className="text-gray-500">{t("queues.running")}</span>
        <span className="font-medium text-blue-600 ml-1">{running || 0}</span>
      </div>
      <div>
        <span className="text-gray-500">{t("queues.done")}</span>
        <span className="font-medium text-green-600 ml-1">{done || 0}</span>
      </div>
      <div>
        <span className="text-gray-500">{t("queues.total")}</span>
        <span className="font-medium ml-1">{total || 0}</span>
      </div>
    </div>
  );

  const renderTasks = (user: UserListDTO) => {
    if (!user.totalTasks) {
      return <span className="text-gray-400 italic">{t("users.noJobs")}</span>;
    }
    return (
      <div className="text-sm text-gray-600">
        <div className="flex gap-2 flex-wrap">
          <div>
            <span className="text-gray-500">{t("queues.queued")}</span>
            <span className="font-medium ml-2">{user.queuedTasks}</span>
          </div>
          <div>
            <span className="text-gray-500">{t("queues.running")}</span>
            <span className="font-medium text-blue-600 ml-2">{user.runningTasks}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div>
            <span className="text-gray-500">{t("queues.done")}</span>
            <span className="font-medium text-green-600 ml-2">{user.doneTasks}</span>
          </div>
          <div>
            <span className="text-gray-500">{t("queues.total")}</span>
            <span className="font-medium ml-2">{user.totalTasks}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderResourceUsage = (user: UserListDTO) => {
    const totalCPU = user.totalCPU || 0;
    const totalGPU = user.totalGPU || 0;

    if (totalCPU === 0 && totalGPU === 0) {
      return <span className="text-gray-400 italic">{t("users.noResources")}</span>;
    }

    return (
      <div className="space-y-1 text-sm text-gray-600">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-gray-500 font-medium">CPU:</span>
          {totalCPU === 0 ? (
            <span className="text-gray-400 italic">{t("users.noCpuResources")}</span>
          ) : (
            renderCounts(user.queuedCPU, user.runningCPU, user.doneCPU, user.totalCPU)
          )}
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-gray-500 font-medium">GPU:</span>
          {totalGPU === 0 ? (
            <span className="text-gray-400 italic">{t("users.noGpuResources")}</span>
          ) : (
            renderCounts(user.queuedGPU, user.runningGPU, user.doneGPU, user.totalGPU)
          )}
        </div>
      </div>
    );
  };

  const fairshareColumns: DataTableColumn<UserListDTO>[] = fairshareServers.map(
    (server, index) => ({
      key: `fairshare-${server}`,
      sortable: true,
      width: "7.5rem",
      // No spanning header: tooltip only on the first server column.
      header: (
        <span className="inline-flex items-center gap-1">
          <span>
            {t("queues.fairshare")} <span className="font-normal">{server}</span>
          </span>
          {index === 0 && (
            <span
              className="inline-flex cursor-help"
              title={t("fairshare.infoTooltip")}
              aria-label={t("fairshare.infoTooltip")}
            >
              <Icon icon="mdi:information" className="w-4 h-4 text-gray-400" />
            </span>
          )}
        </span>
      ),
      render: (user) => {
        const ranking = user.fairshareRankings?.[server];
        const maxRanking = maxFairshare[server];
        return ranking !== undefined && ranking !== null && maxRanking ? (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            {getRankingIcon(ranking, maxRanking)}
            <span className="font-medium">{ranking}</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    })
  );

  const columns: (DataTableColumn<UserListDTO> | false)[] = [
    {
      key: "username",
      header: t("users.username"),
      sortable: true,
      width: "10rem",
      render: (user) => (
        <Link
          to={`/users/${user.username}`}
          className="font-medium text-gray-900 hover:text-primary-600"
        >
          {user.username}
        </Link>
      ),
    },
    !isCompact && {
      key: "nickname",
      header: t("users.nickname"),
      sortable: true,
      width: "12rem",
      render: (user) => (
        <span className="text-sm text-gray-600">
          {typeof user.nickname === "string"
            ? user.nickname
            : user.nickname
              ? String(user.nickname)
              : "-"}
        </span>
      ),
    },
    ...fairshareColumns,
    !isCompact && {
      key: "totalTasks",
      header: t("users.totalTasks"),
      sortable: true,
      width: "15rem",
      render: renderTasks,
    },
    !isCompact && {
      key: "totalCPU",
      header: t("users.resourceUsage"),
      sortable: true,
      render: renderResourceUsage,
    },
    !isCompact &&
      isAdmin && {
        key: "actions",
        header: t("users.actions"),
        width: "8rem",
        render: (user) => (
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onImpersonate(user.username);
            }}
          >
            {t("users.impersonate")}
          </Button>
        ),
      },
  ];

  return columns.filter((c): c is DataTableColumn<UserListDTO> => Boolean(c));
}
