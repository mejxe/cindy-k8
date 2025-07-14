package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/mejxe/cindy-k8/internal/handlers"
	"golang.org/x/net/websocket"
)

var reactDir = os.DirFS("../app/app/dist/")

func main() {
	port := ":8080"

	fmt.Printf("Server started at localhost%s\n", port)
	http.Handle("/", http.FileServerFS(reactDir))
	http.Handle("/create", http.HandlerFunc(handlers.HandleJoin))
	http.Handle("/ws", websocket.Handler(handlers.HandleRoom))
	http.Handle("/gm", websocket.Handler(handlers.HandleGmConnection))
	log.Fatal(http.ListenAndServe(port, nil))

}
