import { Suspense, useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Spaceship from "./Spaceship";
import "./App.css";
import { SkyBox } from "./SkyBox";
import { Hexagon } from "./Hexagon";
import { useStore } from "./state";
import { Laser } from "./Laser";
import {
  Bloom,
  EffectComposer,
  Selection,
  Select,
  SelectiveBloom,
} from "@react-three/postprocessing";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

extend({ EffectComposer, RenderPass, UnrealBloomPass });

const Graphics = () => {
  const { hexagons, spaceships, lasers, update } = useStore();
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
      <directionalLight
        castShadow
        color={0xffffff}
        intensity={1}
        position={[0, 10, 4]}
      />
      {spaceships.map((spaceship) => {
        return (
          <Spaceship
            key={spaceship.nick}
            position={spaceship.coordinates}
            collisionCoordinates={spaceship.collisionCoordinates}
            rotation={spaceship.rotation}
            event={spaceship.event}
          />
        );
      })}

      {hexagons
        .filter((hex) => hex.terrain !== "void")
        .map((hex) => (
          <Hexagon
            key={`${hex.coordinates[0]}${hex.coordinates[2]}`}
            {...hex}
          />
        ))}

      <Selection>
        <EffectComposer>
          <SelectiveBloom
            luminanceThreshold={0}
            luminanceSmoothing={0.9}
            height={1}
          />
        </EffectComposer>
          {lasers.map((laser, i) => {
            return (
              <Laser
                key={laser.startCoordinates.toString() + i}
                startCoordinates={laser.startCoordinates}
                endCoordinates={laser.endCoordinates}
                height={10}
                rotation={laser.rotation}
              />
            );
          })}
      </Selection>
    </>
  );
};

function App() {
  const socketUrl = "ws://localhost:8080/ui";
  const { init, update, initialized } = useStore();
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage !== null) {
      const message = JSON.parse(lastMessage.data);
      // If we already got server state we should update instead

      initialized ? update(message) : init(message);
    }
  }, [lastMessage]);

  return (
    <div className="App">
      <Canvas shadows style={{ background: "black" }}>
        <Suspense fallback={null}>
          <Graphics />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;
