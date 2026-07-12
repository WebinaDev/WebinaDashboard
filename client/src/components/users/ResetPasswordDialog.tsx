import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { toastApiError } from '@/lib/apiError'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { apiFetch } from '@/lib/api'

type ResetPasswordDialogProps = {
  userId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResetPasswordDialog({ userId, open, onOpenChange }: ResetPasswordDialogProps) {
  const { t } = useTranslation()

  const resetMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; sent_email?: boolean }>(`users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ send_email: true }),
      }),
    onSuccess: () => {
      toast.success(t('users.resetEmailSent'))
      onOpenChange(false)
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('users.actionResetPassword')}</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          {t('users.resetEmailHint', { defaultValue: 'A reset link will be emailed to the user (recommended).' })}
        </p>
        <DialogFooter className="gap-2 sm:justify-start">
          <Button
            type="button"
            disabled={resetMutation.isPending}
            onClick={() => void resetMutation.mutateAsync()}
          >
            {t('users.resetSendEmail')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
