"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, LogOut } from "lucide-react"
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-balance mb-2">Super Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage events and client instances</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Events</CardTitle>
              <CardDescription>All time</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{events.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Events</CardTitle>
              <CardDescription>Currently running</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{events.filter((e) => e.status === "active").length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Draft Events</CardTitle>
              <CardDescription>Pending setup</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{events.filter((e) => e.status === "draft").length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Events Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Events</CardTitle>
                <CardDescription>Manage all event instances</CardDescription>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
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
