import * as React from "react"

/**
 * When `allowBodyScroll` is true, the react-remove-scroll shim keeps page
 * wheel/touch scrolling enabled (used by Select; Dialog/Sheet stay locked).
 */
const RemoveScrollGateContext = React.createContext(false)

export function RemoveScrollGate({
  allowBodyScroll,
  children,
}: {
  allowBodyScroll: boolean
  children: React.ReactNode
}) {
  return (
    <RemoveScrollGateContext.Provider value={allowBodyScroll}>
      {children}
    </RemoveScrollGateContext.Provider>
  )
}

export function useAllowBodyScroll() {
  return React.useContext(RemoveScrollGateContext)
}
