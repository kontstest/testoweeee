"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useGuestAuth } from "@/lib/hooks/use-guest-auth"
import { GuestAuthDialog } from "../guest-auth-dialog"
import { Trophy, CheckCircle2 } from "lucide-react"
import type { BingoCard, BingoProgress } from "@/lib/types/database"
import { cn } from "@/lib/utils"

interface BingoModuleProps {
  eventId: string
  primaryColor: string
}

export function BingoModule({ eventId, primaryColor }: BingoModuleProps) {
  const [bingoCard, setBingoCard] = useState<BingoCard | null>(null)
  const [progress, setProgress] = useState<BingoProgress | null>(null)
  const [completedItems, setCompletedItems] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const { user } = useGuestAuth()
  const supabase = createClient()

  useEffect(() => {
    loadBingo()
  }, [eventId, user])

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bingo...</p>
        </div>
      </div>
    )
  }

  if (!bingoCard || bingoCard.items.length < 16) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="text-lg font-semibold mb-2">No Bingo Game Available</h3>
          <p className="text-muted-foreground">The event organizer hasn't created a bingo game yet.</p>
        </CardContent>
      </Card>
    )
  }

  // Prepare 5x5 grid (25 items)
  const gridItems = bingoCard.items.slice(0, 25)
  while (gridItems.length < 25) {
    gridItems.push("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">{bingoCard.title}</h2>
          <p className="text-muted-foreground">Tap items as you spot them during the event!</p>
        </div>
        {progress?.is_winner && (
          <div className="flex items-center gap-2 text-yellow-600">
            <Trophy className="w-6 h-6" />
            <span className="font-semibold">Winner!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2 max-w-2xl mx-auto">
        {gridItems.map((item, index) => {
          const isCompleted = completedItems.includes(index)
          const isFreeSpace = index === 12 // Center square

          return (
            <Card
              key={index}
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg aspect-square",
                isCompleted && "ring-2",
                isFreeSpace && "bg-muted",
              )}
              style={isCompleted ? { ringColor: primaryColor } : undefined}
              onClick={() => !isFreeSpace && handleItemClick(index)}
            >
              <CardContent className="p-2 h-full flex flex-col items-center justify-center text-center">
                {isFreeSpace ? (
                  <div>
                    <Star className="w-6 h-6 mx-auto mb-1" style={{ color: primaryColor }} />
                    <p className="text-xs font-semibold">FREE</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs leading-tight">{item}</p>
                    {isCompleted && (
                      <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: primaryColor }} />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Complete 5 in a row (horizontal, vertical, or diagonal) to win!</p>
        <p className="mt-1">
          Progress: {completedItems.length} / {gridItems.filter((_, i) => i !== 12).length} items
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

function Star({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}
