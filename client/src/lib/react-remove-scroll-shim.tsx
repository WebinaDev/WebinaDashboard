import * as React from "react"
// Relative import so Vite's `react-remove-scroll` → shim alias does not recurse.
import { RemoveScroll as BaseRemoveScroll } from "../../node_modules/react-remove-scroll"

import { useAllowBodyScroll } from "@/lib/remove-scroll-gate"

type RemoveScrollProps = React.ComponentProps<typeof BaseRemoveScroll>

const RemoveScroll = React.forwardRef<HTMLElement, RemoveScrollProps>(
  function RemoveScrollShim(props, ref) {
    const allowBodyScroll = useAllowBodyScroll()
    const enabled = allowBodyScroll ? false : props.enabled !== false
    return <BaseRemoveScroll {...props} ref={ref} enabled={enabled} />
  }
) as typeof BaseRemoveScroll

RemoveScroll.classNames = BaseRemoveScroll.classNames

export { RemoveScroll }
export default RemoveScroll
