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
  };
});

describe("Home Component", () => {
  test("renders without crashing", () => {
    render(<Home />);
  });

  test("should initialize Three.js scene", () => {
    render(<Home />);
    const renderer = THREE.WebGLRenderer; // モックされた WebGLRenderer を確認
    const textureLoader = THREE.TextureLoader; // モックされた TextureLoader を確認
    expect(renderer).toHaveBeenCalled();
    expect(textureLoader).toHaveBeenCalled();
  });
});
