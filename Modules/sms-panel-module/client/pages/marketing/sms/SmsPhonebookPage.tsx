import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Loader2, Send, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

import { SmsServiceBanner, isSmsUnavailable } from '@/components/marketing/SmsServiceBanner'
import { ScrollTable } from '@/components/ScrollTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { toastApiError } from '@/lib/apiError'
import {
  createSmsPhonebook,
  createSmsPhonebookContact,
  fetchSmsPhonebookContacts,
  fetchSmsPhonebooks,
  smsQueryOptions,
} from '@/lib/modirpayamak-api'

interface Phonebook {
  id: number
  name: string
}

export default function SmsPhonebookPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [newName, setNewName] = useState('')
  const [creatingBook, setCreatingBook] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Phonebook | null>(null)
  const [contactPhone, setContactPhone] = useState('')
  const [contactName, setContactName] = useState('')
  const [addingContact, setAddingContact] = useState(false)

  const booksQ = useQuery({
    queryKey: ['sms', 'phonebooks'],
    queryFn: fetchSmsPhonebooks,
    ...smsQueryOptions,
  })
  useQueryErrorToast(booksQ)

  const contactsQ = useQuery({
    queryKey: ['sms', 'phonebook-contacts', selectedBook?.id],
    queryFn: () => fetchSmsPhonebookContacts(selectedBook!.id),
    enabled: !!selectedBook,
    ...smsQueryOptions,
  })
  useQueryErrorToast(contactsQ)

  const unavailable = isSmsUnavailable(booksQ.data)
  const books: Phonebook[] = unavailable ? [] : (booksQ.data?.phonebooks ?? [])
  const contacts = contactsQ.data?.contacts ?? []

  const addBook = async () => {
    if (!newName.trim()) return
    setCreatingBook(true)
    try {
      await createSmsPhonebook(newName.trim())
      toast.success(t('common.saved'))
      setNewName('')
      void qc.invalidateQueries({ queryKey: ['sms', 'phonebooks'] })
    } catch (e) {
      toastApiError(t, e as Error)
    }
    setCreatingBook(false)
  }

  const addContact = async () => {
    if (!selectedBook || !contactPhone.trim()) return
    setAddingContact(true)
    try {
      await createSmsPhonebookContact(selectedBook.id, {
        phone: contactPhone.trim(),
        name: contactName.trim() || undefined,
      })
      toast.success(t('marketing.sms.contactAdded'))
      setContactPhone('')
      setContactName('')
      void qc.invalidateQueries({ queryKey: ['sms', 'phonebook-contacts', selectedBook.id] })
    } catch (e) {
      toastApiError(t, e as Error)
    }
    setAddingContact(false)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">{t('marketing.sms.phonebookTitle')}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t('marketing.sms.phonebookHint')}</p>
        </div>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/marketing/sms/send">{t('marketing.sms.send')}</Link>
        </Button>
      </div>

      {unavailable ? (
        <SmsServiceBanner message={booksQ.data?.message} onRetry={() => void booksQ.refetch()} />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('marketing.sms.newPhonebook')}</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                value={newName}
                disabled={unavailable}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void addBook()
                }}
              />
              <Button
                type="button"
                disabled={creatingBook || !newName.trim() || unavailable}
                onClick={() => void addBook()}
              >
                {creatingBook ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t('common.save')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('marketing.sms.phonebook')}</CardTitle>
              <CardDescription>{t('marketing.sms.phonebookDeleteUnavailable')}</CardDescription>
            </CardHeader>
            <CardContent>
              {booksQ.isPending ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }, (_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-md" />
                  ))}
                </div>
              ) : books.length === 0 ? (
                <p className="text-muted-foreground text-sm">{t('marketing.sms.noPhonebooks')}</p>
              ) : (
                <ScrollTable>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('marketing.sms.name')}</TableHead>
                        <TableHead>#</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {books.map((b) => (
                        <TableRow
                          key={b.id}
                          className={`cursor-pointer ${selectedBook?.id === b.id ? 'bg-muted' : ''}`}
                          onClick={() => setSelectedBook(b)}
                        >
                          <TableCell className="font-medium">{b.name}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{b.id}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollTable>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {!selectedBook ? (
            <Card>
              <CardContent className="text-muted-foreground py-8 text-center text-sm">
                {t('marketing.sms.selectPhonebook')}
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t('marketing.sms.contacts')} — {selectedBook.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <fieldset disabled={unavailable} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>{t('marketing.sms.contactPhone')}</Label>
                        <Input
                          className="mt-1"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="09..."
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <Label>{t('marketing.sms.contactName')}</Label>
                        <Input
                          className="mt-1"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      disabled={addingContact || !contactPhone.trim()}
                      onClick={() => void addContact()}
                    >
                      {addingContact ? (
                        <Loader2 className="me-2 h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="me-2 h-4 w-4" />
                      )}
                      {t('marketing.sms.addContact')}
                    </Button>
                  </fieldset>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('marketing.sms.contacts')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollTable>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('marketing.sms.contactPhone')}</TableHead>
                          <TableHead>{t('marketing.sms.contactName')}</TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contactsQ.isPending
                          ? Array.from({ length: 4 }, (_, i) => (
                              <TableRow key={i}>
                                <TableCell colSpan={3}>
                                  <Skeleton className="h-5 w-full" />
                                </TableCell>
                              </TableRow>
                            ))
                          : contacts.length === 0
                            ? (
                                <TableRow>
                                  <TableCell colSpan={3} className="text-muted-foreground text-sm">
                                    {t('marketing.sms.noContacts')}
                                  </TableCell>
                                </TableRow>
                              )
                            : contacts.map((c) => (
                                <TableRow key={c.id}>
                                  <TableCell className="font-mono" dir="ltr">
                                    {c.phone}
                                  </TableCell>
                                  <TableCell>{c.name ?? '—'}</TableCell>
                                  <TableCell className="text-end">
                                    <Button type="button" size="sm" variant="outline" asChild>
                                      <Link to="/marketing/sms/send" state={{ phone: c.phone }}>
                                        <Send className="me-1 h-3.5 w-3.5" />
                                        {t('marketing.sms.send')}
                                      </Link>
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                      </TableBody>
                    </Table>
                  </ScrollTable>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
