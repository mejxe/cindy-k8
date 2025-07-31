import type { Dispatch, SetStateAction } from "react"

export default function CharacterForm({ setToken }: { setToken: Dispatch<SetStateAction<string | null>> }) {

  async function sendFormData(formData: FormData) {
    const params = new URLSearchParams()
    formData.forEach((value, key) => {
      params.append(key, value.toString())
    })
    const response =
      await fetch("http://localhost:8080/create", {
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
          <select id="mySelect" name="occupation">
            <option value="cleaner">Cleaner</option>
            <option value="shopkeeper">Shopkeeper</option>
            <option value="carpenter">Carpenter</option>
            <option value="goverment">Goverment official</option>
            <option value="nurse">Nurse</option>
            <option value="soldier">Soldier</option>

          </select>
        </fieldset>
      </div>
      <button>Join the game</button>
    </form>
  </>
}


