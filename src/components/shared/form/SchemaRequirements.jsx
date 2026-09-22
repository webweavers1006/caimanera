"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/features/shared";
import { SHARED_CONFIG } from "@/features/shared";

const { SCHEMA_REQUIREMENTS } = SHARED_CONFIG.UI.LABELS;

/**
 * Componente Shared genérico que extrae dinámicamente los requerimientos de un schema de Zod.
 * Útil para dar feedback visual en tiempo real sobre la validez de un campo.
 * 
 * @param {Object} props
 * @param {Object} props.schema - El objeto Zod (ej: z.string()) que contiene las validaciones.
 * @param {string} props.value - El valor actual del campo a validar.
 * @param {string} [props.title="Requisitos del campo"] - Título opcional para la sección.
 */
export function SchemaRequirements({ 
  schema, 
  value = "", 
  title = SCHEMA_REQUIREMENTS.TITLE
}) {
  // 1. Extraer los checks definidos en el schema de Zod
  const checks = schema?._def?.checks || [];

  // 2. Mapear cada check a un requisito con su estado de cumplimiento
  const requirements = checks.map((check) => {
    let isMet = false;
    
    // Adaptación para diferentes estructuras internas de Zod (_zod.def)
    const def = check._zod?.def || check;
    
    // Normalizar el tipo de check
    let kind = def.format || def.kind || def.check;
    if (kind === "string_min" || kind === "min_length") kind = "min";
    if (kind === "string_max" || kind === "max_length") kind = "max";
    if (kind === "string_format") kind = "regex";
    
    const pattern = def.pattern || def.regex;
    const message = def.error || def.message;
    
    // Resolver el label (soporta funciones de mensaje dinámico)
    let label = (typeof message === "function" ? message() : message) || SCHEMA_REQUIREMENTS.FALLBACK;
    
    // Validación manual de cada tipo de regla
    switch (kind) {
      case "min":
        const minVal = def.limit ?? def.value ?? def.min ?? def.minimum;
        isMet = value.length >= (minVal || 0);
        if (label === SCHEMA_REQUIREMENTS.FALLBACK) label = SCHEMA_REQUIREMENTS.MIN_CHARS(minVal);
        break;
      case "max":
        const maxVal = def.limit ?? def.value ?? def.max ?? def.maximum;
        isMet = value.length <= (maxVal || 1000);
        if (label === SCHEMA_REQUIREMENTS.FALLBACK) label = SCHEMA_REQUIREMENTS.MAX_CHARS(maxVal);
        break;
      case "regex":
        if (pattern) isMet = pattern.test(value);
        break;
      case "email":
        isMet = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (label === SCHEMA_REQUIREMENTS.FALLBACK) label = SCHEMA_REQUIREMENTS.VALID_EMAIL;
        break;
      default:
        isMet = false;
    }

    return { label, met: isMet };
  });

  // No mostrar si el campo está vacío o no tiene reglas
  if (!value || requirements.length === 0) return null;

  return (
    <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-2">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
          {title}
        </p>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {requirements.map((req, index) => (
          <div 
            key={index} 
            className={cn(
              "flex items-center gap-2.5 text-xs transition-all duration-300",
              req.met ? "text-success font-medium" : "text-muted-foreground/60"
            )}
          >
            <div className={cn(
              "h-5 w-5 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-sm",
              req.met 
                ? "bg-success/10 border-success text-success scale-100 rotate-0" 
                : "bg-muted/30 border-muted-foreground/10 text-transparent -rotate-45"
            )}>
              <Check className={cn(
                "h-3 w-3 stroke-[3] transition-transform duration-500",
                req.met ? "scale-100" : "scale-0"
              )} />
            </div>
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
