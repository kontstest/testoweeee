"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LogOut,
  Palette,
  Calendar,
  MenuIcon,
  MessageSquare,
  Grid3x3,
  QrCode,
  ImageIcon,
  Users,
  Heart,
  Eye,
  X,
  Settings,
  Zap,
  BarChart3,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Event } from "@/lib/types/database"
import { CustomizationTab } from "./customization-tab"
import { ScheduleTab } from "./schedule-tab"
import { MenuTab } from "./menu-tab"
import { SurveyTab } from "./survey-tab"
import { BingoTab } from "./bingo-tab"
import { PhotoLibraryTab } from "./photo-library-tab"
import { VendorsTab } from "./vendors-tab"
import { WeddingPlanningTab } from "./wedding-planning-tab"
import { ModulesVisibilityTab } from "./modules-visibility-tab"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { generateEventQRCodeUrl, getEventUrl } from "@/lib/utils/qr-code"
import { QRTemplateGeneratorAdvanced } from "./qr-template-generator-advanced"
import { AdvancedSettingsTab } from "./advanced-settings-tab"
import { TemplateSelectorTab } from "./template-selector-tab" // Added import
import { SurveyResponsesTab } from "./survey-responses-tab" // Added import
import { cn } from "@/lib/utils"

interface ClientDashboardProps {
  events: Event[]
  userId: string
}

export function ClientDashboardSidebar({ events: initialEvents, userId }: ClientDashboardProps) {
  const [events, setEvents] = useState(initialEvents)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(events[0] || null)
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("customization")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const refreshEvent = async () => {
    if (!selectedEvent) return

    const { data } = await supabase.from("events").select("*").eq("id", selectedEvent.id).single()

    if (data) {
      setSelectedEvent(data)
      setEvents(events.map((e) => (e.id === data.id ? data : e)))
    }
  }

  if (!selectedEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Events Found</CardTitle>
            <CardDescription>Contact your administrator to create an event for you.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const isWedding = selectedEvent.event_type === "wedding"

  const menuItems = [
    { id: "customization", label: "Personalizacja", icon: Palette, show: true },
    { id: "templates", label: "Szablony Gościa", icon: Zap, show: true }, // Added template selector
    { id: "modules", label: "Moduły", icon: Eye, show: true },
    { id: "qr-template", label: "Szablon QR", icon: QrCode, show: true },
    { id: "planning", label: "Planowanie", icon: Heart, show: isWedding },
    { id: "photos", label: "Galeria", icon: ImageIcon, show: selectedEvent.module_photo_gallery },
    { id: "vendors", label: "Usługodawcy", icon: Users, show: isWedding },
    { id: "schedule", label: "Harmonogram", icon: Calendar, show: selectedEvent.module_schedule },
    { id: "menu", label: "Menu", icon: MenuIcon, show: selectedEvent.module_menu },
    { id: "survey", label: "Ankiety", icon: MessageSquare, show: selectedEvent.module_survey },
    { id: "survey-responses", label: "Odpowiedzi", icon: BarChart3, show: selectedEvent.module_survey }, // Added survey responses tab
    { id: "bingo", label: "Bingo", icon: Grid3x3, show: selectedEvent.module_bingo },
    { id: "advanced", label: "Zaawansowane", icon: Settings, show: true },
  ].filter((item) => item.show)

  const renderContent = () => {
    switch (activeTab) {
      case "customization":
        return <CustomizationTab event={selectedEvent} onUpdate={refreshEvent} />
      case "templates": // Added template selector case
        return <TemplateSelectorTab event={selectedEvent} onUpdate={refreshEvent} />
      case "modules":
        return <ModulesVisibilityTab event={selectedEvent} onUpdate={refreshEvent} />
      case "qr-template":
        return <QRTemplateGeneratorAdvanced event={selectedEvent} />
      case "planning":
        return <WeddingPlanningTab eventId={selectedEvent.id} />
      case "photos":
        return <PhotoLibraryTab eventId={selectedEvent.id} />
      case "vendors":
        return <VendorsTab eventId={selectedEvent.id} />
      case "schedule":
        return <ScheduleTab eventId={selectedEvent.id} />
      case "menu":
        return <MenuTab eventId={selectedEvent.id} />
      case "survey":
        return <SurveyTab eventId={selectedEvent.id} />
      case "survey-responses":
        return <SurveyResponsesTab eventId={selectedEvent.id} /> // Added survey responses case
      case "bingo":
        return <BingoTab eventId={selectedEvent.id} />
      case "advanced":
        return <AdvancedSettingsTab event={selectedEvent} onUpdate={refreshEvent} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-[70] bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </Button>
        <h1 className="text-lg font-semibold">{selectedEvent.name}</h1>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r z-60 transition-transform duration-300 overflow-y-auto pt-16 lg:pt-0 lg:top-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          <div className="p-6 border-b hidden lg:block">
            <h1 className="text-2xl font-bold text-balance mb-1">{isWedding ? "Pulpit Weselny" : "Event Dashboard"}</h1>
            <p className="text-sm text-muted-foreground">{isWedding ? "Twórz wspomnienia" : "Customize your event"}</p>
          </div>

          {/* Event Selector */}
          {events.length > 1 && (
            <div className="p-4 border-b">
              <p className="text-sm font-medium mb-2">Wybierz event</p>
              <div className="space-y-1">
                {events.map((event) => (
                  <Button
                    key={event.id}
                    variant={selectedEvent.id === event.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    size="sm"
                    onClick={() => {
                      setSelectedEvent(event)
                      setSidebarOpen(false)
                    }}
                  >
                    {event.event_type === "wedding" && <Heart className="w-4 h-4 mr-2" />}
                    {event.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              )
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t mt-auto space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => setShowQRDialog(true)}
            >
              <QrCode className="w-4 h-4 mr-2" />
              QR Code
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => router.push(`/event/${selectedEvent.id}`)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Zobacz stronę
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start hidden lg:flex bg-transparent"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Wyloguj
            </Button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {/* Event Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-2xl">{selectedEvent.name}</CardTitle>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        isWedding ? "bg-pink-100 text-pink-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {isWedding ? "Wedding" : "Event"}
                    </span>
                  </div>
                  <CardDescription>
                    {new Date(selectedEvent.event_date).toLocaleDateString("pl-PL", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Content Area */}
          <Card>
            <CardContent className="pt-6">{renderContent()}</CardContent>
          </Card>
        </main>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wedding QR Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={generateEventQRCodeUrl(selectedEvent.id) || "/placeholder.svg"}
                alt="Event QR Code"
                className="w-64 h-64"
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Share this QR code with your guests!</p>
              <code className="text-xs bg-muted px-3 py-2 rounded block">{getEventUrl(selectedEvent.id)}</code>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
