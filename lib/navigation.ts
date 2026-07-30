import { 
  LayoutDashboard, 
  User, 
  History, 
  LifeBuoy, 
  Store, 
  Package,
  Inbox,
  Send,
  Settings
} from "lucide-react";

export const NAVIGATION_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["store_owner", "store"]
  },
  {
    name: "Incoming Parcels",
    href: "/dashboard/incoming",
    icon: Inbox,
    roles: ["store"]
  },
  {
    name: "Inventory Vault",
    href: "/dashboard/inventory",
    icon: Package,
    roles: ["store"]
  },
  {
    name: "Outgoing Parcels",
    href: "/dashboard/outgoing",
    icon: Send,
    roles: ["store"]
  },
  {
    name: "Store Management",
    href: "/dashboard/stores",
    icon: Store,
    roles: ["store_owner"]
  },
  {
    name: "Past Booking",
    href: "/dashboard/booking_history",
    icon: History,
    roles: ["store"]
  },
  {
    name: "Booking Manager",
    href: "/dashboard/bookings",
    icon: History,
    roles: ["store_owner"]
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User,
    roles: ["store_owner", "store"]
  },
  {
    name: "Support",
    href: "/dashboard/support",
    icon: LifeBuoy,
    roles: ["store_owner", "store"]
  }
];
