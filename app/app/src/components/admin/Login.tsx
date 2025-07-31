import type { Dispatch } from "react";
import { connectWSForGM } from "../../services/ws";

export default function Login({ setVerified, setWS }: { setVerified: Dispatch<boolean>, setWS: Dispatch<WebSocket | null> }) {
  const verifyGM = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: add verification 
    const formData = new FormData(e.currentTarget)
    const passw = formData.get('password')?.toString()
    if (passw != undefined && passw.length > 0)
      connectWSForGM(passw, setVerified, setWS)
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
