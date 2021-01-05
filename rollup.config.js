import typescript from "rollup-plugin-typescript2";
import pkg from "./package.json";
import {nodeResolve} from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import fs from "fs";
import path from "path";
import handler from 'serve-handler';
import http from 'http';
const fp = require('find-free-port');

//const extensions = [".js", ".jsx", ".ts", ".tsx"];
const input = "src/index.tsx";

const watch = process.env.ROLLUP_WATCH === 'true';

const servePlugin = {
  buildStart: async () => {
    const server = http.createServer((request, response) => {
      return handler(request, response, {public: 'dist'});
    })

    const ports = await fp(8080);

    server.listen({port: ports[0]}, () => {
      console.log(`Running at http://localhost:${ports[0]}`);
    });
  }
}

const plugins = [
  typescript({
    typescript: require("typescript"),
  }),
  nodeResolve(),
  commonjs({
    include: [/node_modules/]
  }),
  replace({
    'process.env.NODE_ENV': JSON.stringify('development')
  }),
  {
    writeBundle: () => {
      fs.copyFile(path.resolve("./src/index.html"), path.resolve("./dist/index.html"), err => console.error(err));
    }
  },
];

const external = [
  //...Object.keys(pkg.dependencies),
];

export default commandLineArgs => {
  if (commandLineArgs.test === true) {
    plugins.push({
      buildStart: async () => {
        console.log('prepare tests');
      }
    });
    plugins.push({
      buildEnd: async () => {
        console.log('run tests');
      }
    });
  }
  if (commandLineArgs.test === true ||
    commandLineArgs.serve === true) {
    plugins.push(servePlugin);    
  }
  return [
      {
        input,
        output: {
          file: pkg.main,
          format: "esm",
          sourcemap: true,
        },
        external,
        plugins,
      },
    ]
  }
