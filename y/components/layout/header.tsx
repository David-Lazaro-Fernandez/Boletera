"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDownIcon, SearchIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, User, LogOut } from "lucide-react"
import Link from "next/link"

interface HeaderProps {
  activePage: string
}

export function Header({ activePage }: HeaderProps) {
  const navItems = [
    { name: "Inicio", href: "/" },
    { name: "Eventos", href: "/eventos" },
    { name: "Mapas De Asientos", href: "/mapas-asientos" },
    { name: "Ventas y Canales", href: "/ventas-canales" },
    { name: "Finanzas por Evento", href: "/finanzas" },
    { name: "Reportes y Exportación", href: "/reportes" },
    { name: "Imprimir Boleto", href: "/imprimir-boleto" },
    { name: "Prueba Boleto", href: "/prueba-boleto" },
  ]

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="flex h-16 items-center px-6">
        {/* User Dropdown Menu */}
        <div className="mr-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback className="bg-red-100 text-red-600">GG</AvatarFallback>
                </Avatar>
                <span className="font-medium text-gray-900">Gerardo Gamez</span>
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Mi perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Navigation */}
        <nav className="flex items-center space-x-6 flex-1 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                activePage === item.name.toLowerCase().replace(/\s+/g, "-")
                  ? "text-blue-600 font-medium border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              } pb-4 whitespace-nowrap`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Search and Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Buscar" className="pl-10 w-64" />
          </div>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback className="bg-red-100 text-red-600">GG</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
