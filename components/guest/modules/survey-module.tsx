"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { CheckCircle2, Star } from "lucide-react"
import { toast } from "react-toastify"
import { translations } from "@/lib/i18n/translations"
import type { Survey, SurveyQuestion } from "@/lib/types/database"
import { useLanguage } from "@/lib/hooks/use-language"

interface SurveyModuleProps {
  eventId: string
  primaryColor: string
}

export function SurveyModule({ eventId, primaryColor }: SurveyModuleProps) {
  const { language } = useLanguage()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [guestName, setGuestName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const t = translations[language]?.modules?.survey ?? {}
  const safe = <K extends keyof typeof t>(key: K, fallback: string) => t[key] ?? fallback

  useEffect(() => {
    loadSurvey()
  }, [eventId, language])

  const loadSurvey = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/events/${eventId}/surveys`)
      if (!res.ok) throw new Error("Failed to load survey")
      const surveysData = await res.json()
      const activeSurvey = surveysData?.[0]

      if (activeSurvey) {
        setSurvey(activeSurvey)
        const questionsRes = await fetch(`/api/events/${eventId}/surveys/${activeSurvey.id}/questions`)
        if (questionsRes.ok) {
          const questionsData = await questionsRes.json()
          setQuestions(questionsData || [])
        }
      }
    } catch (error) {
      console.error("[v0] Error loading survey:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses({ ...responses, [questionId]: value })
  }

  const handleSubmit = async () => {
    if (!survey) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/events/${eventId}/surveys/${survey.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses: Object.entries(responses).map(([questionId, responseText]) => ({
            question_id: questionId,
            response_text: responseText,
            guest_name: guestName || null,
          })),
        }),
      })

      if (!res.ok) throw new Error("Failed to submit survey")

      setHasSubmitted(true)
      toast.success(safe("thankYou", "Thank you!"))
    } catch (error) {
      console.error("[v0] Error submitting survey:", error)
      toast.error("Failed to submit survey")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderTopColor: primaryColor }}
          ></div>
          <p className="text-muted-foreground">{safe("loading", "Loading survey...")}</p>
        </div>
      </div>
    )
  }

  if (!survey || questions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="text-lg font-semibold mb-2">{safe("noSurvey", "No survey available")}</h3>
          <p className="text-muted-foreground">{safe("notAdded", "Survey not created")}</p>
        </CardContent>
      </Card>
    )
  }

  if (hasSubmitted) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: primaryColor }} />
          <h3 className="text-lg font-semibold mb-2">{safe("thankYou", "Thank you!")}</h3>
          <p className="text-muted-foreground">{safe("alreadySubmitted", "Already submitted")}</p>
        </CardContent>
      </Card>
    )
  }

  const surveyTitle = language === "en" && survey?.title_en ? survey.title_en : survey?.title
  const surveyDescription = language === "en" && survey?.description_en ? survey.description_en : survey?.description

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">{surveyTitle}</h2>
        {surveyDescription && <p className="text-muted-foreground">{surveyDescription}</p>}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">{safe("yourName", "Your Name")} (optional)</Label>
            <Input
              placeholder={safe("yourName", "Your Name")}
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="text-base"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  {index + 1}.{" "}
                  {language === "en" && question.question_text_en ? question.question_text_en : question.question_text}
                </Label>

                {question.question_type === "text" && (
                  <Textarea
                    placeholder={safe("label", "Your answer")}
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
                    {question.options.map((option, optionIndex) => {
                      const options_en = question.options_en || []
                      const displayOption =
                        language === "en" && options_en[optionIndex] ? options_en[optionIndex] : option
                      return (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} />
                          <Label htmlFor={`${question.id}-${optionIndex}`} className="cursor-pointer font-normal">
                            {displayOption}
                          </Label>
                        </div>
                      )
                    })}
                  </RadioGroup>
                )}

                {question.question_type === "rating" && (
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        type="button"
                        variant={responses[question.id] === rating.toString() ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleResponseChange(question.id, rating.toString())}
                        style={
                          responses[question.id] === rating.toString() ? { backgroundColor: primaryColor } : undefined
                        }
                        className="text-white"
                      >
                        <Star
                          className={`w-5 h-5 ${responses[question.id] === rating.toString() ? "fill-current" : ""}`}
                        />
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
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || hasSubmitted}
          size="lg"
          style={{ backgroundColor: primaryColor }}
          className="text-white"
        >
          {isSubmitting ? safe("submitting", "Submitting...") : safe("submit", "Submit")}
        </Button>
      </div>
    </div>
  )
}
