import { NavLink, Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Boxes, Package, FileBarChart2, ShoppingCart, Users, Settings, Home, Store, Tags, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/products", label: "Products", icon: Package },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/suppliers", label: "Suppliers", icon: Truck },
  { to: "/purchases", label: "Purchases", icon: Boxes },
  { to: "/sales", label: "Sales", icon: ShoppingCart },
  { to: "/reports", label: "Reports", icon: FileBarChart2 },
  { to: "/users", label: "Users & Roles", icon: Users },
];

export default function AppLayout() {
  const { pathname } = useLocation();
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="p-3">
          <div className="flex items-center gap-2 px-1">
            <Store className="h-5 w-5 text-primary" />
            <span className="font-bold tracking-tight">SwiftStock</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={pathname === item.to}>
                      <NavLink to={item.to} className={cn("flex items-center gap-2")}> 
                        <item.icon />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <div className="p-3 text-xs text-muted-foreground">© {new Date().getFullYear()} SwiftStock</div>
      </Sidebar>
      <SidebarInset>
        <TopBar />
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function TopBar() {
  return (
    <div className="sticky top-0 z-40 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center gap-2 px-3 py-2 md:px-6">
        <SidebarTrigger />
        <div className="ml-1 flex-1 max-w-xl">
          <Input placeholder="Search products, suppliers, invoices..." />
        </div>
        <Button variant="ghost" size="icon" aria-label="Alerts"><Bell className="h-5 w-5" /></Button>
        <Button variant="default" size="sm">New Transaction</Button>
      </div>
    </div>
  );
}
