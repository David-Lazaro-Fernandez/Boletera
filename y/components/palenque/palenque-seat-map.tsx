"use client"

import { useState, useEffect } from "react"
import { Trash2, MapPin, Calendar, Clock, Users, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import palenqueData from "../../data/palenque-seats.json"

interface Seat {
  id: string
  zone: string
  zoneName: string
  section: string
  sectionName: string
  row: number
  seat: number
  price: number
  status: "available" | "occupied" | "selected"
  color: string
  x: number
  y: number
}

interface SeatPosition {
  id: string
  x: number
  y: number
  zone: string
  section: string
  row: number
  seat: number
}

export function PalenqueSeatMap() {
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null)
  const [seatData, setSeatData] = useState<Record<string, Seat>>({})
  const [seatPositions, setSeatPositions] = useState<SeatPosition[]>([])

  // Información del evento
  const eventInfo = {
    title: "Gloria Trevi - En Vivo",
    date: "Sábado, 29 de marzo 2025",
    time: "21:00 hrs",
    venue: "Palenque Victoria, San Luis Potosí",
  }

  // Función para generar secciones automáticamente basado en sectionCount
  const generateDynamicSections = (zone: any) => {
    if (zone.sectionCount === 1) {
      // Una sola sección que ocupa todo el ángulo de la zona
      return [
        {
          ...zone.sections[0],
          startAngle: zone.position.startAngle + 5,
          endAngle: zone.position.endAngle - 5,
          seatsPerRow: Math.floor((zone.position.endAngle - zone.position.startAngle) / 4),
        },
      ]
    }

    // Múltiples secciones con gaps
    const totalAngle = zone.position.endAngle - zone.position.startAngle
    const gapAngle = zone.sectionGap || 5
    const totalGapAngle = (zone.sectionCount - 1) * gapAngle
    const sectionAngle = (totalAngle - totalGapAngle) / zone.sectionCount

    const sections = []
    for (let i = 0; i < zone.sectionCount; i++) {
      const startAngle = zone.position.startAngle + i * (sectionAngle + gapAngle)
      const endAngle = startAngle + sectionAngle

      sections.push({
        id: `sec-${String.fromCharCode(65 + i).toLowerCase()}`, // sec-a, sec-b, etc.
        name: `Sección ${String.fromCharCode(65 + i)}`,
        rows: zone.sections[0]?.rows || 8,
        seatsPerRow: Math.floor(sectionAngle / 3), // Ajustar según el ángulo
        startRadius: zone.sections[0]?.startRadius || 180,
        rowSpacing: zone.sections[0]?.rowSpacing || 25,
        startAngle: startAngle,
        endAngle: endAngle,
      })
    }

    return sections
  }

  // Generar posiciones de asientos en arco
  const generateArcPositions = (
    zoneId: string,
    sectionId: string,
    config: any,
    centerX: number,
    centerY: number,
  ): SeatPosition[] => {
    const { startRadius, rowSpacing, startAngle, endAngle, rows, seatsPerRow } = config

    const positions: SeatPosition[] = []

    // Convertir ángulos a radianes
    const startAngleRad = (startAngle * Math.PI) / 180
    const endAngleRad = (endAngle * Math.PI) / 180

    // Calcular delta theta para distribución uniforme
    const deltaTheta = seatsPerRow > 1 ? (endAngleRad - startAngleRad) / (seatsPerRow - 1) : 0

    for (let row = 0; row < rows; row++) {
      // Radio para esta fila
      const radius = startRadius + row * rowSpacing

      for (let seat = 0; seat < seatsPerRow; seat++) {
        // Ángulo para este asiento
        const theta = startAngleRad + seat * deltaTheta

        // Conversión polar → cartesiana
        const x = centerX + radius * Math.cos(theta)
        const y = centerY + radius * Math.sin(theta)

        const seatId = `${zoneId}-${sectionId}-${row + 1}-${seat + 1}`
        positions.push({
          id: seatId,
          x: Math.round(x),
          y: Math.round(y),
          zone: zoneId,
          section: sectionId,
          row: row + 1,
          seat: seat + 1,
        })
      }
    }

    return positions
  }

  // Generar asientos circulares completos (para VIP)
  const generateCircularSeats = (
    radius: number,
    seatsCount: number,
    zoneId: string,
    sectionId: string,
    centerX: number,
    centerY: number,
    startRow = 1,
  ): SeatPosition[] => {
    const positions: SeatPosition[] = []
    const angleStep = (2 * Math.PI) / seatsCount

    for (let i = 0; i < seatsCount; i++) {
      const angle = i * angleStep
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      const seatId = `${zoneId}-${sectionId}-${startRow}-${i + 1}`
      positions.push({
        id: seatId,
        x: Math.round(x),
        y: Math.round(y),
        zone: zoneId,
        section: sectionId,
        row: startRow,
        seat: i + 1,
      })
    }

    return positions
  }

  // Inicializar datos de asientos
  useEffect(() => {
    const positions: SeatPosition[] = []
    const seats: Record<string, Seat> = {}

    // Generar posiciones para cada zona y sección
    palenqueData.zones.forEach((zone) => {
      const dynamicSections = generateDynamicSections(zone)

      dynamicSections.forEach((section) => {
        let sectionPositions: SeatPosition[] = []

        if (zone.id === "vip-central") {
          // VIP con secciones separadas
          sectionPositions = generateArcPositions(
            zone.id,
            section.id,
            section,
            palenqueData.ruedo.centerX,
            palenqueData.ruedo.centerY,
          )
        } else {
          // Secciones en arco normales
          sectionPositions = generateArcPositions(
            zone.id,
            section.id,
            section,
            palenqueData.ruedo.centerX,
            palenqueData.ruedo.centerY,
          )
        }

        positions.push(...sectionPositions)

        // Crear datos de asientos con la sección dinámica
        sectionPositions.forEach((pos) => {
          seats[pos.id] = {
            id: pos.id,
            zone: zone.id,
            zoneName: zone.name,
            section: section.id,
            sectionName: section.name,
            row: pos.row,
            seat: pos.seat,
            price: zone.price,
            status: Math.random() > 0.25 ? "available" : "occupied",
            color: zone.color,
            x: pos.x,
            y: pos.y,
          }
        })
      })
    })

    setSeatPositions(positions)
    setSeatData(seats)
  }, [])

  const handleSeatClick = (seatId: string) => {
    const seat = seatData[seatId]
    if (!seat || seat.status === "occupied") return

    if (selectedSeats.find((s) => s.id === seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seatId))
    } else {
      setSelectedSeats([...selectedSeats, seat])
    }
  }

  const removeSeat = (seatId: string) => {
    setSelectedSeats(selectedSeats.filter((s) => s.id !== seatId))
  }

  const getSeatStatus = (seatId: string) => {
    if (selectedSeats.find((s) => s.id === seatId)) return "selected"
    return seatData[seatId]?.status || "available"
  }

  const getSeatColor = (seatId: string) => {
    const status = getSeatStatus(seatId)
    const seat = seatData[seatId]

    if (status === "selected") return "#EC4899"
    if (status === "occupied") return "#6B7280"
    return seat?.color || "#E5E7EB"
  }

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0)
  const totalSeats = selectedSeats.length

  // Agrupar asientos seleccionados por zona
  const groupedSeats = selectedSeats.reduce(
    (acc, seat) => {
      if (!acc[seat.zoneName]) {
        acc[seat.zoneName] = []
      }
      acc[seat.zoneName].push(seat)
      return acc
    },
    {} as Record<string, Seat[]>,
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Panel lateral izquierdo */}
      <div className="w-96 bg-white shadow-xl overflow-y-auto">
        {/* Información del evento */}
        <div className="p-6 border-b">
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{eventInfo.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm opacity-90">
                <Calendar className="w-4 h-4 mr-2" />
                {eventInfo.date}
              </div>
              <div className="flex items-center text-sm opacity-90">
                <Clock className="w-4 h-4 mr-2" />
                {eventInfo.time}
              </div>
              <div className="flex items-center text-sm opacity-90">
                <MapPin className="w-4 h-4 mr-2" />
                {eventInfo.venue}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de precios por zona */}
        <div className="p-6 border-b">
          <h3 className="font-semibold text-gray-800 mb-4">Precios por Zona</h3>
          <div className="space-y-3">
            {palenqueData.zones.map((zone) => (
              <div key={zone.id} className="flex items-center p-3 rounded-lg border bg-gray-50">
                <div className="w-4 h-8 rounded mr-3" style={{ backgroundColor: zone.color }} />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{zone.name}</div>
                  <div className="text-green-600 font-semibold">${zone.price.toFixed(2)} MXN</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Asientos seleccionados */}
        {selectedSeats.length > 0 && (
          <div className="p-6 border-b">
            <Card className="bg-pink-500 text-white border-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Asientos Seleccionados ({totalSeats})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(groupedSeats).map(([zoneName, seats]) => (
                  <div key={zoneName} className="space-y-2">
                    <div className="font-medium text-sm opacity-90">{zoneName}</div>
                    {seats.map((seat) => (
                      <div key={seat.id} className="flex justify-between items-center bg-white/20 p-2 rounded">
                        <div className="text-sm">
                          <div>{seat.sectionName}</div>
                          <div className="opacity-80">
                            Fila {seat.row}, Asiento {seat.seat}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">${seat.price.toFixed(2)}</span>
                          <button
                            onClick={() => removeSeat(seat.id)}
                            className="text-white/70 hover:text-white transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                <div className="border-t border-white/30 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      <span className="text-lg font-bold">${totalPrice.toFixed(2)} MXN</span>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Comprar {totalSeats} boleto{totalSeats !== 1 ? "s" : ""}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Leyenda */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-800 mb-3">Leyenda</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-400"></div>
              <span>Ocupado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-pink-500"></div>
              <span>Seleccionado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span>Disponible</span>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <p>• Haz clic en los asientos para seleccionar</p>
            <p>• Puedes seleccionar múltiples asientos</p>
            <p>• Los asientos grises no están disponibles</p>
          </div>
        </div>
      </div>

      {/* Mapa de asientos */}
      <div className="flex-1 p-6 overflow-auto">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-xl">Mapa de Asientos - {palenqueData.venue.name}</CardTitle>
            <p className="text-gray-600">Selecciona tus asientos haciendo clic en el mapa</p>
          </CardHeader>
          <CardContent className="h-full">
            <div className="flex justify-center h-full">
              <svg width="800" height="600" viewBox="0 0 800 600" className="border rounded-lg bg-gray-50">
                {/* Ruedo central */}
                <circle
                  cx={palenqueData.ruedo.centerX}
                  cy={palenqueData.ruedo.centerY}
                  r={palenqueData.ruedo.radius}
                  fill="#1F2937"
                  stroke="#374151"
                  strokeWidth="3"
                />
                <text
                  x={palenqueData.ruedo.centerX}
                  y={palenqueData.ruedo.centerY - 10}
                  textAnchor="middle"
                  fill="white"
                  fontSize="18"
                  fontWeight="bold"
                >
                  RUEDO
                </text>
                <text
                  x={palenqueData.ruedo.centerX}
                  y={palenqueData.ruedo.centerY + 15}
                  textAnchor="middle"
                  fill="white"
                  fontSize="14"
                >
                  PALENQUE
                </text>

                {/* Etiquetas de zonas */}
                <text x="300" y="150" fontSize="14" fontWeight="bold" fill="#3B82F6">
                  Zona 1
                </text>
                <text x="500" y="150" fontSize="14" fontWeight="bold" fill="#10B981">
                  Zona 2
                </text>
                <text x="500" y="480" fontSize="14" fontWeight="bold" fill="#F59E0B">
                  Zona 3
                </text>
                <text x="300" y="480" fontSize="14" fontWeight="bold" fill="#8B5CF6">
                  Zona 4
                </text>
                <text x="350" y="300" fontSize="12" fontWeight="bold" fill="#DC2626">
                  VIP
                </text>

                {/* Líneas de separación entre zonas */}
                <line x1="400" y1="180" x2="400" y2="420" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="280" y1="300" x2="520" y2="300" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="5,5" />

                {/* Líneas de separación entre secciones */}
                {palenqueData.zones.map((zone) => {
                  if (zone.sectionCount > 1) {
                    const sections = generateDynamicSections(zone)
                    return sections.map((section, index) => {
                      if (index < sections.length - 1) {
                        const angle = (section.endAngle * Math.PI) / 180
                        const x1 = palenqueData.ruedo.centerX + 160 * Math.cos(angle)
                        const y1 = palenqueData.ruedo.centerY + 160 * Math.sin(angle)
                        const x2 = palenqueData.ruedo.centerX + 280 * Math.cos(angle)
                        const y2 = palenqueData.ruedo.centerY + 280 * Math.sin(angle)

                        return (
                          <line
                            key={`${zone.id}-sep-${index}`}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="#E5E7EB"
                            strokeWidth="2"
                            strokeDasharray="3,3"
                          />
                        )
                      }
                      return null
                    })
                  }
                  return null
                })}

                {/* Renderizado de asientos */}
                {seatPositions.map((pos) => (
                  <circle
                    key={pos.id}
                    cx={pos.x}
                    cy={pos.y}
                    r="5"
                    fill={getSeatColor(pos.id)}
                    stroke={getSeatStatus(pos.id) === "selected" ? "#BE185D" : "none"}
                    strokeWidth="2"
                    className={`cursor-pointer transition-all duration-200 ${
                      getSeatStatus(pos.id) === "occupied"
                        ? "cursor-not-allowed"
                        : "hover:stroke-gray-400 hover:stroke-2 hover:r-6"
                    }`}
                    onClick={() => handleSeatClick(pos.id)}
                    onMouseEnter={() => setHoveredSeat(seatData[pos.id])}
                    onMouseLeave={() => setHoveredSeat(null)}
                  />
                ))}

                {/* Tooltip para asiento hover */}
                {hoveredSeat && (
                  <g>
                    <rect x="50" y="520" width="220" height="70" fill="rgba(0,0,0,0.9)" rx="8" />
                    <text x="60" y="540" fill="white" fontSize="13" fontWeight="bold">
                      {hoveredSeat.zoneName} - {hoveredSeat.sectionName}
                    </text>
                    <text x="60" y="555" fill="white" fontSize="12">
                      Fila {hoveredSeat.row}, Asiento {hoveredSeat.seat}
                    </text>
                    <text x="60" y="570" fill="#10B981" fontSize="12" fontWeight="bold">
                      ${hoveredSeat.price.toFixed(2)} MXN
                    </text>
                    <text x="60" y="585" fill="#9CA3AF" fontSize="11">
                      {hoveredSeat.status === "available" ? "Disponible" : "Ocupado"}
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
