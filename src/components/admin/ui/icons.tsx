'use client'

// Ícones do CRM: Hugeicons com a mesma interface que o Lucide usava (size, className, strokeWidth),
// para todas as telas trocarem de biblioteca sem mudar nada além do import.

import type { ComponentProps } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  AiChat02Icon,
  Alert02Icon,
  AlertCircleIcon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowLeft02Icon,
  ArrowRight01Icon,
  ArrowRight02Icon,
  ArrowTurnBackwardIcon,
  Attachment01Icon,
  BubbleChatIcon,
  Calendar03Icon,
  Call02Icon,
  Cancel01Icon,
  ChartHistogramIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Copy01Icon,
  Delete02Icon,
  Dollar02Icon,
  Download04Icon,
  File02Icon,
  FilterHorizontalIcon,
  FilterIcon,
  FireIcon,
  Flag02Icon,
  Folder02Icon,
  Globe02Icon,
  HelpCircleIcon,
  InboxIcon,
  KanbanIcon,
  Link04Icon,
  LinkSquare02Icon,
  Loading03Icon,
  Login03Icon,
  Logout03Icon,
  Mail01Icon,
  Maximize02Icon,
  Menu02Icon,
  Message01Icon,
  Mic01Icon,
  MicOff01Icon,
  Minimize02Icon,
  MoreHorizontalIcon,
  MoreVerticalIcon,
  Notification03Icon,
  PauseIcon,
  PencilEdit02Icon,
  PlayIcon,
  Plug01Icon,
  PlugSocketIcon,
  PlusSignIcon,
  RefreshIcon,
  Search01Icon,
  SecurityBlockIcon,
  SecurityCheckIcon,
  SentIcon,
  Shield02Icon,
  ShoppingBag02Icon,
  SidebarLeft01Icon,
  SidebarLeftIcon,
  SidebarRight01Icon,
  SidebarRightIcon,
  SnowIcon,
  SparklesIcon,
  SquareLock02Icon,
  SquareUnlock02Icon,
  Table02Icon,
  ThumbsDownIcon,
  Tick02Icon,
  TickDouble02Icon,
  Unlink04Icon,
  UserAdd01Icon,
  UserCheck01Icon,
  UserIcon,
  UserRemove01Icon,
} from '@hugeicons/core-free-icons'

type IconData = ComponentProps<typeof HugeiconsIcon>['icon']
export type IconProps = Omit<ComponentProps<typeof HugeiconsIcon>, 'icon'>

function make(icon: IconData, name: string) {
  function Icon({ size = 16, strokeWidth = 1.6, ...props }: IconProps) {
    return <HugeiconsIcon icon={icon} size={size} strokeWidth={strokeWidth} aria-hidden {...props} />
  }
  Icon.displayName = name
  return Icon
}

export const AlertCircle = make(AlertCircleIcon, 'AlertCircle')
export const AlertTriangle = make(Alert02Icon, 'AlertTriangle')
export const ArrowLeft = make(ArrowLeft02Icon, 'ArrowLeft')
export const ArrowRight = make(ArrowRight02Icon, 'ArrowRight')
export const BarChart2 = make(ChartHistogramIcon, 'BarChart2')
export const Bell = make(Notification03Icon, 'Bell')
export const Bot = make(AiChat02Icon, 'Bot')
export const Calendar = make(Calendar03Icon, 'Calendar')
export const Check = make(Tick02Icon, 'Check')
export const CheckCheck = make(TickDouble02Icon, 'CheckCheck')
export const CheckCircle2 = make(CheckmarkCircle02Icon, 'CheckCircle2')
export const ChevronDown = make(ArrowDown01Icon, 'ChevronDown')
export const ChevronLeft = make(ArrowLeft01Icon, 'ChevronLeft')
export const ChevronRight = make(ArrowRight01Icon, 'ChevronRight')
export const Clock = make(Clock01Icon, 'Clock')
export const Copy = make(Copy01Icon, 'Copy')
export const DollarSign = make(Dollar02Icon, 'DollarSign')
export const Download = make(Download04Icon, 'Download')
export const ExternalLink = make(LinkSquare02Icon, 'ExternalLink')
export const FileText = make(File02Icon, 'FileText')
export const Filter = make(FilterHorizontalIcon, 'Filter')
export const Flag = make(Flag02Icon, 'Flag')
export const Flame = make(FireIcon, 'Flame')
export const FolderKanban = make(Folder02Icon, 'FolderKanban')
export const Globe = make(Globe02Icon, 'Globe')
export const HelpCircle = make(HelpCircleIcon, 'HelpCircle')
export const Inbox = make(InboxIcon, 'Inbox')
export const Kanban = make(KanbanIcon, 'Kanban')
export const Link2 = make(Link04Icon, 'Link2')
export const ListFilter = make(FilterIcon, 'ListFilter')
export const Loader2 = make(Loading03Icon, 'Loader2')
export const LoaderCircle = make(Loading03Icon, 'LoaderCircle')
export const Lock = make(SquareLock02Icon, 'Lock')
export const LogIn = make(Login03Icon, 'LogIn')
export const LogOut = make(Logout03Icon, 'LogOut')
export const Mail = make(Mail01Icon, 'Mail')
export const Maximize2 = make(Maximize02Icon, 'Maximize2')
export const Menu = make(Menu02Icon, 'Menu')
export const MessageCircle = make(BubbleChatIcon, 'MessageCircle')
export const MessageSquare = make(Message01Icon, 'MessageSquare')
export const Mic = make(Mic01Icon, 'Mic')
export const MicOff = make(MicOff01Icon, 'MicOff')
export const Minimize2 = make(Minimize02Icon, 'Minimize2')
export const MoreHorizontal = make(MoreHorizontalIcon, 'MoreHorizontal')
export const MoreVertical = make(MoreVerticalIcon, 'MoreVertical')
export const PanelLeftClose = make(SidebarLeft01Icon, 'PanelLeftClose')
export const PanelLeftOpen = make(SidebarLeftIcon, 'PanelLeftOpen')
export const PanelRightClose = make(SidebarRight01Icon, 'PanelRightClose')
export const PanelRightOpen = make(SidebarRightIcon, 'PanelRightOpen')
export const Paperclip = make(Attachment01Icon, 'Paperclip')
export const Pause = make(PauseIcon, 'Pause')
export const Pencil = make(PencilEdit02Icon, 'Pencil')
export const Phone = make(Call02Icon, 'Phone')
export const Play = make(PlayIcon, 'Play')
export const Plug = make(Plug01Icon, 'Plug')
export const Plus = make(PlusSignIcon, 'Plus')
export const RefreshCw = make(RefreshIcon, 'RefreshCw')
export const RotateCcw = make(ArrowTurnBackwardIcon, 'RotateCcw')
export const Search = make(Search01Icon, 'Search')
export const Send = make(SentIcon, 'Send')
export const ShieldAlert = make(Shield02Icon, 'ShieldAlert')
export const ShieldCheck = make(SecurityCheckIcon, 'ShieldCheck')
export const ShieldX = make(SecurityBlockIcon, 'ShieldX')
export const ShoppingBag = make(ShoppingBag02Icon, 'ShoppingBag')
export const Snowflake = make(SnowIcon, 'Snowflake')
export const Sparkles = make(SparklesIcon, 'Sparkles')
export const Table = make(Table02Icon, 'Table')
export const ThumbsDown = make(ThumbsDownIcon, 'ThumbsDown')
export const Trash2 = make(Delete02Icon, 'Trash2')
export const Unlink = make(Unlink04Icon, 'Unlink')
export const Unlock = make(SquareUnlock02Icon, 'Unlock')
export const Unplug = make(PlugSocketIcon, 'Unplug')
export const User = make(UserIcon, 'User')
export const UserCheck = make(UserCheck01Icon, 'UserCheck')
export const UserPlus = make(UserAdd01Icon, 'UserPlus')
export const UserX = make(UserRemove01Icon, 'UserX')
export const X = make(Cancel01Icon, 'X')
