"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
  type MouseEvent,
} from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerEl: HTMLButtonElement | null;
  setTriggerEl: (el: HTMLButtonElement | null) => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

export function DropdownMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [triggerEl, setTriggerEl] = useState<HTMLButtonElement | null>(null);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerEl, setTriggerEl }}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ children, className }: { children: ReactNode; className?: string }) {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) throw new Error("DropdownMenuTrigger must be inside DropdownMenu");

  return (
    <button
      ref={(el) => { ctx.setTriggerEl(el); }}
      type="button"
      aria-haspopup="menu"
      aria-expanded={ctx.open}
      onClick={(e: MouseEvent) => { e.stopPropagation(); ctx.setOpen(!ctx.open); }}
      className={cn("inline-flex items-center", className)}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({ children, className, align = "end" }: { children: ReactNode; className?: string; align?: "start" | "end" }) {
  const ctx = useContext(DropdownMenuContext);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = useCallback(
    (e: MouseEvent | globalThis.MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        ctx?.triggerEl &&
        !ctx.triggerEl.contains(e.target as Node)
      ) {
        ctx.setOpen(false);
      }
    },
    [ctx],
  );

  useEffect(() => {
    if (!ctx?.open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") ctx.setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [ctx?.open, handleClickOutside, ctx]);

  if (!ctx?.open) return null;

  return (
    <div
      ref={menuRef}
      className={cn(
        "absolute z-50 mt-1 min-w-[12rem] rounded-lg border border-border bg-popover p-1 shadow-lg",
        align === "end" ? "right-0" : "left-0",
        className,
      )}
      role="menu"
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  onClick,
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const ctx = useContext(DropdownMenuContext);

  function handleClick() {
    if (disabled) return;
    onClick?.();
    ctx?.setOpen(false);
  }

  return (
    <button
      type="button"
      role="menuitem"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-foreground hover:bg-muted focus-visible:bg-muted focus-visible:outline-none disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 border-t border-border" />;
}
