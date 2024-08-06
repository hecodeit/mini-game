import { Grid, KeyboardControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Physics, RapierRigidBody, RigidBody } from "@react-three/rapier";
import Ecctrl from "ecctrl";
import NiceColor from "nice-color-palettes";
import { useEffect, useMemo, useRef, useState } from "react";
import { Vector3 } from "three";

const boxColors = NiceColor[Math.floor(Math.random() * NiceColor.length)];

function RandomBox() {
  const cubeRef = useRef<RapierRigidBody>(null);
  useEffect(() => {
    if (cubeRef.current) {
      cubeRef.current?.setTranslation(
        {
          x: Math.random() * 10 - 5,
          y: Math.random() * 10,
          z: Math.random() * 10 + 5,
        },
        false
      );
    }
  }, []);
  return (
    <RigidBody ref={cubeRef} type="dynamic">
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={boxColors[Math.floor(Math.random() * 5)]} />
      </mesh>
    </RigidBody>
  );
}

function ShotBox() {
  const { camera } = useThree();
  const [cubeMesh, setCubeMesh] = useState<any[]>([]);
  const cubeRef = useRef<RapierRigidBody>(null);
  const direction = useMemo(() => new Vector3(), []);

  const clickToCreateBox = () => {
    const newMesh = (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={boxColors[Math.floor(Math.random() * 5)]} />
      </mesh>
    );
    setCubeMesh((prevMeshes:any) => [...prevMeshes, newMesh]);
  };

  useEffect(() => {
    camera.getWorldDirection(direction);
    if (cubeMesh.length > 0) {
      const cameraDirection = camera.getWorldDirection(new Vector3());
      const start = camera.position
        .clone()
        .add(cameraDirection.clone().multiplyScalar(3));
      start.y += 0;
      cubeRef.current?.setTranslation(
        { x: start.x, y: start.y, z: start.z },
        false
      );
      cubeRef.current?.setLinvel(
        new Vector3(
          direction.x * 10 + Math.random() * 2,
          direction.y * 10 + 5 + Math.random() * 2,
          direction.z * 10 + Math.random() * 2
        ),
        false
      );
      cubeRef.current?.setAngvel(
        new Vector3(Math.random() * 10, Math.random() * 10, Math.random() * 10),
        false
      );
    }
  }, [cubeMesh]);

  useEffect(() => {
    window.addEventListener("click", () => clickToCreateBox());

    return () => {
      window.removeEventListener("click", () => clickToCreateBox());
    };
  }, []);

  return (
    <>
      {cubeMesh.map((item, i) => {
        return (
          <RigidBody key={i} ref={cubeRef} colliders="cuboid">
            {item}
          </RigidBody>
        );
      })}
    </>
  );
}

function App() {
  /**
   * Keyboard control preset
   */
  const keyboardMap = [
    { name: "forward", keys: ["ArrowUp", "KeyW"] },
    { name: "backward", keys: ["ArrowDown", "KeyS"] },
    { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
    { name: "rightward", keys: ["ArrowRight", "KeyD"] },
    { name: "jump", keys: ["Space"] },
    { name: "run", keys: ["Shift"] },
  ];

  return (
    <>
      <Canvas>
        {/* lights */}
        <directionalLight
          position={[20, 30, 10]}
          intensity={5}
        />
        <ambientLight intensity={2} />

        {/* Grid */}
        <Grid
          args={[300, 300]}
          sectionColor={"lightgray"}
          cellColor={"gray"}
          position={[0, -0.99, 0]}
          userData={{ camExcludeCollision: true }} // this won't be collide by camera ray
        />
        {/* <ShootHelper start={playerPosition} /> */}

        <Physics debug={true} timeStep="vary">
          <KeyboardControls map={keyboardMap}>
            <Ecctrl
              autoBalance={false}
              camCollision={false}
              floatHeight={0}
              sprintMult={0}
              camInitDis={-0.5}
              camMinDis={-0.5}
              camMaxDis={-0.5}
              camFollowMult={100} // give any big number here, so the camera follows the character instantly
              turnVelMultiplier={1} // Turning speed same as moving speed
              turnSpeed={100} // give it big turning speed to prevent turning wait time
            ></Ecctrl>
          </KeyboardControls>

          {/* Random boxes */}
          {Array.from({ length: 40 }).map((_, index) => (
            <RandomBox key={index} />
          ))}

          <ShotBox />

          {/* floor */}
          <RigidBody type="fixed">
            <mesh receiveShadow position={[0, -3.5, 0]}>
              <boxGeometry args={[300, 5, 300]} />
              <meshStandardMaterial color="white" />
            </mesh>
          </RigidBody>
        </Physics>
      </Canvas>
    </>
  );
}

export default App;
