export function renderEmail(input: { type:'quote'|'invoice'; company:string; recipient:string; link:string; number?:string; total?:string }) {
  const subject = input.type === 'quote' ? `Your quote from ${input.company}` : `Invoice from ${input.company}`;
  const text = `Hello ${input.recipient},\n\nYour ${input.type} is ready. View it here: ${input.link}\n\nThanks,\n${input.company}`;
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Inter;line-height:1.5">
    <h2>${input.company}</h2>
    <p>Hello ${input.recipient},</p>
    <p>Your ${input.type}${input.number?` <b>${input.number}</b>`:''} is ready.${input.total?` Total: <b>${input.total}</b>.`:''}</p>
    <p><a href="${input.link}">View ${input.type === 'quote' ? 'Quote' : 'Invoice'}</a></p>
    <p>Thanks,<br/>${input.company}</p>
  </div>`;
  return { subject, text, html };
}
