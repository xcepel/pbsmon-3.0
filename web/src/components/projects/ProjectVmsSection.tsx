import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { DataTable, type DataTableColumn } from "@metacentrum/design-system";

type ProjectVm = {
  id: string;
  name: string;
  flavorName: string;
  vcpus: number;
  memoryGb: number;
};

interface ProjectVmsSectionProps {
  vms: ProjectVm[];
}

export function ProjectVmsSection({ vms }: ProjectVmsSectionProps) {
  const { t } = useTranslation();

  // Compact view covers narrow-width phones (portrait) as well as short-height
  // phones in landscape, where a width-only breakpoint would otherwise show
  // the full desktop column set on a screen too short to comfortably use it.
  const isCompact = useMediaQuery(
    "(max-width: 639px), (max-height: 500px) and (orientation: landscape)"
  );

  const columns: (DataTableColumn<ProjectVm> | false)[] = [
    {
      key: "name",
      header: t("projects.vmName"),
      render: (vm) => (
        <div className="flex items-center">
          <Icon icon="mdi:server" className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
            {vm.name}
          </span>
        </div>
      ),
    },
    !isCompact && {
      key: "id",
      header: t("projects.vmId"),
      render: (vm) => (
        <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
          {vm.id}
        </code>
      ),
    },
    !isCompact && {
      key: "flavorName",
      header: t("projects.flavor"),
      render: (vm) => (
        <span className="text-sm text-gray-900 whitespace-nowrap">{vm.flavorName}</span>
      ),
    },
    !isCompact && {
      key: "vcpus",
      header: t("projects.vcpus"),
      render: (vm) => <span className="text-sm text-gray-900">{vm.vcpus}</span>,
    },
    !isCompact && {
      key: "memoryGb",
      header: t("projects.memory"),
      render: (vm) => (
        <span className="text-sm text-gray-900 whitespace-nowrap">{vm.memoryGb} GB</span>
      ),
    },
  ];

  return (
    <div className="px-6 py-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {t("projects.vms")}
        {vms.length > 0 && ` (${vms.length})`}
      </h2>
      <DataTable
        columns={columns.filter((c): c is DataTableColumn<ProjectVm> => Boolean(c))}
        rows={vms}
        rowKey={(vm) => vm.id}
        emptyTitle={t("projects.noVms")}
      />
    </div>
  );
}
