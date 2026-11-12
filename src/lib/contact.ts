/** A wa.me link from a number written any way ("+55 48 99684-4907"), with a prefilled message. */
export function whatsappHref(number: string, message?: string): string {
  const digits = number.replace(/\D/g, '');
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}
