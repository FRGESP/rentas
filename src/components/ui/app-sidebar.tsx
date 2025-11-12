"use client";
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";
import { logout } from "@/actions";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader
} from "@/components/ui/sidebar";

// Menu items.
const itemsAlmacen = [
  {
    title: "Pagos",
    url: "/users/cajero/pagos",
    icon: "/assets/administrador/Pagos.png",
    iconBold: "/assets/administrador/PagosAzul.png",
  },
];

const itemsAdmin = [
  {
    title: "Propiedades",
    url: "/users/administrador/propiedades",
    icon: "/assets/administrador/Propiedades.png",
    iconBold: "/assets/administrador/PropiedadesAzul.png",
  },
  {
    title: "Pagos",
    url: "/users/administrador/pagos",
    icon: "/assets/administrador/Pagos.png",
    iconBold: "/assets/administrador/PagosAzul.png",
  },
  {
    title: "Balance",
    url: "/users/administrador/balance",
    icon: "/assets/administrador/balance.png",
    iconBold: "/assets/administrador/balanceAzul.png",
  },
  {
    title: "Empleados",
    url: "/users/administrador/empleados",
    icon: "/assets/administrador/Empleados.png",
    iconBold: "/assets/administrador/EmpleadosVerde.png",
  },  
];

const itemsEntradas = [
  {
    title: "Guias",
    url: "/users/entradas/guias",
    icon: "/assets/Entradas/Guias.png",
    iconBold: "/assets/Entradas/GuiasVerde.png",
  },
  {
    title: "Corrales",
    url: "/users/entradas/corrales",
    icon: "/assets/Entradas/Corrales.png",
    iconBold: "/assets/Entradas/CorralesVerde.png",
  }
];

export function AppSidebar() {

  const pathname = usePathname();

  const [logoutaction, setLogout] = useState(false);

  const handleLogout = async () => {
    setLogout(true);
    await logout();
    setLogout(false);
  };

  const isEntradas = pathname.toString().substring(0,15) == "/users/entradas";
  const isadmin = pathname.toString().substring(0,12) == "/users/admin";
  const itemsChoice = isadmin ? itemsAdmin : isEntradas ? itemsEntradas : itemsAlmacen;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex flex-col justify-center items-center overflow-hidden">
          <img src="/assets/Login/Logo.webp" alt="" className="items-center w-20"/>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg">{isadmin ? "Administrador" : isEntradas ? "Entradas" : "Almacen"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {itemsChoice.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="my-2 hover:bg-[#ececec] mb-4 py-3">
                    <Link href={item.url}>
                      <img src={`${pathname == item.url ? item.iconBold : item.icon}`} alt="" className="w-7 h-auto" />
                      <span className={`${pathname == item.url ? 'text-navy font-bold' : ''} text-lg`} >{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:overflow-x-hidden">
        <SidebarMenuItem key={"logout"}>
          <SidebarMenuButton onClick={handleLogout} disabled={logoutaction} className="hover:bg-[#eeeeee] mb-4">
            <img src="/assets/login/logout.png" alt="" className="w-8 h-auto"/>
            <span className="overflow-hidden text-lg">{"Salir"}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}
