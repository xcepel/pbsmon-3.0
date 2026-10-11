import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUsers } from "@/hooks/useUsers";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useImpersonation } from "@/contexts/ImpersonationContext";
import { useUsersTableColumns } from "@/components/users/usersTableColumns";
import { usePaginationLabels } from "@/lib/paginationLabels";
import {
  DataTable,
  PageContainer,
  PageHeader,
  type DataTableSort,
} from "@metacentrum/design-system";

const USERS_PAGE_SIZES = [20];

export function UsersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const paginationLabels = usePaginationLabels();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState<string>("fairshare-pbs-m1");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");

  const { data: currentUser } = useCurrentUser();
  const { impersonate } = useImpersonation();
  const isAdmin = currentUser?.role === "admin";

  // Includes short landscape phones, not only narrow ones.
  const isCompact = useMediaQuery(
    "(max-width: 639px), (max-height: 500px) and (orientation: landscape)"
  );

  const { data, isLoading, error } = useUsers({
    page,
    limit,
    sort,
    order,
    search: search.trim() || undefined,
  });

  const handleSortChange = (next: DataTableSort) => {
    if (next.key === sort) {
      setOrder(next.direction);
    } else {
      // New column: desc for fairshare, asc for others
      setSort(next.key);
      setOrder(next.key.startsWith("fairshare-") ? "desc" : "asc");
    }
    setPage(1); // Reset to first page on sort
  };

  const handlePaginationChange = (next: { page: number; pageSize: number }) => {
    setPage(next.page);
    setLimit(next.pageSize);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = (query: string) => {
    setSearch(query);
    setPage(1); // Reset to first page on search
  };

  const handleImpersonate = (username: string) => {
    impersonate(username);
    // Redirect admin to personal view page after impersonation
    navigate("/personal-view");
  };

  const fairshareServers = data?.data?.fairshareServers || [];
  const maxFairshare = data?.meta?.maxFairshare || {};
  const totalCount = data?.meta?.totalCount || 0;

  const columns = useUsersTableColumns({
    fairshareServers,
    maxFairshare,
    isAdmin,
    isCompact,
    onImpersonate: handleImpersonate,
  });

  return (
    <PageContainer>
      <PageHeader title={t("pages.users")} />
      <DataTable
        columns={columns}
        rows={data?.data?.users ?? []}
        rowKey={(user) => user.username}
        sort={{ key: sort, direction: order }}
        onSortChange={handleSortChange}
        search={{
          value: search,
          onChange: handleSearchChange,
          placeholder: t("users.searchPlaceholder"),
        }}
        toolbar={
          <span className="self-center px-4 text-sm text-gray-600 whitespace-nowrap">
            {t("users.totalUsers", { count: totalCount })}
          </span>
        }
        loading={isLoading}
        loadingLabel={t("common.loading")}
        error={
          error
            ? {
                title: t("common.errorLoading"),
                description:
                  error instanceof Error ? error.message : t("common.unknownError"),
              }
            : undefined
        }
        emptyTitle={t("users.noUsersFound")}
        pagination={{
          page,
          pageSize: limit,
          totalItems: totalCount,
          onChange: handlePaginationChange,
          pageSizes: USERS_PAGE_SIZES,
          labels: paginationLabels,
        }}
      />
    </PageContainer>
  );
}
