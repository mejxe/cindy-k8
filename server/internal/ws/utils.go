package ws

import (
	"crypto/md5"
	"io/fs"
	"net/http"

	"github.com/mejxe/cindy-k8/internal/models"
)

func getIdentity(token string) *models.Player {
	// find identity based on provided user token
	for _, p := range players.Players {
		if p.Token == token {
			return p
		}
	}
	return nil
}
func VerifyGM(password string) bool {
	// true if password matches
	return md5.Sum([]byte(password)) == [16]byte(models.GlobalRoom.GameMaster.Password)
}

func SpaFileServer(fsys fs.FS) http.Handler {
	fileServer := http.FileServer(http.FS(fsys))

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path

		if _, err := fs.Stat(fsys, path[1:]); err != nil {
			r.URL.Path = "/"
		}

		fileServer.ServeHTTP(w, r)
	})
}
