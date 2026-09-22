import Link from 'next/link'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
      <FileQuestion className="h-12 w-12 text-muted-foreground" />
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Página no encontrada</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          La página que buscas no existe o fue movida.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  )
}
