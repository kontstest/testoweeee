"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import type { MenuItem } from "@/lib/types/database"
import { toast } from "sonner"

interface MenuTabProps {
  eventId: string
}

export function MenuTab({ eventId }: MenuTabProps) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadMenu()
  }, [eventId])

  const loadMenu = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/menu`)
      if (!res.ok) throw new Error("Failed to load menu")
      const data = await res.json()
      setItems(data || [])
    } catch (error) {
      console.error("[v0] Error loading menu:", error)
      toast.error("Failed to load menu")
    }
  }

  const handleAdd = () => {
    const newItem: Partial<MenuItem> = {
      event_id: eventId,
      category: "main",
      name: "",
      name_en: "",
      description: "",
      description_en: "",
      order_index: items.length,
    }
    setItems([...items, newItem as MenuItem])
  }

  const handleUpdate = (index: number, field: keyof MenuItem, value: string) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const handleDelete = async (index: number) => {
    const item = items[index]
    if (item.id) {
      try {
        await fetch(`/api/events/${eventId}/menu/${item.id}`, { method: "DELETE" })
      } catch (error) {
        console.error("[v0] Error deleting item:", error)
      }
    }
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      const itemsToInsert = items.map((item, index) => ({
        event_id: eventId,
        category: item.category,
        name: item.name,
        name_en: item.name_en || item.name,
        description: item.description,
        description_en: item.description_en || item.description,
        order_index: index,
      }))

      const res = await fetch(`/api/events/${eventId}/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsToInsert }),
      })

      if (!res.ok) throw new Error("Failed to save menu")

      await loadMenu()
      toast.success("Menu saved successfully!")
    } catch (error) {
      console.error("[v0] Error saving menu:", error)
      toast.error("Failed to save menu")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Event Menu</h3>
          <p className="text-sm text-muted-foreground">Add food and drink items</p>
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
                <div className="flex-1 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={item.category} onValueChange={(value) => handleUpdate(index, "category", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="appetizer">Appetizer</SelectItem>
                          <SelectItem value="main">Main Course</SelectItem>
                          <SelectItem value="dessert">Dessert</SelectItem>
                          <SelectItem value="drink">Drink</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        placeholder="Grilled Salmon"
                        value={item.name}
                        onChange={(e) => handleUpdate(index, "name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Name (English)</Label>
                      <Input
                        placeholder="Grilled Salmon"
                        value={item.name_en || ""}
                        onChange={(e) => handleUpdate(index, "name_en", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description (optional)</Label>
                      <Textarea
                        placeholder="With lemon butter sauce..."
                        value={item.description || ""}
                        onChange={(e) => handleUpdate(index, "description", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description (English) (optional)</Label>
                      <Textarea
                        placeholder="With lemon butter sauce..."
                        value={item.description_en || ""}
                        onChange={(e) => handleUpdate(index, "description_en", e.target.value)}
                      />
                    </div>
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
            No menu items yet. Click "Add Item" to get started.
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Menu"}
        </Button>
      </div>
    </div>
  )
}
