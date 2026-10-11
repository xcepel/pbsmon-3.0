import { useTranslation } from "react-i18next";
import { useState, useCallback, useEffect } from "react";
import { useInfrastructure, useInfrastructureFilterables } from "@/hooks/useInfrastructure";
import { OrganizationPreview } from "@/components/infrastructure/OrganizationPreview";
import { MetacentrumOverview } from "@/components/infrastructure/MetacentrumOverview";
import { QuickLinksSidebar } from "@/components/infrastructure/QuickLinksSidebar";
import { MachineSearchBar } from "@/components/infrastructure/MachineSearchBar";
import { MachinesHeader } from "@/components/infrastructure/MachinesHeader";
import { MachineLegend } from "@/components/infrastructure/MachineLegend";
import { PageContainer, PageHeader, ErrorState, LoadingState } from "@metacentrum/design-system";

export function MachinesPage() {
  const [machineSearch, setMachineSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [machineFilters, setMachineFilters] = useState<[string, string | number][] | null>(null);
  const handleMachinePageChange = useCallback((query: string) => {
    setMachineSearch(query);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(machineSearch), 300);
    return () => clearTimeout(timer);
  }, [machineSearch]);
  const handleMachineFilters = useCallback((query: [string, string | number][] | null) => {
    setMachineFilters(query);
  }, []);
  const convertToQueryString = useCallback((data: [string, string | number][] | null, prefix: string) => {
    if (!data) return null;
    return data
      .map(([key, value]) => {
        const encodedKey = encodeURIComponent(`${prefix}[${key}]`);
        const encodedValue = encodeURIComponent(String(value));
        return `${encodedKey}=${encodedValue}`;
      })
      .join('&');
  }, []);
  const { t, i18n } = useTranslation();
  const { data: filterData, isLoading: filterIsLoading, error: filterError} = useInfrastructureFilterables();
  const { data, isLoading, error } = useInfrastructure({
    search: debouncedSearch.trim() || undefined,
    filters: convertToQueryString(machineFilters, 'filters') || undefined,
  });

  const currentLanguage = i18n.language as "cs" | "en";

  return (
    <PageContainer>
      <PageHeader title={t("pages.machines")} />

      <div className="flex gap-6">
        <div className="flex-1">
          {filterIsLoading && (
            <LoadingState label={t("common.loading")} />
          )}

          {filterError && (
            <ErrorState
              title={t("common.errorLoading")}
              description={
                filterError instanceof Error
                  ? filterError.message
                  : t("common.unknownError")
              }
            />
          )}

          {filterData && (
            <MachinesHeader
              filterData={filterData.data}
              machineFilters={machineFilters}
              onFilterChange={handleMachineFilters}
            />
          )}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1">

          <MachineSearchBar
            searchQuery={machineSearch}
            onSearchChange={handleMachinePageChange}
            totalMachines={data?.meta?.totalNodes || 0}
          />

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

          {data && (
            <>
              {/* Metacentrum Total Info */}
              {data.meta && <MetacentrumOverview meta={data.meta} />}

              {/* State Legend */}
              {<MachineLegend />}

              {/* Organizations */}
              {data.data.map((organization) => (
                <OrganizationPreview
                  key={organization.id}
                  organization={organization}
                  currentLanguage={currentLanguage}
                />
              ))}
            </>
          )}
        </div>

        {/* Right Sidebar - Hot Links */}
        {data && data.data.length > 0 && (
          <QuickLinksSidebar
            organizations={data.data}
            currentLanguage={currentLanguage}
          />
        )}
      </div>
    </PageContainer>
  );
}
