/** xAI Grok card on the Models page (`settings.models.footer`), shaped like Codex Connect's. */

import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { QuotaView } from './quota-view.tsx'
import { XaiSettings } from './XaiSettings.tsx'
import { SettingsDialog } from './SettingsDialog.tsx'
import type { XaiOAuthSettingsKey } from './locales.ts'

const STATUS_PATH = '/plugins/dsh-grok-kit/auth/status'

type Status =
  | { status: 'loading' | 'signed-out' | 'signing-in' | 'error'; sharedGrokAuth?: boolean }
  | { status: 'signed-in'; models?: string[]; selected?: string[]; sharedGrokAuth?: boolean }

const secondary = { color: 'var(--dsw-alias-label-secondary, #888)', fontSize: 12, lineHeight: '18px' } as const
const button = {
  height: 32, padding: '0 14px', borderRadius: 8, cursor: 'pointer', font: 'inherit', fontSize: 13,
  border: '1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.3))', background: 'transparent', color: 'inherit',
} as const

export function GrokModelsCard({ t }: { t: (key: XaiOAuthSettingsKey) => string }): ReactNode {
  const [status, setStatus] = useState<Status>({ status: 'loading' })
  const [open, setOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(STATUS_PATH, { credentials: 'same-origin', headers: { accept: 'application/json' }, ...signal === undefined ? {} : { signal } })
      setStatus(response.ok ? await response.json() as Status : { status: 'error' })
    } catch {
      if (signal?.aborted !== true) setStatus({ status: 'error' })
    }
  }, [])
  useEffect(() => {
    const abort = new AbortController()
    void load(abort.signal)
    return () => { abort.abort() }
  }, [load])

  const signedIn = status.status === 'signed-in'
  useEffect(() => { if (!signedIn) setOpen(false) }, [signedIn])
  const shared = status.sharedGrokAuth === true
  const label = signedIn ? t(shared ? 'signedInShared' : 'signedIn')
    : status.status === 'loading' ? t('loadingAccount')
      : status.status === 'signing-in' ? t('signingIn')
        : status.status === 'error' ? t('requestFailed') : t('signedOut')
  const visible = status.status === 'signed-in' ? (status.selected ?? status.models ?? []).length : 0

  return (
    <div style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 12, padding: '12px 14px', color: 'var(--dsw-alias-label-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <span style={{ fontSize: 14, lineHeight: '22px', fontWeight: 500 }}>{t('modelsCardName')}</span>
        <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 4, background: signedIn ? '#16a34a' : status.status === 'error' ? '#dc2626' : 'var(--dsw-alias-label-secondary, #888)' }} />
        <span role="status" style={{ ...secondary, flex: 1 }}>{label}</span>
      </div>
      <div style={{ ...secondary, marginTop: 4 }}>{t('modelsCardPowered')}</div>
      {signedIn && <div style={{ fontSize: 13, marginTop: 12 }}>{visible} {t('modelsCardVisible')}</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {!signedIn && <button type="button" style={button} onClick={() => { setSettingsOpen(true) }}>{t('modelsCardSignIn')}</button>}
        {signedIn && <button type="button" style={button} aria-expanded={open} onClick={() => { setOpen(!open) }}>{open ? t('modelsCardHideQuota') : t('modelsCardViewQuota')}</button>}
        {signedIn && <button type="button" style={button} onClick={() => { setSettingsOpen(true) }}>{t('modelsCardManage')}</button>}
      </div>
      {open && signedIn && (
        <div style={{ borderTop: '1px solid var(--dsw-alias-border-l2)', marginTop: 12, paddingTop: 12 }}>
          <QuotaView t={t} signedIn />
        </div>
      )}
      <div style={{ ...secondary, marginTop: 12 }}>
        {t('modelsCardHelp')}{' '}
        <button type="button" onClick={() => { setSettingsOpen(true) }}
          style={{ padding: 0, border: 0, background: 'transparent', color: 'inherit', font: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}>{t('modelsCardMoreSettings')}</button>
      </div>
      {settingsOpen && (
        <SettingsDialog title={t('modelsCardName')} closeLabel={t('modelsCardClose')} onClose={() => { setSettingsOpen(false); void load() }}>
          <XaiSettings t={t} />
        </SettingsDialog>
      )}
    </div>
  )
}
