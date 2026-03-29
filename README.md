## Cindy-K8
A simple, self hosted party game based on Werewolf.
## Features
As of right now there are enough basic features to play a full game at a party.
- Based on the werewolf rules, so it's easy to understand.
- There are highlights for the GM of what he should do next.
- One player has to lead the game as the game master.
- There is a game master panel to control the game flow.
- Everything is synchronized across all the players.
- You can reconnect if you crash as a client, just refresh the webpage.
## How to play
Download the precompiled release or compile it yourself with go (you should compile the server/cmd/server/main.go).\
The machine you run it on is the host, and players will connect directly to it, so it's important for all of them 
to be on the same network.
- Run the executable.
- Create an admin password for the gm panel.
- Check your pc's ip.
- Players should connect to {your ip}:8080.
- Game Master should connect to {your ip}:8080/gm.
- When all the players connect, GM starts the game.
- GM manipulates the game flow (starts/ends the night, starts next round, commences votes).
- Game ends when there are no syndicate members (evil guys) or there are equal amount of citizens and syndicate members.
- Have fun.
## Technicalities
- Built with Golang + React.
- Supports only one game at a time per host (as it's a party game, duh).
- Self hosted on your local network.
- Backend serves the React SPA.
- Uses websockets for front to back communication.
It's more of a simple passion/practice project than anything farfetched, but it's functional.
