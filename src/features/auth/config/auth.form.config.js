import { AUTH_CONFIG } from "./auth.constants";

const { FORM } = AUTH_CONFIG.UI.LABELS;

export const loginFormConfig = [
  { 
    name: 'email', 
    label: FORM.EMAIL || 'Correo Electrónico', 
    placeholder: FORM.EMAIL_PLACEHOLDER || 'ejemplo@correo.com', 
    type: 'email' 
  },
  { 
    name: 'password', 
    label: FORM.PASSWORD, 
    placeholder: FORM.PASSWORD_PLACEHOLDER, 
    type: 'password' 
  }
];
