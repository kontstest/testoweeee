"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UtensilsCrossed, Wine, Cake, Coffee } from "lucide-react"
import { translations } from "@/lib/i18n/translations"
import type { MenuItem } from "@/lib/types/database"
import { useLanguage } from "@/lib/hooks/use-language"

interface MenuModuleProps {
  eventId: string
  primaryColor: string
}

export function MenuModule({ eventId, primaryColor }: MenuModuleProps) {
  const { language } = useLanguage()
  const [items, setItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const t = translations[language].modules.menu

  useEffect(() => {
    loadMenu()
  }, [eventId, language])

  const loadMenu = async () => {
    setIsLoading(true)

    try {
      const res = await fetch(`/api/events/${eventId}/menu`)
      if (!res.ok) throw new Error("Failed to load menu")
      const data = await res.json()
      setItems(data || [])
    } catch (error) {
      console.error("[v0] Error loading menu:", error)
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
    const labels: Record<string, string> = {
      appetizer: t.appetizers,
      main: t.mainCourses,
      dessert: t.desserts,
      drink: t.drinks,
    }
    return labels[category] || category
  }

  const categories = ["appetizer", "main", "dessert", "drink"]
  const categoriesWithItems = categories.filter((cat) => items.some((item) => item.category === cat))

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

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">{t.noMenu}</h3>
          <p className="text-muted-foreground">{t.notAdded}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">{t.title}</h2>
        <p className="text-muted-foreground">{t.description}</p>
      </div>

      {categoriesWithItems.length > 1 ? (
        <Tabs defaultValue={categoriesWithItems[0]} className="w-full">
          <TabsList
            className="grid w-full gap-2 h-auto p-2 bg-transparent"
            style={{ gridTemplateColumns: `repeat(auto-fit, minmax(120px, 1fr))` }}
          >
            {categoriesWithItems.map((category) => {
              const Icon = getCategoryIcon(category)
              return (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="flex-col sm:flex-row gap-1 px-2 sm:px-4 py-2 sm:py-3"
                  style={{
                    backgroundColor: `${primaryColor}05`,
                    borderColor: `${primaryColor}20`,
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">{getCategoryLabel(category)}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {categoriesWithItems.map((category) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items
                  .filter((item) => item.category === category)
                  .map((item) => {
                    const displayName = language === "en" && item.name_en ? item.name_en : item.name
                    const displayDescription =
                      language === "en" && item.description_en ? item.description_en : item.description
                    return (
                      <Card key={item.id} style={{ borderColor: `${primaryColor}20` }}>
                        <CardHeader>
                          <CardTitle className="text-lg">{displayName}</CardTitle>
                        </CardHeader>
                        {displayDescription && (
                          <CardContent>
                            <p className="text-muted-foreground text-sm">{displayDescription}</p>
                          </CardContent>
                        )}
                      </Card>
                    )
                  })}
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
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items
                    .filter((item) => item.category === category)
                    .map((item) => {
                      const displayName = language === "en" && item.name_en ? item.name_en : item.name
                      const displayDescription =
                        language === "en" && item.description_en ? item.description_en : item.description
                      return (
                        <Card key={item.id} style={{ borderColor: `${primaryColor}20` }}>
                          <CardHeader>
                            <CardTitle className="text-lg">{displayName}</CardTitle>
                          </CardHeader>
                          {displayDescription && (
                            <CardContent>
                              <p className="text-muted-foreground text-sm">{displayDescription}</p>
                            </CardContent>
                          )}
                        </Card>
                      )
                    })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
