"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Plus, Trash2, X } from "lucide-react"
import type { Survey, SurveyQuestion } from "@/lib/types/database"

interface SurveyTabProps {
  eventId: string
}

export function SurveyTab({ eventId }: SurveyTabProps) {
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [questions, setQuestions] = useState<Partial<SurveyQuestion>[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadSurvey()
  }, [eventId])

  const loadSurvey = async () => {
    const { data: surveyData } = await supabase.from("surveys").select("*").eq("event_id", eventId).single()

    if (surveyData) {
      setSurvey(surveyData)

      const { data: questionsData } = await supabase
        .from("survey_questions")
        .select("*")
        .eq("survey_id", surveyData.id)
        .order("order_index", { ascending: true })

      if (questionsData) {
        setQuestions(questionsData)
      }
    }
  }

  const handleAddQuestion = () => {
    const newQuestion: Partial<SurveyQuestion> = {
      question_text: "",
      question_type: "text",
      options: null,
      order_index: questions.length,
    }
    setQuestions([...questions, newQuestion])
  }

  const handleUpdateQuestion = (index: number, field: keyof SurveyQuestion, value: any) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const handleDeleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const handleAddOption = (questionIndex: number) => {
    const updated = [...questions]
    const options = updated[questionIndex].options || []
    updated[questionIndex].options = [...options, ""]
    setQuestions(updated)
  }

  const handleUpdateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions]
    const options = [...(updated[questionIndex].options || [])]
    options[optionIndex] = value
    updated[questionIndex].options = options
    setQuestions(updated)
  }

  const handleDeleteOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions]
    const options = [...(updated[questionIndex].options || [])]
    options.splice(optionIndex, 1)
    updated[questionIndex].options = options
    setQuestions(updated)
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      let surveyId = survey?.id

      // Create survey if it doesn't exist
      if (!surveyId) {
        const { data: newSurvey, error: surveyError } = await supabase
          .from("surveys")
          .insert({
            event_id: eventId,
            title: "Event Survey",
            description: "Share your feedback",
            is_active: true,
          })
          .select()
          .single()

        if (surveyError) throw surveyError
        surveyId = newSurvey.id
        setSurvey(newSurvey)
      }

      // Delete existing questions
      await supabase.from("survey_questions").delete().eq("survey_id", surveyId)

      // Insert new questions
      const questionsToInsert = questions.map((q, index) => ({
        survey_id: surveyId,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options,
        order_index: index,
      }))

      const { error } = await supabase.from("survey_questions").insert(questionsToInsert)

      if (error) throw error

      await loadSurvey()
      alert("Survey saved successfully!")
    } catch (error) {
      console.error("[v0] Error saving survey:", error)
      alert("Failed to save survey")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Event Survey</h3>
          <p className="text-sm text-muted-foreground">Create questions for your guests</p>
        </div>
        <Button onClick={handleAddQuestion} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      <div className="space-y-4">
        {questions.map((question, qIndex) => (
          <Card key={qIndex}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label>Question</Label>
                      <Input
                        placeholder="How would you rate the event?"
                        value={question.question_text}
                        onChange={(e) => handleUpdateQuestion(qIndex, "question_text", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={question.question_type}
                        onValueChange={(value) => handleUpdateQuestion(qIndex, "question_type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="rating">Rating (1-5)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {question.question_type === "multiple_choice" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Options</Label>
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleAddOption(qIndex)}>
                            <Plus className="w-4 h-4 mr-1" />
                            Add Option
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {(question.options || []).map((option, oIndex) => (
                            <div key={oIndex} className="flex gap-2">
                              <Input
                                placeholder={`Option ${oIndex + 1}`}
                                value={option}
                                onChange={(e) => handleUpdateOption(qIndex, oIndex, e.target.value)}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteOption(qIndex, oIndex)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-start">
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteQuestion(qIndex)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {questions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No questions yet. Click "Add Question" to get started.
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Survey"}
        </Button>
      </div>
    </div>
  )
}
