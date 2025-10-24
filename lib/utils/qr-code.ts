// Utility function to generate QR code URL for events
export function generateEventQRCodeUrl(eventId: string): string {
  const eventUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/event/${eventId}`
  // Using a free QR code API
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(eventUrl)}`
}

export function getEventUrl(eventId: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/event/${eventId}`
}
