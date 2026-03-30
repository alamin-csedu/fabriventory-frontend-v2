import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Construction, Home, ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Page not found | FABRIVENTORY",
}

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4] dark:opacity-[0.35]"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% -15%, oklch(0.55 0.14 240 / 0.18), transparent 55%), radial-gradient(ellipse 70% 50% at 100% 50%, oklch(0.55 0.08 200 / 0.1), transparent 45%), radial-gradient(ellipse 50% 40% at 0% 80%, oklch(0.6 0.06 280 / 0.08), transparent 50%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <div className="mx-auto w-full max-w-lg text-center">
          <div className="mb-8 inline-flex items-center justify-center rounded-2xl border border-border/80 bg-card/80 px-4 py-2 shadow-sm backdrop-blur-sm">
            <Construction className="mr-2 h-5 w-5 text-primary" strokeWidth={2} />
            <span className="text-sm font-medium tracking-wide text-muted-foreground">
              Under construction
            </span>
          </div>

          <p className="font-mono text-7xl font-bold tabular-nums tracking-tighter text-primary/90 sm:text-8xl">
            404
          </p>
          <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            This page isn&apos;t available yet
          </h1>
          <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            The feature you&apos;re looking for is still being built. Check back soon, or head back to
            your workspace.
          </p>

          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="gap-2 shadow-md">
              <Link href="/">
                <Home className="h-4 w-4" />
                Back to home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 border-border/80 bg-background/60 backdrop-blur-sm">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
