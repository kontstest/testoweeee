"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface ModuleSelectorProps {
  onModuleChange: (module: string) => void
}

const MODULES = [
  { value: "photo_gallery", label: "Photo Gallery" },
  { value: "schedule", label: "Schedule" },
  { value: "menu", label: "Menu" },
  { value: "survey", label: "Survey" },
  { value: "bingo", label: "Bingo" },
  { value: "vendors", label: "Vendors" },
]

export function ModuleSelector({ onModuleChange }: ModuleSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="module-select" className="whitespace-nowrap">
        Filter by Module:
      </Label>
      <Select onValueChange={onModuleChange} defaultValue="">
        <SelectTrigger id="module-select" className="w-48">
          <SelectValue placeholder="All Modules" />
        </SelectTrigger>
        <SelectContent>
          {MODULES.map((module) => (
            <SelectItem key={module.value} value={module.value}>
              {module.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
