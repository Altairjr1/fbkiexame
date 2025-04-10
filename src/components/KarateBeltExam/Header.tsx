
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuList, 
  NavigationMenuTrigger,
  NavigationMenuLink
} from '@/components/ui/navigation-menu';
import { BarChart3, FileText, Home, Plus, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="fixed w-full top-0 bg-background border-b z-10">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/"
            className="flex items-center mr-8 text-lg font-semibold tracking-tight"
          >
            <img
              src="/lovable-uploads/71435d9d-518a-4191-b618-373eeaa8782d.png"
              alt="FBKI Logo"
              className="h-10 w-10 mr-2 rounded-full object-cover"
            />
            <span className="hidden sm:inline">FBKI Exames</span>
          </Link>
          
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={cn(
                    "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                    location.pathname === '/' && "bg-accent/50"
                  )}
                >
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={cn(
                    "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                    location.pathname === '/exame' && "bg-accent/50"
                  )}
                >
                  <Link to="/exame">
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Novo Exame</span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={cn(
                    "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                    location.pathname === '/archive' && "bg-accent/50"
                  )}
                >
                  <Link to="/archive">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Arquivo</span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        {/* Mobile Navigation */}
        <div className="flex md:hidden">
          <Button variant="outline" size="icon" asChild>
            <Link to="/" className={location.pathname === '/' ? "bg-accent/50" : ""}>
              <Home className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild className="ml-2">
            <Link to="/exame" className={location.pathname === '/exame' ? "bg-accent/50" : ""}>
              <Plus className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild className="ml-2">
            <Link to="/archive" className={location.pathname === '/archive' ? "bg-accent/50" : ""}>
              <FileText className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="hidden sm:flex items-center gap-2">
          <Button variant="outline" size="sm">
            <User className="mr-2 h-4 w-4" />
            <span>Minha Conta</span>
          </Button>
          <Button variant="ghost" size="icon">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
