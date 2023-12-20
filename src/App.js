// import logo from './logo.svg';
import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import "./redBlocks";
import { socket } from "./socket";
// import './App.css';

import villa from "./img/version12-a.png";
import foregroundImage from "./img/version12fb.png";
import playerDownImage from "./img/playerDown.png";
import playerUpImage from "./img/playerUp.png";
import playerLeftImage from "./img/playerLeft.png";
import playerRightImage from "./img/playerRight.png";
import petLeftImage from "./img/petLeft.png";
import petRightImage from "./img/petRight.png";
import petUpImage from "./img/petUp.png";
import petDownImage from "./img/petDown.png";
import directionPointerImage from "./img/directionPointer.png";
import { redBlocks } from "./redBlocks";

export default function App() {
  //use refs

  // canvas useRef
  const canvasRef = useRef(null);
  //const intervalRef = useRef(null);

  // images import
  const foreground = new Image();
  foreground.src = foregroundImage;
  const playerDown = new Image();
  playerDown.src = playerDownImage;
  const playerUp = new Image();
  playerUp.src = playerUpImage;
  const playerLeft = new Image();
  playerLeft.src = playerLeftImage;
  const playerRight = new Image();
  playerRight.src = playerRightImage;
  const stage = new Image();
  stage.src = villa;
  const petLeft = new Image();
  petLeft.src = petLeftImage;
  const petRight = new Image();
  petRight.src = petRightImage;
  const petUp = new Image();
  petUp.src = petUpImage;
  const petDown = new Image();
  petDown.src = petDownImage;
  const directionPointer = new Image();
  directionPointer.src = directionPointerImage;

  // USE STATES
  // const [canvasWidth] = useState(1024);
  const [canvasWidth] = useState(2048);
  // const [canvasHeight] = useState(576);
  const [canvasHeight] = useState(1152);
  const [seconds, setSeconds] = useState(0);
  const [frames, setFrames] = useState(0);
  const [animationFrame, setAnimationFrame] = useState(1);
  const [keyLog, setKeyLog] = useState(["s"]);
  const [offsetX, setOffsetX] = useState(-190);
  const [offsetY, setOffsetY] = useState(-290);
  const [speed, setSpeed] = useState(3);
  const [keyW, setKeyW] = useState(false);
  const [keyA, setKeyA] = useState(false);
  const [keyS, setKeyS] = useState(false);
  const [keyD, setKeyD] = useState(false);
  const [animate, setAnimate] = useState({
    player: false,
    episode: false,
    foreground: false,
    pet: false,
  });

  const [playerSprite, setPlayerSprite] = useState(playerDown);
  const [petSprite, setPetSprite] = useState(petDown);
  const [petOffset, setPetOffset] = useState([
    { x: -48, y: 0, storedSprite: playerDown },
  ]);

  const centerX = canvasWidth / 2 - 192 / 4 / 2;
  const centerY = canvasHeight / 2 - 68 / 2;
  const [isConnected, setIsConnected] = useState(socket.connected);

  // CONSTRUCTORS

  class SpritePlayer {
    constructor({ image, x, y, width, height, frames = { max: 1 } }) {
      this.image = image;
      this.x = x;
      this.y = y - 24;
      this.width = this.image.width / 4;
      this.height = this.image.height;
      this.frames = { ...frames, val: 0 };
      if (animate.player) {
        //console.log(animate.player)
        this.frames.val = animationFrame;
      } else {
        this.frames.val = 0;
      }
    }
    draw() {
      const ctx = canvasRef.current.getContext("2d");
      ctx.drawImage(
        this.image,
        this.frames.val * (this.image.width / this.frames.max),
        0,
        this.width, //
        this.height,
        this.x,
        this.y,
        this.image.width / this.frames.max,
        this.image.height
      );
    }
  }
  class SpritePet {
    constructor({ image, x, y, frames = { max: 1 } }) {
      this.image = image;
      this.x = x + petOffset[petOffset.length - 1].x;
      this.y = y + petOffset[petOffset.length - 1].y - 24;
      this.frames = { ...frames, val: 0 };
      if (animate.player) {
        this.frames.val = animationFrame;
      } else {
        this.frames.val = 0;
      }
    }
    draw() {
      const ctx = canvasRef.current.getContext("2d");
      ctx.drawImage(
        this.image,
        this.frames.val * (this.image.width / this.frames.max),
        0,
        this.image.width / this.frames.max, //
        this.image.height,
        this.x,
        this.y,
        this.image.width / this.frames.max,
        this.image.height
      );
    }
  }
  class Stage {
    constructor({ image, x, y }) {
      this.image = image;
      this.x = x;
      this.y = y;
    }
    draw() {
      const ctx = canvasRef.current.getContext("2d");
      ctx.drawImage(this.image, this.x, this.y);
    }
  }
  class RedBlock {
    constructor({ x, y }) {
      //this.image = image;
      this.x = x;
      this.y = y;
      this.width = 48;
      this.height = 48;
    }
    draw() {
      const ctx = canvasRef.current.getContext("2d");
      ctx.fillStyle = "rgba(255, 0, 0, 0)";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
  //   constructor({ x, y }) {
  //     //this.image = image;
  //     this.x = x;
  //     this.y = y;
  //     this.width = 48;
  //     this.height = 48;
  //   }
  //   draw() {
  //     const ctx = canvasRef.current.getContext("2d");
  //     ctx.fillStyle = "rgba(0, 0, 255, 0)";
  //     ctx.fillRect(this.x, this.y, this.width, this.height);
  //   }
  // }

  // IMAGES

  const episode1 = new Stage({
    image: stage,
    x: offsetX,
    y: offsetY,
  });

  const player = new SpritePlayer({
    image: playerSprite,
    x: canvasWidth / 2 - 192 / 4 / 2,
    y: canvasHeight / 2 - 68 / 2,
    frames: { max: 4 },
  });

  const pet = new SpritePet({
    image: petSprite,
    x: centerX,
    y: centerY,
    frames: { max: 4 },
  });

  const episode1Foreground = new Stage({
    image: foreground,
    x: offsetX,
    y: offsetY,
  });

  // seconds timer

  useEffect(() => {
    setTimeout(() => {
      setSeconds((seconds) => seconds + 1);
    }, 1000);
  }, [seconds]);

  // set frames counter to set all the states
  useEffect(() => {
    setTimeout(() => {
      setFrames((frames) => frames + 1);
    }, 160);
  });

  // set animation frames timer (could rework to a different animation timer) fixed animation timer for now
  useEffect(() => {
    if (frames % 4 === 0) {
      if (animationFrame > 2) {
        setAnimationFrame(0);
      } else if (animationFrame >= 0) {
        setAnimationFrame((animationFrame) => animationFrame + 1);
      }
    }
  }, [frames]);

  // event listeners to keys
  useEffect(() => {
    const handleKeyDown = (event) => {
      //console.log(petOffset[petOffset.length-25])

      // console.log("x: "+Math.floor(offsetX/48))
      // console.log("y: "+Math.floor(offsetY/48))

      //  console.log("Keycode es " + event.keyCode);
      //  console.log("Event es " + event.code);
      switch (event.code) {
        case "ArrowUp":
          setKeyW(true);
          setAnimate({ player: true });
          let arrW = keyLog;
          arrW.push("w");
          setKeyLog(arrW);
          break;
        case "ArrowLeft":
          setKeyA(true);
          setAnimate({ player: true });
          let arrA = keyLog;
          arrA.push("a");
          setKeyLog(arrA);
          break;
        case "ArrowDown":
          setKeyS(true);
          setAnimate({ player: true });
          let arrS = keyLog;
          arrS.push("s");
          setKeyLog(arrS);
          break;
        case "ArrowRight":
          setKeyD(true);
          setAnimate({ player: true });
          let arrD = keyLog;
          arrD.push("d");
          setKeyLog(arrD);
          break;
        default:
        // do nothing
      }
    };
    const handleKeyUp = (event) => {
      switch (event.code) {
        case "ArrowUp":
          setKeyW(false);
          setAnimate({ player: false });
          break;
        case "ArrowLeft":
          setKeyA(false);
          setAnimate({ player: false });
          break;
        case "ArrowDown":
          setKeyS(false);
          setAnimate({ player: false });
          break;
        case "ArrowRight":
          setKeyD(false);
          setAnimate({ player: false });
          break;
        default:
        // do nothing
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [frames]);

  // draw canvas and move character. better to separate in different canvas
  useEffect(() => {
    //const c = canvasRef.current.getContext("2d");
    episode1.draw();
    if (petOffset[petOffset.length - 1].y > 24) {
      player.draw();
      pet.draw();
    } else {
      pet.draw();
      player.draw();
    }
    episode1Foreground.draw(); // ATTENTION!!! ACTIVATE FOR FOREGROUND DO NOT FORGET!

    // RedBlock mapping
    const redBlocksData = [];
    for (let i = 0; i < redBlocks.length; i += 140) {
      //for (let i = 0; i < redBlocks.length; i += 70) {
      redBlocksData.push(redBlocks.slice(i, 140 + i)); //redBlocksData.push(redBlocks.slice(i, 70 + i));
    }
    const redBlocksMap = [];
    redBlocksData.forEach((row, i) => {
      row.forEach((Symbol, j) => {
        if (Symbol === 1025) {
          //console.log(j*48+offsetX)
          redBlocksMap.push(
            new RedBlock({ x: j * 48 + offsetX, y: i * 48 + offsetY })
          );
        }
      });
    });
    // Draw RedBlockMap
    redBlocksMap.forEach((bloq) => {
      bloq.draw();
    });
    // bloque.draw()

    // Draw mouseBlock
    // if (click) {
    //   mouse.draw();
    // }

    // colission detection of rectangles function
    function collisionDetector({ rectangle1, rectangle2 }) {
      return (
        rectangle1.x - speed + rectangle1.width >= rectangle2.x && // Player right collision
        rectangle1.x + speed <= rectangle2.x + rectangle2.width && // Player left collision
        rectangle1.y + speed + 20 <= rectangle2.y + rectangle2.height && // Player top collision
        rectangle1.y - speed + rectangle1.height >= rectangle2.y // Player down collision
      );
    }

    //console.log(player.height)
    // moving detection
    let moving = true;
    //console.log(keyLog[keyLog.length-1])

    //console.log(petOffset[petOffset.length-1])
    if (keyW && keyLog[keyLog.length - 1] === "w") {
      setPlayerSprite(playerUp);
      setPetSprite(petUp);
      setAnimate({ player: true });
      for (let i = 0; i < redBlocksMap.length; i++) {
        const redBlock = redBlocksMap[i];
        if (
          collisionDetector({
            rectangle1: player,
            rectangle2: { ...redBlock, x: redBlock.x, y: redBlock.y + speed },
          })
        ) {
          moving = false;
          //console.log("colliding up");
          break;
        }
      }
      if (moving) {
        setOffsetY(offsetY + speed);
        let arr = petOffset;
        function limitWY() {
          if (petOffset[petOffset.length - 1].y >= 68) {
            return petOffset[petOffset.length - 1].y;
          } else {
            return petOffset[petOffset.length - 1].y + speed;
          }
        }
        function limitWX() {
          if (petOffset[petOffset.length - 1].x === 0) {
            return petOffset[petOffset.length - 1].x;
          } else if (petOffset[petOffset.length - 1].x < 0) {
            return petOffset[petOffset.length - 1].x + speed;
          } else if (petOffset[petOffset.length - 1].x > 0) {
            return petOffset[petOffset.length - 1].x - speed;
          }
        }
        const pusherWX = limitWX();
        const pusherWY = limitWY();
        arr.push({ x: pusherWX, y: pusherWY, key: "KeyW" });
        setPetOffset(arr);
        //console.log(petOffset[petOffset.length-1])
      }
    } else if (keyS && keyLog[keyLog.length - 1] === "s") {
      setPlayerSprite(playerDown);
      setPetSprite(petDown);
      setAnimate({ player: true });
      for (let i = 0; i < redBlocksMap.length; i++) {
        const redBlock = redBlocksMap[i];
        if (
          collisionDetector({
            rectangle1: player,
            rectangle2: { ...redBlock, x: redBlock.x, y: redBlock.y - speed },
          })
        ) {
          moving = false;
          //console.log("colliding down");
          break;
        }
      }
      if (moving) {
        setOffsetY(offsetY - speed);
        let arr = petOffset;
        function limitSY() {
          if (petOffset[petOffset.length - 1].y <= -68) {
            return petOffset[petOffset.length - 1].y;
          } else {
            return petOffset[petOffset.length - 1].y - 5;
          }
        }
        function limitXY() {
          if (petOffset[petOffset.length - 1].x === 0) {
            return petOffset[petOffset.length - 1].x;
          } else if (petOffset[petOffset.length - 1].x < 0) {
            return petOffset[petOffset.length - 1].x + speed;
          } else if (petOffset[petOffset.length - 1].x > 0) {
            return petOffset[petOffset.length - 1].x - speed;
          }
        }
        const pusherXY = limitXY();
        const pusherSY = limitSY();
        arr.push({ x: pusherXY, y: pusherSY, key: "KeyS" });
        setPetOffset(arr);
        //console.log(petOffset[petOffset.length-1])
      }
    } else if (keyA && keyLog[keyLog.length - 1] === "a") {
      setPlayerSprite(playerLeft);
      setPetSprite(petLeft);
      setAnimate({ player: true });
      for (let i = 0; i < redBlocksMap.length; i++) {
        const redBlock = redBlocksMap[i];
        if (
          collisionDetector({
            rectangle1: player,
            rectangle2: { ...redBlock, x: redBlock.x + speed, y: redBlock.y },
          })
        ) {
          moving = false;
          //console.log("colliding left");
          break;
        }
      }
      if (moving) {
        setOffsetX(offsetX + speed);
        let arr = petOffset;
        function limitAX() {
          if (petOffset[petOffset.length - 1].x >= 48) {
            return petOffset[petOffset.length - 1].x;
          } else {
            return petOffset[petOffset.length - 1].x + speed;
          }
        }
        function limitAY() {
          if (petOffset[petOffset.length - 1].y === 0) {
            return petOffset[petOffset.length - 1].y;
          } else if (petOffset[petOffset.length - 1].y < 0) {
            return petOffset[petOffset.length - 1].y + speed;
          } else if (petOffset[petOffset.length - 1].y > 0) {
            return petOffset[petOffset.length - 1].y - speed;
          }
        }
        const pusherAX = limitAX();
        const pusherAY = limitAY();
        arr.push({ x: pusherAX, y: pusherAY, key: "KeyA" });
        setPetOffset(arr);
        //console.log(petOffset[petOffset.length-1])
      }
    } else if (keyD && keyLog[keyLog.length - 1] === "d") {
      setPlayerSprite(playerRight);
      setPetSprite(petRight);
      setAnimate({ player: true });
      for (let i = 0; i < redBlocksMap.length; i++) {
        const redBlock = redBlocksMap[i];
        if (
          collisionDetector({
            rectangle1: player,
            rectangle2: { ...redBlock, x: redBlock.x - speed, y: redBlock.y },
          })
        ) {
          moving = false;
          //console.log("colliding right");
          break;
        }
      }
      if (moving) {
        setOffsetX(offsetX - speed);
        let arr = petOffset;
        function limitDX() {
          if (petOffset[petOffset.length - 1].x <= -48) {
            return petOffset[petOffset.length - 1].x;
          } else {
            return petOffset[petOffset.length - 1].x - speed;
          }
        }
        function limitDY() {
          if (petOffset[petOffset.length - 1].y === 0) {
            return petOffset[petOffset.length - 1].y;
          } else if (petOffset[petOffset.length - 1].y < 0) {
            return petOffset[petOffset.length - 1].y + speed;
          } else if (petOffset[petOffset.length - 1].y > 0) {
            return petOffset[petOffset.length - 1].y - speed;
          }
        }
        const pusherDX = limitDX();
        const pusherDY = limitDY();

        arr.push({ x: pusherDX, y: pusherDY, key: "KeyD" });
        setPetOffset(arr);
        //console.log(petOffset[petOffset.length-1])
      }
    }
    // DrawImage Syntax
    // drawImage(image, dx, dy)
    // drawImage(image, dx, dy, dWidth, dHeight)
    // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)

    //c.drawImage(stage, offsetX, offsetY);

    // c.drawImage(
    //   playerDown,
    //   animationFrame*48,
    //   0,
    //   playerDown.width / 4, //
    //   playerDown.height,
    //   canvasWidth / 2 - 192 / 4 / 2,
    //   canvasHeight / 2 - 68 / 2,
    //   playerDown.width / 4,
    //   playerDown.height
    // );
    //c.drawImage(playerDown,60,60,60,60)

    //c.drawImage(foreground, offsetX, offsetY);

    // c.beginPath();
    // c.fillStyle = "blue";
    // c.rect(mousePos.x, mousePos.y, 10, 10);
    // c.fillRect(mousePos.x, mousePos.y, 10, 10);
    // c.stroke();
  }, [frames]);

  function processData(data) {
    if (data.indexOf("a") === 0) {
      console.log("a");
      setKeyA(true);
      setAnimate({ player: true });
      let arrA = keyLog;
      arrA.push("a");
      setKeyLog(arrA);
      setTimeout(() => {

        setKeyA(false);
        setAnimate({ player: false });
        console.log("Delayed for 1 second.");
      }, "1000");
    } else if (data.indexOf("b") === 0) {
      console.log("b");

      setKeyD(true);
      setAnimate({ player: true });
      let arrD = keyLog;
      arrD.push("d");
      setKeyLog(arrD);
      setTimeout(() => {
      setKeyD(false);
      setAnimate({ player: false });
      console.log("Delayed for 1 second.");
    }, "1000");
    } else if (data.indexOf("c") === 0) {
      console.log("c");

      setKeyW(true);
      setAnimate({ player: true });
      let arrW = keyLog;
      arrW.push("w");
      setKeyLog(arrW);
      setTimeout(() => {
      setKeyW(false);
      setAnimate({ player: false });
      console.log("Delayed for 1 second.");
    }, "1000");
    } else if (data.indexOf("d") === 0) {
      console.log("d");

      setKeyS(true);
      setAnimate({ player: true });
      let arrS = keyLog;
      arrS.push("s");
      setKeyLog(arrS);
      setTimeout(() => {
      setKeyS(false);
      setAnimate({ player: false });
      console.log("Delayed for 1 second.");
    }, "1000");
    }
  }

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }
    function onData(value) {
      // console.log(typeof(value))
      processData(value);
      // setAge(a => a + 1);
    }
    socket.on("serialData", onData);
    socket.on("connection", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("serialData", onConnect);
      socket.off("connection", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);
  // clean up useEffect

  useEffect(() => {
    return;
  }, []);

  return (
    <>
      <div id="container">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{ background: "white", border: "1px black solid" }}
        ></canvas>
      </div>
    </>
  );
}
