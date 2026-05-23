// =============================================================================
//  src/config/planFeatures.ts
//  Archivo NUEVO — crear en src/config/planFeatures.ts
//
//  Espejo del backend. El frontend lo usa para ocultar módulos
//  que no corresponden al plan del tenant.
// =============================================================================

export type Plan = "BASIC" | "PLUS" | "PREMIUM";

export interface PlanFeatures {
  accounting:   boolean;
  sales:        boolean;
  purchases:    boolean;
  reports:      boolean;
  dashboard:    boolean;
  inventory:    boolean;
  payroll:      boolean;
  ocr:          boolean;
  ai:           boolean;
  toolTokens:   boolean;
  advancedBI:   boolean;
  sunat:        boolean;
  audit:        boolean;
  integrations: boolean;
}

export const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  BASIC: {
    accounting:   true,
    sales:        true,
    purchases:    true,
    reports:      true,
    dashboard:    true,
    inventory:    false,
    payroll:      false,
    ocr:          false,
    ai:           false,
    toolTokens:   false,
    advancedBI:   false,
    sunat:        false,
    audit:        false,
    integrations: false,
  },
  PLUS: {
    accounting:   true,
    sales:        true,
    purchases:    true,
    reports:      true,
    dashboard:    true,
    inventory:    true,
    payroll:      true,
    ocr:          true,
    ai:           true,
    toolTokens:   false,
    advancedBI:   true,
    sunat:        false,
    audit:        false,
    integrations: false,
  },
  PREMIUM: {
    accounting:   true,
    sales:        true,
    purchases:    true,
    reports:      true,
    dashboard:    true,
    inventory:    true,
    payroll:      true,
    ocr:          true,
    ai:           true,
    toolTokens:   true,
    advancedBI:   true,
    sunat:        true,
    audit:        true,
    integrations: true,
  },
};

/**
 * Retorna true si el plan tiene acceso a la feature.
 *
 * Uso:
 *   {hasFeature(plan, "inventory") && <InventoryPanel />}
 */
export function hasFeature(
  plan: string,
  feature: keyof PlanFeatures
): boolean {
  return Boolean(
    PLAN_FEATURES[plan as Plan]?.[feature]
  );
}

/**
 * Retorna todas las features del plan como objeto.
 */
export function getPlanFeatures(plan: string): PlanFeatures {
  return PLAN_FEATURES[plan as Plan] ?? PLAN_FEATURES.BASIC;
}
