import * as THREE from 'three';
import create, { GetState, SetState } from 'zustand'
import { StoreApiWithSubscribeWithSelector, subscribeWithSelector } from 'zustand/middleware'
import { hexCoodinateToThreeCoordinate, hexPositionsToRadianAngle } from './calculations';

const SPACESHIP_HEIGHT = 0.5;

export type Coordinates = [q: number, r: number, s: number];
export type CartesianCoordinates = [x: number, y: number, z: number];

interface Action {
  type: 'move' | 'laser' | 'rocket';
  coordinates: Coordinates;
}

interface Player {
  nick: string;
  coordinates: Coordinates;
  cartesianCoordinates: CartesianCoordinates;
}

type Tile = 'land' | 'mountain' | 'void';

interface HexTile {
  coordinates: Coordinates;
  terrain: Tile;
  noise: number;
}

interface ServerState {
  round: number;
  players: Player[];
  grid: HexTile[];
  actions: Action[];
}

interface Spaceship {
  nick: string;
  coordinates: CartesianCoordinates;
  hexCoordinates: Coordinates;
  rotation: number;
}

interface Laser {
  coordinates: CartesianCoordinates;
}

export interface HexMesh {
  coordinates: CartesianCoordinates;
  height: number;
  terrain: Tile;
}

interface GameState {
  initialized: boolean;
  clock: THREE.Clock;
  serverState: ServerState;
  spaceships: Spaceship[];
  hexagons: HexMesh[];

  init: (state: ServerState) => void;
  update: (state: ServerState) => void;
  move: () => void;
}

type State = GameState;

export const useStore = create<State>((set, get) => ({
  initialized: false,
  clock: new THREE.Clock(),
  serverState: {
    round: 0,
    players: [],
    grid: [],
    actions: [],
  },
  spaceships: [],
  hexagons: [],

  // Initialize the game state
  init: (serverState: ServerState) => {

    console.log('Initializing game state');

    set(_state => ({
      serverState,
      initialized: true,
      clock: new THREE.Clock(false),
      spaceships: serverState.players.map(player => ({
        nick: player.nick,
        coordinates: hexCoodinateToThreeCoordinate(player.coordinates, SPACESHIP_HEIGHT),
        hexCoordinates: player.coordinates,
        rotation: 0,
      })),
      hexagons: serverState.grid.map(tile => {
        let height = 0;
        switch (tile.terrain) {
          case 'land': height = tile.noise/10; break;
          case 'mountain': height = (tile.noise / 2) + 0.2; break;
        }
        return {
          coordinates: hexCoodinateToThreeCoordinate(tile.coordinates, height),
          height,
          terrain: tile.terrain,
        }
      })
    }));

    // Do some initialization on the constructed state
    const { clock } = get();
    clock.start();
  },
  
  update: (serverState: ServerState) => {
    console.log('Update game state');
    set(state => ({
      serverState,
      spaceships: state.spaceships.map(spaceship => {
        const player = serverState.players.find(player => player.nick === spaceship.nick);
        if (player) {
          return {
            ...spaceship,
            hexCoordinates: player.coordinates,
            coordinates: hexCoodinateToThreeCoordinate(player.coordinates, SPACESHIP_HEIGHT),
            rotation: hexPositionsToRadianAngle(spaceship.hexCoordinates, player.coordinates),
          }
        }
        return spaceship;
      })
    }))
  },

  move: () => {
    set(state => ({
      spaceships: state.spaceships.map(({coordinates: [x,y,z], ...spaceship}) => ({
        ...spaceship,
        coordinates: [x+1, y, z],
      }))
    }))
  }


}));