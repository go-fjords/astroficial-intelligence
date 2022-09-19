import * as THREE from "three";
import { animated, easings, useSpring } from "@react-spring/three";
import { Laser as LaserState } from "./state";
import React, { useRef } from "react";
import { useThree } from "@react-three/fiber";
import { Select } from "@react-three/postprocessing";

export const Laser = ({
  startCoordinates,
  endCoordinates,
  rotation,
  height = 0.1,
}: LaserState) => {
  const { position } = useSpring({
    from: {
      position: startCoordinates,
    },
    to: {
      position: endCoordinates,
    },
    config: {
      precision: 0.001,
      duration: 600, //1250,
      easing: easings.easeInSine,
    },
  });

  return (
    <Select enabled>
      <animated.mesh rotation-x={Math.PI / 2} rotation-z={Math.PI/2} rotation-y={rotation} position={position}>
        <cylinderGeometry args={[0.015, 0.015, 0.5]} />
        <meshBasicMaterial color={"#ff0000"} />
      </animated.mesh>
    </Select>
  );
};
