"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, LogOut, TrendingUp, Calendar, Archive } from "lucide-react"
import { CreateEventDialog } from "./create-event-dialog"
import { EventsTable } from "./events-table"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface AdminDashboardProps {
  events: any[]
}

export function AdminDashboard({ events: initialEvents }: AdminDashboardProps) {
  const [events, setEvents] = useState(initialEvents)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const refreshEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select(`
        *,
        profiles:client_id (
          email,
          first_name,
          last_name
        )
      `)
      .order("created_at", { ascending: false })

    if (data) {
      setEvents(data)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <h1 className="text-4xl font-bold text-balance mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Super Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage events and client instances</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="hover:scale-105 transition-transform bg-transparent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card
            className="hover:shadow-lg transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-4 duration-700"
            style={{ animationDelay: "100ms" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{events.length}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>
          <Card
            className="hover:shadow-lg transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-4 duration-700"
            style={{ animationDelay: "200ms" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {events.filter((e) => e.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Currently running</p>
            </CardContent>
          </Card>
          <Card
            className="hover:shadow-lg transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-4 duration-700"
            style={{ animationDelay: "300ms" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft Events</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {events.filter((e) => e.status === "draft").length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pending setup</p>
            </CardContent>
          </Card>
        </div>

        {/* Events Table */}
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "400ms" }}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Events</CardTitle>
                <CardDescription>Manage all event instances</CardDescription>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="hover:scale-105 transition-transform">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <EventsTable events={events} onRefresh={refreshEvents} />
          </CardContent>
        </Card>

        <CreateEventDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onSuccess={refreshEvents} />
      </div>
    </div>
  )
}
