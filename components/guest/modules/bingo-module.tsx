"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useGuestAuth } from "@/lib/hooks/use-guest-auth"
import { GuestAuthDialog } from "../guest-auth-dialog"
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
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const { user } = useGuestAuth()
  const supabase = createClient()
  const t = translations[language]?.modules?.bingo || translations.pl.modules.bingo

  useEffect(() => {
    loadBingo()
  }, [eventId, user, language])

  const loadBingo = async () => {
    setIsLoading(true)

    const { data: cardData } = await supabase.from("bingo_cards").select("*").eq("event_id", eventId).maybeSingle()

    if (cardData) {
      setBingoCard(cardData)

      // Load user progress if logged in
      if (user) {
        const { data: progressData } = await supabase
          .from("bingo_progress")
          .select("*")
          .eq("bingo_card_id", cardData.id)
          .eq("guest_id", user.id)
          .maybeSingle()

        if (progressData) {
          setProgress(progressData)
          setCompletedItems(progressData.completed_items || [])
        } else {
          // Create initial progress
          const { data: newProgress } = await supabase
            .from("bingo_progress")
            .insert({
              bingo_card_id: cardData.id,
              guest_id: user.id,
              completed_items: [],
              is_winner: false,
            })
            .select()
            .maybeSingle()

          if (newProgress) {
            setProgress(newProgress)
          }
        }
      }
    }

    setIsLoading(false)
  }

  const handleItemClick = async (index: number) => {
    if (!user) {
      setShowAuthDialog(true)
      return
    }

    if (!progress || !bingoCard) return

    const newCompletedItems = completedItems.includes(index)
      ? completedItems.filter((i) => i !== index)
      : [...completedItems, index]

    setCompletedItems(newCompletedItems)

    // Check for bingo (5 in a row, column, or diagonal)
    const isWinner = checkBingo(newCompletedItems)

    // Update progress in database
    const { error } = await supabase
      .from("bingo_progress")
      .update({
        completed_items: newCompletedItems,
        is_winner: isWinner,
      })
      .eq("id", progress.id)

    if (!error && isWinner && !progress.is_winner) {
      alert("🎉 BINGO! You won!")
      setProgress({ ...progress, is_winner: true })
    }
  }

  const checkBingo = (completed: number[]): boolean => {
    // For a 5x5 grid
    const size = 5

    // Check rows
    for (let row = 0; row < size; row++) {
      const rowItems = Array.from({ length: size }, (_, i) => row * size + i)
      if (rowItems.every((i) => completed.includes(i))) return true
    }

    // Check columns
    for (let col = 0; col < size; col++) {
      const colItems = Array.from({ length: size }, (_, i) => i * size + col)
      if (colItems.every((i) => completed.includes(i))) return true
    }

    // Check diagonals
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

  if (!bingoCard || bingoCard.items.length < 16) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="text-lg md:text-3xl font-semibold mb-2">
            {language === "en" && bingoCard?.title_en ? bingoCard.title_en : bingoCard?.title}
          </h3>
          <p className="text-muted-foreground text-sm md:text-base">{t.description}</p>
        </CardContent>
      </Card>
    )
  }

  const displayItems = language === "en" && bingoCard.items_en ? bingoCard.items_en : bingoCard.items
  const displayActions = language === "en" && bingoCard.actions_en ? bingoCard.actions_en : bingoCard.actions

  const gridItems = displayItems.slice(0, 25)
  while (gridItems.length < 25) {
    gridItems.push("")
  }

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
          <p className="text-muted-foreground text-sm md:text-base">{t.description}</p>
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

      <div className="text-center text-sm text-muted-foreground">
        <p>{t.complete5}</p>
        <p className="mt-1">
          {t.progress}: {completedItems.length} / {gridItems.filter((_, i) => i !== 12).length} {t.items}
        </p>
      </div>

      <GuestAuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onSuccess={() => {
          setShowAuthDialog(false)
          loadBingo()
        }}
        eventId={eventId}
      />
    </div>
  )
}
