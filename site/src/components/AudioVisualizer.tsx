import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import styles from './AudioVisualizer.module.css';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { Reflector } from 'three/examples/jsm/objects/Reflector';
import { CubeTextureLoader } from 'three';

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frequencyData = new Uint8Array(256);
  const timeDomainData = new Uint8Array(256);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [source, setSource] = useState<MediaElementAudioSourceNode | null>(null);

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      let aContext = audioContext;
      if (!aContext) {
        aContext = new window.AudioContext();
        setAudioContext(aContext);
      }

      let aSource = source;
      if (!aSource) {

        aSource = aContext.createMediaElementSource(audioRef.current)
        setSource(aSource)
      }
      let aAnalyser = analyser;
      if (!aAnalyser) {
        aAnalyser = aContext.createAnalyser();
        setAnalyser(aAnalyser);
      }
      aSource.connect(aAnalyser);
    
      aAnalyser.connect(aContext.destination);
      aAnalyser.fftSize = 512;
  }
  };

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
  
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
      }
    };
  }, [audioRef]);


  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const gridSize = 128;

    const zoom = 275;
    const camera = new THREE.PerspectiveCamera(50, width / height);
    camera.position.set(0, 10, zoom);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const scene = new THREE.Scene();

    const skyboxLoader = new CubeTextureLoader();
    const skyboxTexture = skyboxLoader.load([
      'images/px.png',
      'images/nx.png',
      'images/py.png',
      'images/ny.png',
      'images/pz.png',
      'images/nz.png',
    ]);
    scene.background = skyboxTexture;

    const geometry = new THREE.BoxGeometry(1.5, 1, 1.5);
    const material = new THREE.MeshPhongMaterial({
      emissive: 0xffffff,
      shininess: 200,
      specular: 0xffffff,
      flatShading: false,
      reflectivity: 1.4,
      refractionRatio: 0,
      envMap: skyboxTexture,
    });

    const instanceCount = gridSize * gridSize;
    const instancedMesh = new THREE.InstancedMesh(
      geometry,
      material,
      instanceCount
    );
    instancedMesh.userData.y = new Float32Array(instanceCount);

    scene.add(instancedMesh);

    const reflectorGeometry = new THREE.PlaneGeometry(1000, 1000);
    const reflector = new Reflector(reflectorGeometry, {
      clipBias: 0,
      textureWidth: window.innerWidth * window.devicePixelRatio * .25,
      textureHeight: window.innerHeight * window.devicePixelRatio * .25,
      color: 0x777777,
    });
    reflector.position.y = -0.1;
    reflector.rotateX(-Math.PI / 2);
    scene.add(reflector);

    const waveClock = new THREE.Clock();
    const waveSpeed = 1;

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const rotatingGroup = new THREE.Group();
    scene.add(rotatingGroup);
    rotatingGroup.add(instancedMesh);
    rotatingGroup.rotateY(Math.PI / 4);

    let frameCount = 0;
    const skipFrames = 2;

    const animate = () => {
      requestAnimationFrame(animate);
      frameCount++;

      console.log(audioRef?.current?.volume)

      const elapsedTime = waveClock.getElapsedTime() * waveSpeed;
      const minSize = 1;
      const scaleSize = 20;

      analyser?.getByteFrequencyData(frequencyData);
      analyser?.getByteTimeDomainData(timeDomainData);

      if (frameCount % skipFrames === 0) {
        const matrix = new THREE.Matrix4();
        for (let i = 0; i < instanceCount; i++) {
          const x = (i % gridSize) - gridSize / 2;
          const z = Math.floor(i / gridSize) - gridSize / 2;
          const y = (frequencyData[i % frequencyData.length] / 256) * 50 - minSize - reflector.position.y;
          //Math.abs(Math.sin(elapsedTime * 0.01));
          const targetY = (y + instancedMesh.userData.y[i]) / 2;
          instancedMesh.userData.y[i] = targetY;
          matrix.makeTranslation(x * 2, targetY, z * 2);

          const scaleY = Math.max(
            minSize,
            Math.log2(targetY / 2 + 1) *
              (scaleSize + frequencyData[i % frequencyData.length] / 256)
          );
          matrix.scale(new THREE.Vector3(1, scaleY, 1));

          instancedMesh.setMatrixAt(i, matrix);
        }
        instancedMesh.instanceMatrix.needsUpdate = true;
      }
      rotatingGroup.rotation.y = elapsedTime * 0.1;
      composer.render();
    };

    const onWindowResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      composer.setSize(width, height);
    };

    window.addEventListener('resize', onWindowResize);

    animate();

    return () => {
      renderer.domElement.remove();
      window.removeEventListener('resize', onWindowResize);
    };
  }, [audioRef, analyser, audioContext, source]);

  return <div ref={containerRef} className={styles.container}></div>;
};

export default AudioVisualizer;
