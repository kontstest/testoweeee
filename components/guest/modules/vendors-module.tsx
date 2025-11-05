"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Vendor } from "@/lib/types/database"
import { motion } from "framer-motion"
import { translations } from "@/lib/i18n/translations"
import { useLanguage } from "@/lib/hooks/use-language"

interface VendorsModuleProps {
  eventId: string
  primaryColor: string
}

export function VendorsModule({ eventId, primaryColor }: VendorsModuleProps) {
  const { language } = useLanguage()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const t = translations[language].modules.vendors

  useEffect(() => {
    fetchVendors()
  }, [eventId, language])

  const fetchVendors = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("vendors")
      .select("*")
      .eq("event_id", eventId)
      .in("status", ["confirmed", "paid"])
      .order("category", { ascending: true })

    setVendors(data || [])
    setLoading(false)
  }

  if (loading) {
    return <div className="text-center py-8">{t.loading}</div>
  }

  if (vendors.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p>{t.noVendors}</p>
      </div>
    )
  }

  const groupedVendors = vendors.reduce(
    (acc, vendor) => {
      if (!acc[vendor.category]) {
        acc[vendor.category] = []
      }
      acc[vendor.category].push(vendor)
      return acc
    },
    {} as Record<string, Vendor[]>,
  )

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl mb-2 font-bold">{t.title}</h2>
        <p className="text-sm text-gray-600">{t.description}</p>
      </div>

      {Object.entries(groupedVendors).map(([category, categoryVendors], categoryIndex) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: categoryIndex * 0.1 }}
        >
          <h3 className="text-lg md:text-xl font-semibold mb-4" style={{ color: primaryColor }}>
            {translations[language].modules.categories[category as keyof typeof translations.pl.modules.categories] ||
              category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {categoryVendors.map((vendor, index) => {
              const displayNotes = language === "en" && vendor.notes_en ? vendor.notes_en : vendor.notes
              return (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: categoryIndex * 0.1 + index * 0.05 }}
                  className="rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                  style={{
                    backgroundColor: `${primaryColor}05`,
                    border: `2px solid ${primaryColor}20`,
                  }}
                >
                  <h4 className="font-semibold text-gray-800 mb-1">{vendor.name}</h4>
                  {displayNotes && <p className="text-sm text-gray-600">{displayNotes}</p>}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
