import React, { useState, useEffect } from "react";

import { Board } from ".";

/**
 * Responsible to handle the whole game
 */
export const Game = () => {
  const [status, setStatus] = useState("X");
  const [winner, setWinner] = useState("");
  const [turns, setTurns] = useState(0);

  useEffect(() => {
    setTurns(turns + 1);
  }, [status]);

  return (
    <div id="main">
      <div className="game-info">
        <div class="player-turn"> Player {status}'s turn</div>

        <div class="winner">
          {winner !== "" ? (
            <div className="game-info">
              <div> Player {winner} won</div>
            </div>
          ) : turns > 9 ? (
            <div className="game-info">
              <div> Its a DRAW</div>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>

      <div className="game-wrapper">
        <div className="stick vertical first" />
        <div className="stick vertical second" />
        <div className="stick horizontal first" />
        <div className="stick horizontal second" />

        <div className="game-board">
          <Board
            playerStatus={status}
            setPlayerStatus={setStatus}
            setWinner={setWinner}
          />
        </div>
      </div>
    </div>
  );
};
