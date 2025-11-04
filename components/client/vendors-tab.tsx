"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Phone, Mail, Globe, DollarSign } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Vendor } from "@/lib/types/database"
import { useToast } from "@/hooks/use-toast"

interface VendorsTabProps {
  eventId: string
}

const VENDOR_CATEGORIES = [
  "Fotograf",
  "Kamerzysta",
  "DJ",
  "Zespół muzyczny",
  "Kwiaciarnia",
  "Catering",
  "Sala weselna",
  "Tort weselny",
  "Dekoracje",
  "Fryzjer",
  "Makijaż",
  "Samochód",
  "Zaproszenia",
  "Inne",
]

export function VendorsTab({ eventId }: VendorsTabProps) {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    contact_name: "",
    phone: "",
    email: "",
    website: "",
    price: "",
    deposit_paid: "",
    notes: "",
    notes_en: "",
    status: "pending" as const,
  })

  useEffect(() => {
    fetchVendors()
  }, [eventId])

  const fetchVendors = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .eq("event_id", eventId)
      .order("category", { ascending: true })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load vendors",
        variant: "destructive",
      })
    } else {
      setVendors(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const vendorData = {
      event_id: eventId,
      name: formData.name,
      category: formData.category,
      contact_name: formData.contact_name || null,
      phone: formData.phone || null,
      email: formData.email || null,
      website: formData.website || null,
      price: formData.price ? Number.parseFloat(formData.price) : null,
      deposit_paid: formData.deposit_paid ? Number.parseFloat(formData.deposit_paid) : null,
      notes: formData.notes || null,
      notes_en: formData.notes_en || null,
      status: formData.status,
    }

    if (editingVendor) {
      const { error } = await supabase.from("vendors").update(vendorData).eq("id", editingVendor.id)

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update vendor",
          variant: "destructive",
        })
      } else {
        toast({ title: "Success", description: "Vendor updated successfully" })
        resetForm()
        fetchVendors()
      }
    } else {
      const { error } = await supabase.from("vendors").insert(vendorData)

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add vendor",
          variant: "destructive",
        })
      } else {
        toast({ title: "Success", description: "Vendor added successfully" })
        resetForm()
        fetchVendors()
      }
    }
  }

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setFormData({
      name: vendor.name,
      category: vendor.category,
      contact_name: vendor.contact_name || "",
      phone: vendor.phone || "",
      email: vendor.email || "",
      website: vendor.website || "",
      price: vendor.price?.toString() || "",
      deposit_paid: vendor.deposit_paid?.toString() || "",
      notes: vendor.notes || "",
      notes_en: vendor.notes_en || "",
      status: vendor.status,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    toast.promise(
      (async () => {
        const { error } = await supabase.from("vendors").delete().eq("id", id)
        if (error) throw error
        fetchVendors()
      })(),
      {
        loading: "Deleting vendor...",
        success: "Vendor deleted successfully!",
        error: "Failed to delete vendor",
      },
    )
  }

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      contact_name: "",
      phone: "",
      email: "",
      website: "",
      price: "",
      deposit_paid: "",
      notes: "",
      notes_en: "",
      status: "pending",
    })
    setEditingVendor(null)
    setShowForm(false)
  }

  const totalCost = vendors.reduce((sum, v) => sum + (v.price || 0), 0)
  const totalPaid = vendors.reduce((sum, v) => sum + (v.deposit_paid || 0), 0)

  if (loading) {
    return <div className="text-center py-8">Loading vendors...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Usługodawcy</h3>
          <p className="text-sm text-muted-foreground">Zarządzaj listą usługodawców dla swojego wesela</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj usługodawcę
        </Button>
      </div>

      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Całkowity koszt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCost.toFixed(2)} zł</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Zapłacone zaliczki</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalPaid.toFixed(2)} zł</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Do zapłaty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{(totalCost - totalPaid).toFixed(2)} zł</div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingVendor ? "Edytuj usługodawcę" : "Dodaj usługodawcę"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nazwa firmy *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategoria *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz kategorię" />
                    </SelectTrigger>
                    <SelectContent>
                      {VENDOR_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Osoba kontaktowa</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Strona www</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Cena (zł)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit_paid">Zapłacona zaliczka (zł)</Label>
                  <Input
                    id="deposit_paid"
                    type="number"
                    step="0.01"
                    value={formData.deposit_paid}
                    onChange={(e) => setFormData({ ...formData, deposit_paid: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Oczekujący</SelectItem>
                      <SelectItem value="confirmed">Potwierdzony</SelectItem>
                      <SelectItem value="paid">Opłacony</SelectItem>
                      <SelectItem value="cancelled">Anulowany</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notatki</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes_en">Notes in English</Label>
                <Textarea
                  id="notes_en"
                  value={formData.notes_en}
                  onChange={(e) => setFormData({ ...formData, notes_en: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingVendor ? "Zapisz zmiany" : "Dodaj usługodawcę"}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Anuluj
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Vendors List */}
      <div className="space-y-4">
        {vendors.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nie dodano jeszcze żadnych usługodawców
            </CardContent>
          </Card>
        ) : (
          vendors.map((vendor) => (
            <Card key={vendor.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{vendor.name}</CardTitle>
                    <CardDescription>{vendor.category}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(vendor)}>
                      Edytuj
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(vendor.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vendor.contact_name && (
                    <div className="text-sm">
                      <span className="font-medium">Kontakt:</span> {vendor.contact_name}
                    </div>
                  )}
                  {vendor.phone && (
                    <div className="text-sm flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {vendor.phone}
                    </div>
                  )}
                  {vendor.email && (
                    <div className="text-sm flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {vendor.email}
                    </div>
                  )}
                  {vendor.website && (
                    <div className="text-sm flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <a
                        href={vendor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Strona www
                      </a>
                    </div>
                  )}
                  {vendor.price && (
                    <div className="text-sm flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium">Cena:</span> {vendor.price.toFixed(2)} zł
                    </div>
                  )}
                  {vendor.deposit_paid && (
                    <div className="text-sm">
                      <span className="font-medium">Zaliczka:</span> {vendor.deposit_paid.toFixed(2)} zł
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="font-medium">Status:</span>{" "}
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        vendor.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : vendor.status === "confirmed"
                            ? "bg-blue-100 text-blue-800"
                            : vendor.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {vendor.status === "pending" && "Oczekujący"}
                      {vendor.status === "confirmed" && "Potwierdzony"}
                      {vendor.status === "paid" && "Opłacony"}
                      {vendor.status === "cancelled" && "Anulowany"}
                    </span>
                  </div>
                </div>
                {vendor.notes && (
                  <div className="mt-4 text-sm">
                    <span className="font-medium">Notatki:</span>
                    <p className="text-muted-foreground mt-1">{vendor.notes}</p>
                  </div>
                )}
                {vendor.notes_en && (
                  <div className="mt-4 text-sm">
                    <span className="font-medium">Notes in English:</span>
                    <p className="text-muted-foreground mt-1">{vendor.notes_en}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
