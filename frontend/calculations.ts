import * as THREE from 'three';
import { HEXAGON_SIZE } from "./constants";

export type HexCoordinate = [q: number, r: number, s: number];

/**
 * Given a hex coordinate and a height, returns the corresponding three
 * dimensional coordinate.
 * 
 * @param hexCoordinate
 * @param height 
 * @returns The cartesian (Three Fiber) coordinates of the hexagon
 */
export const hexCoodinateToThreeCoordinate = ([q,r,_s]: HexCoordinate, height: number): THREE.Vector3 => {
    const x = HEXAGON_SIZE * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
    const z = HEXAGON_SIZE * ((3 / 2) * r);
    return new THREE.Vector3(x, height / 2, z);
};
  