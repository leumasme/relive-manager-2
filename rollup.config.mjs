import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import terser from "@rollup/plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import css from "rollup-plugin-css-only";
import json from "@rollup/plugin-json";
import alias from "@rollup/plugin-alias";
import copy from "rollup-plugin-copy";

const isProduction = !process.env.ROLLUP_WATCH;

/**
 * @type {import('rollup').RollupOptions}
*/
export default {
  input: "src/frontend/main.ts",
  output: {
    sourcemap: !isProduction,
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
          tsconfigFile: `./src/frontend/tsconfig${isProduction ? ".prod" : ""}.json`,
        }
      }),
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !isProduction,
      },
    }),
    // we'll extract any component CSS out into
    // a separate file - better for performance
    css({
      output: "bundle.css",
      mangle: isProduction,
      compress: isProduction,
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
      tsconfig: `./src/frontend/tsconfig${isProduction ? ".prod" : ""}.json`,
      sourceMap: !isProduction,
      inlineSources: !isProduction,
    }),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !isProduction &&
    serve({
      host: "localhost",
      port: 5000,
      contentBase: "public",
      // verbose: true,
    }),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !isProduction &&
    livereload({
      watch: "public",
      // verbose: true,
    }),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    isProduction &&
    terser({
      compress: true,
      mangle: true,
    }),

    copy({
      targets: [
        { src: "public", dest: "build" },
      ]
    })
  ],
  watch: {
    clearScreen: false,
  },
};
