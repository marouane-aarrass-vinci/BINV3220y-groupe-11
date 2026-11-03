import { useCallback } from "react";
import { createApplication } from "../services/applications.service.ts";
import { isUnauthorized } from "../utils/api.ts";

export const useApplyToOffer = (token: string, onUnauthorized: () => void) => {
  const apply = useCallback(
    async (offerId: number, message?: string) => {
      try {
        return await createApplication(token, offerId, message);
      } catch (reason) {
        if (isUnauthorized(reason)) onUnauthorized();
        throw reason;
      }
    },
    [token, onUnauthorized],
  );

  return { apply };
};
