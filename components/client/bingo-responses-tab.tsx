"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Trophy } from "lucide-react"
import type { BingoProgress } from "@/lib/types/database"

interface BingoResponsesTabProps {
  eventId: string
}

export function BingoResponsesTab({ eventId }: BingoResponsesTabProps) {
  const [responses, setResponses] = useState<BingoProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadResponses()
  }, [eventId])

  const loadResponses = async () => {
    setIsLoading(true)
    try {
      const { data: cardData } = await supabase.from("bingo_cards").select("id").eq("event_id", eventId).maybeSingle()

      if (cardData) {
        const { data } = await supabase
          .from("bingo_progress")
          .select("*")
          .eq("bingo_card_id", cardData.id)
          .order("created_at", { ascending: false })

        setResponses(data || [])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading responses...</p>
      </div>
    )
  }

  if (responses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No bingo responses yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Bingo Responses</h3>
        <p className="text-sm text-muted-foreground">Track guest progress and winners</p>
      </div>

      <div className="grid gap-4">
        {responses.map((response) => (
          <Card key={response.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">{response.guest_name || "Anonymous Guest"}</CardTitle>
              <div className="flex items-center gap-2">
                {response.is_winner && (
                  <Badge className="bg-yellow-600">
                    <Trophy className="w-3 h-3 mr-1" />
                    Winner
                  </Badge>
                )}
                <Badge variant="outline">{response.completed_items?.length || 0} / 24 items</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Progress:</span>
                  <span className="ml-2 font-semibold">
                    {Math.round(((response.completed_items?.length || 0) / 24) * 100)}%
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Started:</span>
                  <span className="ml-2 font-semibold">{new Date(response.created_at).toLocaleDateString()}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
