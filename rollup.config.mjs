import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import css from "rollup-plugin-css-only";
import json from "@rollup/plugin-json";
import alias from "@rollup/plugin-alias";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/frontend/main.ts",
  output: {
    sourcemap: !production,
    format: "cjs",
    name: "fluide",
    file: "public/build/bundle.js",
    exports: "default" // silence main.ts unnamed export warning
  },
  external: ["electron"],
  plugins: [
    alias({
      entries: [
        { find: "./lib-cov/fluent-ffmpeg", replacement: "./lib/fluent-ffmpeg" },
      ]
    }),
    svelte({
      preprocess: sveltePreprocess({
        typescript: {
          tsconfigFile: production ? "./tsconfig.svelte.prod.json" : "./tsconfig.svelte.json",
        }
      }),
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
      },
    }),
    // we'll extract any component CSS out into
    // a separate file - better for performance
    css({
      output: "bundle.css",
      mangle: production ? true : false,
      compress: production ? true : false,
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    commonjs(),
    json(),
    resolve({
      browser: true,
      dedupe: ["svelte"]
    }),
    typescript({
      tsconfig: production ? "./tsconfig.svelte.prod.json" : "./tsconfig.svelte.json",
      sourceMap: !production,
      inlineSources: !production,
    }),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production &&
    serve({
      host: "localhost",
      port: 5000,
      contentBase: "public",
      // verbose: true,
    }),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production &&
    livereload({
      watch: "public",
      // verbose: true,
    }),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production &&
    terser({
      compress: true,
      mangle: true,
    }),
  ],
  watch: {
    clearScreen: false,
  },
};