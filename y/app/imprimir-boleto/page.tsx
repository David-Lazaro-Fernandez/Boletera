"use client"

import type React from "react"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Printer, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TicketData {
  seccion: string
  orden: string
  precio: string
  tipo: string
  fila: string
  asiento: string
}

export default function ImprimirBoletoPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<TicketData>({
    seccion: "",
    orden: "",
    precio: "",
    tipo: "",
    fila: "",
    asiento: "",
  })

  const handleInputChange = (field: keyof TicketData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación básica
    if (
      !formData.seccion ||
      !formData.orden ||
      !formData.precio ||
      !formData.tipo ||
      !formData.fila ||
      !formData.asiento
    ) {
      toast({
        title: "Error de validación",
        description: "Por favor completa todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("https://2r1f9h9q-8000.usw3.devtunnels.ms/print", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors", // Explicitly set CORS mode
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const responseData = await response.text() // or response.json() if your backend returns JSON
        console.log("Response:", responseData)

        toast({
          title: "¡Boleto enviado a imprimir!",
          description: "El boleto se ha enviado correctamente a la impresora.",
        })

        // Limpiar el formulario después del éxito
        setFormData({
          seccion: "",
          orden: "",
          precio: "",
          tipo: "",
          fila: "",
          asiento: "",
        })
      } else {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`)
      }
    } catch (error) {
      console.error("Error al imprimir boleto:", error)

      // Mostrar error más específico
      let errorMessage = "No se pudo enviar el boleto a imprimir. Verifica la conexión e intenta nuevamente."

      if (error instanceof Error) {
        if (error.message.includes("CORS")) {
          errorMessage = "Error de CORS: El servidor necesita configurar los headers apropiados."
        } else if (error.message.includes("405")) {
          errorMessage = "Error 405: El servidor no permite el método OPTIONS. Contacta al administrador del backend."
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage =
            "No se puede conectar al servidor. Verifica que la URL sea correcta y el servidor esté funcionando."
        }
      }

      toast({
        title: "Error al imprimir",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = Object.values(formData).every((value) => value.trim() !== "")

  return (
    <MainLayout activePage="imprimir-boleto">
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Printer className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Imprimir Boleto</h1>
          <p className="text-gray-600">Completa los datos del boleto para enviarlo a imprimir</p>
        </div>

        {/* Debug Info */}
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-sm text-yellow-800">Información de Debug</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-yellow-700">
            <p>
              <strong>URL del backend:</strong> https://2r1f9h9q-8000.usw3.devtunnels.ms/print
            </p>
            <p>
              <strong>Método:</strong> POST
            </p>
            <p>
              <strong>Nota:</strong> Si ves errores CORS o 405, el backend necesita configurar:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Permitir método OPTIONS</li>
              <li>Headers CORS apropiados</li>
              <li>Access-Control-Allow-Origin</li>
              <li>Access-Control-Allow-Methods: POST, OPTIONS</li>
              <li>Access-Control-Allow-Headers: Content-Type</li>
            </ul>
          </CardContent>
        </Card>

        {/* Form Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Datos del Boleto
            </CardTitle>
            <CardDescription>Ingresa la información del boleto que deseas imprimir</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sección */}
                <div className="space-y-2">
                  <Label htmlFor="seccion">
                    Sección <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.seccion} onValueChange={(value) => handleInputChange("seccion", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una sección" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">General</SelectItem>
                      <SelectItem value="VIP">VIP</SelectItem>
                      <SelectItem value="PALCO">Palco</SelectItem>
                      <SelectItem value="PREFERENTE">Preferente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipo */}
                <div className="space-y-2">
                  <Label htmlFor="tipo">
                    Tipo <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PREVENTA">Preventa</SelectItem>
                      <SelectItem value="REGULAR">Regular</SelectItem>
                      <SelectItem value="PROMOCION">Promoción</SelectItem>
                      <SelectItem value="CORTESIA">Cortesía</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Orden */}
                <div className="space-y-2">
                  <Label htmlFor="orden">
                    Número de Orden <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="orden"
                    value={formData.orden}
                    onChange={(e) => handleInputChange("orden", e.target.value)}
                    placeholder="Ej. A1B2C3D4"
                    className="uppercase"
                  />
                </div>

                {/* Precio */}
                <div className="space-y-2">
                  <Label htmlFor="precio">
                    Precio <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="precio"
                      type="number"
                      value={formData.precio}
                      onChange={(e) => handleInputChange("precio", e.target.value)}
                      placeholder="300"
                      className="pl-8"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Fila */}
                <div className="space-y-2">
                  <Label htmlFor="fila">
                    Fila <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fila"
                    value={formData.fila}
                    onChange={(e) => handleInputChange("fila", e.target.value)}
                    placeholder="Ej. 5"
                  />
                </div>

                {/* Asiento */}
                <div className="space-y-2">
                  <Label htmlFor="asiento">
                    Asiento <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="asiento"
                    value={formData.asiento}
                    onChange={(e) => handleInputChange("asiento", e.target.value)}
                    placeholder="Ej. 12"
                  />
                </div>
              </div>

              {/* Preview Card */}
              {isFormValid && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Vista previa del boleto:</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Sección:</span>
                      <span className="ml-2 font-medium">{formData.seccion}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tipo:</span>
                      <span className="ml-2 font-medium">{formData.tipo}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Orden:</span>
                      <span className="ml-2 font-medium">{formData.orden}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Precio:</span>
                      <span className="ml-2 font-medium">${formData.precio}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Fila:</span>
                      <span className="ml-2 font-medium">{formData.fila}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Asiento:</span>
                      <span className="ml-2 font-medium">{formData.asiento}</span>
                    </div>
                  </div>

                  {/* JSON Preview */}
                  <div className="mt-4 p-3 bg-gray-800 rounded text-green-400 text-xs font-mono">
                    <div className="text-gray-300 mb-1">JSON que se enviará:</div>
                    <pre>{JSON.stringify(formData, null, 2)}</pre>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t">
                <Button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 min-w-[140px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Imprimiendo...
                    </>
                  ) : (
                    <>
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimir Boleto
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Asegúrate de que la impresora esté conectada y configurada correctamente.</p>
        </div>
      </div>
    </MainLayout>
  )
}
