import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useJobs } from "@/hooks/useJobs";
import { useJobsSummary } from "@/hooks/useJobsSummary";
import { WaitingJobsTable } from "@/components/jobs/JobsTable";
import { WaitingJobsSummary } from "@/components/jobs/WaitingJobsSummary";
import { PageContainer, PageHeader } from "@metacentrum/design-system";

type SortColumn =
  | "id"
  | "name"
  | "owner"
  | "node"
  | "cpuReserved"
  | "gpuReserved"
  | "memoryReserved"
  | "createdAt";

export function WaitingJobsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [sort, setSort] = useState<SortColumn>("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [commentFilter, setCommentFilter] = useState<string | null>(null);

  const { data, isLoading, error } = useJobs({
    page,
    limit,
    sort,
    order,
    search: search.trim() || undefined,
    state: "Q", // Filter for queued jobs only
    comment: (typeof commentFilter === "string") ? commentFilter : undefined,
  });

  const {
    data: summaryData,
  } = useJobsSummary();

  const handleSort = (column: SortColumn) => {
    if (sort === column) {
      // Toggle order if same column
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      // Set new column with default order
      setSort(column);
      setOrder("desc");
    }
    setPage(1); // Reset to first page on sort
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = (query: string) => {
    setSearch(query);
    setPage(1); // Reset to first page on search
  };

  const handleFilterByReason = (reason: string) => {
    if (commentFilter === reason) {
      // Clear filter if clicking the same reason
      setCommentFilter(null);
    } else {
      // Set filter to this reason
      setCommentFilter(reason);
    }
    setPage(1); // Reset to first page on filter
    setSearch(""); // Clear search when filtering by reason
  };

  return (
    <PageContainer>
      <PageHeader title={t("pages.waitingJobs")} />
      {summaryData && (
        <WaitingJobsSummary
          summary={summaryData}
          onFilterByReason={handleFilterByReason}
          activeFilter={commentFilter}
        />
      )}

      {/* Remount on filter change to clear the search box */}
      <WaitingJobsTable
        key={commentFilter ?? ""}
        jobs={data?.data?.jobs ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        error={error}
        sortColumn={sort}
        sortDirection={order}
        onSort={handleSort}
        search={search}
        onSearchChange={handleSearchChange}
        page={page}
        pageSize={limit}
        onPageChange={handlePageChange}
      />
    </PageContainer>
  );
}
