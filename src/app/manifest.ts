import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Celo Catch",
    short_name: "Celo Catch",
    description: "Cast once a day, catch a fish, and record it on Celo.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4ea",
    theme_color: "#f6c453",
    orientation: "portrait",
  };
}
