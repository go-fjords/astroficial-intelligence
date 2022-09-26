import * as THREE from "three";
import create, { GetState, SetState } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { produce } from "immer";
import {
  addHexCoordinates,
  hexCoodinateToThreeCoordinate,
  hexPositionsToRadianAngle,
} from "./calculations";

const SPACESHIP_HEIGHT = 0.5;

export type Coordinates = [q: number, r: number, s: number];
export type CartesianCoordinates = [x: number, y: number, z: number];

interface EventMove {
  type: "move";
  nick: string;
  coordinates: Coordinates;
  score: number;
  reason: string;
}

interface EventCollision {
  type: "collision";
  nick: string;
  coordinates: Coordinates;
  score: number;
  hitpoints: number;
  reason: string;
}

interface EventRam {
  type: "ram";
  nick: string;
  score: number;
  hitpoints: number;
  reason: string;
}

interface EventRammed {
  type: "rammed";
  nick: string;
  score: number;
  hitpoints: number;
  reason: string;
}

interface EventLaser {
  type: "laser";
  nick: string;
  start: Coordinates;
  end: Coordinates;
  score: number;
  reason: string;
}

interface EventLaserHit {
  type: "laser-hit";
  nick: string;
  coordinates: Coordinates;
  direction: Coordinates;
  hitpoints: number;
  reason: string;
}

interface EventNoop {
  type: "noop";
  nick: string;
  score: number;
}

type Event =
  | EventMove
  | EventCollision
  | EventRam
  | EventRammed
  | EventLaser
  | EventLaserHit
  | EventNoop;

interface Player {
  nick: string;
  hitpoints: number;
  score: number;
  coordinates: Coordinates;
  cartesianCoordinates: CartesianCoordinates;
}

type Tile = "land" | "mountain" | "void";

interface HexTile {
  coordinates: Coordinates;
  terrain: Tile;
  noise: number;
}

interface ServerState {
  status: "initialized" | "playing" | "paused" | "game-over";
  round: number;
  players: Player[];
  grid: HexTile[];
  events: Event[];
}

interface Spaceship {
  nick: string;
  score: number;
  hitpoints: number;
  coordinates: CartesianCoordinates;
  collisionCoordinates?: CartesianCoordinates;
  hexCoordinates: Coordinates;
  rotation: number;
  event: Event["type"];
}

export interface HexMesh {
  hexCoordinates: Coordinates;
  coordinates: CartesianCoordinates;
  height: number;
  terrain: Tile;
}

export interface Laser {
  nick: string;
  startCoordinates: CartesianCoordinates;
  endCoordinates: CartesianCoordinates;
  rotation: number;
  height: number;
}

interface GameState {
  status: "initialized" | "playing" | "paused" | "game-over";
  initialized: boolean;
  clock: THREE.Clock;
  round: number;
  spaceships: Spaceship[];
  lasers: Laser[];
  hexagons: HexMesh[];

  init: (state: ServerState) => void;
  update: (state: ServerState) => void;
}

type State = GameState;

export const useStore = create<State>((set, get) => ({
  initialized: false,
  status: "",
  clock: new THREE.Clock(),
  round: 0,
  lasers: [],
  spaceships: [],
  hexagons: [],

  // Initialize the game state
  init: (serverState: ServerState) => {
    console.log("Initializing game state");

    set((_state) => ({
      initialized: true,
      status: serverState.status,
      clock: new THREE.Clock(false),
      round: serverState.round,
      lasers: [],
      spaceships: serverState.players.map((player) => ({
        nick: player.nick,
        hitpoints: player.hitpoints,
        score: player.score,
        coordinates: hexCoodinateToThreeCoordinate(
          player.coordinates,
          SPACESHIP_HEIGHT
        ),
        hexCoordinates: player.coordinates,
        rotation: 0,
        event: "noop",
      })),
      hexagons: serverState.grid.map((tile) => {
        let height = 0;
        switch (tile.terrain) {
          case "land":
            height = tile.noise / 10;
            break;
          case "mountain":
            height = tile.noise / 2 + 0.2;
            break;
        }
        return {
          hexCoordinates: tile.coordinates,
          coordinates: hexCoodinateToThreeCoordinate(tile.coordinates, height),
          height,
          terrain: tile.terrain,
        };
      }),
    }));

    // Do some initialization on the constructed state
    const { clock } = get();
    clock.start();
  },

  update: async (serverState: ServerState) => {
    set(
      produce((state: GameState) => {
        state.status = serverState.status;
        state.lasers = [];
        state.round = serverState.round;
        serverState.events.forEach((event) => {
          switch (event.type) {
            case "move": {
              const spaceship = state.spaceships.find(
                (s) => s.nick === event.nick
              );
              if (spaceship) {
                spaceship.event = "move";
                spaceship.score += event.score;
                const oldHexCoordinates = spaceship.hexCoordinates;
                spaceship.coordinates = hexCoodinateToThreeCoordinate(
                  event.coordinates,
                  SPACESHIP_HEIGHT
                );
                spaceship.hexCoordinates = event.coordinates;
                spaceship.rotation = hexPositionsToRadianAngle(
                  oldHexCoordinates,
                  event.coordinates
                );
              }
              break;
            }
            case "collision": {
              const spaceship = state.spaceships.find(
                (s) => s.nick === event.nick
              );
              if (spaceship) {
                spaceship.score += event.score;
                spaceship.hitpoints += event.hitpoints;
                const [x1, y, z1] = hexCoodinateToThreeCoordinate(
                  event.coordinates,
                  SPACESHIP_HEIGHT
                );
                const [x2, _, z2] = spaceship.coordinates;

                spaceship.collisionCoordinates = [
                  (x1 + x2) / 2,
                  y,
                  (z1 + z2) / 2,
                ];
                spaceship.rotation = hexPositionsToRadianAngle(
                  spaceship.hexCoordinates,
                  event.coordinates
                );
                spaceship.event = "collision";
              }
              break;
            }
            case "laser": {
              const spaceship = state.spaceships.find(
                (s) => s.nick === event.nick
              );
              if (spaceship) {
                spaceship.score += event.score;
                spaceship.event = "laser";
                spaceship.rotation = hexPositionsToRadianAngle(
                  event.start,
                  addHexCoordinates(event.start, event.direction)
                );
              }

              state.lasers.push({
                nick: event.nick,
                startCoordinates: hexCoodinateToThreeCoordinate(event.start, 1),
                endCoordinates: hexCoodinateToThreeCoordinate(event.end, 1),
                rotation: hexPositionsToRadianAngle(
                  event.start,
                  addHexCoordinates(event.start, event.direction)
                ),
                height: 1,
              });
            }

            case "laser-hit": {
              const spaceship = state.spaceships.find(
                (s) => s.nick === event.nick
              );
              if (spaceship) {
                spaceship.hitpoints += event.hitpoints;
              }
            }

            case "noop": {
              const spaceship = state.spaceships.find(
                (s) => s.nick === event.nick
              );
              if (spaceship) {
                spaceship.score += event.score;
                spaceship.event = "noop";
              }
              break;
            }
          }
        });
      })
    );

    setTimeout(() => {
      set(
        produce((state: GameState) => {
          state.lasers = [];
        })
      );
    }, 3500);
  },
}));
