"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Palette, Calendar, Menu, MessageSquare, Grid3x3, QrCode, ImageIcon, Users, Heart } from "lucide-react"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { generateEventQRCodeUrl, getEventUrl } from "@/lib/utils/qr-code"

interface ClientDashboardProps {
  events: Event[]
  userId: string
}

export function ClientDashboard({ events: initialEvents, userId }: ClientDashboardProps) {
  const [events, setEvents] = useState(initialEvents)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(events[0] || null)
  const [showQRDialog, setShowQRDialog] = useState(false)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-balance mb-2">
              {isWedding ? "Wedding Dashboard" : "Event Dashboard"}
            </h1>
            <p className="text-muted-foreground">
              {isWedding ? "Plan your perfect wedding day" : "Customize your event experience"}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Event Selector */}
        {events.length > 1 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {events.map((event) => (
                  <Button
                    key={event.id}
                    variant={selectedEvent.id === event.id ? "default" : "outline"}
                    onClick={() => setSelectedEvent(event)}
                  >
                    {event.event_type === "wedding" && <Heart className="w-4 h-4 mr-2" />}
                    {event.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                  {new Date(selectedEvent.event_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowQRDialog(true)}>
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code
                </Button>
                <Button variant="outline" onClick={() => router.push(`/event/${selectedEvent.id}`)}>
                  View Guest Page
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Customization Tabs */}
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="customization" className="w-full">
              <TabsList
                className={`grid w-full ${isWedding ? "grid-cols-2 lg:grid-cols-9" : "grid-cols-2 lg:grid-cols-7"}`}
              >
                <TabsTrigger value="customization">
                  <Palette className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Customization</span>
                </TabsTrigger>
                {isWedding && (
                  <TabsTrigger value="planning">
                    <Heart className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Planning</span>
                  </TabsTrigger>
                )}
                {selectedEvent.module_photo_gallery && (
                  <TabsTrigger value="photos">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Photos</span>
                  </TabsTrigger>
                )}
                {isWedding && (
                  <TabsTrigger value="vendors">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Vendors</span>
                  </TabsTrigger>
                )}
                {selectedEvent.module_schedule && (
                  <TabsTrigger value="schedule">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Schedule</span>
                  </TabsTrigger>
                )}
                {selectedEvent.module_menu && (
                  <TabsTrigger value="menu">
                    <Menu className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Menu</span>
                  </TabsTrigger>
                )}
                {selectedEvent.module_survey && (
                  <TabsTrigger value="survey">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Survey</span>
                  </TabsTrigger>
                )}
                {selectedEvent.module_bingo && (
                  <TabsTrigger value="bingo">
                    <Grid3x3 className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Bingo</span>
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="customization" className="mt-6">
                <CustomizationTab event={selectedEvent} onUpdate={refreshEvent} />
              </TabsContent>

              {isWedding && (
                <TabsContent value="planning" className="mt-6">
                  <WeddingPlanningTab eventId={selectedEvent.id} />
                </TabsContent>
              )}

              {selectedEvent.module_photo_gallery && (
                <TabsContent value="photos" className="mt-6">
                  <PhotoLibraryTab eventId={selectedEvent.id} />
                </TabsContent>
              )}

              {isWedding && (
                <TabsContent value="vendors" className="mt-6">
                  <VendorsTab eventId={selectedEvent.id} />
                </TabsContent>
              )}

              {selectedEvent.module_schedule && (
                <TabsContent value="schedule" className="mt-6">
                  <ScheduleTab eventId={selectedEvent.id} />
                </TabsContent>
              )}

              {selectedEvent.module_menu && (
                <TabsContent value="menu" className="mt-6">
                  <MenuTab eventId={selectedEvent.id} />
                </TabsContent>
              )}

              {selectedEvent.module_survey && (
                <TabsContent value="survey" className="mt-6">
                  <SurveyTab eventId={selectedEvent.id} />
                </TabsContent>
              )}

              {selectedEvent.module_bingo && (
                <TabsContent value="bingo" className="mt-6">
                  <BingoTab eventId={selectedEvent.id} />
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event QR Code</DialogTitle>
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
