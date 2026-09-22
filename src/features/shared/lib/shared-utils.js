import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a plain object to FormData.
 * Handles boolean values by converting them to strings.
 * @param {Object} values - The form values.
 * @returns {FormData} The FormData object.
 */
export const toFormData = (values) => {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (typeof value === 'boolean') {
       formData.append(key, value.toString());
    } else if (value !== null && value !== undefined) {
       formData.append(key, value);
    }
  });
  return formData;
};
