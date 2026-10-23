import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Bell,
  Bookmark,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  Copy,
  Ellipsis,
  EllipsisVertical,
  Funnel,
  Heart,
  House,
  Image,
  Info,
  LogOut,
  Menu,
  MessageCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Share,
  Star,
  Trash2,
  TriangleAlert,
  User,
  X,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

/** 디자인 시스템 아이콘 이름 → Lucide 아이콘 (design.pen Iconography Foundation 기준) */
export const ICONS = {
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  "arrow-up": ArrowUp,
  "arrow-down": ArrowDown,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "chevron-up": ChevronUp,
  "chevron-down": ChevronDown,
  home: House,
  calendar: Calendar,
  copy: Copy,
  refresh: RefreshCw,
  logout: LogOut,
  close: X,
  menu: Menu,
  search: Search,
  filter: Funnel,
  sort: ArrowUpDown,
  plus: Plus,
  edit: Pencil,
  delete: Trash2,
  bookmark: Bookmark,
  share: Share,
  "more-horizontal": Ellipsis,
  "more-vertical": EllipsisVertical,
  check: Check,
  info: Info,
  warning: TriangleAlert,
  error: CircleAlert,
  user: User,
  settings: Settings,
  notification: Bell,
  heart: Heart,
  star: Star,
  comment: MessageCircle,
  image: Image,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export const ICON_SIZES = [16, 20, 24, 32] as const;

export type IconSize = (typeof ICON_SIZES)[number];

export type IconProps = Omit<LucideProps, "size" | "ref"> & {
  name: IconName;
  size?: IconSize;
};

/** 기본 색상은 currentColor. aria-label이 없으면 장식용으로 취급해 스크린리더에서 숨긴다. */
export const Icon = ({ name, size = 24, ...rest }: IconProps) => {
  const LucideComponent = ICONS[name];
  return <LucideComponent size={size} aria-hidden={rest["aria-label"] ? undefined : true} {...rest} />;
};
