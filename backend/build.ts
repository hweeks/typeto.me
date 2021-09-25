import { resolve } from "path";
import glob from "glob";
import { pnpPlugin } from "@yarnpkg/esbuild-plugin-pnp";
import { build } from "esbuild";
import rimraf from "rimraf";

export const build_world = (source_files, output_location) => {
  rimraf.sync(output_location);
  build({
    plugins: [pnpPlugin()],
    entryPoints: source_files,
    target: "node14.15.0",
    platform: "node",
    outdir: output_location,
    format: "cjs",
  }).catch(() => process.exit(1));
};


const pull_files_by_type = (extension, base_location, src_folder) =>
  glob.sync(`${resolve(base_location, src_folder)}/**/*.${extension}`);

const find_that_config = async () => {
  let base_build_config = {
    extensions: ["ts",],
    filter: [".spec."],
    dirs: ["src"],
    output: "dist",
    sources: ["src"],
  };
  return base_build_config;
};

const find_them_files = async () => {
  const file_config = await find_that_config();
  const root_files = file_config.sources
    .map((src) =>
      file_config.extensions.map((ext) =>
        pull_files_by_type(ext, process.cwd(), src)
      )
    )
    .reduce((a, v) => [...a, ...v], [])
    .reduce((a, v) => [...a, ...v], [])
    .filter((file_path) =>
      file_config.filter.some((filter) => !file_path.includes(filter))
    );
  await build_world(root_files, resolve(process.cwd(), file_config.output));
};

find_them_files();
