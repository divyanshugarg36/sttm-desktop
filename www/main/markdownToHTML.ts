import * as marked from 'marked';
import fs from 'fs';
import path from 'path';

import { i18n } from './common/main-app';

const markdownFiles = {
  changelog: '../CHANGELOG.md',
  help: '../HELP.md',
  legend: '../LEGEND.md',
};

function markdownToHTML(file: keyof typeof markdownFiles) {
  const fileMD = fs.readFileSync(path.resolve(__dirname, markdownFiles[file]), 'utf8');
  const $file = document.getElementById(file);
  if ($file) {
    $file.innerHTML = marked.parse(fileMD);
  }
}

const key = document.querySelector('h1')!.innerHTML;
document.querySelector('h1')!.innerHTML = i18n.t(key);

(Object.keys(markdownFiles) as (keyof typeof markdownFiles)[]).forEach(markdownToHTML);
