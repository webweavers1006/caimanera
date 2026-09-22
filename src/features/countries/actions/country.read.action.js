"use server";

import { createProtectedFunction } from "@/features/shared/lib/safe-action";
import { COUNTRY_CONFIG } from "../config/country.constants";
import { fetchCountriesList } from "../services/country.read.service";

export const getCountriesListAction = createProtectedFunction(
  COUNTRY_CONFIG.PERMISSIONS.READ,
  async (params) => {
    return fetchCountriesList(params);
  }
);
