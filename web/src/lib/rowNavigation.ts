import { useCallback } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Handler for DataTable's onRowClick: navigates in-app, or opens a new tab on
 * ctrl/cmd-click or middle-click.
 */
export function useRowNavigate() {
  const navigate = useNavigate();

  return useCallback(
    (path: string, event: MouseEvent | KeyboardEvent) => {
      const middleClick = "button" in event && event.button === 1;
      if (event.ctrlKey || event.metaKey || middleClick) {
        window.open(path, "_blank", "noopener");
      } else {
        navigate(path);
      }
    },
    [navigate]
  );
}
