"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, Users, ImageIcon, MessageSquare, MenuIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Event, Photo } from "@/lib/types/database"

interface EventDetailsPageProps {
  eventId: string
}

export function EventDetailsPage({ eventId }: EventDetailsPageProps) {
  const [event, setEvent] = useState<Event | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [scheduleItems, setScheduleItems] = useState<any[]>([])
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [surveyQuestions, setSurveyQuestions] = useState<any[]>([])
  const [bingoItems, setBingoItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadEventDetails()
  }, [eventId])

  const loadEventDetails = async () => {
    setIsLoading(true)
    try {
      const [eventRes, scheduleRes, menuRes, surveyRes, bingoRes] = await Promise.all([
        fetch(`/api/events/${eventId}`),
        fetch(`/api/events/${eventId}/schedule`),
        fetch(`/api/events/${eventId}/menu`),
        fetch(`/api/events/${eventId}/surveys`),
        fetch(`/api/events/${eventId}/bingo`),
      ])

      if (eventRes.ok) {
        const eventData = await eventRes.json()
        setEvent(eventData)
      }

      if (scheduleRes.ok) {
        const scheduleData = await scheduleRes.json()
        setScheduleItems(scheduleData.items || [])
      }

      if (menuRes.ok) {
        const menuData = await menuRes.json()
        setMenuItems(menuData.items || [])
      }

      if (surveyRes.ok) {
        const surveyData = await surveyRes.json()
        setSurveyQuestions(surveyData.items || [])
      }

      if (bingoRes.ok) {
        const bingoData = await bingoRes.json()
        setBingoItems(bingoData.items || [])
      }
    } catch (error) {
      console.error("[v0] Error loading event details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push("/admin")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Event Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">{event.name}</CardTitle>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(event.event_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {event.client_email} {event.client_first_name} {event.client_last_name}
                  </div>
                </div>
              </div>
              <Badge className={event.status === "active" ? "bg-green-100 text-green-800" : ""}>{event.status}</Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Photos</p>
                  <p className="text-2xl font-bold">{photos.length}</p>
                </div>
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Schedule Items</p>
                  <p className="text-2xl font-bold">{scheduleItems.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Menu Items</p>
                  <p className="text-2xl font-bold">{menuItems.length}</p>
                </div>
                <MenuIcon className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Survey Questions</p>
                  <p className="text-2xl font-bold">{surveyQuestions.length}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details Tabs */}
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="photos">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="photos">Photos ({photos.length})</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="menu">Menu</TabsTrigger>
                <TabsTrigger value="survey">Survey</TabsTrigger>
                <TabsTrigger value="bingo">Bingo</TabsTrigger>
              </TabsList>

              <TabsContent value="photos" className="mt-6">
                {photos.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No photos uploaded yet</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {photos.map((photo) => (
                      <Card key={photo.id} className="overflow-hidden">
                        <div className="aspect-square relative">
                          <img
                            src={photo.image_url || "/placeholder.svg"}
                            alt={photo.caption || "Event photo"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="schedule" className="mt-6">
                {scheduleItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No schedule items yet</p>
                ) : (
                  <div className="space-y-4">
                    {scheduleItems.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="font-semibold text-primary">{item.time}</div>
                            <div>
                              <h4 className="font-semibold">{item.title}</h4>
                              {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="menu" className="mt-6">
                {menuItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No menu items yet</p>
                ) : (
                  <div className="space-y-6">
                    {["appetizers", "main_courses", "desserts", "drinks"].map((category) => {
                      const items = menuItems.filter((item) => item.category === category)
                      if (items.length === 0) return null
                      return (
                        <div key={category}>
                          <h3 className="text-lg font-semibold mb-3 capitalize">{category.replace("_", " ")}</h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            {items.map((item) => (
                              <Card key={item.id}>
                                <CardContent className="pt-6">
                                  <h4 className="font-semibold">{item.name}</h4>
                                  {item.description && (
                                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="survey" className="mt-6">
                {surveyQuestions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No survey questions yet</p>
                ) : (
                  <div className="space-y-4">
                    {surveyQuestions.map((question, index) => (
                      <Card key={question.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <Badge variant="outline">{index + 1}</Badge>
                            <div className="flex-1">
                              <p className="font-medium">{question.question}</p>
                              <p className="text-sm text-muted-foreground mt-1">Type: {question.type}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="bingo" className="mt-6">
                {bingoItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No bingo items yet</p>
                ) : (
                  <div className="grid grid-cols-5 gap-2 max-w-2xl mx-auto">
                    {bingoItems.map((item) => (
                      <Card key={item.id} className="aspect-square">
                        <CardContent className="p-2 h-full flex items-center justify-center text-center">
                          <p className="text-xs font-medium">{item.text}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
