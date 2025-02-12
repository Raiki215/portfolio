"use client";
import { useEffect } from "react";
import * as THREE from "three";
import React from "react";
import Chart from "chart.js/auto";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

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

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0px";
    document.body.appendChild(labelRenderer.domElement);

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

    // 矩形（赤い四角）の設定
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

    // アニメーション関連の設定
    let isZooming = false;
    let isScrollDisabled = false;
    const zoomSpeed = 0.1;
    const targetZ = rectangle.position.z + 0.5;
    let currentZoomProgress = 0;
    let zoomFinished = false;

    const images: THREE.Mesh[] = [];

    function getFontSettings(url: string) {
      if (url === "/long-frame.png") {
        // frame.png と比べた倍率を計算（例：2000/965 ≒ 2.07）
        // const scaleFactor = 2000 / 965;
        return {
          baseFontSize: 30,
          secondaryFontSize: 24,
          baseLineSpacing: 30,
          secondaryLineSpacing: 24,
        };
      } else {
        // デフォルトの設定（frame.png 用）
        return {
          baseFontSize: 48,
          secondaryFontSize: 24,
          baseLineSpacing: 48 + 15,
          secondaryLineSpacing: 24 + 5,
        };
      }
    }

    function createImagePlaneWithText(
      url: string,
      textArray: string[],
      x: number,
      y: number,
      order: number
    ) {
      const imageWidth = 965 / 100;
      const imageHeight = 559 / 100;

      const canvas = document.createElement("canvas");
      const scaleFactor = 2; // 高解像度対応
      canvas.width = 1024 * scaleFactor;
      canvas.height = 512 * scaleFactor;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(scaleFactor, scaleFactor);

      const loadFont = async () => {
        const font = new FontFace("CustomFont", "url(/font/font.ttf)");
        await font.load();
        document.fonts.add(font);

        const image = new Image();
        image.src = url;
        image.onload = () => {
          ctx.drawImage(
            image,
            0,
            0,
            canvas.width / scaleFactor,
            canvas.height / scaleFactor
          );

          // フォント設定をURLごとに取得
          const fontSettings = getFontSettings(url);

          if (order === 0) {
            const startX = 900;
            const startY = 100;
            const columnSpacing = 100;

            textArray.forEach((text, index) => {
              const isFirstText = index === 0;
              const fontSize = isFirstText
                ? fontSettings.baseFontSize
                : fontSettings.secondaryFontSize;
              const lineSpacing = isFirstText
                ? fontSettings.baseLineSpacing
                : fontSettings.secondaryLineSpacing;

              ctx.font = `bold ${fontSize}px CustomFont`;
              ctx.fillStyle = "black";
              ctx.textAlign = "center";

              const textX = startX - index * columnSpacing;
              let textY = startY;
              for (let i = 0; i < text.length; i++) {
                ctx.fillText(text[i], textX, textY);
                textY += lineSpacing;
              }
            });
            const additionalImage = new Image();
            additionalImage.src = "chick.jpg"; // 追加する画像のパス
            additionalImage.onload = () => {
              const imagePosX = startX - 830; // 位置調整
              const imagePosY = startY + 200; // テキストの下に配置
              const imageWidth = 200;
              const imageHeight = 150;
              ctx.drawImage(
                additionalImage,
                imagePosX,
                imagePosY,
                imageWidth,
                imageHeight
              );
            };
          } else if (order === 1) {
            const startX = 900;
            const startY = 100;
            const columnSpacing = 100;

            textArray.forEach((text, index) => {
              const isFirstText = index === 0;
              const fontSize = isFirstText
                ? fontSettings.baseFontSize
                : fontSettings.secondaryFontSize;
              const lineSpacing = isFirstText
                ? fontSettings.baseLineSpacing
                : fontSettings.secondaryLineSpacing;

              ctx.font = `bold ${fontSize}px CustomFont`;
              ctx.fillStyle = "black";
              ctx.textAlign = "center";

              const textX = startX - index * columnSpacing;
              let textY = startY;
              for (let i = 0; i < text.length; i++) {
                ctx.fillText(text[i], textX, textY);
                textY += lineSpacing;
              }
            });
            const createDoughnutChart = (
              dataValue: number,
              labelText: string,
              color: string, // 追加: 個別の色を指定
              posX: number,
              posY: number
            ) => {
              const chartCanvas = document.createElement("canvas");
              chartCanvas.width = 200;
              chartCanvas.height = 300;
              const chartCtx = chartCanvas.getContext("2d");

              if (chartCtx) {
                new Chart(chartCtx, {
                  type: "doughnut",
                  data: {
                    labels: ["Used", "Remaining"],
                    datasets: [
                      {
                        data: [dataValue, 100 - dataValue],
                        backgroundColor: [color, "lightgray"], // ★ color を適用
                      },
                    ],
                  },
                  options: {
                    responsive: false,
                    cutout: "70%",
                    animation: {
                      duration: 300,
                      onComplete: function () {
                        ctx.drawImage(chartCanvas, posX, posY, 200, 200);
                      },
                    },
                    plugins: {
                      legend: { display: false },
                      tooltip: { enabled: false },
                    },
                  },
                  plugins: [
                    {
                      id: "centerAndText",
                      beforeDraw: (chart) => {
                        const {
                          ctx,
                          chartArea: { width, height },
                        } = chart;
                        ctx.save();
                        // 中央の数字
                        ctx.font = "bold 30px CustomFont";
                        ctx.fillStyle = "black";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText(`${dataValue}%`, width / 2, height / 2);
                        // 下部のテキスト
                        ctx.font = "bold 25px CustomFont";
                        ctx.fillText(labelText, width / 2, height - 20);
                        ctx.restore();
                      },
                    },
                  ],
                });
              }
            };

            // 6つのチャートを描画（色を個別に指定）
            createDoughnutChart(75, "Javascript", "goldenrod", 650, 50);
            createDoughnutChart(60, "HTML", "black", 400, 50);
            createDoughnutChart(60, "CSS", "yellow", 150, 50);
            createDoughnutChart(55, "Python", "purple", 650, 250);
            createDoughnutChart(45, "PHP", "green", 400, 250);
            createDoughnutChart(20, "Java", "red", 150, 250);
          } else if (order === 2) {
            const leftText = textArray[0] || "成果物";
            const leftTextX = 980; // 左側テキストの x 座標（ここを変更すると左右位置が変わる）
            let leftTextY = 80; // 左側テキストの開始 y 座標
            ctx.font = `bold ${fontSettings.baseFontSize}px CustomFont`;
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            for (let i = 0; i < leftText.length; i++) {
              ctx.fillText(leftText[i], leftTextX, leftTextY);
              leftTextY += fontSettings.baseLineSpacing; // 行間（ここを変更すると縦方向の間隔が変わる）
            }

            const insertedImage = new Image();
            const insertedImage2 = new Image();
            insertedImage.src = "equipment.png"; // 追加する画像のパス
            insertedImage2.src = "casino.png";
            insertedImage.onload = () => {
              const insertedX = 700; // 左側テキストの右から 100px（調整可能）
              const insertedY = 100; // 画像の y 座標（調整可能）
              const insertedWidth = 250; // 画像の幅（調整可能）
              const insertedHeight = 250; // 画像の高さ（調整可能）
              ctx.drawImage(
                insertedImage,
                insertedX,
                insertedY,
                insertedWidth,
                insertedHeight
              );
              // 長いフレーム内に追加で描画したいテキスト群を配列で定義
              const additionalTextItems = [
                {
                  text: "開発したのは備品管理システム", // 描画するテキスト
                  x: 680, // 描画するx座標（例：画像の右側に配置）
                  y: 80, // 描画開始のy座標
                  font: `18px CustomFont`, // 使用するフォントサイズとフォント
                },
                {
                  text: "自分は主にパソコン側のフロン",
                  x: 650,
                  y: 80,
                  font: `18px CustomFont`,
                },
                {
                  text: "トエンドを担当しました", // 任意でさらに追加可能
                  x: 620,
                  y: 80,
                  font: `18px CustomFont`,
                },
                {
                  text: "QRコ|ドの読み込みやUI", // 任意でさらに追加可能
                  x: 590,
                  y: 80,
                  font: `18px CustomFont`,
                },
                {
                  text: "UXに気をつけて開発を行った", // 任意でさらに追加可能
                  x: 560,
                  y: 80,
                  font: `18px CustomFont`,
                },
                // 必要な分だけオブジェクトを追加できます
              ];

              // 各テキストアイテムについて、縦書きにする例（1文字ずつ描画）
              additionalTextItems.forEach((item) => {
                ctx.font = item.font;
                ctx.fillStyle = "black";
                ctx.textAlign = "center";
                let currentY = item.y;
                for (let i = 0; i < item.text.length; i++) {
                  ctx.fillText(item.text[i], item.x, currentY);
                  currentY += fontSettings.baseLineSpacing; // 行間（調整可能）
                }
              });

              if (imageTexture) imageTexture.needsUpdate = true;
            };
            insertedImage2.onload = () => {
              const insertedX2 = 260; // 左側テキストの右から 100px（調整可能）
              const insertedY2 = 100; // 画像の y 座標（調整可能）
              const insertedWidth2 = 250; // 画像の幅（調整可能）
              const insertedHeight2 = 250; // 画像の高さ（調整可能）
              ctx.drawImage(
                insertedImage2,
                insertedX2,
                insertedY2,
                insertedWidth2,
                insertedHeight2
              );
              const additionalTextItems2 = [
                {
                  text: "1年生の時にPHPを使って", // 描画するテキスト
                  x: 230, // 描画するx座標（例：画像の右側に配置）
                  y: 80, // 描画開始のy座標
                  font: `20px CustomFont`, // 使用するフォントサイズとフォント
                },
                {
                  text: "カジノアプリを開発しました",
                  x: 200,
                  y: 80,
                  font: `20px CustomFont`,
                },
                {
                  text: "この開発ではログイン機能と",
                  x: 170,
                  y: 80,
                  font: `20px CustomFont`,
                },
                {
                  text: "アカウント削除・遊戯一覧を",
                  x: 140,
                  y: 80,
                  font: `20px CustomFont`,
                },
                {
                  text: "担当しました",
                  x: 110,
                  y: 80,
                  font: `20px CustomFont`,
                },
              ];
              additionalTextItems2.forEach((item) => {
                ctx.font = item.font;
                ctx.fillStyle = "black";
                ctx.textAlign = "center";
                let currentY2 = item.y;
                for (let i = 0; i < item.text.length; i++) {
                  ctx.fillText(item.text[i], item.x, currentY2);
                  currentY2 += fontSettings.baseLineSpacing; // 行間（調整可能）
                }
              });
            };
          }

          const imageTexture = new THREE.CanvasTexture(canvas);
          imageTexture.minFilter = THREE.LinearFilter;
          imageTexture.magFilter = THREE.LinearFilter;

          let imageGeometry;
          if (url === "/long-frame.png") {
            const longImageWidth = 1930 / 100;
            imageGeometry = new THREE.PlaneGeometry(
              longImageWidth,
              imageHeight
            );
          } else {
            imageGeometry = new THREE.PlaneGeometry(imageWidth, imageHeight);
          }

          const imageMaterial = new THREE.MeshBasicMaterial({
            map: imageTexture,
            transparent: true,
            side: THREE.DoubleSide,
          });

          const imagePlane = new THREE.Mesh(imageGeometry, imageMaterial);
          imagePlane.position.set(x, y, -0.1);
          imagePlane.userData.order = order;
          if (url === "/long-frame.png") {
            imagePlane.userData.offsetAdjustment = -5;
          }
          scene.add(imagePlane);
          images.push(imagePlane);

          if (order === 2) {
            const linkElement = document.createElement("a");
            const linkElement2 = document.createElement("a");
            const linkElement3 = document.createElement("a");

            linkElement.href =
              "https://github.com/takumiTakahata/equipment_management_system"; // 遷移先のパス（絶対URLでも可）
            linkElement.innerText = "github";
            linkElement.style.color = "blue";
            linkElement2.href =
              "https://github.com/tsushima3074/Hackathon_casino"; // 遷移先のパス（絶対URLでも可）
            linkElement2.innerText = "github";
            linkElement2.style.color = "blue";
            linkElement3.href =
              "https://www.figma.com/design/9XGETQ1nEzPpt2VSeFqPpY/%E7%94%BB%E9%9D%A2%E8%A8%AD%E8%A8%88?node-id=0-1&p=f&t=qxNEnyjGtu4yVnaD-0"; // 遷移先のパス（絶対URLでも可）
            linkElement3.innerText = "figma";
            linkElement3.style.color = "blue";
            // linkElement4.href = "https://www.google.co.jp/"; // 遷移先のパス（絶対URLでも可）
            // linkElement4.innerText = "figma";
            // linkElement4.style.color = "blue";
            // linkElement.style.textDecoration = "underline";
            linkElement.style.cursor = "pointer";
            linkElement2.style.cursor = "pointer";
            linkElement3.style.cursor = "pointer";

            linkElement.style.writingMode = "vertical-lr"; // 文字を右から左へ縦書きにする（"vertical-lr" も選択可能）
            linkElement.style.textOrientation = "upright";
            linkElement.style.fontFamily = "CustomFont";
            linkElement.style.fontSize = "20px";
            linkElement2.style.writingMode = "vertical-lr"; // 文字を右から左へ縦書きにする（"vertical-lr" も選択可能）
            linkElement2.style.textOrientation = "upright";
            linkElement2.style.fontFamily = "CustomFont";
            linkElement2.style.fontSize = "20px";
            linkElement3.style.writingMode = "vertical-lr"; // 文字を右から左へ縦書きにする（"vertical-lr" も選択可能）
            linkElement3.style.textOrientation = "upright";
            linkElement3.style.fontFamily = "CustomFont";
            linkElement3.style.fontSize = "20px";

            // CSS2DObject を作成して、3Dシーン上に配置
            const labelObject = new CSS2DObject(linkElement);
            const labelObject2 = new CSS2DObject(linkElement2);
            const labelObject3 = new CSS2DObject(linkElement3);
            // ここで設定する座標は、imagePlane のローカル座標（Three.js のワールド単位）です。
            // 下記は例です。必要に応じて値を調整してください。
            labelObject.position.set(0.5, -1.5, 0);
            labelObject2.position.set(-8, -1.5, 0);
            labelObject3.position.set(0.5, 1.5, 0);

            imagePlane.add(labelObject);
            imagePlane.add(labelObject2);
            imagePlane.add(labelObject3);
          }
        };
      };

      loadFont();
    }

    let targetX = 0;

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
      } else {
        targetX += scrollAmount * 0.01;
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
          // createImagePlane("/frame.png", initialX);
          createImagePlaneWithText(
            "/frame.png",
            [
              "自己紹介",
              "2004年2月15日生まれ",
              "岩手県滝沢市出身",
              "盛岡第四高等学校出身",
              "強みはポジティブ思考",
              "趣味は読書",
              "嫌いなものはひよこ",
              "よろしくね！！",
            ],
            -window.innerWidth / 2,
            0,
            0
          );

          createImagePlaneWithText(
            "/frame.png",
            ["技術"],
            -window.innerWidth / 2,
            0,
            1
          );

          createImagePlaneWithText(
            "/long-frame.png",
            [
              "成果物",
              "テキストテキストテキストテキ",
              "テキストテキストテキストテキ",
            ],
            -window.innerWidth / 2,
            0,
            2
          );

          frameImageCreated = true;
          isScrollDisabled = false; // スクロール再開
          window.addEventListener("wheel", onWheel, { passive: false });
        }
      }

      const sortImages = images
        .slice()
        .sort((a, b) => a.userData.order - b.userData.order);

      sortImages.forEach((image, index) => {
        const offsetAdjustment = image.userData.offsetAdjustment || 0;
        const targetPositionX = targetX - index * 11 + offsetAdjustment;
        image.position.x = THREE.MathUtils.lerp(
          image.position.x,
          targetPositionX,
          0.1
        );
        // console.log(image.position.x);
      });

      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
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
