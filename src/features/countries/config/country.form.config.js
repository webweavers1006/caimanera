import { COUNTRY_CONFIG } from "./country.constants";

export const getCountryFormConfig = () => {
  const { LABELS } = COUNTRY_CONFIG.UI;

  return [
    [
      {
        name: "name",
        label: LABELS.FORM.FIELDS.NAME,
        placeholder: LABELS.FORM.PLACEHOLDERS.NAME,
        component: "input",
      },
    ],
  ];
};

export const getCountryDefaultValues = (item) => ({
  id: item?.id || undefined,
  name: item?.name || "",
});
