import { useState } from "react"
import Login from "./Login"

export default function GMPanel() {
  const [verified, setVerified] = useState(false)
  const [ws, setWS] = useState<WebSocket | null>(null)
  const toRender = () => {
    switch (verified) {
      case true: {
        // TODO: ADD GM PANEL
        return (<>
          <h1>Verified GM Panel</h1>
        </>)
      }
      case false: {
        return (<>
          <Login setVerified={setVerified} setWS={setWS} />
        </>)
      }
    }
  }
  return (<>
    {toRender()}
  </>)

}
