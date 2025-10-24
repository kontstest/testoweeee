"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Plus, Trash2, GripVertical } from "lucide-react"
import type { ScheduleItem } from "@/lib/types/database"

interface ScheduleTabProps {
  eventId: string
}

export function ScheduleTab({ eventId }: ScheduleTabProps) {
  const [items, setItems] = useState<ScheduleItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadSchedule()
  }, [eventId])

  const loadSchedule = async () => {
    const { data } = await supabase
      .from("schedule_items")
      .select("*")
      .eq("event_id", eventId)
      .order("order_index", { ascending: true })

    if (data) {
      setItems(data)
    }
  }

  const handleAdd = () => {
    const newItem: Partial<ScheduleItem> = {
      event_id: eventId,
      time: "12:00",
      title: "",
      description: "",
      order_index: items.length,
    }
    setItems([...items, newItem as ScheduleItem])
  }

  const handleUpdate = (index: number, field: keyof ScheduleItem, value: string) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const handleDelete = async (index: number) => {
    const item = items[index]
    if (item.id) {
      await supabase.from("schedule_items").delete().eq("id", item.id)
    }
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      // Delete all existing items
      await supabase.from("schedule_items").delete().eq("event_id", eventId)

      // Insert new items
      const itemsToInsert = items.map((item, index) => ({
        event_id: eventId,
        time: item.time,
        title: item.title,
        description: item.description,
        order_index: index,
      }))

      const { error } = await supabase.from("schedule_items").insert(itemsToInsert)

      if (error) throw error

      await loadSchedule()
      alert("Schedule saved successfully!")
    } catch (error) {
      console.error("[v0] Error saving schedule:", error)
      alert("Failed to save schedule")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Event Schedule</h3>
          <p className="text-sm text-muted-foreground">Add timeline items for your event</p>
        </div>
        <Button onClick={handleAdd} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex items-center">
                  <GripVertical className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={item.time}
                        onChange={(e) => handleUpdate(index, "time", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        placeholder="Ceremony"
                        value={item.title}
                        onChange={(e) => handleUpdate(index, "title", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description (optional)</Label>
                    <Textarea
                      placeholder="Additional details..."
                      value={item.description || ""}
                      onChange={(e) => handleUpdate(index, "description", e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-start">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {items.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No schedule items yet. Click "Add Item" to get started.
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Schedule"}
        </Button>
      </div>
    </div>
  )
}
