import { ROLE_CONFIG } from "./role.constants";

export const getRoleDefaultValues = (role) => ({
  id: role?.id,
  name: role?.name || "",
  description: role?.description || "",
  permissionIds: role?.permissionIds || [],
});

export const getRoleFormConfig = () => {
  const { FORM } = ROLE_CONFIG.UI.LABELS;

  return [
    [
      { 
        name: "name", 
        label: FORM.FIELDS.NAME, 
        placeholder: FORM.PLACEHOLDERS.NAME, 
        component: "input" 
      }
    ],
    [
      { 
        name: "description", 
        label: FORM.FIELDS.DESCRIPTION, 
        placeholder: FORM.PLACEHOLDERS.DESCRIPTION, 
        component: "textarea" 
      }
    ],
    [
      {
        name: "permissionIds",
        label: FORM.FIELDS.PERMISSIONS,
        component: "permission-selector",
      }
    ]
  ];
};
