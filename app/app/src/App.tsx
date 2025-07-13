import './App.css'

export default function App() {

  return (<>
    <Header />
    <main>
      <CharacterForm />
    </main>
  </>)
}
function Header() {
  return <div id="header">
    <h1>Welcome to Cindy-K8</h1>
    <h2>Create your character</h2>
  </div>
}
function CharacterForm() {
  return <>
    <form id="cform">
      <label htmlFor="fname">First name</label>
      <input type="text" name='fname'></input>
      <label htmlFor="lname">Last name</label>
      <input type="text" name='lname'></input>
      <label htmlFor="occupation">Occupation</label>
      <select id="mySelect" name="occupation">
        <option value="cleaner">Cleaner</option>
        <option value="shopkeeper">Shopkeeper</option>
        <option value="carpenter">Carpenter</option>
        <option value="goverment">Goverment official</option>
        <option value="nurse">Nurse</option>
        <option value="soldier">Soldier</option>
      </select>
    </form>
  </>
}


