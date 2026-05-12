export const normalizeWhatsappNumber = (value?: string | null) => {
  return (value || "").replace(/[^\d]/g, "")
}
