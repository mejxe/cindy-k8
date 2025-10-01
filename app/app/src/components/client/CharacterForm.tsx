import type { Dispatch, SetStateAction } from "react"
import "../../styles/form.css"
import GameSummary from "./GameSummary"
import type { GameSummary as GameSummaryHandle } from "../../types/types"

export default function CharacterForm({ setToken, gameSummary }:
  {
    setToken: Dispatch<SetStateAction<string | null>>,
    gameSummary: GameSummaryHandle
  }) {

  async function sendFormData(formData: FormData) {
    const params = new URLSearchParams()
    formData.forEach((value, key) => {
      params.append(key, value.toString())
    })

    const host = window.location.hostname === 'localhost'
      ? 'localhost'
      : window.location.hostname;

    const response =
      await fetch(`http://${host}:8080/create`, {
        method: "POST", headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }, body: params
      })
    const responseJson = await response.json()
    try {
      if (responseJson.body.token === undefined) {
        throw (new Error(responseJson.body.message))
      }
      setToken(responseJson.body.token)
    }
    catch (e) {
      console.log(e)
    }
  }

  return <>
    <form onSubmit={(e) => {

      e.preventDefault();
      sendFormData(new FormData(e.currentTarget));

    }} id="cform">
      <div className='options'>
        <fieldset>
          <legend className="name">First Name</legend>
          <input type="text" name='firstName'></input>
        </fieldset>
        <fieldset>
          <legend className="name">Last name</legend>
          <input type="text" name='lastName'></input>
        </fieldset>
        <fieldset>
          <legend id="selectLabel">Occupation</legend>
          <input type="text" name='occupation'></input>
        </fieldset>
      </div>
      <button>Join the game</button>
    </form>
    <GameSummary gameSummaryHandle={gameSummary} />
  </>
}


