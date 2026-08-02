"use client";

import Link from "next/link";
import { usePrefetchAdminSection } from "@/hooks/usePrefetchAdminSection";
import {
  Users,
  Building2,
  Stethoscope,
  UserRound,
  Clock,
  CalendarRange,
  Calendar,
  CreditCard,
  Star,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

const sections: {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
}[] = [
  {
    label: "Users",
    description: "Manage accounts, roles, and verification.",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Clinics",
    description: "Create and update clinic locations.",
    href: "/admin/clinics",
    icon: Building2,
  },
  {
    label: "Specialties",
    description: "Manage medical specialties.",
    href: "/admin/specialties",
    icon: Stethoscope,
  },
  {
    label: "Doctors",
    description: "Manage doctor profiles and fees.",
    href: "/admin/doctors",
    icon: UserRound,
  },
  {
    label: "Schedules",
    description: "Define weekly availability per doctor.",
    href: "/admin/doctor-schedules",
    icon: Clock,
  },
  {
    label: "Slots",
    description: "Manage bookable appointment slots.",
    href: "/admin/appointment-slots",
    icon: CalendarRange,
  },
  {
    label: "Appointments",
    description: "Review and update all appointments.",
    href: "/admin/appointments",
    icon: Calendar,
  },
  {
    label: "Payments",
    description: "Review payment status and history.",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    label: "Reviews",
    description: "Moderate ratings and comments.",
    href: "/admin/reviews",
    icon: Star,
  },
  {
    label: "Patients",
    description: "Manage patient profiles.",
    href: "/admin/patients",
    icon: ClipboardList,
  },
];

export default function AdminDashboardPage() {
  const prefetchSection = usePrefetchAdminSection();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Manage every part of the clinic booking platform.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              onMouseEnter={() => prefetchSection(section.href)}
              onFocus={() => prefetchSection(section.href)}
              className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
            >
              <Card className="h-full transition-colors group-hover:border-primary/50 group-focus-visible:border-primary/50">
                <CardContent className="flex flex-col gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <CardTitle>{section.label}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
