import { useCubeTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

export const SkyBox = () => {
  const { scene } = useThree();

  const texture = useCubeTexture([
    "right.png",
    "left.png",
    "top.png",
    "bottom.png",
    "front.png",
    "back.png",
  ], {path: '/skybox/'});

  scene.background = texture;

  return null;
};
