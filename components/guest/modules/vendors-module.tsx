"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Vendor } from "@/lib/types/database"
import { Phone, Mail, Globe } from "lucide-react"
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
                <h4 className="font-semibold text-gray-800 mb-2">{vendor.name}</h4>
                {vendor.contact_name && <p className="text-sm text-gray-600 mb-2">{vendor.contact_name}</p>}
                <div className="space-y-1">
                  {vendor.phone && (
                    <a
                      href={`tel:${vendor.phone}`}
                      className="flex items-center gap-2 text-sm hover:underline"
                      style={{ color: primaryColor }}
                    >
                      <Phone className="w-4 h-4" />
                      {vendor.phone}
                    </a>
                  )}
                  {vendor.email && (
                    <a
                      href={`mailto:${vendor.email}`}
                      className="flex items-center gap-2 text-sm hover:underline"
                      style={{ color: primaryColor }}
                    >
                      <Mail className="w-4 h-4" />
                      {vendor.email}
                    </a>
                  )}
                  {vendor.website && (
                    <a
                      href={vendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm hover:underline"
                      style={{ color: primaryColor }}
                    >
                      <Globe className="w-4 h-4" />
                      Strona www
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
