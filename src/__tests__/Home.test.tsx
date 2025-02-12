import React from "react";
import { render } from "@testing-library/react";
import Home from "../app/page"; // ここでコンポーネントのパスを指定
import * as THREE from "three";

// Three.js のモックを作成
jest.mock("three", () => {
  const originalThree = jest.requireActual("three");
  return {
    ...originalThree,
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      setSize: jest.fn(),
      domElement: document.createElement("canvas"),
      render: jest.fn(),
      dispose: jest.fn(),
    })),
    TextureLoader: jest.fn().mockImplementation(() => ({
      load: jest.fn(() => ({
        wrapS: 0,
        wrapT: 0,
        repeat: { set: jest.fn() },
        offset: { set: jest.fn() },
      })),
    })),
    Scene: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
    })),
    PerspectiveCamera: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() },
      lookAt: jest.fn(),
    })),
  };
});

describe("Home コンポーネントのテスト", () => {
  test("クラッシュせずにレンダリングされること", () => {
    render(<Home />);
  });

  test("Three.js のシーンが正しく初期化されること", () => {
    render(<Home />);
    const renderer = THREE.WebGLRenderer; // モックされた WebGLRenderer を確認
    const textureLoader = THREE.TextureLoader; // モックされた TextureLoader を確認
    expect(renderer).toHaveBeenCalled();
    expect(textureLoader).toHaveBeenCalled();
  });

  test("Three.js のシーンが作成されること", () => {
    render(<Home />);
    const scene = THREE.Scene;
    expect(scene).toHaveBeenCalled();
  });

  test("PerspectiveCamera が正しいパラメータで作成されること", () => {
    render(<Home />);
    const perspectiveCamera = THREE.PerspectiveCamera;
    expect(perspectiveCamera).toHaveBeenCalledWith(
      75,
      expect.any(Number),
      0.1,
      1000
    );
  });

  test("ホイールイベントリスナーが追加されること", () => {
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");
    render(<Home />);
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "wheel",
      expect.any(Function),
      { passive: false }
    );
  });

  test("アンマウント時にホイールイベントリスナーが削除されること", () => {
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
    const { unmount } = render(<Home />);
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "wheel",
      expect.any(Function)
    );
  });
});
