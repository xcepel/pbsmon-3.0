import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useGroupDetail } from "@/hooks/useGroups";
import { useRowNavigate } from "@/lib/rowNavigation";
import type { GroupMemberDTO } from "@/lib/generated-api";
import {
  DataTable,
  PageContainer,
  PageHeader,
  EmptyState,
  ErrorState,
  LoadingState,
  type DataTableColumn,
} from "@metacentrum/design-system";

export function GroupDetailPage() {
  const { t } = useTranslation();
  const { groupName } = useParams<{ groupName: string }>();
  const decodedGroupName = groupName ? decodeURIComponent(groupName) : "";
  const {
    data: groupDetail,
    isLoading,
    error,
  } = useGroupDetail(decodedGroupName);
  const data = groupDetail?.data;
  const rowNavigate = useRowNavigate();

  const memberColumns: DataTableColumn<GroupMemberDTO>[] = [
    {
      key: "nickname",
      header: t("groups.nickname"),
      render: (member) => (
        <span className="text-sm font-medium text-gray-900 break-words">
          {member.nickname}
        </span>
      ),
    },
    {
      key: "name",
      header: t("groups.name"),
      render: (member) => (
        <span className="text-sm text-gray-500 break-words">
          {member.name
            ? typeof member.name === "string"
              ? member.name
              : member.name.name
            : "-"}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.groupDetail")} />
        <LoadingState label={t("common.loading")} />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.groupDetail")} />
        <ErrorState
          title={t("common.errorLoading")}
          description={
            error instanceof Error
              ? error.message
              : t("common.unknownError")
          }
        />
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer>
        <PageHeader title={t("pages.groupDetail")} />
        <EmptyState title={t("groups.groupNotFound")} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title={t("pages.groupDetail")} />
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Group Info Section */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">{t("groups.name")}</div>
              <div className="text-lg font-semibold text-gray-900 break-words">
                {data.name}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{t("groups.gid")}</div>
              <div className="text-lg font-semibold text-gray-900">
                {data.gid}
              </div>
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div className="px-4 sm:px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t("groups.members")} ({data.members.length})
          </h2>
          <DataTable
            columns={memberColumns}
            rows={data.members}
            rowKey={(member) => member.nickname}
            emptyTitle={t("table.noRecords")}
            onRowClick={(member, event) =>
              rowNavigate(`/users/${encodeURIComponent(member.nickname)}`, event)
            }
          />
        </div>
      </div>
    </PageContainer>
  );
}
