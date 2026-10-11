import { useTranslation } from "react-i18next";
import { useStorageSpaces } from "@/hooks/useStorageSpaces";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUserStorageQuotas } from "@/hooks/useUserStorageQuotas";
import { StorageSpacesContent } from "@/components/storage-spaces/StorageSpacesContent";
import { PageContainer, PageHeader, ErrorState, LoadingState } from "@metacentrum/design-system";

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

      {data && <StorageSpacesContent data={data} quotasData={quotasData ?? undefined} />}
    </PageContainer>
  );
}
