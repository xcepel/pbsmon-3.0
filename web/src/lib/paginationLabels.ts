import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { PaginationLabels } from "@metacentrum/design-system";

/** Translated Carbon pagination texts. */
export function usePaginationLabels(): PaginationLabels {
  const { t, i18n } = useTranslation();

  return useMemo<PaginationLabels>(
    () => ({
      itemsPerPageText: t("table.pagination.itemsPerPage"),
      itemRangeText: (min, max, total) =>
        t("table.pagination.itemRange", { min, max, total }),
      pageRangeText: (_current, total) =>
        t("table.pagination.pageRange", { total }),
      backwardText: t("table.pagination.previousPage"),
      forwardText: t("table.pagination.nextPage"),
      pageSelectLabelText: (total) =>
        t("table.pagination.pageSelectLabel", { total }),
      pageText: (page) => t("table.pagination.page", { page }),
    }),
    [t, i18n.language]
  );
}
