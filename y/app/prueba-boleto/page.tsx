"use client"

import { useState, useRef } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Printer, Download, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

interface TicketData {
  seccion: string
  orden: string
  precio: string
  tipo: string
  fila: string
  asiento: string
  evento: string
  fecha: string
  hora: string
  lugar: string
  ciudad: string
}

interface PrintConfig {
  paperSize: string
  scale: string
  orientation: string
  margins: string
  monocromo: boolean
  dpi: string
}

export default function PruebaBoletoPage() {
  const { toast } = useToast()
  const ticketRef = useRef<HTMLDivElement>(null)

  const [ticketData, setTicketData] = useState<TicketData>({
    seccion: "GENERAL",
    orden: "A1B2C3D4",
    precio: "300",
    tipo: "PREVENTA",
    fila: "5",
    asiento: "12",
    evento: "GLORIA TREVI",
    fecha: "29 DE MARZO 2025",
    hora: "21:00",
    lugar: "ARENA POTOSI",
    ciudad: "SAN LUIS POTOSÍ, SLP",
  })

  const [printConfig, setPrintConfig] = useState<PrintConfig>({
    paperSize: "140x50mm",
    scale: "100",
    orientation: "landscape",
    margins: "none",
    monocromo: true,
    dpi: "203",
  })

  const handleTicketDataChange = (field: keyof TicketData, value: string) => {
    setTicketData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePrintConfigChange = (field: keyof PrintConfig, value: string | boolean) => {
    setPrintConfig((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Función para convertir una imagen a monocromo (1 bit)
  const convertToMonochrome = async (canvas: HTMLCanvasElement): Promise<HTMLCanvasElement> => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return canvas

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Convertir a escala de grises y luego a 1 bit (blanco y negro)
    for (let i = 0; i < data.length; i += 4) {
      // Convertir a escala de grises usando luminosidad percibida
      const grayValue = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]

      // Umbral para convertir a 1 bit (blanco o negro)
      const threshold = 128
      const bwValue = grayValue > threshold ? 255 : 0

      data[i] = bwValue // R
      data[i + 1] = bwValue // G
      data[i + 2] = bwValue // B
      // Alpha se mantiene igual
    }

    ctx.putImageData(imageData, 0, 0)
    return canvas
  }

  const generatePDF = async () => {
    try {
      const { jsPDF } = await import("jspdf")
      const html2canvas = (await import("html2canvas")).default

      if (ticketRef.current) {
        // Configurar opciones para html2canvas
        const scale = printConfig.monocromo ? 3 : 2 // Mayor escala para mejor calidad en monocromo
        const dpi = Number.parseInt(printConfig.dpi) / 72 // Convertir DPI a escala para html2canvas

        const canvas = await html2canvas(ticketRef.current, {
          scale: scale * dpi,
          useCORS: true,
          backgroundColor: "#ffffff", // Fondo explícitamente blanco
          logging: false,
          removeContainer: true,
        })

        // Aplicar conversión a monocromo si está habilitado
        const finalCanvas = printConfig.monocromo ? await convertToMonochrome(canvas) : canvas

        const imgData = finalCanvas.toDataURL("image/png")

        // Determinar dimensiones según el tamaño seleccionado
        const pdfWidth = 140
        let pdfHeight = 50

        if (printConfig.paperSize === "140x50mm+100px") {
          pdfHeight = 50 + 100 * 0.264583 // Convertir 100px a mm (100px / 378 px/100mm)
        }

        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: [pdfWidth, pdfHeight],
          compress: true,
        })

        // Establecer fondo blanco explícito
        pdf.setFillColor(255, 255, 255)
        pdf.rect(0, 0, pdfWidth, pdfHeight, "F")

        // Añadir la imagen con calidad optimizada
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST")

        pdf.save(`boleto-${ticketData.orden}.pdf`)

        toast({
          title: "PDF generado",
          description: "El boleto se ha descargado como PDF optimizado para impresión térmica.",
        })
      }
    } catch (error) {
      console.error("Error generando PDF:", error)
      toast({
        title: "Error",
        description: "No se pudo generar el PDF. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (printWindow && ticketRef.current) {
      const ticketHTML = ticketRef.current.outerHTML

      // Determinar dimensiones según el tamaño seleccionado
      const pageWidth = "140mm"
      let pageHeight = "50mm"

      if (printConfig.paperSize === "140x50mm+100px") {
        pageHeight = "76.4mm" // 50mm + 26.4mm (100px convertidos a mm)
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Boleto - ${ticketData.orden}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Geist+Mono:wght@300;400;500;600&display=swap');
              
              body { 
                margin: 0; 
                padding: 0; 
                font-family: 'Courier New', 'Courier Prime', monospace;
                background: #ffffff !important;
              }
              
              @media print {
                body { 
                  margin: 0; 
                  padding: 0; 
                  background: #ffffff !important;
                }
                .no-print { display: none; }
                @page {
                  size: ${pageWidth} ${pageHeight};
                  margin: 0;
                }
                * {
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
              }
              
              .ticket-container {
                width: 100%;
                max-width: ${pageWidth};
                height: ${pageHeight};
                background: #ffffff;
                border: 1px solid black;
                font-family: 'Courier New', 'Geist Mono', monospace;
                display: flex;
                overflow: hidden;
              }
              
              .ticket-talon {
                width: 25%;
                min-width: 90px;
                background: #ffffff;
                padding: 0.5rem;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                border-right: 6px solid black;
              }
              
              .ticket-body {
                flex: 1;
                padding: 0.5rem;
                display: flex;
                flex-direction: column;
                background: #ffffff;
              }
              
              .ticket-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                background: #ffffff;
              }
              
              .ticket-right {
                width: 30%;
                min-width: 100px;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                padding-left: 0.5rem;
                background: #ffffff;
              }
              
              .ticket-details {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
                font-size: 0.6rem;
                line-height: 1.1;
                font-weight: 500;
              }
              
              .detail-item {
                margin-bottom: 0.25rem;
              }
              
              .detail-label {
                font-weight: 600;
              }
              
              .date-time {
                text-align: center;
                font-weight: 600;
                margin-bottom: 0.25rem;
                font-size: 0.75rem;
              }
              
              .presenter {
                text-align: center;
                margin-bottom: 0.25rem;
                font-size: 0.5rem;
                font-variant: small-caps;
                font-weight: 500;
              }
              
              .event-name {
                text-align: center;
                font-weight: 700;
                font-size: 1.25rem;
                margin: 0.25rem 0;
                letter-spacing: 0.05rem;
                line-height: 1;
              }
              
              .venue-info {
                text-align: center;
                margin: 0.25rem 0;
                font-size: 0.65rem;
                line-height: 1.2;
                font-weight: 500;
              }
              
              .logo {
                width: 2.5rem;
                height: 2.5rem;
                background: black;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.75rem;
                font-weight: 700;
                margin-bottom: 0.5rem;
                font-family: Arial, sans-serif;
              }
              
              .qr-code {
                width: 3.75rem;
                height: 3.75rem;
                border: 1px solid black;
                background-size: cover;
                background-repeat: no-repeat;
                background-position: center;
              }
              
              .ticket-value {
                font-family: 'Geist Mono', monospace;
                font-weight: normal;
              }
              
              ${
                printConfig.monocromo
                  ? `
              /* Estilos específicos para impresión monocromática */
              * {
                color: black !important;
                background-color: white !important;
                border-color: black !important;
              }
              `
                  : ""
              }
            </style>
          </head>
          <body>
            ${ticketHTML}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              }
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  // Función para exportar como imagen monocromática TIFF
  const exportMonochromeTiff = async () => {
    try {
      const html2canvas = (await import("html2canvas")).default

      if (ticketRef.current) {
        toast({
          title: "Procesando...",
          description: "Generando imagen monocromática para impresión térmica.",
        })

        // Capturar el boleto con alta resolución
        const canvas = await html2canvas(ticketRef.current, {
          scale: 4,
          useCORS: true,
          backgroundColor: "#ffffff",
        })

        // Convertir a monocromo
        const monoCanvas = await convertToMonochrome(canvas)

        // Crear un enlace de descarga
        const link = document.createElement("a")
        link.download = `boleto-${ticketData.orden}-mono.png`

        // Convertir a PNG (los navegadores no soportan TIFF directamente)
        monoCanvas.toBlob((blob) => {
          if (blob) {
            link.href = URL.createObjectURL(blob)
            link.click()

            toast({
              title: "Imagen generada",
              description: "La imagen monocromática se ha descargado. Úsala con ImageMagick para convertir a TIFF.",
            })
          }
        }, "image/png")
      }
    } catch (error) {
      console.error("Error generando imagen monocromática:", error)
      toast({
        title: "Error",
        description: "No se pudo generar la imagen. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  // Determinar altura del contenedor según el tamaño seleccionado
  const getTicketHeight = () => {
    return printConfig.paperSize === "140x50mm+100px" ? "300px" : "240px"
  }

  const getTicketDescription = () => {
    return printConfig.paperSize === "140x42mm+100px"
      ? "Diseño extendido con 100px adicionales de altura"
      : "Diseño optimizado para impresión térmica de boletos - Formato horizontal"
  }

  return (
    <MainLayout activePage="prueba-boleto">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Prueba de Boleto</h1>
          <p className="text-gray-600">Configura y previsualiza el diseño del boleto antes de imprimir</p>
        </div>

        {/* Layout en columna */}
        <div className="flex flex-col gap-8">
          {/* Configuration Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ticket Data */}
            <Card>
              <CardHeader>
                <CardTitle>Datos del Boleto</CardTitle>
                <CardDescription>Configura la información que aparecerá en el boleto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="evento">Evento</Label>
                    <Input
                      id="evento"
                      value={ticketData.evento}
                      onChange={(e) => handleTicketDataChange("evento", e.target.value)}
                      placeholder="Nombre del evento"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="precio">Precio</Label>
                    <Input
                      id="precio"
                      value={ticketData.precio}
                      onChange={(e) => handleTicketDataChange("precio", e.target.value)}
                      placeholder="300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha</Label>
                    <Input
                      id="fecha"
                      value={ticketData.fecha}
                      onChange={(e) => handleTicketDataChange("fecha", e.target.value)}
                      placeholder="29 DE MARZO 2025"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hora">Hora</Label>
                    <Input
                      id="hora"
                      value={ticketData.hora}
                      onChange={(e) => handleTicketDataChange("hora", e.target.value)}
                      placeholder="21:00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lugar">Lugar</Label>
                    <Input
                      id="lugar"
                      value={ticketData.lugar}
                      onChange={(e) => handleTicketDataChange("lugar", e.target.value)}
                      placeholder="ARENA POTOSI"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ciudad">Ciudad</Label>
                    <Input
                      id="ciudad"
                      value={ticketData.ciudad}
                      onChange={(e) => handleTicketDataChange("ciudad", e.target.value)}
                      placeholder="SAN LUIS POTOSÍ, SLP"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orden">Orden</Label>
                    <Input
                      id="orden"
                      value={ticketData.orden}
                      onChange={(e) => handleTicketDataChange("orden", e.target.value)}
                      placeholder="A1B2C3D4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seccion">Sección</Label>
                    <Select
                      value={ticketData.seccion}
                      onValueChange={(value) => handleTicketDataChange("seccion", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GENERAL">GENERAL</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                        <SelectItem value="PALCO">PALCO</SelectItem>
                        <SelectItem value="PREFERENTE">PREFERENTE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fila">Fila</Label>
                    <Input
                      id="fila"
                      value={ticketData.fila}
                      onChange={(e) => handleTicketDataChange("fila", e.target.value)}
                      placeholder="5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="asiento">Asiento</Label>
                    <Input
                      id="asiento"
                      value={ticketData.asiento}
                      onChange={(e) => handleTicketDataChange("asiento", e.target.value)}
                      placeholder="12"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Print Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Impresión</CardTitle>
                <CardDescription>Ajusta las opciones de impresión y formato</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paperSize">Tamaño de Papel</Label>
                    <Select
                      value={printConfig.paperSize}
                      onValueChange={(value) => handlePrintConfigChange("paperSize", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="140x50mm">140mm x 50mm (Estándar)</SelectItem>
                        <SelectItem value="140x50mm+100px">140mm x 50mm + 100px (Extendido)</SelectItem>
                        <SelectItem value="A4">A4 (Prueba)</SelectItem>
                        <SelectItem value="Letter">Carta (Prueba)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orientation">Orientación</Label>
                    <Select
                      value={printConfig.orientation}
                      onValueChange={(value) => handlePrintConfigChange("orientation", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="landscape">Horizontal</SelectItem>
                        <SelectItem value="portrait">Vertical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dpi">Resolución (DPI)</Label>
                    <Select value={printConfig.dpi} onValueChange={(value) => handlePrintConfigChange("dpi", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="203">203 DPI (Térmica estándar)</SelectItem>
                        <SelectItem value="300">300 DPI (Alta calidad)</SelectItem>
                        <SelectItem value="600">600 DPI (Muy alta calidad)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="margins">Márgenes</Label>
                    <Select
                      value={printConfig.margins}
                      onValueChange={(value) => handlePrintConfigChange("margins", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin márgenes</SelectItem>
                        <SelectItem value="minimal">Mínimos</SelectItem>
                        <SelectItem value="normal">Normales</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Optimización para impresión térmica */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Optimización para impresión térmica
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="monocromo"
                        checked={printConfig.monocromo}
                        onCheckedChange={(checked) => handlePrintConfigChange("monocromo", checked === true)}
                      />
                      <Label htmlFor="monocromo" className="text-sm">
                        Convertir a monocromo (1 bit)
                      </Label>
                    </div>

                    <p className="text-xs text-gray-500">
                      La conversión a monocromo elimina los tramados y mejora la impresión en impresoras térmicas. Usa
                      203 DPI para impresoras térmicas estándar.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4 pt-4">
                  <div className="flex gap-4">
                    <Button onClick={generatePDF} className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar PDF
                    </Button>
                    <Button onClick={handlePrint} variant="outline" className="flex-1">
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimir
                    </Button>
                  </div>

                  <Button onClick={exportMonochromeTiff} variant="secondary" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar imagen monocromática
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <Card>
            <CardHeader>
              <CardTitle>
                Vista Previa del Boleto (
                {printConfig.paperSize === "140x50mm+100px" ? "140mm x 76.4mm" : "140mm x 50mm"})
              </CardTitle>
              <CardDescription>{getTicketDescription()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-8 rounded-lg flex justify-center">
                <div
                  ref={ticketRef}
                  className="bg-white border border-black"
                  style={{
                    width: "100%",
                    maxWidth: "600px",
                    height: getTicketHeight(),
                    fontFamily: "'Courier New', 'Geist Mono', monospace",
                    display: "flex",
                    overflow: "hidden",
                  }}
                >
                  {/* Talón izquierdo */}
                  <div
                    className="bg-white flex flex-col justify-between"
                    style={{
                      width: "25%",
                      minWidth: "90px",
                      padding: "0.5rem",
                      borderRight: "6px solid black",
                    }}
                  >
                    <div className="flex flex-col gap-[2px] pl-6 py-3">
                      <div>
                        <div className="font-bold text-sm">PRECIO</div>
                        <div className="text-sm font-mono font-normal">$ {ticketData.precio}</div>
                      </div>
                      <div>
                        <div className="font-bold text-sm">Orden</div>
                        <div className="text-sm font-mono font-normal">{ticketData.orden}</div>
                      </div>
                      <div>
                        <div className="font-bold text-sm">SECCION</div>
                        <div className="text-sm font-mono font-normal">{ticketData.seccion}</div>
                      </div>
                      <div>
                        <div className="font-bold text-sm">FILA</div>
                        <div className="text-sm font-mono font-normal">{ticketData.fila}</div>
                      </div>
                      <div>
                        <div className="font-bold text-sm">ASIENTO</div>
                        <div className="text-sm font-mono font-normal">{ticketData.asiento}</div>
                      </div>
                    </div>
                  </div>

                  {/* Cuerpo principal */}
                  <div className="flex-1 flex bg-white">
                    {/* Contenido central */}
                    <div className="flex-1 flex flex-col items-start justify-between py-10 px-2 bg-white">
                      <div className="text-center font-semibold text-sm mb-1">
                        <span className="font-bold">
                          {ticketData.fecha}, {ticketData.hora} HRS
                        </span>
                      </div>

                      <div className="flex flex-col items-start">
                        <div className="text-center text-sm mb-1 font-normal font-mono" style={{ fontVariant: "small-caps" }}>
                          BOSON TICKETS PRESENTA
                        </div>
                        <div className="text-center font-bold text-2xl mb-2 tracking-wide leading-tight">
                          <span className="font-bold">{ticketData.evento}</span>
                        </div>
                      </div>

                      <div className="text-start text-sm mb-2 leading-tight font-medium">
                        <span className="font-mono font-normal">{ticketData.lugar}</span>
                        <br />
                        <span className="font-mono font-normal">{ticketData.ciudad}</span>
                      </div>
                    </div>

                    {/* Sección derecha */}
                    <div className="flex gap-1 py-3 bg-white">
                      <div className="w-[30%] min-w-[100px] flex flex-col items-end bg-white">
                        <div className="text-right text-sm mb-2">
                          <div className="mb-1">
                            <div className="font-bold">PRECIO</div>
                            <div className="font-mono font-normal">$ {ticketData.precio}</div>
                          </div>
                          <div className="mb-1">
                            <div className="font-bold">Orden</div>
                            <div className="font-mono font-normal">{ticketData.orden}</div>
                          </div>
                          <div className="mb-1">
                            <div className="font-bold">SECCION</div>
                            <div className="font-mono font-normal">{ticketData.seccion}</div>
                          </div>
                          <div className="mb-1">
                            <div className="font-bold">FILA</div>
                            <div className="font-mono font-normal">{ticketData.fila}</div>
                          </div>
                          <div className="mb-1">
                            <div className="font-bold">ASIENTO</div>
                            <div className="font-mono font-normal">{ticketData.asiento}</div>
                          </div>
                        </div>
                      </div>
                      <div className="w-[30%] min-w-[100px] flex flex-col items-start justify-around pl-6 bg-white">
                        <div>
                          <svg
                            width="51"
                            height="38"
                            viewBox="0 0 51 38"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M22.6325 8.01386H20.0973V5.35788H22.6325V8.01386Z" fill="#09090B" />
                            <path d="M15.0268 15.7404H12.6122V17.9135H15.0268V15.7404Z" fill="#09090B" />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M18.2864 0.408081V2.70189H25.1678V10.3077H18.2864V13.2051H15.3889V15.7404H18.2864V17.9135H15.3889V20.2073H17.6827V22.3803H20.4595V25.3985H17.6827V23.2254H15.3889L15.0268 20.6902H12.6122V18.2756L10.1977 17.9135V15.7404L12.6122 15.4989V12.8429H15.0268V10.3077H17.6827V5.72006H15.3889V8.01386H12.6122V10.6699H10.4391V12.8429H8.02461V10.3077H5.12717V12.8429H0.539551V15.4989H5.12717V13.2051H7.66243V17.9135H5.12717V22.8632H7.66243V25.3985H10.1977V30.3483H15.0268V33.125H12.6122V35.4188H15.0268V37.5919H20.0973V35.4188H22.6325V37.5919H40.3794C48.3473 37.5919 57.0396 23.2254 43.3975 18.3964V17.4305C50.279 16.5855 53.6593 4.02988 39.5343 0.770261L18.2864 0.408081ZM28.0652 30.3483H25.1678V27.5716H20.0973V30.3483H17.6827V33.125H20.4595V30.3483H24.9263V32.7628H22.6325V35.4188H25.1678V32.7628H28.0652V30.3483ZM28.0652 30.3483L35.7917 30.3404C43.3975 30.3404 41.5866 21.5353 35.7917 22.2517C35.1926 22.3258 28.0652 22.2596 28.0652 22.2596V30.3483ZM10.1977 25.3985H12.6122V27.813H15.0268V25.1571H12.6122V22.8632H10.4391V20.2073H7.66243V22.8632H10.1977V25.3985ZM27.5823 15.4989V8.01386H36.8783C42.0695 10.3077 39.0514 16.1026 36.0332 15.4989H27.5823ZM22.3911 25.5192V22.3803H25.1678V25.5192H22.3911ZM24.9263 17.9135V20.6902H27.8238V17.9135H24.9263ZM24.9263 17.9135V15.4989H20.0973V17.9135H24.9263Z"
                              fill="#09090B"
                            />
                            <path
                              d="M7.66243 22.8632H5.12717V17.9135H7.66243V13.2051H5.12717V15.4989H0.539551V12.8429H5.12717V10.3077H8.02461V12.8429H10.4391V10.6699H12.6122V8.01386H15.3889V5.72006H17.6827V10.3077H15.0268V12.8429H12.6122V15.4989L10.1977 15.7404V17.9135L12.6122 18.2756V20.6902H15.0268L15.3889 23.2254H17.6827V25.3985H20.4595V22.3803H17.6827V20.2073H15.3889V17.9135H18.2864V15.7404H15.3889V13.2051H18.2864V10.3077H25.1678V2.70189H18.2864V0.408081L39.5343 0.770261C53.6593 4.02988 50.279 16.5855 43.3975 17.4305V18.3964C57.0396 23.2254 48.3473 37.5919 40.3794 37.5919H22.6325V35.4188M7.66243 22.8632V20.2073H10.4391V22.8632M7.66243 22.8632V25.3985H10.1977M7.66243 22.8632H10.1977M10.4391 22.8632H10.1977M10.4391 22.8632H12.6122V25.1571M10.1977 25.3985V22.8632M10.1977 25.3985V30.3483H15.0268V33.125H12.6122V35.4188H15.0268V37.5919H20.0973V35.4188H22.6325M10.1977 25.3985H12.6122M22.6325 35.4188V32.7628H24.9263V30.3483H20.4595V33.125H17.6827V30.3483H20.0973V27.5716H25.1678V30.3483H28.0652M22.6325 35.4188H25.1678V32.7628H28.0652M28.0652 30.3483C28.0652 31.2912 28.0652 31.8199 28.0652 32.7628M28.0652 30.3483V22.2596C28.0652 22.2596 35.1926 22.3258 35.7917 22.2517C41.5866 21.5353 43.3975 30.3404 35.7917 30.3404L28.0652 30.3483ZM28.0652 30.3483V32.7628M24.9263 17.9135H20.0973V15.4989H24.9263V17.9135ZM24.9263 17.9135V20.6902H27.8238V17.9135H24.9263ZM12.6122 25.1571H15.0268V27.813H12.6122V25.3985M12.6122 25.1571V25.3985M27.5823 8.01386V15.4989H36.0332C39.0514 16.1026 42.0695 10.3077 36.8783 8.01386H27.5823ZM20.0973 8.01386H22.6325V5.35788H20.0973V8.01386ZM12.6122 15.7404H15.0268V17.9135H12.6122V15.7404ZM22.3911 22.3803V25.5192H25.1678V22.3803H22.3911Z"
                              stroke="black"
                              strokeWidth="0.241453"
                            />
                          </svg>
                        </div>
                        <div className="text-right text-xs mb-2">
                          <svg
                            width="50"
                            height="50"
                            viewBox="0 0 50 50"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M0 43.9655V37.931H12.069V50H0V43.9655ZM10.3448 43.9655V39.6552H1.72414V48.2759H10.3448V43.9655ZM3.44828 43.9655V41.3793H8.62069V46.5517H3.44828V43.9655ZM15.5172 49.1379V48.2759H13.7931V44.8276H15.5172V39.6552H17.2414V37.931H13.7931V36.2069H6.89655V34.4828H8.62069V32.7586H5.17241V36.2069H3.44828V34.4828H0V32.7586H3.44828V29.3103H1.72414V31.0345H0V27.5862H3.44828V29.3103H5.17241V31.0345H6.89655V29.3103H8.62069V31.0345H12.069V29.3103H10.3448V27.5862H5.17241V25.8621H10.3448V24.1379H5.17241V22.4138H3.44828V24.1379H0V18.9655H1.72414V20.6897H12.069V18.9655H10.3448V17.2414H6.89655V18.9655H5.17241V17.2414H1.72414V13.7931H5.17241V17.2414H6.89655V15.5172H10.3448V13.7931H12.069V15.5172H10.3448V17.2414H12.069V18.9655H13.7931V15.5172H15.5172V13.7931H13.7931V8.62069H17.2414V10.3448H18.9655V12.069H17.2414V13.7931H18.9655V24.1379H15.5172V22.4138H13.7931V24.1379H12.069V25.8621H10.3448V27.5862H12.069V29.3103H13.7931V31.0345H17.2414V29.3103H15.5172V27.5862H13.7931V25.8621H17.2414V29.3103H18.9655V25.8621H20.6897V29.3103H22.4138V24.1379H24.1379V22.4138H25.8621V24.1379H24.1379V25.8621H25.8621V27.5862H31.0345V25.8621H29.3103V24.1379H27.5862V20.6897H25.8621V18.9655H27.5862V17.2414H29.3103V15.5172H27.5862V13.7931H25.8621V17.2414H24.1379V15.5172H22.4138V17.2414H20.6897V15.5172H22.4138V13.7931H20.6897V8.62069H18.9655V6.89655H20.6897V8.62069H22.4138V1.72414H24.1379V5.17241H27.5862V3.44828H25.8621V0H29.3103V1.72414H27.5862V3.44828H31.0345V1.72414H32.7586V0H36.2069V5.17241H32.7586V3.44828H31.0345V6.89655H32.7586V12.069H34.4828V10.3448H36.2069V18.9655H39.6552V17.2414H37.931V13.7931H41.3793V18.9655H44.8276V17.2414H43.1034V13.7931H44.8276V17.2414H46.5517V15.5172H50V18.9655H48.2759V17.2414H46.5517V18.9655H44.8276V24.1379H46.5517V25.8621H44.8276V27.5862H41.3793V29.3103H39.6552V31.0345H36.2069V29.3103H34.4828V27.5862H32.7586V31.0345H34.4828V32.7586H39.6552V34.4828H43.1034V32.7586H41.3793V31.0345H43.1034V29.3103H44.8276V31.0345H46.5517V32.7586H48.2759V29.3103H46.5517V27.5862H50V32.7586H48.2759V36.2069H50V39.6552H48.2759V44.8276H50V46.5517H44.8276V50H39.6552V48.2759H43.1034V46.5517H39.6552V43.1034H37.931V46.5517H36.2069V48.2759H37.931V50H34.4828V44.8276H32.7586V48.2759H31.0345V46.5517H29.3103V39.6552H31.0345V44.8276H32.7586V39.6552H34.4828V36.2069H32.7586V34.4828H31.0345V32.7586H32.7586V31.0345H31.0345V29.3103H29.3103V36.2069H31.0345V37.931H27.5862V41.3793H25.8621V44.8276H27.5862V46.5517H25.8621V48.2759H29.3103V50H25.8621V48.2759H24.1379V46.5517H22.4138V50H15.5172V49.1379ZM20.6897 46.5517V44.8276H22.4138V39.6552H18.9655V41.3793H20.6897V43.1034H17.2414V44.8276H15.5172V46.5517H17.2414V48.2759H20.6897V46.5517ZM44.8276 44.8276V43.1034H46.5517V39.6552H48.2759V37.931H46.5517V32.7586H44.8276V37.931H46.5517V39.6552H44.8276V41.3793H43.1034V46.5517H44.8276V44.8276ZM36.2069 43.9655V43.1034H34.4828V44.8276H36.2069V43.9655ZM25.8621 40.5172V39.6552H24.1379V41.3793H25.8621V40.5172ZM41.3793 38.7931V36.2069H36.2069V41.3793H41.3793V38.7931ZM37.931 38.7931V37.931H39.6552V39.6552H37.931V38.7931ZM24.1379 37.069V36.2069H27.5862V34.4828H24.1379V32.7586H22.4138V34.4828H24.1379V36.2069H20.6897V34.4828H18.9655V36.2069H17.2414V34.4828H15.5172V32.7586H13.7931V31.0345H12.069V32.7586H10.3448V34.4828H12.069V32.7586H13.7931V34.4828H15.5172V36.2069H17.2414V37.931H24.1379V37.069ZM18.9655 31.8966V31.0345H17.2414V32.7586H18.9655V31.8966ZM27.5862 31.0345V29.3103H24.1379V31.0345H25.8621V32.7586H27.5862V31.0345ZM37.931 28.4483V27.5862H36.2069V29.3103H37.931V28.4483ZM41.3793 26.7241V25.8621H43.1034V20.6897H41.3793V22.4138H39.6552V24.1379H37.931V22.4138H34.4828V20.6897H32.7586V18.9655H34.4828V13.7931H32.7586V12.069H31.0345V10.3448H29.3103V12.069H27.5862V6.89655H29.3103V8.62069H31.0345V6.89655H29.3103V5.17241H27.5862V6.89655H25.8621V12.069H27.5862V13.7931H29.3103V12.069H31.0345V17.2414H29.3103V18.9655H27.5862V20.6897H29.3103V24.1379H31.0345V22.4138H34.4828V24.1379H36.2069V25.8621H39.6552V27.5862H41.3793V26.7241ZM39.6552 25V24.1379H41.3793V25.8621H39.6552V25ZM12.069 23.2759V22.4138H13.7931V20.6897H12.069V22.4138H10.3448V24.1379H12.069V23.2759ZM17.2414 19.8276V18.9655H15.5172V20.6897H17.2414V19.8276ZM17.2414 11.2069V10.3448H15.5172V12.069H17.2414V11.2069ZM24.1379 10.3448V8.62069H22.4138V12.069H24.1379V10.3448ZM34.4828 2.58621V1.72414H32.7586V3.44828H34.4828V2.58621ZM48.2759 49.1379V48.2759H50V50H48.2759V49.1379ZM48.2759 24.1379V22.4138H46.5517V20.6897H48.2759V22.4138H50V25.8621H48.2759V24.1379ZM0 6.03448V0H12.069V12.069H0V6.03448ZM10.3448 6.03448V1.72414H1.72414V10.3448H10.3448V6.03448ZM3.44828 6.03448V3.44828H8.62069V8.62069H3.44828V6.03448ZM37.931 6.03448V0H50V12.069H37.931V6.03448ZM48.2759 6.03448V1.72414H39.6552V10.3448H48.2759V6.03448ZM41.3793 6.03448V3.44828H46.5517V8.62069H41.3793V6.03448ZM13.7931 6.03448V5.17241H15.5172V6.89655H13.7931V6.03448ZM17.2414 4.31034V3.44828H15.5172V0H17.2414V1.72414H18.9655V0H20.6897V1.72414H18.9655V5.17241H17.2414V4.31034Z"
                              fill="black"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
