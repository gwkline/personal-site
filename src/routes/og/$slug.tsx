import { readFileSync } from "node:fs";

import { Resvg } from "@resvg/resvg-js";
import { createFileRoute } from "@tanstack/react-router";
import satori from "satori";

import { getPostBySlug } from "@/lib/posts";

const WIDTH = 1200;
const HEIGHT = 630;
const fontBuffer = readFileSync(
  new URL("../../assets/mona-sans-semibold.ttf", import.meta.url)
);

const OgCard = ({
  date,
  description,
  title,
}: {
  date: string;
  description?: string;
  title: string;
}) => (
  <div
    style={{
      backgroundImage:
        "linear-gradient(115deg, #f09a58 0%, #f6c08f 28%, #d8e3e9 62%, #3279c6 100%)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      justifyContent: "space-between",
      padding: 72,
      width: "100%",
    }}
  >
    <div
      style={{
        color: "#031024",
        display: "flex",
        fontSize: 22,
        letterSpacing: "0.16em",
        opacity: 0.75,
        textTransform: "uppercase",
      }}
    >
      FIELD NOTES
    </div>
    <div
      style={{
        backgroundColor: "#061633",
        borderRadius: 24,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        padding: 48,
        width: "100%",
      }}
    >
      <div
        style={{
          color: "#f4f0e8",
          display: "flex",
          fontSize: title.length > 42 ? 58 : 72,
          fontWeight: 600,
          lineHeight: 1.1,
        }}
      >
        {title}
      </div>
      {description ? (
        <div
          style={{
            color: "#d8e3e9",
            display: "flex",
            fontSize: 30,
            opacity: 0.85,
          }}
        >
          {description}
        </div>
      ) : null}
    </div>
    <div
      style={{
        color: "#031024",
        display: "flex",
        fontSize: 24,
        justifyContent: "space-between",
        opacity: 0.8,
      }}
    >
      <div style={{ display: "flex" }}>gavinkline.com</div>
      <div style={{ display: "flex" }}>{date}</div>
    </div>
  </div>
);

export const Route = createFileRoute("/og/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const post = getPostBySlug(params.slug);
        if (!post) {
          return new Response("Not found", { status: 404 });
        }
        const svg = await satori(
          <OgCard
            date={post.date}
            description={post.description}
            title={post.title}
          />,
          {
            fonts: [
              {
                data: fontBuffer,
                name: "Mona Sans",
                style: "normal",
                weight: 600,
              },
            ],
            height: HEIGHT,
            width: WIDTH,
          }
        );
        const png = new Resvg(svg, {
          fitTo: { mode: "width", value: WIDTH },
        })
          .render()
          .asPng();
        return new Response(new Uint8Array(png), {
          headers: {
            "Cache-Control": "public, max-age=86400",
            "Content-Type": "image/png",
          },
        });
      },
    },
  },
});
