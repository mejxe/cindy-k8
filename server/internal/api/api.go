package api

import (
	"encoding/json"
	"net/http"

	"github.com/mejxe/cindy-k8/internal/logging"
	"github.com/mejxe/cindy-k8/internal/models"
)

func HandleCreate(w http.ResponseWriter, r *http.Request) {
	// endpoint for handling creation of characters
	logging.Info.Printf("Server got a hit: %s\n", r.URL.Path)
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", 403)
		return
	}
	if models.GlobalRoom.GameState.Started {
		http.Error(w, "Game has already started", 403)
		return
	}
	r.ParseForm()

	if len(r.Form.Get("firstName")) == 0 || len(r.Form.Get("lastName")) == 0 || len(r.Form.Get("occupation")) == 0 {
		json.NewEncoder(w).Encode(models.NewError("Incorrect form data."))
		return
	}
	var player *models.Player = &models.Player{
		Id:         len(models.GlobalRoom.Players.Players),
		FirstName:  r.Form.Get("firstName"),
		LastName:   r.Form.Get("lastName"),
		Occupation: r.Form.Get("occupation"),
		Syndicate:  false,
		Alive:      true,
		Connection: nil,
		Token:      generateToken(),
	}
	models.GlobalRoom.Players.Players[player.Id] = player
	msg := map[string]any{
		"status": "ok",
		"token":  player.Token,
	}
	json.NewEncoder(w).Encode(models.NewServerMessage(models.ServerMessageToken, msg))
	logging.Success.Printf("Succesfully created a character, sending: %s\n", msg)
}
