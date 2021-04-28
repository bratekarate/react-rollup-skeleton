// import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import typescript from "rollup-plugin-typescript2";
import babel from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import fs from "fs";
import path from "path";
import handler from "serve-handler";
import http from "http";
import { createHttpTerminator } from "http-terminator";
import pkg from "./package.json";
import open from "open";
// eslint-disable-next-line
const fp = require("find-free-port");

//const extensions = [".js", ".jsx", ".ts", ".tsx"];
const input = "src/index.tsx";

// const watch = process.env.ROLLUP_WATCH === "true";

let runningServer = null;
let browserOpen = false;

const buildPluginCfg = (env) => {
  const out = env === Environment.build ? "dist" : "serve";
  return {
    postcss: postcss(),
    json: json({ preferConst: true, namedExports: false }),
    replace: replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify("development"),
    }),
    nodeResolve: nodeResolve(),
    commonjs: commonjs({
      include: [/node_modules/],
    }),
    typescript: typescript(),
    babel: babel({
      extensions: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".json"],
    }),
    copyHtml: {
      writeBundle: () => {
        fs.copyFile(
          path.resolve("./src/index.html"),
          path.resolve(
            `./${out}/index.html`
          ),
          (err) => console.error(err)
        );
      },
    },
    testPrepare: {
      buildStart: async () => {
        console.log("Preparing tests");
        await testSetup(out);
      },
    },
    testRun: {
      buildEnd: async () => {
        console.log("Running tests");
        // TODO: run tests
        console.log("Teardown tests");
        await testTeardown();
      },
    },
    livereload: livereload(out),
    // serve: serve(out),
    serve: {
      generateBundle: async () => {
        await serveStart(out);
      },
    },
  };
};

const Environment = ["build", "dev"].reduce(
  (acc, cur) => ({ ...acc, [cur]: cur }),
  {}
);

const external = [
  //...Object.keys(pkg.dependencies),
];

export default ({ configEnv = "dev", configServe, configTest }) => {
  if (configServe && configTest) {
    console.error("Error: Incompatible arguments 'serve' and 'test'");
    process.exit(1);
  }

  const plugins = buildPluginCfg(configEnv);
  return [
    {
      input,
      output: {
        file: configEnv === Environment.build ? pkg.main : pkg.serve,
        format: "esm",
        sourcemap: true,
      },
      external,
      plugins: [
        plugins.postcss,
        plugins.json,
        plugins.replace,
        plugins.nodeResolve,
        plugins.commonjs,
        plugins.typescript,
        ...(configEnv === Environment.build ? [plugins.babel] : []),
        plugins.copyHtml,
        ...(configTest ? [plugins.testPrepare, plugins.testRun] : []),
        ...(configServe ? [plugins.serve, plugins.livereload] : []),
      ],
    },
  ];
};

async function testSetup(serveDir) {
  await serveStart(serveDir);
}

async function testTeardown() {
  await serveStop();
}

async function serveStart(dir) {
  if (runningServer !== null) {
    return;
  }

  const server = http.createServer((request, response) => {
    return handler(request, response, { public: dir });
  });

  const ports = await fp(8080);

  const url = `http://localhost:${ports[0]}`;
  server.listen({ port: ports[0] }, () => {
    console.log(`Running server at ${url}`);
  });
  runningServer = {
    terminator: createHttpTerminator({
      server,
    }),
    port: ports[0],
  };

  if (!browserOpen) {
    await open(url);
    browserOpen = true;
  }
}

async function serveStop() {
  if (runningServer !== null) {
    console.log(
      `Terminating server at http://localhost:${runningServer.port}`
    );
    await runningServer.terminator.terminate();
  }
}
