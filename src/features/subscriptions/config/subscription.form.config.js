import { SUBSCRIPTION_CONFIG } from "./subscription.constants";

export const getSubscriptionFormConfig = () => {
  const { LABELS } = SUBSCRIPTION_CONFIG.UI;

  return [
    [
      {
        name: "name",
        label: LABELS.FORM.FIELDS.NAME,
        placeholder: LABELS.FORM.PLACEHOLDERS.NAME,
        component: "input",
      },
      {
        name: "tier",
        label: LABELS.FORM.FIELDS.TIER,
        placeholder: LABELS.FORM.PLACEHOLDERS.TIER,
        component: "select",
        options: SUBSCRIPTION_CONFIG.TIER.OPTIONS,
      },
    ],
    [
      {
        name: "price",
        label: LABELS.FORM.FIELDS.PRICE,
        placeholder: LABELS.FORM.PLACEHOLDERS.PRICE,
        component: "input",
        type: "number",
        min: 0,
        step: "0.01",
      },
      {
        name: "matchesIncluded",
        label: LABELS.FORM.FIELDS.MATCHES_INCLUDED,
        placeholder: LABELS.FORM.PLACEHOLDERS.MATCHES_INCLUDED,
        component: "input",
        type: "number",
        min: 0,
        step: 1,
      },
    ],
    [
      {
        name: "priorityBooking",
        label: LABELS.FORM.FIELDS.PRIORITY_BOOKING,
        description: LABELS.FORM.PRIORITY_BOOKING_DESCRIPTION,
        component: "switch",
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
  ];
};

export const getSubscriptionDefaultValues = (item) => ({
  id: item?.id || undefined,
  name: item?.name || "",
  tier: item?.tier || "BASIC_PASS",
  price: item?.price ?? "",
  matchesIncluded: item?.matchesIncluded ?? "",
  priorityBooking: item?.priorityBooking !== undefined ? item.priorityBooking : true,
  description: item?.description || "",
});
