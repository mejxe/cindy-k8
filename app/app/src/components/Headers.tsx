import { States, type StateKeys } from "../types/types";

export default function Header({ state }: { state: StateKeys }) {
  const secondParagraph = () => {
    switch (state) {
      case States.CharacterCreation: return <h2>Create your character</h2>;
      case States.Lobby: return <h2>Wait for the game to start...</h2>
      case States.Results: return <h2>Join the next game!</h2>

    }
  }
  return <div id="header">
    <h1>Welcome to <a id='cindy'>Cindy-K8</a></h1>
    {secondParagraph()}

  </div>
}
