"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Vendor } from "@/lib/types/database"
import { motion } from "motion/react"

interface VendorsModuleProps {
  eventId: string
  primaryColor: string
}

export function VendorsModule({ eventId, primaryColor }: VendorsModuleProps) {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchVendors()
  }, [eventId])

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
    return <div className="text-center py-8">Ładowanie...</div>
  }

  if (vendors.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p>Brak usługodawców do wyświetlenia</p>
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
        <h2 className="text-2xl mb-2" style={{ fontFamily: "var(--font-serif)", color: primaryColor }}>
          Nasi Usługodawcy
        </h2>
        <p className="text-sm text-gray-600">
          Dziękujemy tym wspaniałym profesjonalistom za pomoc w organizacji naszego wesela
        </p>
      </div>

      {Object.entries(groupedVendors).map(([category, categoryVendors], categoryIndex) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: categoryIndex * 0.1 }}
        >
          <h3 className="text-lg font-semibold mb-3" style={{ color: primaryColor, fontFamily: "var(--font-serif)" }}>
            {category}
          </h3>
          <div className="space-y-3">
            {categoryVendors.map((vendor, index) => (
              <motion.div
                key={vendor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: categoryIndex * 0.1 + index * 0.05 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm"
                style={{ border: `2px solid ${primaryColor}20` }}
              >
                <h4 className="font-semibold text-gray-800 mb-1">{vendor.name}</h4>
                {vendor.notes && <p className="text-sm text-gray-600">{vendor.notes}</p>}
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
