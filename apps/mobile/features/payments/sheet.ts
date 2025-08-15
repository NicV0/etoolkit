import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { createPaymentIntent, createEphemeralKey } from './api';

export async function payInvoice(invoice_id: string, token: string) {
  const { clientSecret, customerId } = await createPaymentIntent(invoice_id, token);
  const ek = await createEphemeralKey(customerId);

  const init = await initPaymentSheet({
    paymentIntentClientSecret: clientSecret,
    merchantDisplayName: 'eToolkit',
    customerEphemeralKeySecret: ek.secret,
    customerId,
    allowsDelayedPaymentMethods: true,
    defaultBillingDetails: {},
  });
  if (init.error) throw new Error(init.error.message);

  const res = await presentPaymentSheet();
  if (res.error) return { status: 'error', message: res.error.message } as const;
  return { status: 'success' } as const;
}
