import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { ProjectUserDTO } from "@/lib/generated-api";
import { DataTable, type DataTableColumn } from "@metacentrum/design-system";

interface ProjectUsersSectionProps {
  users: ProjectUserDTO[];
}

// Generated types allow non-string values; normalise them once per row.
interface ProjectUserRow {
  key: string;
  isFoundInPerun: boolean;
  fullName: string | null;
  orgString: string | null;
  idString: string | null;
  nameString: string;
  lognameString: string;
}

function toRow(user: ProjectUserDTO, index: number): ProjectUserRow {
  const fullName =
    typeof user.fullName === "string"
      ? user.fullName
      : user.fullName
        ? String(user.fullName)
        : null;
  const orgString =
    typeof user.org === "string"
      ? user.org
      : user.org === null
        ? null
        : String(user.org);
  const idString =
    typeof user.id === "string"
      ? user.id
      : user.id === null
        ? null
        : String(user.id);
  const nameString =
    typeof user.name === "string" ? user.name : String(user.name);
  const lognameString =
    typeof user.logname === "string" ? user.logname : String(user.logname);

  return {
    key: lognameString || idString || String(index),
    isFoundInPerun: user.foundInPerun !== false,
    fullName,
    orgString,
    idString,
    nameString,
    lognameString,
  };
}

export function ProjectUsersSection({ users }: ProjectUsersSectionProps) {
  const { t } = useTranslation();

  // Compact view covers narrow-width phones (portrait) as well as short-height
  // phones in landscape, where a width-only breakpoint would otherwise show
  // the full desktop column set on a screen too short to comfortably use it.
  const isCompact = useMediaQuery(
    "(max-width: 639px), (max-height: 500px) and (orientation: landscape)"
  );

  const rows = users.map(toRow);

  const columns: (DataTableColumn<ProjectUserRow> | false)[] = [
    {
      key: "name",
      header: t("projects.userName"),
      render: (user) => {
        if (user.isFoundInPerun) {
          return (
            <Link
              to={`/users/${encodeURIComponent(user.lognameString)}`}
              className="flex items-center text-sm font-medium text-primary-700 hover:text-primary-900 whitespace-nowrap"
            >
              <Icon icon="mdi:account" className="w-5 h-5 text-gray-400 mr-2" />
              <span>{user.fullName || user.nameString}</span>
            </Link>
          );
        }
        const tooltipId = `user-not-found-${user.key}`;
        return (
          <>
            <div
              className="flex items-center text-sm font-medium text-gray-600 whitespace-nowrap"
              data-tooltip-id={tooltipId}
              data-tooltip-content={t("projects.userNotFoundInPerun")}
            >
              <Icon icon="mdi:account-alert" className="w-5 h-5 text-gray-400 mr-2" />
              <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {user.fullName || user.idString || user.nameString}
              </code>
            </div>
            <Tooltip
              id={tooltipId}
              style={{ maxWidth: "300px", whiteSpace: "normal" }}
            />
          </>
        );
      },
    },
    !isCompact && {
      key: "logname",
      header: t("projects.userLogname"),
      render: (user) => (
        <code
          title={user.lognameString || undefined}
          className="inline-block max-w-[10rem] sm:max-w-xs align-bottom truncate text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
        >
          {user.lognameString || "-"}
        </code>
      ),
    },
    !isCompact && {
      key: "org",
      header: t("projects.userOrg"),
      render: (user) => (
        <span className="text-sm text-gray-900 whitespace-nowrap">
          {user.orgString || "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="px-6 py-4 border-t border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {t("projects.users")}
        {users.length > 0 && ` (${users.length})`}
      </h2>
      <DataTable
        columns={columns.filter((c): c is DataTableColumn<ProjectUserRow> => Boolean(c))}
        rows={rows}
        rowKey={(user) => user.key}
        emptyTitle={t("projects.noUsers")}
      />
    </div>
  );
}
