import { PARTICIPANT_CONFIG } from "./participant.constants";
import { getUsersForSelectAction } from "@/features/users/actions/user.select.action";
import { getMatchesForSelectAction } from "@/features/matches/actions/match.select.action";

export const getParticipantFormConfig = () => {
  const { LABELS } = PARTICIPANT_CONFIG.UI;

  return [
    [
      {
        name: "userId",
        label: LABELS.FORM.FIELDS.USER,
        component: "asyncSelect",
        placeholder: LABELS.FORM.PLACEHOLDERS.USER,
        fetcher: (search) => getUsersForSelectAction({ searchTerm: search }),
        getLabel: (opt) => opt.label,
        getValue: (opt) => opt.value,
        emptyMessage: "No se encontraron jugadores.",
      },
      {
        name: "matchId",
        label: LABELS.FORM.FIELDS.MATCH,
        component: "asyncSelect",
        placeholder: LABELS.FORM.PLACEHOLDERS.MATCH,
        fetcher: (search) => getMatchesForSelectAction({ searchTerm: search }),
        getLabel: (opt) => opt.label,
        getValue: (opt) => opt.value,
        emptyMessage: "No se encontraron partidos.",
      },
    ],
    [
      {
        name: "status",
        label: LABELS.FORM.FIELDS.STATUS,
        placeholder: LABELS.FORM.PLACEHOLDERS.STATUS,
        component: "select",
        options: PARTICIPANT_CONFIG.STATUS.OPTIONS,
      },
      {
        name: "paymentType",
        label: LABELS.FORM.FIELDS.PAYMENT_TYPE,
        placeholder: LABELS.FORM.PLACEHOLDERS.PAYMENT_TYPE,
        component: "select",
        options: PARTICIPANT_CONFIG.PAYMENT_TYPE.OPTIONS,
      },
    ],
    [
      {
        name: "position",
        label: LABELS.FORM.FIELDS.POSITION,
        placeholder: LABELS.FORM.PLACEHOLDERS.POSITION,
        component: "select",
        options: PARTICIPANT_CONFIG.POSITIONS.OPTIONS,
      },
    ],
  ];
};

export const getParticipantDefaultValues = (item) => ({
  id: item?.id || undefined,
  userId: item?.userId || null,
  matchId: item?.matchId || null,
  status: item?.status || "WAITLIST",
  paymentType: item?.paymentType || "PAY_PER_MATCH",
  position: item?.position || "",
});
