import "virtual:windi.css";
import { Suspense, useEffect, useRef, useState } from "react";
import { Dialog } from "@headlessui/react";
import useWebSocket from "react-use-websocket";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { Center, OrbitControls, Text3D } from "@react-three/drei";
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
  const { hexagons, spaceships, lasers, update, status } = useStore();
  console.log("Status", status);
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
            nick={spaceship.nick}
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

      {lasers.map((laser, i) => {
        return (
          <Laser
            key={laser.startCoordinates.toString() + i}
            nick={laser.nick}
            startCoordinates={laser.startCoordinates}
            endCoordinates={laser.endCoordinates}
            height={10}
            rotation={laser.rotation}
          />
        );
      })}

      <Center top position={[0, 1, 0]}>
        <Text3D
          font={"Roboto_Bold.json"}
          bevelEnabled
          bevelSize={0.04}
          bevelThickness={0.1}
          height={0.2}
          lineHeight={0.5}
          letterSpacing={0.05}
          size={1}
        >
          {status === "playing" && ''}
          {status === "paused" && 'Paused'}
          {status === "initialized" && 'Waiting'}
          {status === "game-over" && 'Game over!'}

          <meshToonMaterial color={"rgba(16, 185, 129)"} />
        </Text3D>
      </Center>
    </>
  );
};

const PlayerStats = () => {
  const { spaceships } = useStore();
  return (
    <table className="table-auto text-gray-200 text-shadow text-2xl">
      <thead className="text-green-200">
        <tr>
          <th className="px-3">Nick</th>
          <th className="px-3">Health</th>
          <th className="px-3">Score</th>
        </tr>
      </thead>
      <tbody>
        {spaceships.map((spaceship) => {
          return (
            <tr key={spaceship.nick}>
              <td className="px-3">{spaceship.nick}</td>
              <td className="px-3">{spaceship.hitpoints}</td>
              <td className="px-3">{spaceship.score}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const GameControls = ({ sendMessage }) => {
  const [showJoin, setShowJoin] = useState(false);
  const [nick, setNick] = useState("");
  const [url, setUrl] = useState("");

  return (
    <div className="flex flex-row items-center align-center gap-4">
      <button
        className="bg-green-500 shadow py-2 px-2 rounded pointer-events-auto cursor-pointer"
        onClick={() => sendMessage({ command: "start" })}
        title="Start game"
      >
        Start
      </button>

      <button
        className="bg-green-500 shadow py-2 px-2 rounded pointer-events-auto cursor-pointer"
        onClick={() => sendMessage({ command: "pause" })}
        title="Pause game"
      >
        Pause
      </button>

      <button
        className="bg-green-500 shadow py-2 px-2 rounded pointer-events-auto cursor-pointer"
        onClick={() => setShowJoin(true)}
        title="Join new player"
      >
        Join
      </button>

      <button
        className="bg-green-500 shadow py-2 px-2 rounded pointer-events-auto cursor-pointer"
        onClick={() => sendMessage({ command: "init" })}
        title="Re-initialize entire game state"
      >
        Reset game
      </button>

      <button
        className="bg-green-500 shadow py-2 px-2 rounded pointer-events-auto cursor-pointer"
        onClick={() => sendMessage({ command: "init" })}
        title="Reset all players to initial state"
      >
        Restart server
      </button>

      <Dialog
        open={showJoin}
        onClose={() => setShowJoin(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm rounded bg-green-500 p-4">
            <Dialog.Title>Add new AI player</Dialog.Title>
            {/* Input field for nick */}
            <div className="flex flex-col gap-2 p-2">
              <label htmlFor="nick">Nick</label>
              <input
                type="text"
                id="nick"
                value={nick}
                onChange={(e) => setNick(e.target.value)}
              />
            </div>
            {/* Input field for host */}
            <div className="flex flex-col gap-2 p-2">
              <label htmlFor="url">Url</label>
              <input
                type="text"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="flex flex-row gap-2 p-2">
              <button
                className="bg-gray-800 text-green-300 py-3 px-4 rounded pointer-events-auto cursor-pointer"
                onClick={() => {
                  sendMessage({ command: "join", nick, url });
                  setShowJoin(false);
                }}
              >
                Join
              </button>
              <button
                className="bg-gray-800 text-green-300 py-3 px-4 rounded pointer-events-auto cursor-pointer"
                onClick={() => setShowJoin(false)}
              >
                Cancel
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

const GameSummary = () => {
  const { round } = useStore();

  return (
    <div className="text-green-200 text-shadow text-2xl">
      <div>Round: {round}</div>
    </div>
  );
};

function App() {
  const socketHost = import.meta.env.PROD ? window.location.host : "localhost:8080"
  const socketUrl = `ws://${socketHost}/socket`
  const { init, update, initialized } = useStore();
  const { sendJsonMessage, lastMessage, readyState } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage !== null) {
      const message = JSON.parse(lastMessage.data);
      // If we already got server state we should update instead

      console.log(message);
      if (message.type === "init") {
        init(message);
      } else {
        update(message);
      }
    }
  }, [lastMessage]);

  return (
    <div className="App relative">
      <div className="pointer-events-none absolute z-20 min-w-screen min-h-screen">
        <div className="px-8 py-8 w-full h-full flex flex-row justify-between">
          <PlayerStats />
          <GameControls sendMessage={sendJsonMessage} />
          <GameSummary />
        </div>
      </div>
      <Canvas shadows style={{ background: "black" }}>
        <Suspense fallback={null}>
          <Graphics />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;
