#!/usr/bin/env node
'use strict';

/*
 * Конвертор JSON -> YAML для схем Swagger/OpenAPI.
 *
 * Использует js-yaml с настройками по умолчанию — теми же, которыми были
 * сгенерированы эталонные .yaml файлы в этом репозитории. Результат совпадает
 * с ними байт-в-байт (плюс завершающий перевод строки).
 *
 * Использование:
 *   node json2yaml.js <input.json> [output.yaml]   — один файл
 *   node json2yaml.js                               — все schema_*.json в каталоге
 *
 * Если выходной путь не указан, он получается заменой расширения .json на .yaml.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function convertFile(inputPath, outputPath) {
  if (!outputPath) {
    outputPath = inputPath.replace(/\.json$/i, '') + '.yaml';
  }

  const json = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  // Настройки по умолчанию js-yaml: indent=2, lineWidth=80, одинарные кавычки.
  // dump() уже завершает файл одним переводом строки — лишних пустых строк не добавляем.
  const out = yaml.dump(json);

  fs.writeFileSync(outputPath, out);
  return outputPath;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Конвертируем все schema_*.json в текущем каталоге.
    const files = fs
      .readdirSync(process.cwd())
      .filter((f) => /^schema_.*\.json$/i.test(f))
      .sort();

    if (files.length === 0) {
      console.error('Не найдено ни одного schema_*.json в текущем каталоге.');
      process.exit(1);
    }

    for (const f of files) {
      const out = convertFile(f);
      console.log(`${f} -> ${path.basename(out)}`);
    }
    return;
  }

  const [input, output] = args;
  const out = convertFile(input, output);
  console.log(`${input} -> ${out}`);
}

try {
  main();
} catch (err) {
  console.error('Ошибка:', err.message);
  process.exit(1);
}
