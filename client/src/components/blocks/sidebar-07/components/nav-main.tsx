import { ChevronLeft, ChevronRight } from 'lucide-react'
import { memo, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation } from 'react-router-dom'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import type { Sidebar08MainNavItem } from '@/lib/nav-modules'

function pathIsActive(pathname: string, to: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/'
  if (to === '/') return p === '/'
  const t = to.replace(/\/$/, '')
  return p === t || p.startsWith(`${t}/`)
}

function activeGroupId(
  items: Sidebar08MainNavItem[],
  pathname: string,
): string | null {
  for (const item of items) {
    if (!item.items?.length) continue
    if (item.items.some((sub) => pathIsActive(pathname, sub.url))) {
      return item.id
    }
  }
  return null
}

function NavMainComponent({
  items,
  groupLabel,
}: {
  items: Sidebar08MainNavItem[]
  groupLabel?: string
}) {
  const { pathname } = useLocation()
  const { i18n } = useTranslation()
  const Chevron = i18n.dir() === 'rtl' ? ChevronLeft : ChevronRight

  const routeOpenId = useMemo(
    () => activeGroupId(items, pathname),
    [items, pathname],
  )

  const [openId, setOpenId] = useState<string | null>(
    () => routeOpenId,
  )

  useEffect(() => {
    setOpenId(routeOpenId)
  }, [routeOpenId])

  return (
    <SidebarGroup>
      {groupLabel ? <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel> : null}
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon
          const subItems = item.items

          if (!subItems?.length) {
            const active = pathIsActive(pathname, item.url)
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                  <NavLink to={item.url} end={item.url === '/'}>
                    <Icon />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          return (
            <SidebarMenuItem key={item.id}>
              <Collapsible
                open={openId === item.id}
                onOpenChange={(open) => {
                  setOpenId(open ? item.id : null)
                }}
                className="group/collapsible"
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    <Icon />
                    <span>{item.title}</span>
                    <Chevron className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {subItems.map((subItem) => {
                      const subActive = pathIsActive(pathname, subItem.url)
                      return (
                        <SidebarMenuSubItem key={subItem.id}>
                          <SidebarMenuSubButton asChild isActive={subActive} size="md">
                            <NavLink to={subItem.url}>
                              <span>{subItem.title}</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export const NavMain = memo(NavMainComponent)
