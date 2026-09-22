import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { SHARED_CONFIG } from "@/features/shared";

const { ERROR } = SHARED_CONFIG.UI.LABELS;

/**
 * Generic error alert component.
 * Uses theme tokens via the destructive variant.
 * @param {Object} props
 * @param {string} [props.title] - Alert title.
 * @param {string} [props.message] - Descriptive error message.
 */
export function ErrorAlert({ 
  title = ERROR.TITLE, 
  message = ERROR.DESCRIPTION 
}) {
  return (
    <div className="p-6">
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          {message}
        </AlertDescription>
      </Alert>
    </div>
  );
}
