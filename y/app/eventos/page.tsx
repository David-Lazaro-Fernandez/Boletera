"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { EventTable } from "@/components/events/event-table"
import { EventDrawer } from "@/components/events/event-drawer"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, X, CalendarRange } from "lucide-react"

export default function EventsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | undefined>()

  const handleEditEvent = (id: string) => {
    setEditingEventId(id)
    setDrawerOpen(true)
  }

  const handleNewEvent = () => {
    setEditingEventId(undefined)
    setDrawerOpen(true)
  }

  return (
    <MainLayout activePage="eventos">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Eventos</h1>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 bg-white">
              <CalendarRange className="h-3 w-3" />
              <span>Próximos 30 días</span>
              <X className="h-3 w-3 ml-1 cursor-pointer" />
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 bg-white">
              <span>Arena Potosí</span>
              <X className="h-3 w-3 ml-1 cursor-pointer" />
            </Badge>
          </div>
        </div>

        <Button onClick={handleNewEvent} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Evento
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="listado" className="mb-6">
        <TabsList className="bg-white">
          <TabsTrigger value="listado" className="data-[state=active]:bg-gray-100">
            Listado
          </TabsTrigger>
          <TabsTrigger value="plantillas">Plantillas</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="listado" className="space-y-6">
          <EventTable onEdit={handleEditEvent} />
        </TabsContent>

        <TabsContent value="plantillas">
          <div className="rounded-md border bg-white p-8 text-center text-gray-500">
            Aquí podrás configurar plantillas para eventos recurrentes.
          </div>
        </TabsContent>

        <TabsContent value="historial">
          <div className="rounded-md border bg-white p-8 text-center text-gray-500">
            Aquí encontrarás los eventos finalizados o archivados.
          </div>
        </TabsContent>
      </Tabs>

      {/* Event Drawer */}
      <EventDrawer open={drawerOpen} onOpenChange={setDrawerOpen} eventId={editingEventId} />
    </MainLayout>
  )
}
