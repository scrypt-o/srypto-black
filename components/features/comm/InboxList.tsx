'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import ListViewLayout, { type ListItem } from '@/components/layouts/ListViewLayout'

interface InboxListProps {
  items: Array<ListItem & { data?: any }>
  pageTitle?: string
  currentUserId: string
}

export default function InboxList({ items, pageTitle = 'Messages Inbox', currentUserId }: InboxListProps) {
  const router = useRouter()

  function handleItemClick(item: ListItem & { data?: any }) {
    const row = item.data || {}
    const userFrom = row.user_from as string | undefined
    const userTo = row.user_to as string | undefined
    const other = userFrom === currentUserId ? userTo : userFrom
    if (other) {
      router.push(`/patient/comm/messages/${other}`)
    }
  }

  return (
    <ListViewLayout
      items={items}
      pageTitle={pageTitle}
      searchPlaceholder="Search messages..."
      onItemClick={handleItemClick}
      showSecondaryLine={false}
      showInlineEdit={false}
    />
  )
}

