"use client"

import type React from "react"

import { useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, MapPinIcon, ImageIcon, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface EventDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId?: string
}

export function EventDrawer({ open, onOpenChange, eventId }: EventDrawerProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState("19:00")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [venue, setVenue] = useState("")
  const [seatingEnabled, setSeatingEnabled] = useState(false)
  const [onlineSalesEnabled, setOnlineSalesEnabled] = useState(true)
  const [reservationEnabled, setReservationEnabled] = useState(false)
  const [mainImage, setMainImage] = useState<File | null>(null)
  const [secondaryImage, setSecondaryImage] = useState<File | null>(null)

  const isEditing = !!eventId

  // Cargar datos si estamos editando
  useState(() => {
    if (isEditing) {
      // Aquí cargaríamos los datos del evento desde la API
      // Por ahora usamos datos de ejemplo
      setName("Concierto de Rock en Vivo")
      setDescription("Un increíble concierto con las mejores bandas de rock.")
      setVenue("Arena Potosí")
      setSeatingEnabled(true)
      setOnlineSalesEnabled(true)
      setReservationEnabled(true)
    }
  })

  const handleSave = () => {
    // Validación básica
    if (!name || !date || !venue) {
      // Mostrar errores
      return
    }

    // Aquí enviaríamos los datos a la API
    console.log({
      name,
      description,
      date,
      time,
      venue,
      seatingEnabled,
      onlineSalesEnabled,
      reservationEnabled,
      mainImage,
      secondaryImage,
    })

    // Cerrar el drawer
    onOpenChange(false)

    // Mostrar toast de éxito
    // toast({
    //   title: isEditing ? "Evento actualizado" : "Evento creado",
    //   description: `El evento "${name}" ha sido ${isEditing ? "actualizado" : "creado"} con éxito.`,
    // })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "main" | "secondary") => {
    if (e.target.files && e.target.files[0]) {
      if (type === "main") {
        setMainImage(e.target.files[0])
      } else {
        setSecondaryImage(e.target.files[0])
      }
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[40%] sm:max-w-none overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{isEditing ? "Editar Evento" : "Crear Nuevo Evento"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Actualiza los detalles del evento existente."
              : "Completa el formulario para crear un nuevo evento."}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8">
          {/* Datos básicos */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Datos básicos</h3>
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre del evento <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Concierto de Rock en Vivo"
                maxLength={120}
              />
              <div className="text-xs text-gray-500 text-right">{name.length}/120</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe brevemente el evento..."
                className="h-24 resize-none"
                maxLength={800}
              />
              <div className="text-xs text-gray-500 text-right">{description.length}/800</div>
            </div>
          </div>

          {/* Programación */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Programación</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Fecha <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">
                  Hora <span className="text-red-500">*</span>
                </Label>
                <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Ubicación</h3>
            <div className="space-y-2">
              <Label htmlFor="venue">
                Lugar <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="venue"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Ej. Arena Potosí"
                  className="pl-10"
                />
              </div>
              <Button variant="link" className="h-auto p-0 text-xs text-blue-600">
                + Agregar nuevo recinto
              </Button>
            </div>
          </div>

          {/* Configuraciones de venta */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Configuraciones de venta</h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="seating-enabled">Selección de asientos habilitada</Label>
                  <p className="text-xs text-gray-500">Mostrar mapa en front</p>
                </div>
                <Switch id="seating-enabled" checked={seatingEnabled} onCheckedChange={setSeatingEnabled} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="online-sales">Venta en línea habilitada</Label>
                  <p className="text-xs text-gray-500">Visible en portal público</p>
                </div>
                <Switch id="online-sales" checked={onlineSalesEnabled} onCheckedChange={setOnlineSalesEnabled} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reservation">Reserva de asientos habilitada</Label>
                  <p className="text-xs text-gray-500">Permite hold 15 min</p>
                </div>
                <Switch id="reservation" checked={reservationEnabled} onCheckedChange={setReservationEnabled} />
              </div>
            </div>
          </div>

          {/* Imágenes */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Imágenes</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Imagen principal</Label>
                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  {mainImage ? (
                    <div className="text-center">
                      <p className="text-sm font-medium">{mainImage.name}</p>
                      <p className="text-xs text-gray-500">{(mainImage.size / 1024 / 1024).toFixed(2)} MB</p>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-xs text-red-600 mt-2"
                        onClick={() => setMainImage(null)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                      <div className="text-center">
                        <p className="text-sm font-medium">Arrastra una imagen o haz clic para seleccionar</p>
                        <p className="text-xs text-gray-500">JPEG o PNG, máx. 5MB</p>
                      </div>
                      <Input
                        type="file"
                        className="hidden"
                        id="main-image"
                        accept="image/jpeg,image/png"
                        onChange={(e) => handleImageChange(e, "main")}
                      />
                      <Label htmlFor="main-image" className="sr-only">
                        Seleccionar imagen
                      </Label>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Imagen secundaria</Label>
                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  {secondaryImage ? (
                    <div className="text-center">
                      <p className="text-sm font-medium">{secondaryImage.name}</p>
                      <p className="text-xs text-gray-500">{(secondaryImage.size / 1024 / 1024).toFixed(2)} MB</p>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-xs text-red-600 mt-2"
                        onClick={() => setSecondaryImage(null)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <div className="text-center">
                        <p className="text-sm font-medium">Arrastra una imagen o haz clic para seleccionar</p>
                        <p className="text-xs text-gray-500">JPEG o PNG, máx. 5MB</p>
                      </div>
                      <Input
                        type="file"
                        className="hidden"
                        id="secondary-image"
                        accept="image/jpeg,image/png"
                        onChange={(e) => handleImageChange(e, "secondary")}
                      />
                      <Label htmlFor="secondary-image" className="sr-only">
                        Seleccionar imagen
                      </Label>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-8 flex justify-end gap-4 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            {isEditing ? "Actualizar" : "Guardar"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
