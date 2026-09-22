import { MATCH_CONFIG } from "./match.constants";
import { getUsersForSelectAction } from "@/features/users/actions/user.select.action";
import { getCourtsForSelectAction } from "@/features/courts/actions/court.select.action";

// Converts an ISO date string into a datetime-local input value.
const toDateTimeLocalValue = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const getMatchFormConfig = () => {
  const { LABELS } = MATCH_CONFIG.UI;

  return [
    [
      {
        name: "title",
        label: LABELS.FORM.FIELDS.TITLE,
        placeholder: LABELS.FORM.PLACEHOLDERS.TITLE,
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
        name: "scheduledAt",
        label: LABELS.FORM.FIELDS.SCHEDULED_AT,
        placeholder: LABELS.FORM.PLACEHOLDERS.SCHEDULED_AT,
        component: "input",
        type: "datetime-local",
      },
      {
        name: "durationMins",
        label: LABELS.FORM.FIELDS.DURATION_MINS,
        placeholder: LABELS.FORM.PLACEHOLDERS.DURATION_MINS,
        component: "input",
        type: "number",
        min: 15,
        max: 600,
        step: 1,
      },
    ],
    [
      {
        name: "capacity",
        label: LABELS.FORM.FIELDS.CAPACITY,
        placeholder: LABELS.FORM.PLACEHOLDERS.CAPACITY,
        component: "input",
        type: "number",
        min: 1,
        step: 1,
      },
      {
        name: "pricePerSlot",
        label: LABELS.FORM.FIELDS.PRICE_PER_SLOT,
        placeholder: LABELS.FORM.PLACEHOLDERS.PRICE_PER_SLOT,
        component: "input",
        type: "number",
        min: 0,
        step: "0.01",
      },
    ],
    [
      {
        name: "hostId",
        label: LABELS.FORM.FIELDS.HOST,
        component: "asyncSelect",
        placeholder: LABELS.FORM.PLACEHOLDERS.HOST,
        fetcher: (search) => getUsersForSelectAction({ searchTerm: search }),
        getLabel: (opt) => opt.label,
        getValue: (opt) => opt.value,
        emptyMessage: "No se encontraron usuarios.",
      },
      {
        name: "courtId",
        label: LABELS.FORM.FIELDS.COURT,
        component: "asyncSelect",
        placeholder: LABELS.FORM.PLACEHOLDERS.COURT,
        fetcher: (search) => getCourtsForSelectAction({ searchTerm: search }),
        getLabel: (opt) => opt.label,
        getValue: (opt) => opt.value,
        emptyMessage: "No se encontraron canchas.",
      },
    ],
    [
      {
        name: "status",
        label: LABELS.FORM.FIELDS.STATUS,
        placeholder: LABELS.FORM.PLACEHOLDERS.STATUS,
        component: "select",
        options: MATCH_CONFIG.STATUS.OPTIONS,
      },
    ],
    [
      {
        name: "allowSubscription",
        label: LABELS.FORM.FIELDS.ALLOW_SUBSCRIPTION,
        description: LABELS.FORM.ALLOW_SUBSCRIPTION_DESCRIPTION,
        component: "switch",
      },
    ],
  ];
};

export const getMatchDefaultValues = (item) => ({
  id: item?.id || undefined,
  title: item?.title || "",
  sport: item?.sport || "",
  scheduledAt: toDateTimeLocalValue(item?.scheduledAt),
  durationMins: item?.durationMins ?? 60,
  capacity: item?.capacity ?? "",
  pricePerSlot: item?.pricePerSlot ?? "",
  allowSubscription: item?.allowSubscription !== undefined ? item.allowSubscription : true,
  status: item?.status || "OPEN",
  hostId: item?.hostId || null,
  courtId: item?.courtId || null,
});
