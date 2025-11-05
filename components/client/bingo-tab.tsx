"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Plus, Trash2 } from "lucide-react"
import type { BingoCard } from "@/lib/types/database"
import { toast } from "sonner"

interface BingoTabProps {
  eventId: string
}

export function BingoTab({ eventId }: BingoTabProps) {
  const [bingoCard, setBingoCard] = useState<BingoCard | null>(null)
  const [title, setTitle] = useState("")
  const [titleEn, setTitleEn] = useState("")
  const [items, setItems] = useState<string[]>([])
  const [itemsEn, setItemsEn] = useState<string[]>([])
  const [actions, setActions] = useState<string[]>([])
  const [actionsEn, setActionsEn] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadBingo()
  }, [eventId])

  const loadBingo = async () => {
    const { data } = await supabase.from("bingo_cards").select("*").eq("event_id", eventId).maybeSingle()

    if (data) {
      setBingoCard(data)
      setTitle(data.title || "")
      setTitleEn(data.title_en || "")
      setItems(data.items || [])
      setItemsEn(data.items_en || [])
      setActions(data.actions || [])
      setActionsEn(data.actions_en || [])
    }
  }

  const handleAddItem = () => {
    setItems([...items, ""])
    setItemsEn([...itemsEn, ""])
  }

  const handleUpdateItem = (index: number, value: string, lang: "pl" | "en") => {
    if (lang === "pl") {
      const updated = [...items]
      updated[index] = value
      setItems(updated)
    } else {
      const updated = [...itemsEn]
      updated[index] = value
      setItemsEn(updated)
    }
  }

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
    setItemsEn(itemsEn.filter((_, i) => i !== index))
  }

  const handleAddAction = () => {
    setActions([...actions, ""])
    setActionsEn([...actionsEn, ""])
  }

  const handleUpdateAction = (index: number, value: string, lang: "pl" | "en") => {
    if (lang === "pl") {
      const updated = [...actions]
      updated[index] = value
      setActions(updated)
    } else {
      const updated = [...actionsEn]
      updated[index] = value
      setActionsEn(updated)
    }
  }

  const handleDeleteAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index))
    setActionsEn(actionsEn.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      const filteredItems = items.filter((item) => item.trim() !== "")
      const filteredItemsEn = itemsEn.filter((item) => item.trim() !== "")
      const filteredActions = actions.filter((action) => action.trim() !== "")
      const filteredActionsEn = actionsEn.filter((action) => action.trim() !== "")

      if (bingoCard) {
        const { error } = await supabase
          .from("bingo_cards")
          .update({
            title: title || "Event Bingo",
            title_en: titleEn || null,
            items: filteredItems,
            items_en: filteredItemsEn.length > 0 ? filteredItemsEn : null,
            actions: filteredActions.length > 0 ? filteredActions : null,
            actions_en: filteredActionsEn.length > 0 ? filteredActionsEn : null,
          })
          .eq("id", bingoCard.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("bingo_cards").insert({
          event_id: eventId,
          title: title || "Event Bingo",
          title_en: titleEn || null,
          items: filteredItems,
          items_en: filteredItemsEn.length > 0 ? filteredItemsEn : null,
          actions: filteredActions.length > 0 ? filteredActions : null,
          actions_en: filteredActionsEn.length > 0 ? filteredActionsEn : null,
        })

        if (error) throw error
      }

      await loadBingo()
      toast.success("Bingo card saved successfully!")
    } catch (error) {
      console.error("[v0] Error saving bingo:", error)
      toast.error("Failed to save bingo card")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Event Bingo</h3>
        <p className="text-sm text-muted-foreground">Create bingo items for guests (minimum 16 items recommended)</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Title (Polski)</Label>
          <Input placeholder="Event Bingo" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Title (English)</Label>
          <Input placeholder="Event Bingo" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold">Actions & Challenges</h4>
            <p className="text-sm text-muted-foreground">Optional instructions or challenges for guests</p>
          </div>
          <Button onClick={handleAddAction} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Action
          </Button>
        </div>

        {actions.map((action, index) => (
          <Card key={`action-${index}`}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <Label>Action {index + 1} (Polski)</Label>
                    <Textarea
                      placeholder="Zrób selfie z Panią Młodą"
                      value={action}
                      onChange={(e) => handleUpdateAction(index, e.target.value, "pl")}
                      rows={2}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteAction(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Action {index + 1} (English)</Label>
                  <Textarea
                    placeholder="Take a selfie with the Bride"
                    value={actionsEn[index] || ""}
                    onChange={(e) => handleUpdateAction(index, e.target.value, "en")}
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold">Bingo Items</h4>
            <p className="text-sm text-muted-foreground">Add items for the bingo card (25 items for 5x5 grid)</p>
          </div>
          <Button onClick={handleAddItem} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {items.map((item, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                      <Label>Item {index + 1} (Polski)</Label>
                      <Input
                        placeholder="Ktoś płacze ze szczęścia"
                        value={item}
                        onChange={(e) => handleUpdateItem(index, e.target.value, "pl")}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Item {index + 1} (English)</Label>
                    <Input
                      placeholder="Someone cries happy tears"
                      value={itemsEn[index] || ""}
                      onChange={(e) => handleUpdateItem(index, e.target.value, "en")}
                    />
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
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Bingo Card"}
        </Button>
      </div>
    </div>
  )
}
