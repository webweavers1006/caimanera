import { useCallback, useMemo, useState } from "react";

/**
 * Manages row selection state for the users table.
 */
export function useUserSelection(data) {
  const [selectedUsers, setSelectedUsers] = useState(() => new Set());

  const clearSelection = useCallback(() => setSelectedUsers(new Set()), []);

  const handleSelectUser = useCallback((id, checked) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleSelectAllPage = useCallback(
    (checked) => {
      setSelectedUsers((prev) => {
        const next = new Set(prev);
        const ids = Array.isArray(data) ? data.map((u) => u.id).filter(Boolean) : [];
        if (checked) ids.forEach((id) => next.add(id));
        else ids.forEach((id) => next.delete(id));
        return next;
      });
    },
    [data]
  );

  const isAllPageSelected =
    Array.isArray(data) && data.length > 0 && data.every((u) => selectedUsers.has(u.id));

  const isPageIndeterminate =
    Array.isArray(data) && data.some((u) => selectedUsers.has(u.id)) && !isAllPageSelected;

  const selection = useMemo(
    () => ({
      selectedIds: selectedUsers,
      onSelectRow: (id, checked) => handleSelectUser(id, checked),
      onSelectAll: handleSelectAllPage,
      isAllSelected: isAllPageSelected,
      isIndeterminate: isPageIndeterminate,
      clearSelection,
    }),
    [
      selectedUsers,
      handleSelectUser,
      handleSelectAllPage,
      isAllPageSelected,
      isPageIndeterminate,
      clearSelection,
    ]
  );

  return selection;
}

