import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const samples = load();
const indices = samples.filter(sample => ((sample.tick > 24) && (sample.tick <= 96))).map(sample => sample.index);

export default function() {
  const index = indices[Math.floor(indices.length * Math.random())];
  const sample = samples[index];
  const head = samples.slice(index - 23, index + 1);
  const tail = samples.slice(index + 1, index + 25);

  const anchorPrice = sample.close;

  let minPrice = Infinity;
  let maxPrice = Infinity;
  for (const sample of head) {
    minPrice = Math.min(sample.low, minPrice);
    maxPrice = Math.min(sample.high, maxPrice);
  }

  const range = (maxPrice - minPrice) * 0.2 * Math.random();
  const minZoom = 0.5;
  const maxZoom = 2.0;
  const zoom = minZoom + (maxZoom - minZoom) * Math.random();

  return {
    input: [
      ...points(head, "high", anchorPrice, zoom, range),
      ...points(head, "low", anchorPrice, zoom, range),
      ...array(72, sample.phase, 360),
    ],
    output: [
      ...points(tail, "high", anchorPrice, zoom),
      ...points(tail, "low", anchorPrice, zoom),
    ],
  };
}

function load() {
  const file = fs.readFileSync(path.dirname(fileURLToPath(import.meta.url)) + "/samples.txt").toString();
  const samples = [];

  let index = 0;
  for (const line of file.split("\n")) {
    if (line.length) samples.push(parse(index++, line));
  }

  let maxVolume = 0;
  for (const sample of samples) {
    maxVolume = Math.max(maxVolume, sample.volume);
  }
  for (const sample of samples) sample.volume /= maxVolume;

  return samples;
}

function parse(index, line) {
  const chunks = line.split(" ");

  return {
    index: index,
    group: Number(chunks[0]),
    tick: Number(chunks[1]),
    day: Number(chunks[2]),
    hour: Number(chunks[3]),
    sun: Number(chunks[4]),
    moon: Number(chunks[5]),
    phase: Number(chunks[6]),
    open: Number(chunks[7]),
    high: Number(chunks[8]),
    low: Number(chunks[9]),
    close: Number(chunks[10]),
    volume: Number(chunks[11]),
  };
}

function empty(size) {
  const array = [];

  for (let i = 0; i < size; i++) {
    array.push(0);
  }

  return array;
}

function array(size, value, max) {
  const array = empty(size);

  if (max) {
    array[Math.floor(size * value / max)] = 1;
  } else {
    array[Math.floor(value)] = 1;
  }

  return array;
}

function points(samples, metric, anchor, zoom, range) {
  const array = [];

  for (const sample of samples) {
    array.push(value(sample[metric], anchor, zoom, range));
  }

  return array;
}

function value(value, anchor, zoom, range) {
  const random = range ? range * (Math.random() - 0.5) : 0;
  return 1.0 + (value + random - anchor) * zoom;
}
