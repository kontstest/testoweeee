// Utility function to generate QR code URL for events
export function generateEventQRCodeUrl(eventId: string): string {
  const eventUrl = getEventUrl(eventId)
  // Using a free QR code API
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(eventUrl)}`
}

export function getEventUrl(eventId: string): string {
  // Always use NEXT_PUBLIC_APP_URL if available
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL

  // If running on client side and no env var, use window.location.origin
  if (!baseUrl && typeof window !== "undefined") {
    return `${window.location.origin}/event/${eventId}`
  }

  // If no base URL is available, throw an error
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL environment variable is not set")
  }

  return `${baseUrl}/event/${eventId}`
}
