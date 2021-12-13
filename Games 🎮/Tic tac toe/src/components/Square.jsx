import React, { useState } from "react";

/**
 * Responsible to hanlde each square individually
 */
export const Square = ({
  canPlayGame,
  playerStatus,
  setPlayerStatus,
  boardState,
  setBoardState,
  index
}) => {
  const [value, setValue] = useState("");
  const [empty, setEmpty] = useState(true);
  const [color, setColor] = useState({});

  const handleTurn = () => {
    if (empty && canPlayGame) {
      setValue(playerStatus);
      handlePlayerStatus();
      handleColorStyle();
      setEmpty(false);

      //Edit the board state
      setBoardState(() => {
        var x = boardState;
        x[index] = playerStatus;
        return x;
      });
    }
  };

  const handlePlayerStatus = () => {
    if (playerStatus === "X") setPlayerStatus("O");
    else setPlayerStatus("X");
  };

  const handleColorStyle = () => {
    if (playerStatus === "X") setColor({ color: "#888" });
    else setColor({ color: "#f2ebd3" });
  };

  return (
    <button onClick={handleTurn} className="square" style={color}>
      {value}
    </button>
  );
};
