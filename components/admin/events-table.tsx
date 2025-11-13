"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Trash2, QrCode, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { generateEventQRCodeUrl, getEventUrl } from "@/lib/utils/qr-code"
import { toast } from "sonner"

interface EventsTableProps {
  events: any[]
  onRefresh: () => void
}

export function EventsTable({ events, onRefresh }: EventsTableProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (eventId: string) => {
    toast.promise(
      (async () => {
        const response = await fetch(`/api/events/${eventId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Failed to delete event")
        }

        onRefresh()
      })(),
      {
        loading: "Deleting event...",
        success: "Event deleted successfully!",
        error: (err) => `Error: ${err.message}`,
      },
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEnabledModules = (event: any) => {
    const modules = []
    if (event.module_photo_gallery) modules.push("Gallery")
    if (event.module_schedule) modules.push("Schedule")
    if (event.module_menu) modules.push("Menu")
    if (event.module_survey) modules.push("Survey")
    if (event.module_bingo) modules.push("Bingo")
    return modules.join(", ") || "None"
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No events yet. Create your first event to get started.
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Modules</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.name}</TableCell>
              <TableCell>{new Date(event.event_date).toLocaleDateString()}</TableCell>
              <TableCell>
                {event.profiles?.first_name} {event.profiles?.last_name}
                <br />
                <span className="text-sm text-muted-foreground">{event.profiles?.email}</span>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(event.status)} variant="secondary">
                  {event.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{getEnabledModules(event)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/event/${event.id}`)}>
                    <FileText className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedEventId(event.id)}>
                    <QrCode className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => router.push(`/event/${event.id}`)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(event.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* QR Code Dialog */}
      <Dialog open={!!selectedEventId} onOpenChange={() => setSelectedEventId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event QR Code</DialogTitle>
          </DialogHeader>
          {selectedEventId && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={generateEventQRCodeUrl(selectedEventId) || "/placeholder.svg"}
                  alt="Event QR Code"
                  className="w-64 h-64"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Event URL:</p>
                <code className="text-xs bg-muted px-3 py-2 rounded">{getEventUrl(selectedEventId)}</code>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
