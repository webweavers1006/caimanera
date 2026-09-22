import { USER_CONFIG } from "./user.constants";

/**
 * Generates default values for the user form.
 * @param {Object|null} user - The user domain object (if editing).
 * @returns {Object} Default values for the form.
 */
export const getUserDefaultValues = (user) => ({
  id: user?.id || "",
  firstName: user?.firstName || "",
  lastName: user?.lastName || "",
  idCard: user?.idCard || "",
  roleId: user?.roleId ? user.roleId.toString() : "",
  email: user?.email || "",
  password: "",
  isActive: user?.isActive ?? true,
});

export const getUserFormConfig = (roles = [], user = null) => {
  const { FORM } = USER_CONFIG.UI.LABELS;

  return [
    // Row 1: Personal Information
    [
      { name: "firstName", label: FORM.FIELDS.NAME, placeholder: FORM.PLACEHOLDERS.NAME, component: "input" },
      { name: "lastName", label: FORM.FIELDS.LASTNAME, placeholder: FORM.PLACEHOLDERS.LASTNAME, component: "input" },
    ],
    // Row 2: Identification and Contact
    [
      { name: "idCard", label: FORM.FIELDS.CEDULA, placeholder: FORM.PLACEHOLDERS.CEDULA, component: "input" },
      { name: "email", label: FORM.FIELDS.EMAIL, placeholder: FORM.PLACEHOLDERS.EMAIL, type: "email", component: "input" },
    ],
    // Row 3: Security
    [
      { 
        name: "password", 
        label: FORM.FIELDS.PASSWORD, 
        placeholder: user?.id ? FORM.PLACEHOLDERS.PASSWORD_EDIT : FORM.PLACEHOLDERS.PASSWORD, 
        type: "password", 
        component: "input" 
      },
    ],
    // Row 4: Role & Status
    [
      {
        name: "roleId", 
        label: FORM.FIELDS.ROLE, 
        placeholder: FORM.PLACEHOLDERS.SELECT_ROLE, 
        component: "select", 
        options: roles.map(r => ({ label: r.name, value: r.id.toString() }))
      },
      {
        name: "isActive",
        label: FORM.FIELDS.STATUS,
        component: "checkbox",
        description: (val) => val ? FORM.DESCRIPTIONS.ACTIVE : FORM.DESCRIPTIONS.INACTIVE
      },
    ],
  ].filter(row => row.length > 0);
};
