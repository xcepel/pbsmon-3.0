import { useTranslation } from "react-i18next";
import { useStorageSpaces } from "@/hooks/useStorageSpaces";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUserStorageQuotas } from "@/hooks/useUserStorageQuotas";
import { StorageSpacesContent } from "@/components/storage-spaces/StorageSpacesContent";
import { PageContainer, PageHeader } from "@metacentrum/design-system";

export function StorageSpacesPage() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useStorageSpaces();
  const { data: currentUser } = useCurrentUser();
  const username = currentUser?.username?.split("@")[0];
  const { data: quotasData } = useUserStorageQuotas(username);

  return (
    <PageContainer>
      <PageHeader title={t("pages.storageSpaces")} />

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">{t("common.loading")}</div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">
            {t("common.errorLoading")}{" "}
            {error instanceof Error ? error.message : t("common.unknownError")}
          </div>
        </div>
      )}

      {data && <StorageSpacesContent data={data} quotasData={quotasData ?? undefined} />}
    </PageContainer>
  );
}
