
import React from 'react';
import { Link } from 'react-router-dom';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { BarChart3, FileText, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const Header = () => {
  return (
    <header className="fixed w-full top-0 bg-background border-b z-10">
      <div className="container flex h-16 items-center">
        <Link
          to="/"
          className="flex items-center mr-8 text-lg font-semibold tracking-tight"
        >
          <img
            src="https://via.placeholder.com/40x40?text=FBKI"
            alt="Logo"
            className="h-8 w-8 mr-2"
          />
          FBKI Exames
        </Link>
        
        <NavigationMenu className="mx-auto">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/">
                <NavigationMenuLink
                  className={cn(
                    "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                  )}
                >
                  <Home className="mr-2 h-4 w-4" />
                  <span>Início</span>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link to="/archive">
                <NavigationMenuLink
                  className={cn(
                    "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                  )}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Exames</span>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
};

export default Header;
