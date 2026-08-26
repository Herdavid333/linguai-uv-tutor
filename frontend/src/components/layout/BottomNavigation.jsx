"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  House,
  CircleUserRound,
  ChartNoAxesCombined,
} from "lucide-react";

export default function BottomNavigation() {
  const pathname = usePathname();

  const navigationByPage = {
    "/home": [
      {
        label: "My Profile",
        href: "/profile",
        icon: CircleUserRound,
      },
      {
        label: "My Progress",
        href: "/progress",
        icon: ChartNoAxesCombined,
      },
    ],

    "/profile": [
      {
        label: "Home",
        href: "/home",
        icon: House,
      },
      {
        label: "My Progress",
        href: "/progress",
        icon: ChartNoAxesCombined,
      },
    ],

    "/progress": [
      {
        label: "Home",
        href: "/home",
        icon: House,
      },
      {
        label: "My Profile",
        href: "/profile",
        icon: CircleUserRound,
      },
    ],
  };

  /*
   * Las subinterfaces de Progress:
   * Frequent Errors, Vocabulary y Activity History
   * siguen estando dentro de /progress, por lo que
   * usarán la misma navegación.
   */
  let currentPage = pathname;

  if (pathname.startsWith("/progress")) {
    currentPage = "/progress";
  }

  if (pathname.startsWith("/profile")) {
    currentPage = "/profile";
  }

  if (pathname.startsWith("/home")) {
    currentPage = "/home";
  }

  const items =
    navigationByPage[currentPage] ??
    navigationByPage["/home"];

  return (
    <nav
      className="
        shrink-0
        border-t
        border-black
        bg-[#b8b8b8]

        px-3
        py-2

        sm:px-4

        lg:px-6
        lg:py-2
      "
    >
      <div
        className="
          grid
          grid-cols-[1fr_1px_1fr]
          items-stretch
        "
      >
        {/* LEFT BUTTON */}
        <NavigationItem
          item={items[0]}
          pathname={pathname}
        />

        {/* VERTICAL DIVIDER */}
        <div
          className="
            my-1
            w-[3px]
            bg-white
          "
        />

        {/* RIGHT BUTTON */}
        <NavigationItem
          item={items[1]}
          pathname={pathname}
        />
      </div>
    </nav>
  );
}

function NavigationItem({
  item,
  pathname,
}) {
  if (!item) {
    return null;
  }

  const Icon = item.icon;

  const isActive =
    pathname === item.href;

  return (
    <Link
      href={item.href}
      className={`
        group
        flex
        min-h-[58px]
        items-center
        justify-center
        gap-3
        rounded-md
        px-3
        py-1
        transition-all
        duration-150

        hover:bg-white/30

        active:translate-y-[1px]
        active:scale-[0.98]

        ${
          isActive
            ? "bg-white/40"
            : ""
        }
      `}
    >
      <Icon
        className={`
          shrink-0
          transition-transform
          duration-150

          group-hover:scale-110

          ${
            isActive
              ? "text-red-600"
              : "text-black"
          }

          h-7
          w-7

          sm:h-8
          sm:w-8

          lg:h-9
          lg:w-9

          xl:h-10
          xl:w-10
        `}
        strokeWidth={2.5}
      />

      <span
        className={`
          font-extrabold

          text-[14px]

          sm:text-[15px]

          lg:text-[18px]

          xl:text-[20px]

          ${
            isActive
              ? "text-red-600"
              : "text-black"
          }
        `}
      >
        {item.label}
      </span>
    </Link>
  );
}