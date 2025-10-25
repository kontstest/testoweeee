import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, ImageIcon, Menu, MessageSquare, Grid3x3, Sparkles } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <Sparkles className="w-4 h-4" />
            Modern Event Management Platform
          </div>
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-balance mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000"
            style={{ animationDelay: "100ms" }}
          >
            EventFlow
          </h1>
          <p
            className="text-lg sm:text-xl text-muted-foreground mb-8 text-pretty animate-in fade-in slide-in-from-bottom-4 duration-1000"
            style={{ animationDelay: "200ms" }}
          >
            Create unforgettable event experiences with interactive modules for your guests. Perfect for weddings,
            parties, and special celebrations.
          </p>
          <div
            className="flex gap-4 justify-center flex-wrap animate-in fade-in slide-in-from-bottom-4 duration-1000"
            style={{ animationDelay: "300ms" }}
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-105 shadow-lg"
            >
              <Link href="/auth/login">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="hover:scale-105 transition-transform bg-transparent">
              <Link href="/auth/sign-up">Create Account</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20 max-w-6xl mx-auto">
          <div
            className="bg-white p-6 rounded-lg shadow-sm border border-border hover:shadow-xl hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: "400ms" }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center mb-4">
              <ImageIcon className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Photo Gallery</h3>
            <p className="text-muted-foreground">
              Let guests capture and share memories in a beautiful, collaborative gallery.
            </p>
          </div>

          <div
            className="bg-white p-6 rounded-lg shadow-sm border border-border hover:shadow-xl hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: "500ms" }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Event Schedule</h3>
            <p className="text-muted-foreground">Keep everyone informed with a clear, customizable event timeline.</p>
          </div>

          <div
            className="bg-white p-6 rounded-lg shadow-sm border border-border hover:shadow-xl hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: "600ms" }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center mb-4">
              <Menu className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Digital Menu</h3>
            <p className="text-muted-foreground">Showcase your menu beautifully with categories and descriptions.</p>
          </div>

          <div
            className="bg-white p-6 rounded-lg shadow-sm border border-border hover:shadow-xl hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: "700ms" }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Interactive Surveys</h3>
            <p className="text-muted-foreground">Gather feedback and engage guests with custom surveys and polls.</p>
          </div>

          <div
            className="bg-white p-6 rounded-lg shadow-sm border border-border hover:shadow-xl hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: "800ms" }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center mb-4">
              <Grid3x3 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Event Bingo</h3>
            <p className="text-muted-foreground">Add fun and interaction with customizable bingo games for guests.</p>
          </div>

          <div
            className="bg-white p-6 rounded-lg shadow-sm border border-border hover:shadow-xl hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: "900ms" }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Full Customization</h3>
            <p className="text-muted-foreground">Personalize colors, images, and content to match your event theme.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
