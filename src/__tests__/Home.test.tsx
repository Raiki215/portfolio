// import React from 'react';
import { Scene, PerspectiveCamera } from "three";
// import { render } from '@testing-library/react';

jest.mock("three", () => {
  return {
    ...jest.requireActual("three"),
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      render: jest.fn(),
    })),
  };
});

test("カメラがシーンに正しく追加されるか", () => {
  const scene = new Scene();
  const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  scene.add(camera);

  expect(scene.children).toContain(camera);
});
