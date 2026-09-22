import { EntityPageContainer } from "@/components/shared/EntityPageContainer";
import { fetchCountriesList } from "@/features/countries/services/country.read.service";
import { CountryTable } from "@/features/countries/components/CountryTable";
import { COUNTRY_CONFIG } from "@/features/countries/config/country.constants";

export async function CountryPageContainer({ searchParams }) {
  return (
    <EntityPageContainer
      config={COUNTRY_CONFIG}
      searchParams={searchParams}
      fetchData={fetchCountriesList}
      renderTable={({ data, pagination }) => <CountryTable data={data} pagination={pagination} />}
    />
  );
}
