import { useContext, useState, type Dispatch, type SetStateAction } from "react"
import { AppContext } from "../../store/gamestate-context"
import "./RoleReveal.css"

export default function RoleReveal({ setRoleRevealed }: { setRoleRevealed: Dispatch<SetStateAction<boolean>> }) {
  const state = useContext(AppContext)
  const role = state.me?.syndicate ? "syndicate" : "citizen"
  const [shown, setShown] = useState(false)
  const buttonText = !shown ? "Show Role" : "Join game"
  return (
    <div>
      <h1>You are a <a className={`role-spoiler${shown ? ` ${role}` : " hidden"}`}>{role}</a>.</h1>
      <button onClick={() => {
        if (shown) {
          setRoleRevealed(true)
        }
        else {
          setShown(true)
        }
      }}>{buttonText}</button>
    </div>
  )
}
