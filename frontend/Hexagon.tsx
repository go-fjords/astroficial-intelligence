import { useTexture, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { HEXAGON_SIZE } from './constants';
import { HexMesh as HexagonState } from './state';


type Text = typeof Text;

export const Hexagon = ({ coordinates, hexCoordinates, height = 0.1 }: HexagonState) => {
    const textures = useTexture({
      map: './frontend/models/rocks/Rock048_1K_Color.jpg',
      displacementMap: './frontend/models/rocks/Rock048_1K_Displacement.jpg',
      normalMap: './frontend/models/rocks/Rock048_1K_NormalGL.jpg',
      roughnessMap: './frontend/models/rocks/Rock048_1K_Roughness.jpg',
      aoMap: './frontend/models/rocks/Rock048_1K_AmbientOcclusion.jpg',
    });

    const ref = useRef<any>()

    useFrame(({ camera }) => {
      // Make text face the camera
      if(ref.current) {
        ref.current.quaternion.copy(camera.quaternion)
      }
    })
  
    return (
      <group position={coordinates}>
        <mesh castShadow receiveShadow rotation={[0, 0, 0]}>
          <cylinderGeometry
            args={[HEXAGON_SIZE - 0.03, HEXAGON_SIZE - 0.03, height, 6]}
          />
          <meshStandardMaterial
            displacementScale={0}
            {...textures}
          />
        </mesh>
        {/* <Text ref={ref}  position={[0, .5, 0]} fontSize={0.2} color="red" anchorX="center" anchorY="middle">
          {hexCoordinates[0]},{hexCoordinates[1]},{hexCoordinates[2]}
        </Text> */}
      </group>
    );
  };