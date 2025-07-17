package models_test

import (
	"github.com/mejxe/cindy-k8/internal/models"
	"testing"
)

func TestVoter_Add(t *testing.T) {
	t.Run("Test Add", func(t *testing.T) {
		examplePlayer := models.Player{Id: 0}
		examplePlayer2 := models.Player{Id: 1}
		examplePlayer3 := models.Player{Id: 2}
		voters := models.Voter{Identity: &examplePlayer, VotedFor: nil, NextV: nil}
		voters.Add(&examplePlayer2)
		voters.Add(&examplePlayer3)
		println(voters.Identity.Id)
		voters.Next()
		println(voters.Identity.Id)
	})
}
