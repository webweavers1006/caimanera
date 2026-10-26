'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Algo salió mal</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          Ocurrió un error inesperado. Por favor, intenta nuevamente.
        </p>
      </div>
      <Button onClick={() => reset()} variant="outline">
        Reintentar
      </Button>
    </div>
  )
}
