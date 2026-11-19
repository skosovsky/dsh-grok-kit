//

// Derived from dsh-xai (https://github.com/MirDie/dsh-xai), Apache-2.0.

// Modified for dsh-grok-kit — see NOTICE for the full attribution.

//

/** Browser half: xAI Grok account management inside dsh Settings. */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import { GrokModelsCard } from './models-card.tsx'
import type { XaiOAuthSettingsInjected } from './XaiSettings.tsx'
import { en, zh } from './locales.ts'
import type { XaiOAuthSettingsKey } from './locales.ts'
import { applyImagineViews } from './imagine-view.tsx'
import { applyVideoViews } from './video-view.tsx'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'settings.xai-oauth': XaiOAuthSettingsKey
  }
}

/** Host injects `slots` from dsh-client-ui-slots; we only need this surface. */
declare module '@deepseek-ai/cordis' {
  interface Context {
    slots: {
      inject(name: string, setup: () => (() => void) | void): void
      entries(name: string): readonly unknown[]
      register(
        spec: {
          name: string
          id?: string
          key?: string
          order?: number
          label?: () => string
          inject: () => unknown
        },
        component: unknown,
      ): () => void
    }
    /** Session bindings used by the imagine result views (structural view). */
    sessions: unknown
  }
}

export const name = 'dsh-grok-kit-client'
export const inject = ['slots', 'locale']

export function apply(ctx: Context): void {
  const namespace = 'settings.xai-oauth'
  ctx.effect(() => {
    try {
      return ctx.locale.register(namespace, { zh, en })
    } catch (error) {
      // Another bundle (e.g. an old dsh-xai) already registered this namespace;
      // reuse its copy rather than failing the client boot.
      console.warn('dsh-grok-kit: settings locale namespace already registered; reusing the existing copy.', error)
      return () => undefined
    }
  }, 'dsh-grok-kit: settings copy')
  const t = ctx.locale.bind(namespace) as XaiOAuthSettingsInjected['t']
  // A card on the Models page next to the built-in provider rows (the
  // `settings.models.footer` seat of dsh-client-ui-settings-models).
  ctx.slots.inject('settings.models.footer', () => ctx.slots.register({
    name: 'settings.models.footer',
    id: 'dsh-grok-kit-account',
    order: 115,
    inject: () => ({ t }),
  }, GrokModelsCard))

  // Session image views for grok_imagine / grok_imagine_edit, merged from
  // the former dsh-grok-imagine-ui companion plugin.
  applyImagineViews(ctx)
  applyVideoViews(ctx)
}
