# etoolkit

## Plan Tiers
- **Free**: basic features, access to free invoice templates with watermark.
- **Pro**: includes all templates without watermark.

## Refunds
Only organization **OWNER** or **ADMIN** members may trigger a refund. Successful refunds mark the invoice as `VOID`.

## QA Steps
1. Free plan: Billing screen shows Pro templates disabled; select a free template.
2. Export invoice PDF: watermark visible on Free plan.
3. Pay invoice then tap **Refund**: invoice becomes `VOID`.
4. Void an unpaid invoice: status updates to `VOID`.
