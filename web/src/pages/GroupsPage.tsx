import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useGroups } from "@/hooks/useGroups";
import { PageContainer, PageHeader, ErrorState, LoadingState } from "@metacentrum/design-system";

export function GroupsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGroups();

  const handleGroupClick = (groupName: string) => {
    navigate(`/groups/${encodeURIComponent(groupName)}`);
  };

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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("groups.name")}
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("groups.gid")}
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("groups.memberCount")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.data.groups.map((group) => (
                  <tr
                    key={group.name}
                    onClick={() => handleGroupClick(group.name)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-normal sm:whitespace-nowrap text-sm font-medium text-primary-600 break-words">
                      {group.name}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                      {group.gid}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                      {group.memberCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
