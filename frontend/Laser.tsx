import * as THREE from 'three'
import { animated, easings, useSpring } from "@react-spring/three";
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { KernelSize } from 'postprocessing'
import { Laser as LaserState } from "./state";
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry';
import { MeshLine, MeshLineMaterial } from 'meshline'
import { useRef } from 'react';
import { useFrame, extend, ReactThreeFiber } from '@react-three/fiber';

extend({ MeshLine, MeshLineMaterial })


/* eslint-disable no-unused-vars */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'meshLine': ReactThreeFiber.Object3DNode<MeshLine, typeof MeshLine>;
      'meshLineMaterial': ReactThreeFiber.Object3DNode<MeshLineMaterial, typeof MeshLineMaterial>;
    }
  }
}
/* eslint-enable no-unused-vars */

export const Laser = ({
  startCoordinates,
  endCoordinates,
  height = 0.1,
}: LaserState) => {

  const material = useRef()

  const { position } = useSpring({
    //delay: 750, // Wait for rotation
    from: {
      position: startCoordinates,
    },
    to: {
      position: endCoordinates,
    },
    config: {
      precision: 0.001,
      duration: 600, //1250,
      easing: easings.easeInOutSine
    }
  })

  

  const points = new THREE.LineCurve3(
    new THREE.Vector3(0,1,0),
    new THREE.Vector3(1,1,1)
  ).getPoints(50);

  console.log(points);

  return (
    <group>
      <EffectComposer multisampling={8}>
        <Bloom kernelSize={3} luminanceThreshold={0} luminanceSmoothing={0.4} intensity={0.6} />
        <Bloom kernelSize={KernelSize.HUGE} luminanceThreshold={0} luminanceSmoothing={0} intensity={0.5} />
      </EffectComposer>
      <mesh rotation={[0, 0, 0]} position={[0,2,0]}>
        <meshLine attach="geometry" points={points} />
        <meshLineMaterial ref={material} transparent depthTest={false} lineWidth={20} color={new THREE.Color(255, 255, 255)} dashArray={0.1} dashRatio={0.95} />
      </mesh>
    </group>
  );
};
