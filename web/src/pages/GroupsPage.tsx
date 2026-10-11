import { useTranslation } from "react-i18next";
import { useGroups } from "@/hooks/useGroups";
import { useRowNavigate } from "@/lib/rowNavigation";
import {
  DataTable,
  PageContainer,
  PageHeader,
  ErrorState,
  LoadingState,
  type DataTableColumn,
} from "@metacentrum/design-system";
import type { GroupListDTO } from "@/lib/generated-api";

export function GroupsPage() {
  const { t } = useTranslation();
  const rowNavigate = useRowNavigate();
  const { data, isLoading, error } = useGroups();

  const columns: DataTableColumn<GroupListDTO>[] = [
    {
      key: "name",
      header: t("groups.name"),
      render: (group) => (
        <span className="text-sm font-medium text-primary-600 break-words">
          {group.name}
        </span>
      ),
    },
    {
      key: "gid",
      header: t("groups.gid"),
      render: (group) => <span className="text-sm text-gray-500">{group.gid}</span>,
    },
    {
      key: "memberCount",
      header: t("groups.memberCount"),
      render: (group) => (
        <span className="text-sm text-gray-500">{group.memberCount}</span>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader title={t("pages.groups")} />
      {isLoading && (
        <LoadingState label={t("common.loading")} />
      )}

      {error && (
        <ErrorState
          title={t("common.errorLoading")}
          description={
            error instanceof Error
              ? error.message
              : t("common.unknownError")
          }
        />
      )}

      {data && data.data && (
        <DataTable
          columns={columns}
          rows={data.data.groups}
          rowKey={(group) => group.name}
          emptyTitle={t("table.noRecords")}
          onRowClick={(group, event) =>
            rowNavigate(`/groups/${encodeURIComponent(group.name)}`, event)
          }
        />
      )}
    </PageContainer>
  );
}
