"use client";
import * as THREE from "three";
import React, { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdcb879);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 巻物の設定
    const mainGeometry = new THREE.CylinderGeometry(1, 1, 5, 32);
    const textureLoader = new THREE.TextureLoader();
    const patternTexture = textureLoader.load("/fix-scroll.jpg");
    patternTexture.wrapS = THREE.RepeatWrapping;
    patternTexture.wrapT = THREE.RepeatWrapping;
    patternTexture.repeat.set(1, 1);
    patternTexture.offset.set(0.47, 0);

    const mainMaterial = new THREE.MeshStandardMaterial({
      map: patternTexture,
      roughness: 0.5,
      metalness: 0.0,
    });
    const mainCylinder = new THREE.Mesh(mainGeometry, mainMaterial);

    const smallGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 32);
    const smallMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.8,
      metalness: 0.0,
    });

    const topCylinder = new THREE.Mesh(smallGeometry, smallMaterial);
    const bottomCylinder = new THREE.Mesh(smallGeometry, smallMaterial);

    topCylinder.position.y = 2.75;
    bottomCylinder.position.y = -2.75;

    const group = new THREE.Group();
    group.add(mainCylinder);
    group.add(topCylinder);
    group.add(bottomCylinder);
    scene.add(group);

    // ライトの設定
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    window.addEventListener("resize", () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });

    return () => {
      renderer.dispose();
    };
  }, []);
  return <div></div>;
}
