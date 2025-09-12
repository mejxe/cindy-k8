
import { useState } from 'react';
import './Vote.css';
import type { Player, Vote } from '../../types/types';
import ClientPlayer from './ClientPlayer';
import { useWebSocket } from '../../hooks/useWebSocket';
import type { WSMessage, WSSingleVote } from '../../types/messageTypes';


export default function VotingModal({
  players,
  vote,
  me,
}: { players: Player[], vote: Vote, me: Player }) {
  const [selectedVote, setSelectedVote] = useState<number | null>(null);
  const hasVoted = vote.alreadyVoted.has(me.id)
  const showVoteFirstButton = true
  const websocket = useWebSocket()

  if (!vote.voteOn || vote.type == "syndicate") {
    return
  }

  const handleVote = (playerId: number) => {
    if (hasVoted) return;
    setSelectedVote(playerId);
    const msg: WSSingleVote = {
      type: "vote",
      body: { for: playerId }
    }
    websocket.sendMessage(msg)
  };

  const getVoteCount = (player: Player): number => {
    const votes = vote.votes.get(player.id)
    if (votes === undefined) {
      console.log("Cannot correctly index player in vote count")
      return 0
    }
    return votes
  }


  const getVotingClasses = (player: Player) => {
    let classes = 'voting-player-container';
    if (selectedVote === player.id) classes += ' selected';
    if (vote.currentlyVoting === player.id) classes += ' currently-voting';
    return classes;
  };
  const voteFirst = () => {
    const msg: WSMessage = {
      type: "voteFirst",
      body: null
    }
    websocket.sendMessage(msg)
  }
  return (
    <div className="voting-modal-overlay">
      <div className="voting-modal">
        <div className="voting-header">
          <h2>Let's Vote!</h2>
          <p>Choose wisely</p>
          {showVoteFirstButton && (
            <button
              className="vote-first-btn"
              onClick={voteFirst}
              disabled={hasVoted || vote.currentlyVoting !== null}
            >
              I want to vote first
            </button>
          )}
        </div>

        <div className="voting-content">
          <div className="players-voting-grid">
            {players.map((player) => (
              <div key={player.id} className={getVotingClasses(player)}>
                {ClientPlayer(player, me, null)}

                {getVoteCount(player) > 0 && (
                  <div className="vote-count">
                    {getVoteCount(player)}
                  </div>
                )}

                {player.alive && player.connected && (
                  <button
                    className={`vote-btn ${selectedVote === player.id ? 'voted' : ''}`}
                    onClick={() => handleVote(player.id)}
                    disabled={hasVoted || me.id !== vote.currentlyVoting}
                  >
                    {selectedVote === player.id ? 'VOTED' : 'VOTE'}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="voting-actions">
            {hasVoted && (
              <div className="vote-confirmation">
                {selectedVote ?
                  `You voted for ${players.find(p => p.id === selectedVote)?.firstName} ${players.find(p => p.id === selectedVote)?.lastName}` :
                  'You skipped this vote'
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

