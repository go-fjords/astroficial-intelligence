import ReactDOM from "react-dom";
import React, { useEffect, useRef, useState } from "react";
import {
  Canvas,
  extend,
  ReactThreeFiber,
  useFrame,
  useThree,
} from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import logo from "./logo.svg";
import "./App.css";

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
}

const pointyHexToPoint = (hex: HexPosition, height: number): Point => {
  const x = HEXAGON_SIZE * (Math.sqrt(3) * hex.q + (Math.sqrt(3) / 2) * hex.r);
  const y = HEXAGON_SIZE * ((3 / 2) * hex.r);
  return [x, height/2, y];
};

const Hexagon = ({ position, height = 0.1 }: Hexagon) => {
  console.log(height);
  return (
    <mesh position={pointyHexToPoint(position, height)} rotation={[0, 0, 0]}>
      <cylinderGeometry
        args={[HEXAGON_SIZE - 0.03, HEXAGON_SIZE - 0.03, height, 6]}
      />
      <meshStandardMaterial color={height > 0.1 ? 0xffd4d4 : 0xffd4d4} roughness={1} metalness={1} />
    </mesh>
  );
};


const Graphics = () => {
  const { camera } = useThree();
  const [hexagons, setHexagons] = useState<Hexagon[]>([]);

  useEffect(() => {
    const newHexagons: Hexagon[] = [];
    for (let q = -mapSize; q <= mapSize; q++) {
      for (let r = -mapSize; r <= mapSize; r++) {
        for (let s = -mapSize; s <= mapSize; s++) {
          if(q+r+s === 0) {
            console.log(q, r)
            newHexagons.push({
              position: { q, r, s },
              height: 0.1,
            });
          }
        }
      }
    }

    

    setHexagons(newHexagons);
  }, [])


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
      <directionalLight color={0xffffff} intensity={1.5} position={[0, 10, 4]} />
      {hexagons.map(hex => <Hexagon key={hex.position.q + "," + hex.position.r} {...hex} />)}
    </>
  );
};

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <Canvas shadows style={{background: "black"}}>
        <Graphics />
      </Canvas>
    </div>
  );
}

export default App;
