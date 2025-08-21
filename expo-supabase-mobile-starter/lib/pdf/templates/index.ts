import { cleanMinimalTemplate } from './clean-minimal';
import { modernProTemplate } from './modern-pro';
import { ledgerProTemplate } from './ledger-pro';

export { cleanMinimalTemplate } from './clean-minimal';
export { modernProTemplate } from './modern-pro';
export { ledgerProTemplate } from './ledger-pro';

export const allTemplates = {
  'clean-minimal': cleanMinimalTemplate,
  'modern-pro': modernProTemplate,
  'ledger-pro': ledgerProTemplate,
};

export const freeTemplates = {
  'clean-minimal': cleanMinimalTemplate,
};

export const premiumTemplates = {
  'modern-pro': modernProTemplate,
  'ledger-pro': ledgerProTemplate,
};
