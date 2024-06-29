import fs from "node:fs";

import { inspect } from "node:util";
import { IndexerProgram } from "metashrew-test";
import * as path from "node:path";

const log = (obj: any) => {
  console.log(obj.substr(0, obj.length - 1));
};

const runTest = (s) =>
  it(s, async () => {
    const program = new IndexerProgram(
      new Uint8Array(
        Array.from(
          fs.readFileSync(path.join(__dirname, "..", "build", "debug.wasm")),
        ),
      ).buffer,
    );
    program.on("log", log);
    await program.run(s);
    await new Promise((r) => setTimeout(r, 2000));
    return program;
  });
describe("QUORUM•GENESIS•PROTORUNE", () => {
  [
    "test_BSTU128"
  ].map((v) => runTest(v));
});
