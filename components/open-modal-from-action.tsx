"use client"

import { Suspense, useEffect, useRef } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

/**
 * When URL has `?action=<action>`, runs `onOpen` once and strips the query via `router.replace`.
 * Use inside `<Suspense fallback={null}>` (required for `useSearchParams` in Next.js App Router).
 */
function OpenModalFromActionInner({
  action,
  onOpen,
}: {
  action: string
  onOpen: () => void
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const onOpenRef = useRef(onOpen)
  onOpenRef.current = onOpen

  useEffect(() => {
    if (searchParams.get("action") !== action) return
    onOpenRef.current()
    router.replace(pathname, { scroll: false })
  }, [searchParams, router, pathname, action])

  return null
}

export function OpenModalFromAction(props: { action: string; onOpen: () => void }) {
  return (
    <Suspense fallback={null}>
      <OpenModalFromActionInner {...props} />
    </Suspense>
  )
}
