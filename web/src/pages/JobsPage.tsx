import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useJobs } from "@/hooks/useJobs";
import { useJobsSummary } from "@/hooks/useJobsSummary";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { JobsTable, WaitingJobsTable } from "@/components/jobs/JobsTable";
import { WaitingJobsSummary } from "@/components/jobs/WaitingJobsSummary";
import { Tabs } from "@/components/common/Tabs";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useJobsPageSize } from "@/hooks/useJobsPageSize";
import type { JobFilterableState } from "@/components/jobs/JobsFilterableHeader";
import { PageContainer, PageHeader } from "@metacentrum/design-system";

type SortColumn =
  | "id"
  | "name"
  | "queue"
  | "state"
  | "owner"
  | "node"
  | "cpuReserved"
  | "gpuReserved"
  | "memoryReserved"
  | "createdAt";

type WaitingSortColumn =
  | "id"
  | "name"
  | "owner"
  | "node"
  | "cpuReserved"
  | "gpuReserved"
  | "memoryReserved"
  | "createdAt";

export function JobsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"all" | "waiting" | "my">(
    tabParam === "waiting" ? "waiting" : tabParam === "my" ? "my" : "all"
  );
  // Compact view covers narrow-width phones (portrait) as well as short-height
  // phones in landscape, where a width-only breakpoint would otherwise still
  // show the Waiting Jobs tab on a screen too short to comfortably use it.
  const isMobile = useMediaQuery(
    "(max-width: 639px), (max-height: 500px) and (orientation: landscape)"
  );

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab === "waiting") {
      setSearchParams({ tab: "waiting" }, { replace: true });
    } else if (activeTab === "my") {
      setSearchParams({ tab: "my" }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [activeTab, setSearchParams]);

  // Waiting Jobs isn't shown on phones (its wide comment/reason column
  // doesn't work well on narrow screens) - bounce away from it if needed.
  useEffect(() => {
    if (isMobile && activeTab === "waiting") {
      setActiveTab("all");
    }
  }, [isMobile, activeTab]);

  // Job list page size - shared and persisted (localStorage) across all tabs
  const [jobsPageSize, setJobsPageSize] = useJobsPageSize();

  // All Jobs tab state
  const [allJobsPage, setAllJobsPage] = useState(1);
  const [allJobsSort, setAllJobsSort] = useState<SortColumn>("createdAt");
  const [allJobsOrder, setAllJobsOrder] = useState<"asc" | "desc">("desc");
  const [allJobsSearch, setAllJobsSearch] = useState("");
  const [allStateFilter, setAllStateFilter] = useState<JobFilterableState>("all");

  // Waiting Jobs tab state
  const [waitingJobsPage, setWaitingJobsPage] = useState(1);
  const [waitingJobsSort, setWaitingJobsSort] =
    useState<WaitingSortColumn>("createdAt");
  const [waitingJobsOrder, setWaitingJobsOrder] = useState<"asc" | "desc">(
    "desc"
  );
  const [waitingJobsSearch, setWaitingJobsSearch] = useState("");
  const [commentFilter, setCommentFilter] = useState<string | null>(null);

  // My Jobs tab state
  const [myJobsPage, setMyJobsPage] = useState(1);
  const [myJobsSort, setMyJobsSort] = useState<SortColumn>("createdAt");
  const [myJobsOrder, setMyJobsOrder] = useState<"asc" | "desc">("desc");
  const [myJobsSearch, setMyJobsSearch] = useState("");
  const [myStateFilter, setMyStateFilter] = useState<JobFilterableState>("all");

  const { data: currentUser } = useCurrentUser();
  const currentUsername = currentUser?.username?.split("@")[0] || "";

  // Fetch all jobs
  const {
    data: allJobsData,
    isLoading: allJobsLoading,
    error: allJobsError,
  } = useJobs({
    page: allJobsPage,
    limit: jobsPageSize,
    sort: allJobsSort,
    order: allJobsOrder,
    search: allJobsSearch.trim() || undefined,
    state: allStateFilter === 'all' ? undefined : allStateFilter,
    enabled: activeTab === "all",
  });

  // Fetch waiting jobs
  const {
    data: waitingJobsData,
    isLoading: waitingJobsLoading,
    error: waitingJobsError,
  } = useJobs({
    page: waitingJobsPage,
    limit: jobsPageSize,
    sort: waitingJobsSort,
    order: waitingJobsOrder,
    search: waitingJobsSearch.trim() || undefined,
    state: "Q|W", // Filter for queued jobs only
    comment: (typeof commentFilter === "string") ? commentFilter : undefined,
    enabled: activeTab === "waiting",
  });

  // Fetch my jobs (filtered by current user's username)
  // Use owner filter to get only the current user's jobs
  const {
    data: myJobsData,
    isLoading: myJobsLoading,
    error: myJobsError,
  } = useJobs({
    page: myJobsPage,
    limit: jobsPageSize,
    sort: myJobsSort,
    order: myJobsOrder,
    search: myJobsSearch.trim() || undefined,
    owner: currentUsername || undefined, // Filter by current user's username
    state: myStateFilter === 'all' ? undefined : myStateFilter,
    enabled: activeTab === "my" && !!currentUsername,
  });

  const {
    data: summaryData,
  } = useJobsSummary({
    enabled: activeTab === "waiting",
  });

  // All Jobs handlers
  const handleAllJobsSort = (column: SortColumn) => {
    if (allJobsSort === column) {
      setAllJobsOrder(allJobsOrder === "asc" ? "desc" : "asc");
    } else {
      setAllJobsSort(column);
      setAllJobsOrder("desc");
    }
    setAllJobsPage(1);
  };

  const handleAllStateFilterChange = (state: JobFilterableState) => {
    setAllStateFilter(state);
    setAllJobsPage(1);
  };

  const handleAllJobsPageChange = (newPage: number) => {
    setAllJobsPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAllJobsSearchChange = (query: string) => {
    setAllJobsSearch(query);
    setAllJobsPage(1);
  };

  // Waiting Jobs handlers
  const handleWaitingJobsSort = (column: WaitingSortColumn) => {
    if (waitingJobsSort === column) {
      setWaitingJobsOrder(waitingJobsOrder === "asc" ? "desc" : "asc");
    } else {
      setWaitingJobsSort(column);
      setWaitingJobsOrder("desc");
    }
    setWaitingJobsPage(1);
  };

  const handleWaitingJobsPageChange = (newPage: number) => {
    setWaitingJobsPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWaitingJobsSearchChange = (query: string) => {
    setWaitingJobsSearch(query);
    setWaitingJobsPage(1);
  };

  const handleFilterByReason = (reason: string) => {
    if (commentFilter === reason) {
      // Clear filter if clicking the same reason
      setCommentFilter(null);
    } else {
      // Set filter to this reason
      setCommentFilter(reason);
    }
    setWaitingJobsPage(1); // Reset to first page on filter
    setWaitingJobsSearch(""); // Clear search when filtering by reason
  };

  // My Jobs handlers
  const handleMyJobsSort = (column: SortColumn) => {
    if (myJobsSort === column) {
      setMyJobsOrder(myJobsOrder === "asc" ? "desc" : "asc");
    } else {
      setMyJobsSort(column);
      setMyJobsOrder("desc");
    }
    setMyJobsPage(1);
  };

  const handleMyStateFilterChange = (state: JobFilterableState) => {
    setMyStateFilter(state);
    setMyJobsPage(1);
  };

  const handleMyJobsPageChange = (newPage: number) => {
    setMyJobsPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMyJobsSearchChange = (query: string) => {
    setMyJobsSearch(query);
    setMyJobsPage(1);
  };

  // Shared page size handler - resets every tab back to its first page
  const handleJobsPageSizeChange = (newSize: number) => {
    setJobsPageSize(newSize);
    setAllJobsPage(1);
    setWaitingJobsPage(1);
    setMyJobsPage(1);
  };

  const tabs = [
    {
      id: "my",
      label: t("jobs.tabs.myJobs"),
      content: (
        <JobsTable
          jobs={myJobsData?.data?.jobs ?? []}
          meta={myJobsData?.meta}
          isLoading={myJobsLoading}
          error={myJobsError}
          hideUserColumn
          sortColumn={myJobsSort}
          sortDirection={myJobsOrder}
          onSort={handleMyJobsSort}
          search={myJobsSearch}
          onSearchChange={handleMyJobsSearchChange}
          stateFilter={myStateFilter}
          onStateFilterChange={handleMyStateFilterChange}
          page={myJobsPage}
          pageSize={jobsPageSize}
          onPageChange={handleMyJobsPageChange}
          onPageSizeChange={handleJobsPageSizeChange}
        />
      ),
    },
    {
      id: "all",
      label: t("jobs.tabs.allJobs"),
      content: (
        <JobsTable
          jobs={allJobsData?.data?.jobs ?? []}
          meta={allJobsData?.meta}
          isLoading={allJobsLoading}
          error={allJobsError}
          sortColumn={allJobsSort}
          sortDirection={allJobsOrder}
          onSort={handleAllJobsSort}
          search={allJobsSearch}
          onSearchChange={handleAllJobsSearchChange}
          stateFilter={allStateFilter}
          onStateFilterChange={handleAllStateFilterChange}
          page={allJobsPage}
          pageSize={jobsPageSize}
          onPageChange={handleAllJobsPageChange}
          onPageSizeChange={handleJobsPageSizeChange}
        />
      ),
    },
    {
      id: "waiting",
      label: t("jobs.tabs.waitingJobs"),
      content: (
        <div>
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
            jobs={waitingJobsData?.data?.jobs ?? []}
            meta={waitingJobsData?.meta}
            isLoading={waitingJobsLoading}
            error={waitingJobsError}
            sortColumn={waitingJobsSort}
            sortDirection={waitingJobsOrder}
            onSort={handleWaitingJobsSort}
            search={waitingJobsSearch}
            onSearchChange={handleWaitingJobsSearchChange}
            page={waitingJobsPage}
            pageSize={jobsPageSize}
            onPageChange={handleWaitingJobsPageChange}
            onPageSizeChange={handleJobsPageSizeChange}
          />
        </div>
      ),
    },
  ];

  const visibleTabs = isMobile ? tabs.filter((tab) => tab.id !== "waiting") : tabs;

  return (
    <PageContainer>
      <PageHeader title={t("pages.jobs")} />
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 sm:px-6 py-4">
          <Tabs
            tabs={visibleTabs}
            activeTab={activeTab}
            onTabChange={(tabId) =>
              setActiveTab(tabId as "all" | "waiting" | "my")
            }
          />
        </div>
      </div>
    </PageContainer>
  );
}
