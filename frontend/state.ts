import * as THREE from "three";
import create, { GetState, SetState } from "zustand";
import {
  subscribeWithSelector,
} from "zustand/middleware";
import { produce } from "immer";
import {
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
}

interface EventCollision {
  type: "collision";
  nick: string;
  coordinates: Coordinates;
}

interface EventNoop {
  type: "noop";
}

type Event = EventMove | EventCollision | EventNoop;

interface Player {
  nick: string;
  hitpoints: number;
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
  round: number;
  players: Player[];
  grid: HexTile[];
  events: Event[];
}

interface Spaceship {
  nick: string;
  hitpoints: number;
  coordinates: CartesianCoordinates;
  collisionCoordinates?: CartesianCoordinates;
  hexCoordinates: Coordinates;
  rotation: number;
  event: Event['type'];
}

interface Laser {
  coordinates: CartesianCoordinates;
}

export interface HexMesh {
  hexCoordinates: Coordinates;
  coordinates: CartesianCoordinates;
  height: number;
  terrain: Tile;
}

interface GameState {
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
      clock: new THREE.Clock(false),
      round: serverState.round,
      lasers: [],
      spaceships: serverState.players.map((player) => ({
        nick: player.nick,
        hitpoints: player.hitpoints,
        coordinates: hexCoodinateToThreeCoordinate(
          player.coordinates,
          SPACESHIP_HEIGHT
        ),
        hexCoordinates: player.coordinates,
        rotation: 0,
        event: 'noop'
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
        serverState.events.forEach((event) => {
          console.log("Event:", event);
          switch (event.type) {
            case "move": {
              const spaceship = state.spaceships.find(
                (s) => s.nick === event.nick
              );
              if (spaceship) {
                spaceship.event = 'move';
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
                const [x1, y, z1] = hexCoodinateToThreeCoordinate(
                  event.coordinates,
                  SPACESHIP_HEIGHT
                );
                const [x2, _, z2] = spaceship.coordinates;

                spaceship.collisionCoordinates = [(x1 + x2) / 2, y, (z1 + z2) / 2];
                spaceship.rotation = hexPositionsToRadianAngle(
                  spaceship.hexCoordinates,
                  event.coordinates
                );
                spaceship.event = 'collision';
                setTimeout(() => {

                })
              }
              break;
            }
            case "noop": {
              break;
            }
          }
        });
      })
    );
    
  },

  // set(state => ({
  //   spaceships: state.spaceships.map(spaceship => {
  //     const player = serverState.players.find(player => player.nick === spaceship.nick);
  //     if (player) {
  //       return {
  //         ...spaceship,
  //         hexCoordinates: player.coordinates,
  //         coordinates: hexCoodinateToThreeCoordinate(player.coordinates, SPACESHIP_HEIGHT),
  //         rotation: hexPositionsToRadianAngle(spaceship.hexCoordinates, player.coordinates),
  //       }
  //     }
  //     return spaceship;
  //   }),
  //   hexagons: serverState.grid.map(tile => {
  //     let height = 0;
  //     switch (tile.terrain) {
  //       case 'land': height = tile.noise/10; break;
  //       case 'mountain': height = (tile.noise / 2) + 0.2; break;
  //     }
  //     return {
  //       hexCoordinates: tile.coordinates,
  //       coordinates: hexCoodinateToThreeCoordinate(tile.coordinates, height),
  //       height,
  //       terrain: tile.terrain,
  //     }
  //   })
  // }))
}));
