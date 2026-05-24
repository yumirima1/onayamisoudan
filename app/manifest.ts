import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "よるの相談箱",
    short_name: "よるの相談箱",
    description: "匿名で悩みを静かに書ける、深夜の手紙箱のような相談場所です。",
    start_url: "/",
    display: "standalone",
    background_color: "#0d1118",
    theme_color: "#0d1118",
    lang: "ja"
  };
}
