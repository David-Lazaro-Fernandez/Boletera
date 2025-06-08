"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, DollarSignIcon, TicketIcon, UsersIcon, TrendingUpIcon, DownloadIcon } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { MainLayout } from "@/components/layout/main-layout"

const chartData = [
  { month: "Jan", sales: 5200 },
  { month: "Feb", sales: 6000 },
  { month: "Mar", sales: 5800 },
  { month: "Apr", sales: 5500 },
  { month: "May", sales: 2200 },
  { month: "Jun", sales: 4200 },
  { month: "Jul", sales: 2800 },
  { month: "Aug", sales: 3800 },
  { month: "Sep", sales: 3200 },
  { month: "Oct", sales: 3400 },
  { month: "Nov", sales: 3600 },
  { month: "Dec", sales: 4400 },
]

const recentSales = [
  {
    name: "Pedro Fernandez",
    email: "pedro_239847@gmail.com",
    amount: "+$1,999.00",
  },
  {
    name: "Jack Sparrow",
    email: "jack_239847@gmail.com",
    amount: "+$39.00",
  },
  {
    name: "Pedro Pascal",
    email: "pedro_p7@gmail.com",
    amount: "+$299.00",
  },
  {
    name: "Nicolas Chavez",
    email: "nikoniko09@gmail.com",
    amount: "+$99.00",
  },
  {
    name: "Sofia Dalia",
    email: "sofila_mas@gmail.com",
    amount: "+$1,999.00",
  },
]

export default function Dashboard() {
  return (
    <MainLayout activePage="inicio">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4" />
            <span>Jan 20, 2023 - Feb 09, 2023</span>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Descargar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resumen" className="mb-6">
        <TabsList className="bg-white">
          <TabsTrigger value="resumen" className="data-[state=active]:bg-gray-100">
            Resumen
          </TabsTrigger>
          <TabsTrigger value="analitica">Analítica</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Ventas Totales</CardTitle>
                <DollarSignIcon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-green-600">+20.1% comparado al mes anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Boletos Vendidos</CardTitle>
                <TicketIcon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+2350</div>
                <p className="text-xs text-green-600">+180.1% comparado al mes anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Ventas</CardTitle>
                <UsersIcon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12,234</div>
                <p className="text-xs text-green-600">+19% comparado al mes anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Activos ahora</CardTitle>
                <TrendingUpIcon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-green-600">+201 en la última hora</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Recent Sales */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            {/* Chart */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ChartContainer
                  config={{
                    sales: {
                      label: "Ventas",
                      color: "#3B82F6",
                    },
                  }}
                  className="h-[350px]"
                >
                  <BarChart data={chartData}>
                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Recent Sales */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Ventas Recientes</CardTitle>
                <CardDescription>Vendiste 250 boletos este mes.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {recentSales.map((sale, index) => (
                    <div key={index} className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="/placeholder.svg?height=36&width=36" />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          <TicketIcon className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{sale.name}</p>
                        <p className="text-sm text-gray-500">{sale.email}</p>
                      </div>
                      <div className="ml-auto font-medium">{sale.amount}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  )
}
