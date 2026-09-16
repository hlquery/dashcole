/** Valores base demostrativos de Chile para inicializar un período de nómina.
 *  Deben revisarse (UF/UTM, comisiones AFP, tabla IUSC) antes de liquidaciones reales. */
export function defaultPayrollConfig(period) {
  return {
    parameters: {
      uf: 39700,
      utm: 69100,
      pensionCapUf: 87.8,
      healthCapUf: 87.8,
      afcCapUf: 131.9,
      pensionRate: 0.101,
      healthRate: 0.07,
      healthTaxCapUf: 4.2,
      apvMonthlyCapUf: 50,
      salaryDays: 30,
      employerPensionRate: 0.001,
      sisRate: 0.016,
      lifeExpectancyRate: 0.009,
      protectedReturnRate: 0.009,
      accidentRate: 0.0093,
      sannaRate: 0.0003,
      afc: {
        Indefinido: { employee: 0.006, employer: 0.024 },
        'Plazo fijo': { employee: 0, employer: 0.03 },
        Reemplazo: { employee: 0, employer: 0.03 },
      },
      source: `Valores base para ${period || 'el período'}. Verifica UF, UTM, comisiones AFP y tabla de impuesto oficial antes de emitir liquidaciones.`,
    },
    afpRates: [
      { name: 'Capital', commission: 0.0144 },
      { name: 'Cuprum', commission: 0.0144 },
      { name: 'Habitat', commission: 0.0127 },
      { name: 'Modelo', commission: 0.0058 },
      { name: 'PlanVital', commission: 0.0116 },
      { name: 'Provida', commission: 0.0145 },
      { name: 'Uno', commission: 0.0046 },
    ],
    taxBrackets: [
      { lowerUtm: 0, upperUtm: 13.5, factor: 0, deductionUtm: 0 },
      { lowerUtm: 13.5, upperUtm: 30, factor: 0.04, deductionUtm: 0.54 },
      { lowerUtm: 30, upperUtm: 50, factor: 0.08, deductionUtm: 1.74 },
      { lowerUtm: 50, upperUtm: 70, factor: 0.135, deductionUtm: 4.49 },
      { lowerUtm: 70, upperUtm: 90, factor: 0.23, deductionUtm: 11.14 },
      { lowerUtm: 90, upperUtm: 120, factor: 0.304, deductionUtm: 17.8 },
      { lowerUtm: 120, upperUtm: 310, factor: 0.35, deductionUtm: 23.32 },
      { lowerUtm: 310, upperUtm: null, factor: 0.4, deductionUtm: 38.82 },
    ],
    concepts: [
      { code: 'asignacion_responsabilidad', label: 'Asignación de responsabilidad', taxable: true, pensionable: true },
      { code: 'movilizacion_extra', label: 'Movilización extraordinaria', taxable: false, pensionable: false },
    ],
  };
}
