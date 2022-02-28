import { useThree } from "@react-three/fiber";
import { CubeTextureLoader } from "three";

export const SkyBox = () => {
  const { scene } = useThree();
  const loader = new CubeTextureLoader();

  const texture = loader.load([
    "./frontend/models/skybox/right.png",
    "./frontend/models/skybox/left.png",
    "./frontend/models/skybox/top.png",
    "./frontend/models/skybox/bottom.png",
    "./frontend/models/skybox/front.png",
    "./frontend/models/skybox/back.png",
  ]);

  scene.background = texture;

  return null;
};
