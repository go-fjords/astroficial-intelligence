import * as THREE from "three";
import { animated, easings, useSpring } from "@react-spring/three";
import { Laser as LaserState } from "./state";
import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Select } from "@react-three/postprocessing";

export const Laser = ({
  startCoordinates,
  endCoordinates,
  rotation,
  height = 0.1,
}: LaserState) => {
  console.log('Start - end', startCoordinates, endCoordinates)
  const { position } = useSpring({
    from: {
      position: startCoordinates,
    },
    to: {
      position: endCoordinates,
    },
    config: {
      precision: 0.00001,
      duration: 1000, //1250, 
    },
  });


  return (
      <animated.group rotation={[0, 0, Math.PI / 2]} >
        <animated.mesh rotation={[rotation, 0, 0]} position={position}>
          <cylinderGeometry  args={[0.015, 0.015, 3]} />
          <meshBasicMaterial color={"#ff0000"} />
        </animated.mesh>
      </animated.group>
  );
};
