import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, ImageIcon, Menu, MessageSquare, Grid3x3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-balance mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            EventFlow
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            Create unforgettable event experiences with interactive modules for your guests. Perfect for weddings,
            parties, and special celebrations.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/auth/login">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/auth/sign-up">Create Account</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <ImageIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Photo Gallery</h3>
            <p className="text-muted-foreground">
              Let guests capture and share memories in a beautiful, collaborative gallery.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Event Schedule</h3>
            <p className="text-muted-foreground">Keep everyone informed with a clear, customizable event timeline.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Menu className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Digital Menu</h3>
            <p className="text-muted-foreground">Showcase your menu beautifully with categories and descriptions.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Interactive Surveys</h3>
            <p className="text-muted-foreground">Gather feedback and engage guests with custom surveys and polls.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Grid3x3 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Event Bingo</h3>
            <p className="text-muted-foreground">Add fun and interaction with customizable bingo games for guests.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Full Customization</h3>
            <p className="text-muted-foreground">Personalize colors, images, and content to match your event theme.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
