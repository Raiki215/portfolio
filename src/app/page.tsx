"use client";
import * as THREE from "three";
import React, { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const scene = new THREE.Scene();
    let frameImageCreated = false;
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

    const initialWidth = 0.1;
    const maxWidth = 8;
    const height = 5;
    let currentWidth = initialWidth;

    const rectangleGeometry = new THREE.PlaneGeometry(initialWidth, height);
    const rectangleMaterial = new THREE.MeshBasicMaterial({
      color: 0xffe8b6,
      side: THREE.DoubleSide,
    });

    const rectangle = new THREE.Mesh(rectangleGeometry, rectangleMaterial);
    rectangle.position.x = -0.5;
    rectangle.position.z = -0.1;
    scene.add(rectangle);

    // ライトの設定
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    let isZooming = false;
    let isScrollDisabled = false;
    const zoomSpeed = 0.1;
    const targetZ = rectangle.position.z + 0.5;
    let currentZoomProgress = 0;
    let zoomFinished = false;

    const onWheel = (event: WheelEvent) => {
      if (isScrollDisabled) {
        event.preventDefault();
        return;
      }

      event.preventDefault();

      const scrollAmount = event.deltaY;
      if (!zoomFinished) {
        group.rotation.y -= scrollAmount * 0.005;

        currentWidth += scrollAmount * 0.01;
        if (currentWidth > maxWidth) currentWidth = maxWidth;
        if (currentWidth < initialWidth) currentWidth = initialWidth;

        const newGeometry = new THREE.PlaneGeometry(currentWidth, height);
        rectangle.geometry.dispose();
        rectangle.geometry = newGeometry;

        rectangle.position.x = -0.5 + currentWidth / 2;

        if (currentWidth > maxWidth * 0.9) {
          isZooming = true;
          isScrollDisabled = true; // スクロールを完全に無効化
          window.removeEventListener("wheel", onWheel);
        }
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    function animate() {
      if (isZooming) {
        currentZoomProgress = Math.min(
          1,
          currentZoomProgress + zoomSpeed * 0.01
        );

        camera.position.z = THREE.MathUtils.lerp(
          camera.position.z,
          targetZ,
          currentZoomProgress
        );
        camera.position.x = THREE.MathUtils.lerp(
          camera.position.x,
          rectangle.position.x,
          currentZoomProgress
        );
        camera.position.y = THREE.MathUtils.lerp(
          camera.position.y,
          rectangle.position.y,
          currentZoomProgress
        );

        if (currentZoomProgress >= 0.3 && !frameImageCreated) {
          isZooming = false;
          group.visible = false; // 巻物を非表示
          zoomFinished = true;
          scene.background = rectangleMaterial.color; // 背景色を四角形と同じ色に変更
          console.log(currentZoomProgress);
          camera.position.set(0, 0, 5);
          camera.lookAt(0, 0, 0);
          frameImageCreated = true;
          isScrollDisabled = false; // スクロール再開

          const canvas = document.createElement("canvas");
          const scaleFactor = 2; // 高解像度対応
          canvas.width = 1024 * scaleFactor;
          canvas.height = 512 * scaleFactor;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.scale(scaleFactor, scaleFactor);

          const image = new Image();
          image.src = "/public/frame.png";
          image.onload = () => {
            ctx.drawImage(
              image,
              0,
              0,
              canvas.width / scaleFactor,
              canvas.height / scaleFactor
            );
            window.addEventListener("wheel", onWheel, { passive: false });
          };
        }
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      }
    }
    animate();

    window.addEventListener("resize", () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });

    return () => {
      window.removeEventListener("wheel", onWheel);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    document.body.style.height = "100vh";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden"; // 完全にスクロールを無効化

    return () => {
      document.body.style.height = "";
      document.body.style.margin = "";
      document.body.style.overflow = "";
    };
  }, []);
  return <div></div>;
}
