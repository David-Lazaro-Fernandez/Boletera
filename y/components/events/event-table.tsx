"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreVertical, MapPin, Copy, Trash2, Map } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Event {
  id: string
  name: string
  date: string
  time: string
  location: string
  address: string
  status: "preventa" | "activo" | "agotado" | "finalizado"
  onlineSales: boolean
  hasSeating: boolean
  image: string
}

const events: Event[] = [
  {
    id: "1",
    name: "Concierto de Rock en Vivo",
    date: "15 Jun 2023",
    time: "20:00",
    location: "Arena Potosí",
    address: "Av. Principal #123, Potosí, México",
    status: "activo",
    onlineSales: true,
    hasSeating: true,
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: "2",
    name: "Festival de Jazz",
    date: "22 Jul 2023",
    time: "18:30",
    location: "Auditorio Nacional",
    address: "Reforma #50, Ciudad de México",
    status: "preventa",
    onlineSales: true,
    hasSeating: true,
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: "3",
    name: "Obra de Teatro: Romeo y Julieta",
    date: "05 Ago 2023",
    time: "19:00",
    location: "Teatro Municipal",
    address: "Calle Teatro #45, Centro Histórico",
    status: "agotado",
    onlineSales: false,
    hasSeating: true,
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: "4",
    name: "Exposición de Arte Contemporáneo",
    date: "10 Sep 2023",
    time: "10:00",
    location: "Galería Moderna",
    address: "Av. Insurgentes #789, Zona Rosa",
    status: "finalizado",
    onlineSales: true,
    hasSeating: false,
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: "5",
    name: "Conferencia de Tecnología",
    date: "18 Oct 2023",
    time: "09:00",
    location: "Centro de Convenciones",
    address: "Blvd. Tecnológico #500, Parque Industrial",
    status: "activo",
    onlineSales: true,
    hasSeating: false,
    image: "/placeholder.svg?height=60&width=60",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "preventa":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    case "activo":
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case "agotado":
      return "bg-amber-100 text-amber-800 hover:bg-amber-200"
    case "finalizado":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case "preventa":
      return "En preventa"
    case "activo":
      return "Activo"
    case "agotado":
      return "Agotado"
    case "finalizado":
      return "Finalizado"
    default:
      return status
  }
}

export function EventTable({ onEdit }: { onEdit: (id: string) => void }) {
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])

  const toggleSelectAll = () => {
    if (selectedEvents.length === events.length) {
      setSelectedEvents([])
    } else {
      setSelectedEvents(events.map((event) => event.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedEvents.includes(id)) {
      setSelectedEvents(selectedEvents.filter((eventId) => eventId !== id))
    } else {
      setSelectedEvents([...selectedEvents, id])
    }
  }

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedEvents.length === events.length && events.length > 0}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead className="w-16">Imagen</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Hora</TableHead>
            <TableHead>Lugar</TableHead>
            <TableHead>Estado de Venta</TableHead>
            <TableHead>Venta en línea</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id} className="hover:bg-gray-50">
              <TableCell>
                <Checkbox checked={selectedEvents.includes(event.id)} onCheckedChange={() => toggleSelect(event.id)} />
              </TableCell>
              <TableCell>
                <Avatar className="h-10 w-10 rounded-md">
                  <AvatarImage src={event.image || "/placeholder.svg"} alt={event.name} />
                  <AvatarFallback className="rounded-md bg-gray-100">EV</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span className="cursor-pointer hover:text-blue-600" onClick={() => onEdit(event.id)}>
                    {event.name}
                  </span>
                  {event.hasSeating && (
                    <Badge variant="outline" className="bg-gray-50">
                      <Map className="h-3 w-3 mr-1" />
                      <span className="text-xs">Asientos</span>
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{event.date}</TableCell>
              <TableCell>{event.time}</TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span>{event.location}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{event.address}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(event.status)}>{getStatusText(event.status)}</Badge>
              </TableCell>
              <TableCell>
                <Switch checked={event.onlineSales} />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {event.hasSeating && (
                      <DropdownMenuItem>
                        <Map className="mr-2 h-4 w-4" />
                        <span>Ver mapa de asientos</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      <span>Duplicar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Eliminar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedEvents.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border rounded-lg shadow-lg px-4 py-3 flex items-center gap-4">
          <span className="text-sm font-medium">{selectedEvents.length} eventos seleccionados</span>
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Duplicar
          </Button>
          <Button variant="outline" size="sm">
            Pausar ventas
          </Button>
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      )}
    </div>
  )
}
