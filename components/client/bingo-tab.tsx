"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Plus, Trash2 } from "lucide-react"
import type { BingoCard } from "@/lib/types/database"

interface BingoTabProps {
  eventId: string
}

export function BingoTab({ eventId }: BingoTabProps) {
  const [bingoCard, setBingoCard] = useState<BingoCard | null>(null)
  const [items, setItems] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadBingo()
  }, [eventId])

  const loadBingo = async () => {
    const { data } = await supabase.from("bingo_cards").select("*").eq("event_id", eventId).single()

    if (data) {
      setBingoCard(data)
      setItems(data.items)
    }
  }

  const handleAddItem = () => {
    setItems([...items, ""])
  }

  const handleUpdateItem = (index: number, value: string) => {
    const updated = [...items]
    updated[index] = value
    setItems(updated)
  }

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      const filteredItems = items.filter((item) => item.trim() !== "")

      if (bingoCard) {
        // Update existing bingo card
        const { error } = await supabase
          .from("bingo_cards")
          .update({
            items: filteredItems,
          })
          .eq("id", bingoCard.id)

        if (error) throw error
      } else {
        // Create new bingo card
        const { error } = await supabase.from("bingo_cards").insert({
          event_id: eventId,
          title: "Event Bingo",
          items: filteredItems,
        })

        if (error) throw error
      }

      await loadBingo()
      alert("Bingo card saved successfully!")
    } catch (error) {
      console.error("[v0] Error saving bingo:", error)
      alert("Failed to save bingo card")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Event Bingo</h3>
          <p className="text-sm text-muted-foreground">Create bingo items for guests (minimum 16 items recommended)</p>
        </div>
        <Button onClick={handleAddItem} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <Label>Item {index + 1}</Label>
                  <Input
                    placeholder="Someone cries happy tears"
                    value={item}
                    onChange={(e) => handleUpdateItem(index, e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {items.length === 0 && (
          <div className="col-span-2 text-center py-12 text-muted-foreground">
            No bingo items yet. Click "Add Item" to get started.
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Bingo Card"}
        </Button>
      </div>
    </div>
  )
}
