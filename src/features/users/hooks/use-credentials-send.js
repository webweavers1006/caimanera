"use client";

import { useState, useCallback } from "react";

/**
 * Hook for managing the credentials-send dialog state for the users module.
 *
 * @returns {{ showDialog: boolean, userIds: string[]|null,
 *   openSendAll: Function, openSendSelected: Function, closeDialog: Function }}
 */
export function useCredentialsSend() {
  const [showDialog, setShowDialog] = useState(false);
  const [userIds, setUserIds] = useState(null); // null=all, [] = none, ["uuid1","uuid2"]=selected

  const openSendAll = useCallback(() => {
    setUserIds(null);
    setShowDialog(true);
  }, []);

  const openSendSelected = useCallback((ids) => {
    setUserIds(ids);
    setShowDialog(true);
  }, []);

  const closeDialog = useCallback(() => {
    setShowDialog(false);
  }, []);

  return { showDialog, userIds, openSendAll, openSendSelected, closeDialog };
}
