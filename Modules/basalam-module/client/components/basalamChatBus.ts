/** Event other dashboard surfaces (e.g. the booth page button) use to open the shared chat dock. */
export const BASALAM_CHAT_OPEN_EVENT = 'webino:basalam-chat-open'

/** Ask the dashboard-wide Basalam chat dock to open. */
export function openBasalamChat(): void {
  window.dispatchEvent(new CustomEvent(BASALAM_CHAT_OPEN_EVENT))
}
