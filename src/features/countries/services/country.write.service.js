import { countryWriteRepository } from "../repositories/country.write.repository";
import { validateCountryRules } from "./country.validation.service";

export async function createCountry(data) {
  const validation = await validateCountryRules(data);
  if (!validation.success) return validation;

  try {
    const result = await countryWriteRepository.create(data);
    return { success: true, data: result, message: "País creado exitosamente." };
  } catch (error) {
    return { success: false, error: "Error al crear el país." };
  }
}

export async function updateCountry(id, data) {
  const validation = await validateCountryRules(data, id);
  if (!validation.success) return validation;

  try {
    const result = await countryWriteRepository.update(id, data);
    return { success: true, data: result, message: "País actualizado exitosamente." };
  } catch (error) {
    return { success: false, error: "Error al actualizar el país." };
  }
}

export async function deleteCountry(id) {
  try {
    await countryWriteRepository.softDelete(id);
    return { success: true, message: "País eliminado exitosamente." };
  } catch (error) {
    return { success: false, error: "Error al eliminar el país." };
  }
}
