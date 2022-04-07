import * as THREE from 'three';
import create, { GetState, SetState } from 'zustand'
import { StoreApiWithSubscribeWithSelector, subscribeWithSelector } from 'zustand/middleware'
import { hexCoodinateToThreeCoordinate } from './calculations';

const SPACESHIP_HEIGHT = 0.5;

type Coordinates = [q: number, r: number, s: number];
type CartesianCoordinates = [x: number, y: number, z: number];

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
  coordinates: THREE.Vector3;
}

export interface HexMesh {
  coordinates: THREE.Vector3;
  height: number;
  terrain: Tile;
}

interface GameState {
  clock: THREE.Clock;
  serverState: ServerState;
  spaceships: Spaceship[];
  hexagons: HexMesh[];

  init: (state: ServerState) => void;
  animate: ()  => void;
}

type State = GameState;

export const useStore = create<State>((set, get) => ({
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
    set(_state => ({
      serverState,
      clock: new THREE.Clock(false),
      spaceships: serverState.players.map(player => ({
        coordinates: hexCoodinateToThreeCoordinate(player.coordinates, SPACESHIP_HEIGHT),
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

  // Animate the ships
  animate: () => {
    set(({clock, spaceships}) => ({
      spaceships: spaceships.map(spaceship => ({
        ...spaceship,
        coordinates: spaceship.coordinates = spaceship.coordinates.copy(new THREE.Vector3).setY(
          (Math.sin(clock.getElapsedTime()) / 20) + .5
        )
      }))
    }));
  }
}));