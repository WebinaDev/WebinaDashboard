import type { LucideIcon } from 'lucide-react'
import {
  BarChart2,
  Bot,
  Bell,
  Coffee,
  Circle,
  CircleDollarSign,
  FileText,
  Images,
  LayoutDashboard,
  LineChart,
  MessageSquare,
  Newspaper,
  Package,
  Percent,
  Puzzle,
  Settings,
  ShoppingBag,
  Shield,
  Sparkles,
  Store,
  User,
  Users,
  LifeBuoy,
} from 'lucide-react'

const MAP: Record<string, LucideIcon> = {
  'circle-dollar-sign': CircleDollarSign,
  'layout-dashboard': LayoutDashboard,
  newspaper: Newspaper,
  images: Images,
  'file-text': FileText,
  'shopping-bag': ShoppingBag,
  package: Package,
  store: Store,
  puzzle: Puzzle,
  percent: Percent,
  users: Users,
  user: User,
  'life-buoy': LifeBuoy,
  'bar-chart-2': BarChart2,
  'line-chart': LineChart,
  settings: Settings,
  bot: Bot,
  bell: Bell,
  'message-square': MessageSquare,
  sparkles: Sparkles,
  coffee: Coffee,
  shield: Shield,
}

export function moduleIcon(slug?: string): LucideIcon {
  if (!slug) return Circle
  return MAP[slug] ?? Circle
}
