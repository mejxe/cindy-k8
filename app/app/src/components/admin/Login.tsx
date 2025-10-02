import type { Dispatch, SetStateAction } from "react";
import { connectWSForGM } from "../../services/GMWS.ts";
import type { GameState, Vote } from "../../types/types";

export default function Login({ setVerified, setWS, setGameState, gameState, setVote }:
  {
    setVerified: Dispatch<boolean>,
    setWS: Dispatch<WebSocket | null>,
    setGameState: Dispatch<GameState>,
    gameState: GameState,
    setVote: Dispatch<SetStateAction<Vote>>
  }) {

  const verifyGM = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget)
    const passw = formData.get('password')?.toString()
    if (passw != undefined && passw.length > 0)
      connectWSForGM(passw, setVerified, setWS, setGameState, gameState, setVote)
  }

  return (<div id="login">
    <h1 id="verify" className="gold">Verify yourself</h1>
    <form onSubmit={verifyGM} id="cform">
      <div className='options'>
        <fieldset>
          <legend className="name">password</legend>
          <input type="text" name='password'></input>
        </fieldset>
      </div>
      <button>Login</button>
    </form>
  </div>)
}
