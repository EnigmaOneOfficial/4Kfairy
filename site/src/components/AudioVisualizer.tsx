'use client'
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import styles from './AudioVisualizer.module.css';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { Reflector } from 'three/examples/jsm/objects/Reflector';
import { CubeTextureLoader } from 'three';

const audioContextMap = new Map<HTMLAudioElement, AudioContext>();
const sourceNodeMap = new Map<HTMLAudioElement, MediaElementAudioSourceNode>();
interface AudioVisualizerProps {
  audioElement: HTMLAudioElement;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioElement }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frequencyData = new Uint8Array(256);
  const timeDomainData = new Uint8Array(256);

  useEffect(() => {
    if (!containerRef.current) return;

    let analyser: AnalyserNode | null = null;
    if (audioElement) {
      let audioContext = audioContextMap.get(audioElement);
      if (!audioContext) {
        audioContext = new window.AudioContext();
        audioContextMap.set(audioElement, audioContext);
      }
      let source = sourceNodeMap.get(audioElement);
      if (!source) {
        source = audioContext.createMediaElementSource(audioElement);
        sourceNodeMap.set(audioElement, source);
      }
      analyser = audioContext.createAnalyser();
      source.connect(analyser);

      analyser.connect(audioContext.destination);
      analyser.fftSize = 512;
    }
    
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const gridSize = 126;

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
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
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

    const animate = () => {
      requestAnimationFrame(animate);

      const elapsedTime = waveClock.getElapsedTime() * waveSpeed;
      const minSize = 10;

      analyser?.getByteFrequencyData(frequencyData);
      analyser?.getByteTimeDomainData(timeDomainData);

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
            (minSize + frequencyData[i % frequencyData.length] / 256)
        );
        matrix.scale(new THREE.Vector3(1, scaleY, 1));

        instancedMesh.material.opacity = 0;
        instancedMesh.setMatrixAt(i, matrix);
      }
      instancedMesh.instanceMatrix.needsUpdate = true;

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
  }, [audioElement]);

  return <div ref={containerRef} className={styles.container}></div>;
};

export default AudioVisualizer;
