"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useGuestAuth } from "@/lib/hooks/use-guest-auth"
import { GuestAuthDialog } from "../guest-auth-dialog"
import { CheckCircle2, Star } from "lucide-react"
import type { Survey, SurveyQuestion } from "@/lib/types/database"

interface SurveyModuleProps {
  eventId: string
  primaryColor: string
}

export function SurveyModule({ eventId, primaryColor }: SurveyModuleProps) {
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const { user } = useGuestAuth()
  const supabase = createClient()

  useEffect(() => {
    loadSurvey()
  }, [eventId, user])

  const loadSurvey = async () => {
    setIsLoading(true)

    // Load survey
    const { data: surveyData } = await supabase
      .from("surveys")
      .select("*")
      .eq("event_id", eventId)
      .eq("is_active", true)
      .single()

    if (surveyData) {
      setSurvey(surveyData)

      // Load questions
      const { data: questionsData } = await supabase
        .from("survey_questions")
        .select("*")
        .eq("survey_id", surveyData.id)
        .order("order_index", { ascending: true })

      if (questionsData) {
        setQuestions(questionsData)
      }

      // Check if user has already submitted
      if (user) {
        const { data: existingResponses } = await supabase
          .from("survey_responses")
          .select("question_id")
          .eq("survey_id", surveyData.id)
          .eq("guest_id", user.id)

        if (existingResponses && existingResponses.length > 0) {
          setHasSubmitted(true)
        }
      }
    }

    setIsLoading(false)
  }

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses({ ...responses, [questionId]: value })
  }

  const handleSubmit = async () => {
    if (!user) {
      setShowAuthDialog(true)
      return
    }

    if (!survey) return

    setIsSubmitting(true)

    try {
      // Prepare responses
      const responsesToInsert = Object.entries(responses).map(([questionId, responseText]) => ({
        survey_id: survey.id,
        question_id: questionId,
        guest_id: user.id,
        response_text: responseText,
      }))

      const { error } = await supabase.from("survey_responses").insert(responsesToInsert)

      if (error) throw error

      setHasSubmitted(true)
      alert("Thank you for your feedback!")
    } catch (error) {
      console.error("[v0] Error submitting survey:", error)
      alert("Failed to submit survey")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading survey...</p>
        </div>
      </div>
    )
  }

  if (!survey || questions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="text-lg font-semibold mb-2">No Survey Available</h3>
          <p className="text-muted-foreground">The event organizer hasn't created a survey yet.</p>
        </CardContent>
      </Card>
    )
  }

  if (hasSubmitted) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-semibold mb-2">Thank You!</h3>
          <p className="text-muted-foreground">You've already submitted your response to this survey.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{survey.title}</h2>
        {survey.description && <p className="text-muted-foreground">{survey.description}</p>}
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  {index + 1}. {question.question_text}
                </Label>

                {question.question_type === "text" && (
                  <Textarea
                    placeholder="Your answer..."
                    value={responses[question.id] || ""}
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    rows={3}
                  />
                )}

                {question.question_type === "multiple_choice" && question.options && (
                  <RadioGroup
                    value={responses[question.id] || ""}
                    onValueChange={(value) => handleResponseChange(question.id, value)}
                  >
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} />
                        <Label htmlFor={`${question.id}-${optionIndex}`} className="cursor-pointer font-normal">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {question.question_type === "rating" && (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        type="button"
                        variant={responses[question.id] === rating.toString() ? "default" : "outline"}
                        size="lg"
                        onClick={() => handleResponseChange(question.id, rating.toString())}
                        style={
                          responses[question.id] === rating.toString() ? { backgroundColor: primaryColor } : undefined
                        }
                      >
                        <Star
                          className={`w-5 h-5 ${responses[question.id] === rating.toString() ? "fill-current" : ""}`}
                        />
                        {rating}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" style={{ backgroundColor: primaryColor }}>
          {isSubmitting ? "Submitting..." : "Submit Survey"}
        </Button>
      </div>

      <GuestAuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onSuccess={() => {
          setShowAuthDialog(false)
          loadSurvey()
        }}
        eventId={eventId}
      />
    </div>
  )
}
