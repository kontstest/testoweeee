"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trophy, CheckCircle2, Lightbulb } from "lucide-react"
import type { BingoCard, BingoProgress } from "@/lib/types/database"
import { cn } from "@/lib/utils"
import { translations } from "@/lib/i18n/translations"
import { useLanguage } from "@/lib/hooks/use-language"

interface BingoModuleProps {
  eventId: string
  primaryColor: string
}

export function BingoModule({ eventId, primaryColor }: BingoModuleProps) {
  const { language } = useLanguage()
  const [bingoCard, setBingoCard] = useState<BingoCard | null>(null)
  const [progress, setProgress] = useState<BingoProgress | null>(null)
  const [completedItems, setCompletedItems] = useState<number[]>([])
  const [guestName, setGuestName] = useState("")
  const [showNameInput, setShowNameInput] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null)
  const [showItemModal, setShowItemModal] = useState(false)
  const supabase = createClient()
  const t = translations[language]?.modules?.bingo || translations.pl.modules.bingo

  useEffect(() => {
    loadBingo()
  }, [eventId, language])

  const loadBingo = async () => {
    setIsLoading(true)

    const { data: cardData } = await supabase.from("bingo_cards").select("*").eq("event_id", eventId).maybeSingle()

    if (cardData) {
      setBingoCard(cardData)

      setShowNameInput(true)
    }

    setIsLoading(false)
  }

  const handleSaveName = async () => {
    if (!bingoCard || !guestName.trim()) return

    try {
      const sessionKey = `bingo_progress_${bingoCard.id}`
      const sessionProgress = {
        bingo_card_id: bingoCard.id,
        guest_name: guestName,
        completed_items: [],
        is_winner: false,
      }
      sessionStorage.setItem(sessionKey, JSON.stringify(sessionProgress))
      setProgress(sessionProgress as any)
      setShowNameInput(false)
    } catch (error) {
      console.error(error)
    }
  }

  const handleItemClick = (index: number) => {
    setSelectedItemIndex(index)
    setShowItemModal(true)
  }

  const handleCompleteItem = async (index: number) => {
    if (!progress || !bingoCard) return

    const newCompletedItems = completedItems.includes(index)
      ? completedItems.filter((i) => i !== index)
      : [...completedItems, index]

    setCompletedItems(newCompletedItems)

    const isWinner = checkBingo(newCompletedItems)

    const sessionKey = `bingo_progress_${bingoCard.id}`
    const updatedProgress = {
      ...progress,
      completed_items: newCompletedItems,
      is_winner: isWinner,
    }
    sessionStorage.setItem(sessionKey, JSON.stringify(updatedProgress))
    setProgress(updatedProgress)

    if (isWinner && !progress.is_winner) {
      alert("🎉 BINGO! You won!")
    }

    setShowItemModal(false)
  }

  const checkBingo = (completed: number[]): boolean => {
    const size = 5

    for (let row = 0; row < size; row++) {
      const rowItems = Array.from({ length: size }, (_, i) => row * size + i)
      if (rowItems.every((i) => completed.includes(i))) return true
    }

    for (let col = 0; col < size; col++) {
      const colItems = Array.from({ length: size }, (_, i) => i * size + col)
      if (colItems.every((i) => completed.includes(i))) return true
    }

    const diagonal1 = Array.from({ length: size }, (_, i) => i * size + i)
    if (diagonal1.every((i) => completed.includes(i))) return true

    const diagonal2 = Array.from({ length: size }, (_, i) => i * size + (size - 1 - i))
    if (diagonal2.every((i) => completed.includes(i))) return true

    return false
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderTopColor: primaryColor }}
          ></div>
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (showNameInput) {
    return (
      <Card>
        <CardContent className="py-12">
          <h3 className="text-lg font-semibold mb-4 text-center">How should we call you?</h3>
          <div className="max-w-sm mx-auto space-y-4">
            <Input
              placeholder="Your name or nickname"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
            />
            <Button onClick={handleSaveName} disabled={!guestName.trim()} className="w-full">
              Start Playing
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!bingoCard || bingoCard.items.length < 16) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">{t.description}</p>
        </CardContent>
      </Card>
    )
  }

  const displayItems = language === "en" && bingoCard.items_en ? bingoCard.items_en : bingoCard.items
  const displayDescriptions =
    language === "en" && bingoCard.descriptions_en ? bingoCard.descriptions_en : bingoCard.descriptions
  const displayActions = language === "en" && bingoCard.actions_en ? bingoCard.actions_en : bingoCard.actions

  const gridItems = displayItems.slice(0, 25)
  while (gridItems.length < 25) {
    gridItems.push("")
  }

  const selectedItem = selectedItemIndex !== null ? gridItems[selectedItemIndex] : null
  const selectedDescription = selectedItemIndex !== null ? displayDescriptions?.[selectedItemIndex] : null
  const selectedImage = selectedItemIndex !== null ? bingoCard.images?.[selectedItemIndex] : null

  return (
    <div className="space-y-6">
      {displayActions && displayActions.length > 0 && (
        <div className="bg-gradient-to-r" style={{ backgroundColor: `${primaryColor}10` }}>
          <div className="p-4 rounded-lg border" style={{ borderColor: `${primaryColor}30` }}>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: primaryColor }}>
              <Lightbulb className="w-4 h-4" />
              {t.actions}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {displayActions.map((action, index) => (
                <div
                  key={index}
                  className="text-sm p-2 bg-white rounded border-l-2"
                  style={{ borderLeftColor: primaryColor }}
                >
                  {action}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            {language === "en" && bingoCard?.title_en ? bingoCard.title_en : bingoCard?.title}
          </h2>
          <p className="text-muted-foreground text-sm">
            Playing as: <span className="font-semibold">{guestName}</span>
          </p>
        </div>
        {progress?.is_winner && (
          <div className="flex items-center gap-2 text-yellow-600 text-lg font-semibold">
            <Trophy className="w-6 h-6" />
            {t.winner}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <div className="grid grid-cols-5 gap-1 sm:gap-2 w-full max-w-md">
          {gridItems.map((item, index) => {
            const isCompleted = completedItems.includes(index)
            const isFreeSpace = index === 12

            return (
              <Card
                key={index}
                className={cn(
                  "cursor-pointer transition-all aspect-square flex items-center justify-center",
                  isCompleted && "ring-2",
                  isFreeSpace && "bg-muted",
                )}
                style={{
                  ringColor: isCompleted ? primaryColor : undefined,
                  borderColor: `${primaryColor}20`,
                }}
                onClick={() => !isFreeSpace && handleItemClick(index)}
              >
                <CardContent className="p-2 h-full flex flex-col items-center justify-center text-center">
                  {isFreeSpace ? (
                    <div>
                      <div className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1" style={{ color: primaryColor }}>
                        ★
                      </div>
                      <p className="text-xs font-semibold">{t.free}</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs sm:text-sm leading-tight px-1">{item}</p>
                      {isCompleted && (
                        <CheckCircle2
                          className="w-4 h-4 sm:w-5 sm:h-5 mt-1 flex-shrink-0"
                          style={{ color: primaryColor }}
                        />
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <Dialog open={showItemModal} onOpenChange={setShowItemModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedItem}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedImage && (
              <img
                src={selectedImage || "/placeholder.svg"}
                alt={selectedItem || ""}
                className="w-full h-48 object-cover rounded"
              />
            )}
            {selectedDescription && <p className="text-sm text-muted-foreground">{selectedDescription}</p>}
            <Button
              onClick={() => selectedItemIndex !== null && handleCompleteItem(selectedItemIndex)}
              className="w-full"
              style={{ backgroundColor: primaryColor }}
            >
              {completedItems.includes(selectedItemIndex!) ? "Undo Complete" : "Mark Complete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="text-center text-sm text-muted-foreground">
        <p>{t.complete5}</p>
        <p className="mt-1">
          {t.progress}: {completedItems.length} / {gridItems.filter((_, i) => i !== 12).length} {t.items}
        </p>
      </div>
    </div>
  )
}
