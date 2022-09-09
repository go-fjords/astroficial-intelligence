/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
author: Blank2574 (https://sketchfab.com/Blank2574)
license: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
source: https://sketchfab.com/3d-models/small-space-ship-low-poly-4e852173138b4a7aa8379bb77eecec39
title: Small space ship-low poly
*/

import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { animated, easings, useSpring } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';
import { CartesianCoordinates } from './state';

type GLTFResult = GLTF & {
  nodes: {
    pCylinder13_lambert2_0: THREE.Mesh
  }
  materials: {
    lambert2: THREE.MeshStandardMaterial
  }
}

interface Spaceship {
  position: CartesianCoordinates;
  rotation: number;
}

export default function Model({ position: newPos, rotation: newRot, ...props }: Spaceship) {
  const group = useRef<THREE.Group>()
  const { nodes, materials } = useGLTF('./frontend/models/spaceship/scene.gltf') as GLTFResult
  const ref = useRef<THREE.Mesh>();
  const [[prevPos, nextPos], setPositions] = useState<CartesianCoordinates[]>([newPos, newPos]);
  const [[prevRot, nextRot], setRotations] = useState<number[]>([0, 0]);
  console.log('Previous rotation: ', prevRot);
  console.log('New rotation', newRot)

  useEffect(() => {
    setPositions([nextPos, newPos])
  }, [newPos]);

  useEffect(() => {
    setRotations([nextRot, newRot])
  }, [newRot]);
  
  const { rotation } = useSpring({
    from: {
      rotation: prevRot,
    },
    to: {
      rotation: nextRot,
    },
    config: {
      precision: 0.001,
      duration: 250,
      easing: easings.easeInOutSine
    }
  })

  const { position } = useSpring({
    delay: 750, // Wait for rotation
    from: {
      position: prevPos,
    },
    to: {
      position: nextPos,
    },
    config: {
      precision: 0.001,
      duration: 600, //1250,
      easing: easings.easeInOutSine
    }
  })


  useFrame(({ clock }) => {
    if(ref.current) {
      ref.current.position.y = (Math.sin(clock.getElapsedTime()) / 20) + .5;
    }
  })

  return (
    <group ref={group} {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <animated.mesh
            ref={ref}
            castShadow
            receiveShadow
            geometry={nodes.pCylinder13_lambert2_0.geometry}
            material={materials.lambert2}
            position={position}
            rotation-y={rotation}
            scale={.03}
          />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('./frontend/models/spaceship/scene.gltf')
