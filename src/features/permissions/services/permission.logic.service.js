/**
 * Permissions Business Logic
 * Centralizes rules on how permissions are grouped and filtered.
 */

/**
 * Groups a flat list of permissions by module (prefix before colon ':').
 * @param {Array} permissions - List of permissions [{id, slug, description}, ...]
 * @returns {Object} Grouped permissions { 'ModuleName': [permissions...] }
 */
export const groupPermissionsByModule = (permissions = []) => {
  const groups = {};

  permissions.forEach(p => {
    const label = p.slug || p.label || "";
    const [module] = label.includes(":") ? label.split(":") : ["Otros"];
    
    const moduleName = module.charAt(0).toUpperCase() + module.slice(1);

    if (!groups[moduleName]) {
      groups[moduleName] = [];
    }

    groups[moduleName].push({
      id: p.id,
      label: label,
      description: p.description || p.descripcion || ""
    });
  });

  return groups;
};

/**
 * Filters permissions based on a search term.
 * @param {Array} permissions - Flat list of permissions.
 * @param {string} searchTerm - Search term.
 * @returns {Array} Matching permissions.
 */
export const filterPermissions = (permissions, searchTerm) => {
  if (!searchTerm) return permissions;
  
  const term = searchTerm.toLowerCase();
  return permissions.filter(p =>
    (p.slug || p.label || "").toLowerCase().includes(term) ||
    (p.description || p.descripcion || "").toLowerCase().includes(term)
  );
};
