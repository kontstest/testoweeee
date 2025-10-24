"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { UtensilsCrossed, Wine, Cake, Coffee } from "lucide-react"
import type { MenuItem } from "@/lib/types/database"

interface MenuModuleProps {
  eventId: string
  primaryColor: string
}

export function MenuModule({ eventId, primaryColor }: MenuModuleProps) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadMenu()
  }, [eventId])

  const loadMenu = async () => {
    setIsLoading(true)

    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .eq("event_id", eventId)
      .order("order_index", { ascending: true })

    if (data) {
      setItems(data)
    }

    setIsLoading(false)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "appetizer":
        return Coffee
      case "main":
        return UtensilsCrossed
      case "dessert":
        return Cake
      case "drink":
        return Wine
      default:
        return UtensilsCrossed
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "appetizer":
        return "Appetizers"
      case "main":
        return "Main Courses"
      case "dessert":
        return "Desserts"
      case "drink":
        return "Drinks"
      default:
        return category
    }
  }

  const categories = ["appetizer", "main", "dessert", "drink"]
  const categoriesWithItems = categories.filter((cat) => items.some((item) => item.category === cat))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Menu Available</h3>
          <p className="text-muted-foreground">The event organizer hasn't added a menu yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Event Menu</h2>
        <p className="text-muted-foreground">Discover what's being served</p>
      </div>

      {categoriesWithItems.length > 1 ? (
        <Tabs defaultValue={categoriesWithItems[0]} className="w-full">
          <TabsList
            className="grid w-full"
            style={{ gridTemplateColumns: `repeat(${categoriesWithItems.length}, 1fr)` }}
          >
            {categoriesWithItems.map((category) => {
              const Icon = getCategoryIcon(category)
              return (
                <TabsTrigger key={category} value={category}>
                  <Icon className="w-4 h-4 mr-2" />
                  {getCategoryLabel(category)}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {categoriesWithItems.map((category) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid md:grid-cols-2 gap-4">
                {items
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <Card key={item.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                      </CardHeader>
                      {item.description && (
                        <CardContent>
                          <p className="text-muted-foreground">{item.description}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="space-y-6">
          {categoriesWithItems.map((category) => {
            const Icon = getCategoryIcon(category)
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="text-xl font-semibold">{getCategoryLabel(category)}</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {items
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <Card key={item.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                        </CardHeader>
                        {item.description && (
                          <CardContent>
                            <p className="text-muted-foreground">{item.description}</p>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
