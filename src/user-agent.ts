// Single wire identity for every direct xAI call this plugin makes.
//
// The main chat/responses path runs through pi-ai, which sends its own
// User-Agent (`getPiUserAgent()`, e.g. "pi (darwin 27.2.0; arm64)") on each
// request. The auxiliary xAI calls in this plugin — web search, image
// generation, image edit, and video — used to send a hand-written
// `dsh-grok-kit/<ver>` string instead, which is a third-party tell: the same
// SuperGrok / X Premium OAuth token would reach api.x.ai under two different
// identities. Reusing pi-ai's User-Agent makes every request under the one
// token present a single, consistent identity, matching the rest of the
// plugin's traffic rather than standing out as a separate client.
import { getPiUserAgent } from '@earendil-works/pi-ai/utils/pi-user-agent'

/** The exact User-Agent pi-ai sends on the chat/responses path. */
export const GROK_WIRE_USER_AGENT = getPiUserAgent()
