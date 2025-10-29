"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Calendar, DollarSign, CheckSquare, Plus, Trash2, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { WeddingBudget, WeddingExpense, WeddingChecklistItem } from "@/lib/types/database"
import { useToast } from "@/hooks/use-toast"

interface WeddingPlanningTabProps {
  eventId: string
}

const EXPENSE_CATEGORIES = [
  "Sala weselna",
  "Catering",
  "Fotograf",
  "Kamerzysta",
  "Zespół/DJ",
  "Kwiaciarnia",
  "Tort",
  "Suknia ślubna",
  "Garnitur",
  "Dekoracje",
  "Zaproszenia",
  "Samochód",
  "Fryzjer/Makijaż",
  "Podróż poślubna",
  "Inne",
]

export function WeddingPlanningTab({ eventId }: WeddingPlanningTabProps) {
  const [budget, setBudget] = useState<WeddingBudget | null>(null)
  const [expenses, setExpenses] = useState<WeddingExpense[]>([])
  const [checklist, setChecklist] = useState<WeddingChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [eventId])

  const fetchData = async () => {
    setLoading(true)

    const [budgetRes, expensesRes, checklistRes] = await Promise.all([
      supabase.from("wedding_budget").select("*").eq("event_id", eventId).maybeSingle(),
      supabase.from("wedding_expenses").select("*").eq("event_id", eventId).order("category"),
      supabase.from("wedding_checklist").select("*").eq("event_id", eventId).order("order_index"),
    ])

    if (budgetRes.data) setBudget(budgetRes.data)
    if (expensesRes.data) setExpenses(expensesRes.data)
    if (checklistRes.data) setChecklist(checklistRes.data)

    setLoading(false)
  }

  const updateBudget = async (totalBudget: number, notes: string) => {
    const { error } = await supabase
      .from("wedding_budget")
      .update({ total_budget: totalBudget, notes })
      .eq("event_id", eventId)

    if (error) {
      toast({ title: "Error", description: "Failed to update budget", variant: "destructive" })
    } else {
      toast({ title: "Success", description: "Budget updated" })
      fetchData()
    }
  }

  const addExpense = async (expense: Partial<WeddingExpense>) => {
    const { error } = await supabase.from("wedding_expenses").insert({
      event_id: eventId,
      ...expense,
    })

    if (error) {
      toast({ title: "Error", description: "Failed to add expense", variant: "destructive" })
    } else {
      toast({ title: "Success", description: "Expense added" })
      fetchData()
    }
  }

  const updateExpense = async (id: string, updates: Partial<WeddingExpense>) => {
    const { error } = await supabase.from("wedding_expenses").update(updates).eq("id", id)

    if (error) {
      toast({ title: "Error", description: "Failed to update expense", variant: "destructive" })
    } else {
      fetchData()
    }
  }

  const deleteExpense = async (id: string) => {
    const { error } = await supabase.from("wedding_expenses").delete().eq("id", id)

    if (error) {
      toast({ title: "Error", description: "Failed to delete expense", variant: "destructive" })
    } else {
      toast({ title: "Success", description: "Expense deleted" })
      fetchData()
    }
  }

  const toggleChecklistItem = async (id: string, completed: boolean) => {
    const { error } = await supabase.from("wedding_checklist").update({ completed }).eq("id", id)

    if (error) {
      toast({ title: "Error", description: "Failed to update task", variant: "destructive" })
    } else {
      fetchData()
    }
  }

  const addChecklistItem = async (item: Partial<WeddingChecklistItem>) => {
    const { error } = await supabase.from("wedding_checklist").insert({
      event_id: eventId,
      ...item,
    })

    if (error) {
      toast({ title: "Error", description: "Failed to add task", variant: "destructive" })
    } else {
      toast({ title: "Success", description: "Task added" })
      fetchData()
    }
  }

  const deleteChecklistItem = async (id: string) => {
    const { error } = await supabase.from("wedding_checklist").delete().eq("id", id)

    if (error) {
      toast({ title: "Error", description: "Failed to delete task", variant: "destructive" })
    } else {
      toast({ title: "Success", description: "Task deleted" })
      fetchData()
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading wedding planner...</div>
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.actual_cost || e.estimated_cost), 0)
  const totalPaid = expenses.reduce((sum, e) => sum + e.paid, 0)
  const remaining = (budget?.total_budget || 0) - totalExpenses
  const completedTasks = checklist.filter((t) => t.completed).length
  const totalTasks = checklist.length
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Panel Weselny</h3>
        <p className="text-sm text-muted-foreground">Kompleksowe narzędzie do planowania i organizacji wesela</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <AlertCircle className="w-4 h-4 mr-2" />
            Przegląd
          </TabsTrigger>
          <TabsTrigger value="budget">
            <DollarSign className="w-4 h-4 mr-2" />
            Budżet
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <Calendar className="w-4 h-4 mr-2" />
            Wydatki
          </TabsTrigger>
          <TabsTrigger value="checklist">
            <CheckSquare className="w-4 h-4 mr-2" />
            Checklist
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Budżet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{budget?.total_budget.toFixed(2) || "0.00"} zł</div>
                <p className="text-xs text-muted-foreground mt-1">Całkowity budżet</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Wydane</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{totalExpenses.toFixed(2)} zł</div>
                <p className="text-xs text-muted-foreground mt-1">Planowane wydatki</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pozostało</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${remaining < 0 ? "text-red-600" : "text-green-600"}`}>
                  {remaining.toFixed(2)} zł
                </div>
                <p className="text-xs text-muted-foreground mt-1">Do wykorzystania</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Postęp przygotowań</CardTitle>
              <CardDescription>
                Ukończono {completedTasks} z {totalTasks} zadań ({progressPercent.toFixed(0)}%)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progressPercent} className="h-3" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pytania pomocnicze</CardTitle>
              <CardDescription>Odpowiedz na te pytania aby lepiej zaplanować wesele</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">1. Ile osób planujesz zaprosić?</h4>
                <p className="text-sm text-muted-foreground">
                  To pomoże określić wielkość sali i koszty cateringu (średnio 150-300 zł/osoba)
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">2. Jaki styl wesela preferujesz?</h4>
                <p className="text-sm text-muted-foreground">
                  Eleganckie, rustykalnie, nowoczesne, tradycyjne? To wpłynie na wybór sali i dekoracji
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">3. Czy planujesz ślub kościelny czy cywilny?</h4>
                <p className="text-sm text-muted-foreground">
                  To wpłynie na harmonogram dnia i koszty (kościół, USC, plener)
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">4. Jakie są Wasze priorytety?</h4>
                <p className="text-sm text-muted-foreground">
                  Fotografia, muzyka, jedzenie, alkohol, dekoracje? Przeznacz więcej budżetu na to co jest dla Was
                  najważniejsze
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <BudgetTab budget={budget} onUpdate={updateBudget} />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <ExpensesTab expenses={expenses} onAdd={addExpense} onUpdate={updateExpense} onDelete={deleteExpense} />
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4">
          <ChecklistTab
            checklist={checklist}
            onToggle={toggleChecklistItem}
            onAdd={addChecklistItem}
            onDelete={deleteChecklistItem}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Budget Tab Component
function BudgetTab({
  budget,
  onUpdate,
}: {
  budget: WeddingBudget | null
  onUpdate: (totalBudget: number, notes: string) => void
}) {
  const [totalBudget, setTotalBudget] = useState(budget?.total_budget.toString() || "0")
  const [notes, setNotes] = useState(budget?.notes || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(Number.parseFloat(totalBudget) || 0, notes)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zarządzanie budżetem</CardTitle>
        <CardDescription>Ustaw całkowity budżet wesela i dodaj notatki</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="total_budget">Całkowity budżet (zł)</Label>
            <Input
              id="total_budget"
              type="number"
              step="0.01"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notatki</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Dodaj notatki o budżecie, źródłach finansowania, itp."
            />
          </div>
          <Button type="submit">Zapisz budżet</Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Expenses Tab Component
function ExpensesTab({
  expenses,
  onAdd,
  onUpdate,
  onDelete,
}: {
  expenses: WeddingExpense[]
  onAdd: (expense: Partial<WeddingExpense>) => void
  onUpdate: (id: string, updates: Partial<WeddingExpense>) => void
  onDelete: (id: string) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    estimated_cost: "",
    actual_cost: "",
    paid: "",
    due_date: "",
    status: "pending" as const,
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      category: formData.category,
      name: formData.name,
      estimated_cost: Number.parseFloat(formData.estimated_cost) || 0,
      actual_cost: Number.parseFloat(formData.actual_cost) || 0,
      paid: Number.parseFloat(formData.paid) || 0,
      due_date: formData.due_date || null,
      status: formData.status,
      notes: formData.notes || null,
    })
    setFormData({
      category: "",
      name: "",
      estimated_cost: "",
      actual_cost: "",
      paid: "",
      due_date: "",
      status: "pending",
      notes: "",
    })
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Wydatki</h3>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj wydatek
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nowy wydatek</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz kategorię" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nazwa</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Szacowany koszt (zł)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.estimated_cost}
                    onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rzeczywisty koszt (zł)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.actual_cost}
                    onChange={(e) => setFormData({ ...formData, actual_cost: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Zapłacono (zł)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.paid}
                    onChange={(e) => setFormData({ ...formData, paid: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Termin płatności</Label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notatki</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Dodaj wydatek</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Anuluj
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {expenses.map((expense) => (
          <Card key={expense.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{expense.name}</h4>
                    <span className="text-xs bg-muted px-2 py-1 rounded">{expense.category}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Szacowany:</span>{" "}
                      <span className="font-medium">{expense.estimated_cost.toFixed(2)} zł</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rzeczywisty:</span>{" "}
                      <span className="font-medium">{expense.actual_cost.toFixed(2)} zł</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Zapłacono:</span>{" "}
                      <span className="font-medium text-green-600">{expense.paid.toFixed(2)} zł</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Do zapłaty:</span>{" "}
                      <span className="font-medium text-orange-600">
                        {((expense.actual_cost || expense.estimated_cost) - expense.paid).toFixed(2)} zł
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => onDelete(expense.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Checklist Tab Component
function ChecklistTab({
  checklist,
  onToggle,
  onAdd,
  onDelete,
}: {
  checklist: WeddingChecklistItem[]
  onToggle: (id: string, completed: boolean) => void
  onAdd: (item: Partial<WeddingChecklistItem>) => void
  onDelete: (id: string) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    category: "",
    task: "",
    description: "",
    due_date: "",
    priority: "medium" as const,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      category: formData.category,
      task: formData.task,
      description: formData.description || null,
      due_date: formData.due_date || null,
      priority: formData.priority,
      order_index: checklist.length,
    })
    setFormData({
      category: "",
      task: "",
      description: "",
      due_date: "",
      priority: "medium",
    })
    setShowForm(false)
  }

  const groupedTasks = checklist.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, WeddingChecklistItem[]>,
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Lista zadań</h3>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj zadanie
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nowe zadanie</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategoria</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="np. 6 miesięcy przed"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priorytet</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Niski</SelectItem>
                      <SelectItem value="medium">Średni</SelectItem>
                      <SelectItem value="high">Wysoki</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Zadanie</Label>
                <Input
                  value={formData.task}
                  onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Opis</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Termin</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Dodaj zadanie</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Anuluj
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([category, tasks]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-base">{category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-2 rounded hover:bg-muted/50">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) => onToggle(task.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={task.completed ? "line-through text-muted-foreground" : ""}>{task.task}</span>
                      {task.priority === "high" && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Wysoki</span>
                      )}
                    </div>
                    {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
