import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { toastApiError } from '@/lib/apiError'
import {
  addFirewallAllow,
  addFirewallBlock,
  deleteFirewallAllow,
  deleteFirewallBlock,
  fetchFirewallAllows,
  fetchFirewallBlocks,
} from '../lib/security-api'
import { SecurityShell } from './SecurityShell'

const BLOCK_TYPES = ['ip', 'cidr', 'ua'] as const

function BlockAllowForm({
  mode,
  onSubmit,
  pending,
}: {
  mode: 'block' | 'allow'
  onSubmit: (body: { type: string; value: string; reason?: string; note?: string; minutes?: number }) => void
  pending: boolean
}) {
  const { t } = useTranslation()
  const [type, setType] = useState<string>('ip')
  const [value, setValue] = useState('')
  const [extra, setExtra] = useState('')
  const [minutes, setMinutes] = useState('')

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-1">
        <Label>{t('security.col.type')}</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BLOCK_TYPES.map((bt) => (
              <SelectItem key={bt} value={bt}>
                {t(`security.blockType.${bt}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1 sm:col-span-2">
        <Label>{t('security.col.value')}</Label>
        <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="203.0.113.10" />
      </div>
      <div className="space-y-1">
        <Label>{mode === 'block' ? t('security.col.reason') : t('security.col.note')}</Label>
        <Input value={extra} onChange={(e) => setExtra(e.target.value)} />
      </div>
      {mode === 'block' ? (
        <div className="space-y-1">
          <Label>{t('security.col.minutes')}</Label>
          <Input
            type="number"
            min={0}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder={t('security.optional')}
          />
        </div>
      ) : null}
      <div className="flex items-end">
        <Button
          disabled={pending || !value.trim()}
          onClick={() =>
            onSubmit({
              type,
              value: value.trim(),
              ...(mode === 'block'
                ? { reason: extra, minutes: minutes ? Number(minutes) : undefined }
                : { note: extra }),
            })
          }
        >
          {mode === 'block' ? t('security.addBlock') : t('security.addAllow')}
        </Button>
      </div>
    </div>
  )
}

export default function SecurityFirewallBlockingPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()

  const blocksQ = useQuery({
    queryKey: ['security', 'firewall', 'blocks'],
    queryFn: fetchFirewallBlocks,
  })
  useQueryErrorToast(blocksQ)

  const allowsQ = useQuery({
    queryKey: ['security', 'firewall', 'allows'],
    queryFn: fetchFirewallAllows,
  })
  useQueryErrorToast(allowsQ)

  const addBlockM = useMutation({
    mutationFn: addFirewallBlock,
    onSuccess: () => {
      toast.success(t('security.blockAdded'))
      void qc.invalidateQueries({ queryKey: ['security', 'firewall', 'blocks'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const delBlockM = useMutation({
    mutationFn: deleteFirewallBlock,
    onSuccess: () => {
      toast.success(t('security.blockRemoved'))
      void qc.invalidateQueries({ queryKey: ['security', 'firewall', 'blocks'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const addAllowM = useMutation({
    mutationFn: addFirewallAllow,
    onSuccess: () => {
      toast.success(t('security.allowAdded'))
      void qc.invalidateQueries({ queryKey: ['security', 'firewall', 'allows'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  const delAllowM = useMutation({
    mutationFn: deleteFirewallAllow,
    onSuccess: () => {
      toast.success(t('security.allowRemoved'))
      void qc.invalidateQueries({ queryKey: ['security', 'firewall', 'allows'] })
    },
    onError: (e: Error) => toastApiError(t, e),
  })

  return (
    <div className="space-y-4">
      <SecurityShell />

      <Tabs defaultValue="blocks">
        <TabsList>
          <TabsTrigger value="blocks">{t('security.tabBlocks')}</TabsTrigger>
          <TabsTrigger value="allows">{t('security.tabAllows')}</TabsTrigger>
        </TabsList>

        <TabsContent value="blocks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('security.addBlock')}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <BlockAllowForm
                mode="block"
                pending={addBlockM.isPending}
                onSubmit={(body) => void addBlockM.mutateAsync(body)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('security.tabBlocks')}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {blocksQ.isPending ? (
                <Skeleton className="h-32 w-full" />
              ) : (blocksQ.data?.items ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('security.noBlocks')}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('security.col.type')}</TableHead>
                      <TableHead>{t('security.col.value')}</TableHead>
                      <TableHead>{t('security.col.reason')}</TableHead>
                      <TableHead>{t('security.col.source')}</TableHead>
                      <TableHead className="text-right">{t('security.col.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(blocksQ.data?.items ?? []).map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.type}</TableCell>
                        <TableCell className="font-mono text-xs">{row.value_text}</TableCell>
                        <TableCell>{row.reason || '—'}</TableCell>
                        <TableCell>{row.source}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={delBlockM.isPending}
                            onClick={() => void delBlockM.mutateAsync(row.id)}
                          >
                            {t('security.delete')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('security.addAllow')}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <BlockAllowForm
                mode="allow"
                pending={addAllowM.isPending}
                onSubmit={(body) => void addAllowM.mutateAsync(body)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('security.tabAllows')}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {allowsQ.isPending ? (
                <Skeleton className="h-32 w-full" />
              ) : (allowsQ.data?.items ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('security.noAllows')}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('security.col.type')}</TableHead>
                      <TableHead>{t('security.col.value')}</TableHead>
                      <TableHead>{t('security.col.note')}</TableHead>
                      <TableHead className="text-right">{t('security.col.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(allowsQ.data?.items ?? []).map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.type}</TableCell>
                        <TableCell className="font-mono text-xs">{row.value_text}</TableCell>
                        <TableCell>{row.note || '—'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={delAllowM.isPending}
                            onClick={() => void delAllowM.mutateAsync(row.id)}
                          >
                            {t('security.delete')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
