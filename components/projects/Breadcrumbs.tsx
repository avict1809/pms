"use client";
import { useRouter, usePathname } from "next/navigation";
import { ChevronRight, Home, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const router = useRouter();

  const handleClick = (href?: string) => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <nav className="flex items-center space-x-2 text-md text-neutral-400 mb-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleClick("/projects")}
        className="text-neutral-400 hover:text-white p-0 h-auto"
      >
        <Home className="w-4 h-4" />
      </Button>

      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-neutral-600" />
          {item.href ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleClick(item.href)}
              className="text-neutral-400 hover:text-white p-0 h-auto font-normal"
            >
              {item.icon && <span className="mr-1">{item.icon}</span>}
              {item.label}
            </Button>
          ) : (
            <span className="text-white font-medium">
              {item.icon && <span className="mr-1">{item.icon}</span>}
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
