"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useGuestAuth } from "@/lib/hooks/use-guest-auth"
import { GuestAuthDialog } from "../guest-auth-dialog"
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
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const { user } = useGuestAuth()
  const supabase = createClient()

  const t = translations[language]?.modules?.survey || {
    loading: "Loading survey...",
    submit: "Submit",
    thankYou: "Thank You",
    submitting: "Submitting...",
    noSurvey: "No Survey",
    notCreated: "Survey not created",
    alreadySubmitted: "Already submitted",
    yourName: "Your Name",
    answer: "Your answer",
  }

  useEffect(() => {
    loadSurvey()
  }, [eventId, user, language])

  const loadSurvey = async () => {
    setIsLoading(true)

    const { data: surveyData } = await supabase
      .from("surveys")
      .select("*")
      .eq("event_id", eventId)
      .eq("is_active", true)
      .maybeSingle()

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
      const responsesToInsert = Object.entries(responses).map(([questionId, responseText]) => ({
        survey_id: survey.id,
        question_id: questionId,
        guest_id: user.id,
        response_text: responseText,
        guest_name: guestName || null,
      }))

      const { error } = await supabase.from("survey_responses").insert(responsesToInsert)

      if (error) throw error

      setHasSubmitted(true)
      toast.success(t.thankYou)
    } catch (error) {
      console.error("[v0] Error submitting survey:", error)
      toast.error(t.submit)
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
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (!survey || questions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="text-lg font-semibold mb-2">{t.noSurvey}</h3>
          <p className="text-muted-foreground">{t.notCreated}</p>
        </CardContent>
      </Card>
    )
  }

  if (hasSubmitted) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: primaryColor }} />
          <h3 className="text-lg font-semibold mb-2">{t.thankYou}</h3>
          <p className="text-muted-foreground">{t.alreadySubmitted}</p>
        </CardContent>
      </Card>
    )
  }

  const surveyTitle = language === "en" && survey.title_en ? survey.title_en : survey.title
  const surveyDescription = language === "en" && survey.description_en ? survey.description_en : survey.description

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">{surveyTitle}</h2>
        {surveyDescription && <p className="text-muted-foreground">{surveyDescription}</p>}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t.yourName} (opcjonalnie)</Label>
            <Input
              placeholder={t.yourName}
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
                    placeholder={t.answer}
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
          disabled={isSubmitting}
          size="lg"
          style={{ backgroundColor: primaryColor }}
          className="text-white"
        >
          {isSubmitting ? t.submitting : t.submit}
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
