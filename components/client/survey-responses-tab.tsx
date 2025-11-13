"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, MessageSquare } from "lucide-react"
import type { Survey, SurveyQuestion, SurveyResponse } from "@/lib/types/database"

interface SurveyResponsesTabProps {
  eventId: string
}

export function SurveyResponsesTab({ eventId }: SurveyResponsesTabProps) {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSurveys()
  }, [eventId])

  const loadSurveys = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/events/${eventId}/surveys`)
      if (!res.ok) throw new Error("Failed to load surveys")
      const surveysData = await res.json()

      if (surveysData && surveysData.length > 0) {
        setSurveys(surveysData)
        setSelectedSurvey(surveysData[0])
        await loadResponses(surveysData[0].id)
      }
    } catch (error) {
      console.error("[v0] Error loading surveys:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadResponses = async (surveyId: string) => {
    try {
      const questionsRes = await fetch(`/api/events/${eventId}/surveys/${surveyId}/questions`)
      const responsesRes = await fetch(`/api/events/${eventId}/surveys/${surveyId}/responses`)

      if (questionsRes.ok) {
        const questionsData = await questionsRes.json()
        setQuestions(questionsData || [])
      }

      if (responsesRes.ok) {
        const responsesData = await responsesRes.json()
        setResponses(responsesData || [])
      }
    } catch (error) {
      console.error("[v0] Error loading responses:", error)
    }
  }

  const handleSurveyChange = async (survey: Survey) => {
    setSelectedSurvey(survey)
    await loadResponses(survey.id)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading responses...</p>
        </div>
      </div>
    )
  }

  if (surveys.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Surveys</h3>
          <p className="text-muted-foreground">No surveys created yet for this event.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Survey Responses</h3>
      </div>

      {surveys.length > 1 && (
        <Tabs
          defaultValue={selectedSurvey?.id}
          onValueChange={(id) => {
            const survey = surveys.find((s) => s.id === id)
            if (survey) handleSurveyChange(survey)
          }}
        >
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))` }}>
            {surveys.map((survey) => (
              <TabsTrigger key={survey.id} value={survey.id} className="text-sm">
                {survey.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <div className="space-y-4">
        {responses.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No responses yet</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              Total responses: <span className="font-semibold">{responses.length}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {responses.map((response, index) => {
                const question = questions.find((q) => q.id === response.question_id)
                return (
                  <Card key={`${response.id}-${index}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{question?.question_text}</CardTitle>
                      {response.guest_name && (
                        <p className="text-xs text-muted-foreground">From: {response.guest_name}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">{response.response_text}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(response.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
