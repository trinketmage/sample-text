import {
  TextureLoader,
} from "three";

export const loader = new TextureLoader();

const assets = {
  fonts: {
    regular: loader.load("/assets/fonts/Roboto-Black.png")
  }
};

export default assets;
