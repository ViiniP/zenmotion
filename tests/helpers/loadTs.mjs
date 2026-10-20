import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

// Executa os arquivos TypeScript com sensores simulados, sem precisar do celular.
export function createTsLoader(mocks = {}, globals = {}) {
  const cache = new Map();
  function load(relativePath) {
    let filename = path.resolve(relativePath);
    if (!path.extname(filename)) filename += ".ts";
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = {
      exports: {},
    };
    cache.set(filename, module);
    const nativeRequire = createRequire(filename);
    const code = ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;
    vm.runInNewContext(
      code,
      {
        module,
        exports: module.exports,
        require: (name) =>
          mocks[name] ??
          (name.startsWith(".")
            ? load(path.resolve(path.dirname(filename), name))
            : nativeRequire(name)),
        Date,
        performance,
        setInterval,
        clearInterval,
        ...globals,
      },
      {
        filename,
      },
    );
    return module.exports;
  }
  return load;
}
