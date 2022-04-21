import * as THREE from 'three';
import { HEXAGON_SIZE } from "./constants";
import { CartesianCoordinates } from './state';

export type HexCoordinate = [q: number, r: number, s: number];

/**
 * 
 * @param deg the number of degrees (0-360)
 * @returns the number of radians (0-2pi)
 */
 export const degToRad = (deg: number): number => deg * (Math.PI / 180);

// Given a hex direction expressed as a coordinate (relative to current)
const ANGLES: {[coord: string]: number} = [
   [[1, 0, -1], degToRad(0)],
   [[1, -1, 0], degToRad(60)],
   [[0, -1, 1], degToRad(120)],
   [[-1, 0, 1], degToRad(180)],
   [[-1, 1, 0], degToRad(240)],
   [[0, 1, -1], degToRad(300)],
].reduce((acc, [coord, rad]) => {
    return {...acc, [JSON.stringify(coord)]: rad}
}, {});

/**
 * 
 * @param hex1 Initial hex position
 * @param hex2 Target hex position
 * @returns angle expressed in radians
 */
export const hexPositionsToRadianAngle = (hex1: HexCoordinate, hex2: HexCoordinate): number => {
    const [q1, r1, s1] = hex1;
    const [q2, r2, s2] = hex2;
    const angle = ANGLES[JSON.stringify([q2 - q1, r2 - r1, s2 - s1])];
    console.log('Computed hex dir', [q2 - q1, r2 - r1, s2 - s1]);
    console.log('Angle: ', angle);
    return angle;
}

console.log('ANGLES', ANGLES);

/**
 * Given a hex coordinate and a height, returns the corresponding three
 * dimensional coordinate.
 * 
 * @param hexCoordinate
 * @param height 
 * @returns The cartesian (Three Fiber) coordinates of the hexagon
 */
export const hexCoodinateToThreeCoordinate = ([q,r,_s]: HexCoordinate, height: number): CartesianCoordinates => {
    const x = HEXAGON_SIZE * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
    const z = HEXAGON_SIZE * ((3 / 2) * r);
    return [x, height / 2, z];
};