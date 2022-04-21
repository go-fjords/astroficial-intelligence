import ReactDOM from "react-dom";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import {
  Canvas,
  extend,
  ReactThreeFiber,
  useFrame,
  useLoader,
  useThree,
} from "@react-three/fiber";
import { Texture, RepeatWrapping, ClampToEdgeWrapping } from "three";
import { OrbitControls, useTexture } from "@react-three/drei";
import Spaceship from "./Spaceship";
import logo from "./logo.svg";
import "./App.css";
import { SkyBox } from "./SkyBox";
import { Hexagon } from "./Hexagon";
import { hexCoodinateToThreeCoordinate } from "./calculations";
import { useStore, HexMesh } from "./state";


const Graphics = () => {
  const { camera } = useThree();
  const { hexagons, serverState: {players}, spaceships, move } = useStore();


  return (
    <>
      <perspectiveCamera position={[0, 0, 0]} fov={25} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        addEventListener={undefined}
        hasEventListener={undefined}
        removeEventListener={undefined}
        dispatchEvent={undefined}
      />
      <SkyBox />
      <directionalLight castShadow color={0xffffff} intensity={4} position={[0, 10, 4]} />
      {spaceships.map(spaceship => {
        
        return <Spaceship key={spaceship.nick} position={spaceship.coordinates} rotation={spaceship.rotation} />
      })}
      {hexagons.filter(hex => hex.terrain !== 'void').map(hex => <Hexagon key={`${hex.coordinates[0]}${hex.coordinates[2]}`} {...hex} />)}
    </>
  );
};

function App() {
  const socketUrl = 'ws://localhost:8080/ui';
  const { init, update, initialized } = useStore();
  const {
    sendMessage,
    lastMessage,
    readyState,
  } = useWebSocket(socketUrl);

  useEffect(() => {
    if(lastMessage !== null) {
      const message = JSON.parse(lastMessage.data);
      // If we already got server state we should update instead
      initialized ? update(message) : init(message);
    }
  }, [lastMessage])

  return (
    <div className="App">
      <Canvas shadows style={{background: "black"}}>
        <Suspense fallback={null}>
          <Graphics />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;
