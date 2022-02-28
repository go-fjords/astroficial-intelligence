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
import { OrbitControls } from "@react-three/drei";
import Spaceship from "./Spaceship";
import logo from "./logo.svg";
import "./App.css";
import { SkyBox } from "./SkyBox";
import { Texture, TextureLoader } from "three";

// CONSTANTS
const mapSize = 2;

// CONSTANTS describing central hexagon properties
const HEXAGON_SIZE = 0.5;
const HEXAGON_WIDTH = Math.sqrt(3) * HEXAGON_SIZE;
const HEXAGON_HEIGHT = HEXAGON_SIZE * 2;

interface HexPosition {
  q: number;
  r: number;
  s: number;
}

type Point = [number, number, number];

type Tile = 'ground' | 'mountain' | 'void';

interface Hexagon {
  position: HexPosition;
  height: number;
  textures: Texture[];
}

const pointyHexToPoint = (hex: HexPosition, height: number): Point => {
  const x = HEXAGON_SIZE * (Math.sqrt(3) * hex.q + (Math.sqrt(3) / 2) * hex.r);
  const y = HEXAGON_SIZE * ((3 / 2) * hex.r);
  return [x, height/2, y];
};

const Hexagon = ({ position, height = 0.1, textures }: Hexagon) => {
  const [color, displacement, normal, roughness, ambientOcclusion] = textures;
  return (
    <mesh castShadow receiveShadow position={pointyHexToPoint(position, height)} rotation={[0, 0, 0]}>
      <cylinderGeometry
        args={[HEXAGON_SIZE - 0.03, HEXAGON_SIZE - 0.03, height, 6]}
      />
      <meshStandardMaterial
        displacementScale={0}
        map={color}
        displacementMap={displacement}
        normalMap={normal}
        roughnessMap={roughness}
        aoMap={ambientOcclusion}
      />
    </mesh>
  );
};


interface GraphicsProps {
  gameState: any;
}

const Graphics = ({gameState}: GraphicsProps) => {
  const { camera } = useThree();
  const textures = useLoader(TextureLoader, [
    './frontend/models/rock/Rock035_1K_Color.jpg',
    './frontend/models/rock/Rock035_1K_Displacement.jpg',
    './frontend/models/rock/Rock035_1K_NormalDX.jpg',
    './frontend/models/rock/Rock035_1K_Roughness.jpg',
    './frontend/models/rock/Rock035_1K_AmbientOcclusion.jpg',
  ]);

  const hexagons: Hexagon = gameState?.grid?.filter((h:any) => h.terrain !== 'void').map((h:any) => {
    const [q, r, s] = h.coordinates;
    let height = 0;
    switch (h.terrain) {
      case 'land': height = h.noise/10; break;
      case 'mountain': height = (h.noise / 2) + 0.2; break;
    }
    return { position: {q, r, s}, height } as Hexagon;
  })?? [];
  console.log('Gamestate', gameState);


// Generate circular shaped grid of hexagons

  return (
    <>
      <perspectiveCamera makeDefault position={[0, 0, 0]} fov={25} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        addEventListener={undefined}
        hasEventListener={undefined}
        removeEventListener={undefined}
        dispatchEvent={undefined}
      />

      {/* <ambientLight intensity={0.4} /> */}
      {/* <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} /> */}
      <SkyBox />
      <directionalLight castShadow color={0xffffff} intensity={3} position={[0, 10, 4]} />
      <Spaceship position={[0, 12, 0]} />
      {hexagons.map(hex => <Hexagon key={hex.position.q + "," + hex.position.r} {...hex} textures={textures} />)}
    </>
  );
};

function App() {
  const socketUrl = 'ws://localhost:8080/ui';
  const [gameState, setGameState] = useState();
  const {
    sendMessage,
    lastMessage,
    readyState,
  } = useWebSocket(socketUrl);

  useEffect(() => {
    if(lastMessage !== null) {
      const message = JSON.parse(lastMessage.data);
      setGameState(message);
    }
  }, [lastMessage])

  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <Canvas shadows style={{background: "black"}}>
        <Suspense fallback={null}>
          <Graphics gameState={gameState} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;
