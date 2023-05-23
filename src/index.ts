import fs from 'fs';
import os from 'os';
import path from 'path';

import { XMLBuilder, XMLParser } from 'fast-xml-parser';

const argv = require('yargs-parser')(process.argv.slice(2));

export const validateArg = (argv: any) => {
  if (!argv.file) {
    return console.log('Provide file path to recentProjects.xml by --file');
  }
  if (path.extname(argv.file) !== '.xml') {
    return console.log('File should be with .xml extension');
  }
  if (!fs.existsSync(argv.file)) {
    return console.log('File not exist');
  }
  return true;
};

if (!validateArg(argv)) {
  process.exit();
}

const recentProjectsFilePath = argv.file;

const parser = new XMLParser({
  ignoreAttributes: false,
  allowBooleanAttributes: true,
});

export const builder = new XMLBuilder({
  ignoreAttributes: false,
  suppressBooleanAttributes: false,
  suppressEmptyNode: true,
  format: true,
});

const jObj = parser.parse(fs.readFileSync(recentProjectsFilePath, 'utf-8'));

const entries = jObj.application.component.option[0].map.entry;

const notExist: string[] = [];
for (const entry of entries) {
  const projDir = entry['@_key'].replace('$USER_HOME$', os.homedir());
  if (!fs.existsSync(projDir)) {
    notExist.push(entry['@_key']);
  }
}

type Map = {
  value: unknown;
  '@_key': string;
};

const existentProjects = jObj.application.component.option[0].map.entry.filter(
  (entry: Map) => !notExist.includes(entry['@_key'])
);

jObj.application.component.option[0].map.entry = existentProjects;
const xmlContent = builder.build(jObj);
fs.writeFileSync(recentProjectsFilePath, xmlContent, 'utf-8');
