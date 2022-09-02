import { useTexture } from '@react-three/drei';
import { HEXAGON_SIZE } from './constants';
import { HexMesh as HexagonState } from './state';

export const Hexagon = ({ coordinates, height = 0.1 }: HexagonState) => {
    const textures = useTexture({
      map: './frontend/models/rocks/Rock048_1K_Color.jpg',
      displacementMap: './frontend/models/rocks/Rock048_1K_Displacement.jpg',
      normalMap: './frontend/models/rocks/Rock048_1K_NormalGL.jpg',
      roughnessMap: './frontend/models/rocks/Rock048_1K_Roughness.jpg',
      aoMap: './frontend/models/rocks/Rock048_1K_AmbientOcclusion.jpg',
    });
  
    return (
      <mesh castShadow receiveShadow position={coordinates} rotation={[0, 0, 0]}>
        <cylinderGeometry
          args={[HEXAGON_SIZE - 0.03, HEXAGON_SIZE - 0.03, height, 6]}
        />
        <meshStandardMaterial
          displacementScale={0}
          {...textures}
        />
      </mesh>
    );
  };