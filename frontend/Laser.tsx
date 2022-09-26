import * as THREE from "three";
import { animated, easings, useSpring } from "@react-spring/three";
import { Laser as LaserState } from "./state";
import React, { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Select } from "@react-three/postprocessing";

export const Laser = ({
  startCoordinates,
  endCoordinates,
  rotation,
  height = 0.1,
}: LaserState) => {

  const ref = useRef<THREE.Mesh>();
  const { position } = useSpring({
    from: {
      position: startCoordinates,
    },
    to: {
      position: endCoordinates,
    },
    delay: 1500,
    config: {
      precision: 0.00001,
      duration: 1500, //1250,
    },
  });

  useFrame(({ clock }) => {
    if(ref.current) {
      const [x, y, z] = position.get();
      const [x2, y2, z2] = endCoordinates;
      if (x === x2 && y === y2 && z === z2) {
        ref.current.visible = false;
      }
    }
  })

  return (
      <animated.group position={position}>
        <animated.mesh ref={ref}>
          <sphereGeometry  args={[0.08, 100, 100]} />
          <meshBasicMaterial color={"#ff0000"} />
        </animated.mesh>
      </animated.group>
  );
};
