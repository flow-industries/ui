import {
  harbour,
  keyring,
  type LoaderFigure,
  lighthouse,
  metronome,
  pigeonholes,
} from "../src/loaders";

// Compile-time only: the figures are `@ts-nocheck` modules, so their inferred
// types are what consumers see when they pass one to `<Loader figure>`.
export const figures: LoaderFigure[] = [
  harbour,
  keyring,
  lighthouse,
  metronome,
  pigeonholes,
];
