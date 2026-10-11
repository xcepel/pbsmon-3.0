import { useTranslation } from "react-i18next";

// The file keeps its old name because JobFilterableState is imported from here
// by the queue/machine/user detail pages. The filter itself used to sit in the
// Status column header; with the shared DataTable it lives in the table toolbar.

export type JobFilterableState = "all" | "Q" | "R|B" | "C|F|X" | "E" | "H" | "S" | "T|M" | "W";

interface JobsStateFilterProps {
  filterableStates?: Record<string, string> | null;
  stateFilter?: JobFilterableState;
  onStateFilterChange?: (state: JobFilterableState) => void;
}

function convertPbsStateToFilterableState(pbsState: string): JobFilterableState {
  const state = pbsState?.toUpperCase() || 'all';

  switch (state) {
    case 'Q':
      return "Q";
    case 'R':
    case 'B':
      return "R|B";
    case 'C':
    case 'F':
    case 'X':
      return "C|F|X";
    case 'E':
      return "E";
    case 'H':
      return "H";
    case 'S':
      return "S";
    case 'T':
    case 'M':
      return "T|M";
    case 'W':
      return "W";
    default:
      return "all"; // Default to "all" for unrecognized states
  }
}

export function JobsStateFilter({
  filterableStates,
  stateFilter,
  onStateFilterChange,
}: JobsStateFilterProps) {
  const { t } = useTranslation();
  const stateOptions: { value: JobFilterableState; label: string }[] = [
    { value: "all", label: t("jobs.all") },
    ...(filterableStates
      ? Object.values(
          Object.entries(filterableStates).reduce((acc, [value, name]) => {
            const filterValue = convertPbsStateToFilterableState(value);
            // Only add if this category hasn't been added yet
            if (!acc[filterValue]) {
              acc[filterValue] = {
                value: filterValue,
                label: t(`jobs.state.${name}`),
              };
            }
            return acc;
          }, {} as Record<string, { value: JobFilterableState; label: string }>)
        )
      : []),
  ];

  return (
    <label className="flex items-center gap-2 px-4 text-sm text-gray-600 whitespace-nowrap">
      <span>{t("jobs.stateLabel")}</span>
      <select
        value={stateFilter || "all"}
        onChange={(e) => {
          const newFilter = e.target.value as JobFilterableState;
          onStateFilterChange?.(newFilter);
        }}
        className="min-w-[8rem] text-sm bg-white border border-gray-200 rounded-md shadow-sm cursor-pointer hover:border-gray-500 focus:ring-primary-500 focus:border-primary-500"
      >
        {stateOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
