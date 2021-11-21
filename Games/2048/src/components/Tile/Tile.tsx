import React, { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import { usePrevProps } from "../../hooks/usePrevProps";
import { useBoard } from "../Board";
import "./tile.less";

type Props = {
  //tile value => 2, 4, 8, ..., 2048
  value: number;
  //an array containing the x and y index on the board
  position: [number, number];
  //the order of tile on the tile stack
  zIndex: number;
};

/**
 * To create and merge tiles
 */
export const Tile = ({ value, position, zIndex }: Props) => {
  //retrieves board properties for the highlight animation
  //for the creation or the merge
  const [containerWidth, tileCount] = useBoard();

  const [scale, setScale] = useState(1);

  //the previous value (prop)
  //it is undefined if it is a new tile
  const previousValue = usePrevProps<number>(value);

  const withinBoardBoundaries =
    position[0] < tileCount && position[1] < tileCount;

  invariant(withinBoardBoundaries, "Tile out of bound");

  const isNew = previousValue === undefined, // if it is a new tile...
    hasChanged = previousValue !== value, // ...or its value has changed...
    shallHighlight = isNew || hasChanged; // ... then the tile should be highlighted.

  // useEffect will decide if highlight should be triggered
  useEffect(() => {
    if (shallHighlight) {
      setScale(1.1);
      setTimeout(() => setScale(1), 100);
    }
  }, [shallHighlight, scale]);

  /**
   * Converts tile position from array index to pixels.
   */
  const positionToPixels = (position: number) => {
    return (position / tileCount) * (containerWidth as number);
  };

  // all animations come from CSS transition, and we pass them as styles
  const style = {
    top: positionToPixels(position[1]),
    left: positionToPixels(position[0]),
    transform: `scale(${scale})`,
    zIndex
  };

  return (
    <div className={`tile tile-${value}`} style={style}>
      {value}
    </div>
  );
};
