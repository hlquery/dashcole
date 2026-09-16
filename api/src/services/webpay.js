import tbk from 'transbank-sdk';
import { ApiError } from '../http.js';

const {
  WebpayPlus, Oneclick, Environment, IntegrationApiKeys, IntegrationCommerceCodes,
} = tbk;

export const PLATFORM_BANK_ACCOUNT = {
  bank: 'Banco de Chile',
  accountType: 'Cuenta corriente',
  accountNumber: '00-123-45678-09',
  accountNumberMasked: '************7809',
  holderName: 'DashCole SpA',
  holderRut: '76.543.210-K',
  email: 'pagos@hlquery.com',
  branch: 'Casa Matriz Santiago',
  transferNote: 'Usa el RUT y el número de cuenta. En el comentario indica el slug del colegio.',
};

function envName() {
  return String(process.env.WEBPAY_ENVIRONMENT || 'integration').trim().toLowerCase() === 'production'
    ? 'production'
    : 'integration';
}

export function webpayPublicConfig() {
  const environment = envName();
  return {
    environment,
    configured: Boolean(process.env.WEBPAY_COMMERCE_CODE && process.env.WEBPAY_API_KEY) || environment === 'integration',
    usingIntegrationCredentials: !(process.env.WEBPAY_COMMERCE_CODE && process.env.WEBPAY_API_KEY),
    commerceCodeMasked: process.env.WEBPAY_COMMERCE_CODE
      ? `****${String(process.env.WEBPAY_COMMERCE_CODE).slice(-4)}`
      : IntegrationCommerceCodes.WEBPAY_PLUS,
  };
}

function credentials(kind = 'webpay') {
  const commerce = String(process.env.WEBPAY_COMMERCE_CODE || '').trim();
  const apiKey = String(process.env.WEBPAY_API_KEY || '').trim();
  const production = envName() === 'production';
  if (production && (!commerce || !apiKey)) {
    throw new ApiError(503, 'WEBPAY_NOT_CONFIGURED', 'Configura WEBPAY_COMMERCE_CODE y WEBPAY_API_KEY para producción.');
  }
  if (kind === 'oneclick') {
    return {
      commerceCode: commerce || IntegrationCommerceCodes.ONECLICK_MALL,
      childCommerceCode: String(process.env.WEBPAY_ONECLICK_CHILD_COMMERCE_CODE || '').trim() || IntegrationCommerceCodes.ONECLICK_MALL_CHILD1,
      apiKey: apiKey || IntegrationApiKeys.WEBPAY,
      production,
    };
  }
  return {
    commerceCode: commerce || IntegrationCommerceCodes.WEBPAY_PLUS,
    apiKey: apiKey || IntegrationApiKeys.WEBPAY,
    production,
  };
}

export function webpayTransaction() {
  const { commerceCode, apiKey, production } = credentials('webpay');
  return production
    ? WebpayPlus.Transaction.buildForProduction(commerceCode, apiKey)
    : WebpayPlus.Transaction.buildForIntegration(commerceCode, apiKey);
}

export function oneclickInscription() {
  const { commerceCode, apiKey, production } = credentials('oneclick');
  return production
    ? Oneclick.MallInscription.buildForProduction(commerceCode, apiKey)
    : Oneclick.MallInscription.buildForIntegration(commerceCode, apiKey);
}

export function oneclickTransaction() {
  const { commerceCode, apiKey, production } = credentials('oneclick');
  return production
    ? Oneclick.MallTransaction.buildForProduction(commerceCode, apiKey)
    : Oneclick.MallTransaction.buildForIntegration(commerceCode, apiKey);
}

export function oneclickChildCommerceCode() {
  return credentials('oneclick').childCommerceCode;
}

export function webpayReturnBase() {
  const configured = String(process.env.WEBPAY_RETURN_URL || '').trim();
  if (configured) return configured.replace(/\/$/, '');
  const origin = String(process.env.WEB_ORIGIN || 'http://localhost:5174').split(',')[0].trim().replace(/\/$/, '');
  return `${origin}/plataforma/pagos`;
}

export function buyOrderId(prefix = 'NE') {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}${stamp}${rand}`.slice(0, 26);
}

export { Environment, IntegrationCommerceCodes, IntegrationApiKeys };
