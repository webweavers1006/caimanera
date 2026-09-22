import { COURT_CONFIG } from "./court.constants";
import { getUsersForSelectAction } from "@/features/users/actions/user.select.action";

export const getCourtFormConfig = () => {
  const { LABELS } = COURT_CONFIG.UI;

  return [
    [
      {
        name: "name",
        label: LABELS.FORM.FIELDS.NAME,
        placeholder: LABELS.FORM.PLACEHOLDERS.NAME,
        component: "input",
      },
      {
        name: "sport",
        label: LABELS.FORM.FIELDS.SPORT,
        placeholder: LABELS.FORM.PLACEHOLDERS.SPORT,
        component: "input",
      },
    ],
    [
      {
        name: "description",
        label: LABELS.FORM.FIELDS.DESCRIPTION,
        placeholder: LABELS.FORM.PLACEHOLDERS.DESCRIPTION,
        component: "textarea",
        rows: 3,
      },
    ],
    [
      {
        name: "address",
        label: LABELS.FORM.FIELDS.ADDRESS,
        placeholder: LABELS.FORM.PLACEHOLDERS.ADDRESS,
        component: "input",
      },
    ],
    [
      {
        name: "latitude",
        label: LABELS.FORM.FIELDS.LATITUDE,
        placeholder: LABELS.FORM.PLACEHOLDERS.LATITUDE,
        component: "input",
        type: "number",
        step: "0.000001",
      },
      {
        name: "longitude",
        label: LABELS.FORM.FIELDS.LONGITUDE,
        placeholder: LABELS.FORM.PLACEHOLDERS.LONGITUDE,
        component: "input",
        type: "number",
        step: "0.000001",
      },
    ],
    [
      {
        name: "hourlyRate",
        label: LABELS.FORM.FIELDS.HOURLY_RATE,
        placeholder: LABELS.FORM.PLACEHOLDERS.HOURLY_RATE,
        component: "input",
        type: "number",
        step: "0.01",
      },
      {
        name: "managerId",
        label: LABELS.FORM.FIELDS.MANAGER,
        component: "asyncSelect",
        placeholder: LABELS.FORM.PLACEHOLDERS.MANAGER,
        fetcher: (search) => getUsersForSelectAction({ searchTerm: search }),
        getLabel: (opt) => opt.label,
        getValue: (opt) => opt.value,
        emptyMessage: "No se encontraron usuarios.",
      },
    ],
    [
      {
        name: "isActive",
        label: LABELS.FORM.FIELDS.IS_ACTIVE,
        description: LABELS.FORM.IS_ACTIVE_DESCRIPTION,
        component: "switch",
      },
    ],
  ];
};

export const getCourtDefaultValues = (item) => ({
  id: item?.id || undefined,
  name: item?.name || "",
  sport: item?.sport || "",
  description: item?.description || "",
  address: item?.address || "",
  latitude: item?.latitude ?? "",
  longitude: item?.longitude ?? "",
  hourlyRate: item?.hourlyRate ?? "",
  managerId: item?.managerId || null,
  isActive: item?.isActive !== undefined ? item.isActive : true,
  photos: item?.photos?.map((p) => p.url) || [],
});
