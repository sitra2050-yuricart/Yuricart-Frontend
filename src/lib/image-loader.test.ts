import { describe, expect, it } from "vitest";
import imageLoader from "./image-loader";

const base = "https://res.cloudinary.com/demo/image/upload";

describe("imageLoader", () => {
  it("adds transforms to an untransformed Cloudinary URL", () => {
    expect(imageLoader({ src: `${base}/v1/a/b.jpg`, width: 384 })).toBe(
      `${base}/f_auto,q_auto,c_limit,w_384/v1/a/b.jpg`,
    );
  });

  it("replaces the width of an already transformed URL", () => {
    expect(
      imageLoader({ src: `${base}/f_auto,q_auto,c_limit,w_1600/v1/a/b.jpg`, width: 640 }),
    ).toBe(`${base}/f_auto,q_auto,c_limit,w_640/v1/a/b.jpg`);
  });

  it("fills in missing format and quality when only a width is present", () => {
    expect(imageLoader({ src: `${base}/w_128/v1/a/b.jpg`, width: 256 })).toBe(
      `${base}/f_auto,q_auto,c_limit,w_256/v1/a/b.jpg`,
    );
  });

  it("passes non-Cloudinary URLs through", () => {
    expect(imageLoader({ src: "/placeholder.png", width: 256 })).toBe("/placeholder.png");
    expect(imageLoader({ src: "https://picsum.photos/id/1/800/800", width: 256 })).toBe(
      "https://picsum.photos/id/1/800/800",
    );
  });
});
