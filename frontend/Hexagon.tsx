import { useTexture } from '@react-three/drei';
import { HexCoordinate, hexCoodinateToThreeCoordinate } from './calculations';
import { HEXAGON_SIZE } from './constants';
import { Hexagon as HexagonState } from './state';

export const Hexagon = ({ coordinates, height = 0.1 }: HexagonState) => {
    const textures = useTexture([
      './frontend/models/rock/Rock035_1K_Color.jpg',
      './frontend/models/rock/Rock035_1K_Displacement.jpg',
      './frontend/models/rock/Rock035_1K_NormalDX.jpg',
      './frontend/models/rock/Rock035_1K_Roughness.jpg',
      './frontend/models/rock/Rock035_1K_AmbientOcclusion.jpg',
    ]);
  
    const [color, displacement, normal, roughness, ambientOcclusion] = textures;
  
    return (
      <mesh castShadow receiveShadow position={coordinates} rotation={[0, 0, 0]}>
        <cylinderGeometry
          args={[HEXAGON_SIZE - 0.03, HEXAGON_SIZE - 0.03, height, 6]}
        />
        <meshStandardMaterial
          displacementScale={0}
          map={color}
          displacementMap={displacement}
          normalMap={normal}
          roughnessMap={roughness}
          aoMap={ambientOcclusion}
        />
      </mesh>
    );
  };