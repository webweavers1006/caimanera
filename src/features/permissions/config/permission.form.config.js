import { PERMISSION_CONFIG } from "./permission.constants";

export const getPermissionDefaultValues = (permission) => ({
  id: permission?.id,
  slug: permission?.slug || "",
  description: permission?.description || "",
});

export const getPermissionFormConfig = () => {
  const { FORM } = PERMISSION_CONFIG.UI.LABELS;

  return [
    [
      {
        name: "slug",
        label: FORM.FIELDS.SLUG,
        placeholder: FORM.PLACEHOLDERS.SLUG,
        component: "input",
      },
    ],
    [
      {
        name: "description",
        label: FORM.FIELDS.DESCRIPTION,
        placeholder: FORM.PLACEHOLDERS.DESCRIPTION,
        component: "textarea",
      },
    ],
  ];
};
