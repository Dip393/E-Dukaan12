import { Canvas } from '@react-three/fiber';

import { OrbitControls, useGLTF } from '@react-three/drei';



const ThreeD
 = () => {

  const earth = useGLTF('../assets.model/model.gltf');



return (

    <Canvas className="cursor-pointer" frameloop="demand" camera={{ position: [-4, 3, 6], fov: 45, near: 0.1, far: 200 }}>

      <OrbitControls autoRotate enableZoom={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 2} enablePan={false} />

      <primitive object={earth.scene} scale={2.5} />

    </Canvas>

  );

};



export default ThreeD
;

