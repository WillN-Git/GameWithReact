import { useState, useEffect, useRef } from "react";
import {
  Bodies,
  Body,
  Composite,
  Engine,
  Events,
  Render,
  Runner,
  World
} from "matter-js";
import _ from "lodash";

import neko from "./static/cat.png";
import cloudImage from "./static/cloud.png";

import "./styles.css";

export default function App() {
  //---- Hanging on the main elements
  const scene = useRef(null);
  const engine = useRef(Engine.create());
  const player = useRef(Body.create({}));

  //----- State
  const [isStart, setIsStart] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [score, setScore] = useState(0);

  //---- Mount the scene
  useEffect(() => {
    //Screen size
    const clientWidth = document.body.clientWidth;
    const clientHeight = document.body.clientHeight / 2;

    //Engine info
    const e = engine.current;

    let bodyElt: HTMLElement = document.body;

    if (scene.current) bodyElt = scene.current;
    else return () => {};

    //Define the playground
    const render = Render.create({
      element: bodyElt,
      engine: e,
      options: {
        width: clientWidth,
        height: clientHeight,
        background: cloudImage,
        wireframes: false
      }
    });

    //Define the boundaries
    Composite.add(e.world, [
      //Top
      Bodies.rectangle(clientWidth / 2, 10, clientWidth, 20, {
        isStatic: true,
        render: {
          fillStyle: "black"
        }
      }),
      //Bottom
      Bodies.rectangle(
        clientWidth / 2,
        clientHeight - 10,
        clientWidth * 2,
        20,
        {
          isStatic: true,
          render: {
            fillStyle: "black"
          }
        }
      ),
      //Left
      Bodies.rectangle(-50, clientHeight / 2, 5, clientHeight, {
        /**
         * Left bar cannot be see by the player
         * It just allows us to say if the player has lost or not
         */
        isStatic: true,
        render: {
          fillStyle: "black"
        }
      })
    ]);
    player.current = Bodies.rectangle(
      clientWidth / 2,
      clientHeight / 2,
      10,
      20,
      {
        render: {
          fillStyle: "white",
          sprite: {
            texture: neko,
            xScale: 0.05,
            yScale: 0.05
          }
        },
        friction: 0,
        frictionStatic: 0,
        frictionAir: 0
      }
    );

    Render.run(render);

    Composite.add(e.world, [player.current as Body]);

    //Responsible to store all visible platforms
    const platforms: Array<Body> = [];

    const possibleYPositions: Array<number> = [
      clientHeight - 25,
      clientHeight - 25,
      clientHeight / 3,
      clientHeight / 2,
      clientHeight / 1.5
    ];

    const gameLoop = setInterval(() => {
      //Choose a random position for the next platform
      const index: number = Math.floor(
        Math.random() * possibleYPositions.length
      );

      //Platform draw
      const platform = Bodies.rectangle(
        clientWidth + 100,
        possibleYPositions[index],
        100,
        25,
        {
          isStatic: true,
          friction: 0,
          frictionStatic: 0,
          frictionAir: 0,
          render: {
            lineWidth: 0
          }
        }
      );

      platforms.push(platform);
      Body.setVelocity(platform, { x: -100, y: 0 });
      Composite.add(e.world, [platform]);

      Body.setVelocity(player.current, {
        x: player.current.velocity.x / 10,
        y: player.current.velocity.y
      });

      //If neko is not on the screen, neko is dead
      if (player.current.position.x < 0) {
        setIsStart(false);
        setIsDead(true);
      }
    }, 700);

    const gameLoopPlayer = setInterval(() => {
      if (player.current.position.x < clientWidth * 0.45) {
        Body.setVelocity(player.current, {
          x: 1,
          y: player.current.velocity.y
        });
      } else if (player.current.position.x > clientWidth * 0.85) {
        Body.setVelocity(player.current, {
          x: -0.25,
          y: player.current.velocity.y
        });
      }
    }, 100);

    if (!isStart) {
      clearInterval(gameLoop);
      clearInterval(gameLoopPlayer);
    }

    Events.on(e, "beforeUpdate", () => {
      for (let platform of platforms) {
        if (platform.position.x < -50) {
          Composite.remove(e.world, platform);
        } else {
          Body.setVelocity(platform, { x: -1, y: 0 });
          Body.setPosition(platform, {
            x: platform.position.x - 1,
            y: platform.position.y
          });
        }
      }
      while (platforms.length > 0 && platforms[0].position.x < -50) {
        platforms.splice(0, 1);
      }
      Body.setAngularVelocity(player.current, 0);
    });

    //--------- Unmount the scene
    return () => {
      //Destroy matter
      Render.stop(render);
      Engine.clear(e);
      World.clear(e.world, false);
      Composite.clear(e.world, false);
      render.canvas.remove();
      render.textures = {};
      clearInterval(gameLoop);
    };
  }, [isStart]);

  useEffect(() => {
    let id: any;
    if (isStart) {
      id = setInterval(() => {
        setScore((score) => {
          return score + 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(id);
    };
  }, [isStart]);

  const wait = 500;
  const handleTinyDown = _.throttle(
    (e: { clientX: number; clientY: number }) => {
      const p = player.current;
      Body.applyForce(
        p,
        { x: p.position.x, y: p.position.y },
        { x: 0, y: -0.006 }
      );
    },
    wait
  );

  const handleStrongDown = _.throttle(
    (e: { clientX: number; clientY: number }) => {
      const p = player.current;
      Body.applyForce(
        p,
        { x: p.position.x, y: p.position.y },
        { x: 0, y: -0.008 }
      );
    },
    wait
  );

  return (
    <div className="App">
      <div className="score">{score}</div>
      <div className="playground" ref={scene} />
      <div className="control">
        {isStart ? (
          <>
            <div className="btn" onMouseDown={handleTinyDown}>
              Jump
            </div>
            <div className="btn" onMouseDown={handleStrongDown}>
              Jump Jump
            </div>
          </>
        ) : (
          <>
            {isDead ? (
              <div className="deadLogo">You Dead</div>
            ) : (
              <div
                className="btn"
                onClick={() => {
                  // run the engine
                  Runner.run(engine.current);

                  setIsStart(true);
                }}
              >
                Start
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
