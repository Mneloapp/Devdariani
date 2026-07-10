import { Environment, Lightformer } from "@react-three/drei";

export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.16} />
      <directionalLight color="#E7E2D8" intensity={2.2} position={[-3.8, 4.2, 3.6]} />
      <directionalLight color="#8B8D89" intensity={0.95} position={[4.6, 1.4, -3.8]} />
      <pointLight color="#A99478" distance={4.2} intensity={1.2} position={[0.1, -0.35, 1.2]} />
      <Environment resolution={128}>
        <Lightformer color="#E7E2D8" form="rect" intensity={2.2} position={[-3, 3, 2]} scale={[3, 5, 1]} />
        <Lightformer color="#A99478" form="rect" intensity={0.8} position={[3, -1, -2]} scale={[2, 2, 1]} />
        <Lightformer color="#54575B" form="ring" intensity={0.7} position={[0, 2, -4]} scale={3} />
      </Environment>
    </>
  );
}
