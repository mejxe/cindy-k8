package main

import (
	"bufio"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/mejxe/cindy-k8/internal/api"
	"github.com/mejxe/cindy-k8/internal/models"
	"github.com/mejxe/cindy-k8/internal/ws"
	"golang.org/x/net/websocket"
)

var reactDir = os.DirFS("../app/app/dist/")

func main() {
	port := ":8080"

	// TODO: Move
	scanner := bufio.NewScanner(os.Stdin)
	println("Create GM password for this session")
	scanner.Scan()
	password := scanner.Text()
	fmt.Printf("Your GM password is: %s\n", password)
	models.GlobalRoom.GameMaster = models.NewGM(password)

	fmt.Printf("Server started at localhost%s\n", port)
	go ws.HandleClientMessages()
	go ws.HandleGMMessages()
	go ws.HandleSending()
	models.GlobalRoom.Players.Lock()
	http.Handle("/", http.FileServerFS(reactDir))
	http.Handle("/create", http.HandlerFunc(api.HandleCreate))
	http.Handle("/ws", websocket.Handler(ws.HandleRoom))
	http.Handle("/gm", websocket.Handler(ws.HandleGmConnection))
	log.Fatal(http.ListenAndServe(port, nil))

}
