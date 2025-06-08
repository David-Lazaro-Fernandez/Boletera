"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { PalenqueSeatMap } from "@/components/palenque/palenque-seat-map"

export default function MapasAsientosPage() {
  return (
    <MainLayout activePage="mapas-asientos">
      <div className="h-[calc(100vh-4rem)]">
        <PalenqueSeatMap />
      </div>
    </MainLayout>
  )
}
