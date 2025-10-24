import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Event Not Found</h1>
        <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  )
}
