import { createLogger, getMonorepoRoot } from '@design-systems/cli-utils';
import { Plugin } from '@design-systems/plugin';
import { TypescriptParser } from 'typescript-parser';
import fs = require('fs-extra');
import path = require('path');

const logger = createLogger({ scope: 'rui' });

// eslint-disable-next-line @typescript-eslint/no-var-requires
const acorn = require('acorn');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const walk = require('acorn-walk');

const parser = new TypescriptParser();

interface RuiArgs {
  /** param to pass folder name you wan to find */
  nameOfFolder?: string;
}
// esprima.parse()
const excludedDirectories = ['node_modules'];

/**
 * A Plugin to check the unused imports and functions in yours folders
 */
export default class RuiPlugin implements Plugin<RuiArgs> {
  async run() {
    const mono = getMonorepoRoot();

    fs.readdir(mono, async function(err, fileNames) {
      fileNames.forEach(async item => {
        if (fs.statSync(item).isDirectory()) {
          // logger.info(path.join(mono,item));
          if (!excludedDirectories.includes(item) && item === 'scripts') {
            await getFilesOfDir(path.join(mono, item));
          }
        }
      });
    });
  }
}

/**
 * function to all all the fileDirectories
 * @param filePath
 */
async function getFilesOfDir(filePath: string) {
  fs.readdir(filePath, function(err, filesNames) {
    filesNames.forEach(async function(item) {
      if (fs.statSync(path.join(filePath, item)).isDirectory()) {
        logger.info(path.join(filePath, item));
        // getFilesOfDir(item);
      } else {
        let fileData = '';
        logger.watch(`${path.join(filePath, item)}`);
        fs.readFile(
          path.join(filePath, item),
          'utf-8',
          async (notFound, data) => {
            if (!notFound) {
              fileData = data;
              if (item.includes('.ts')) {
                const parsed = await parser.parseSource(fileData);
                console.log(parsed,'parsed')
              } else if(item.includes('.js')) {
                const data1 = acorn.parse(fileData, {
                  ecmaVersion: 2020,
                  sourceType: 'module',
                  // onComment: true,
                  locations: true
                });
                walk.simple(data1, {
                  
                  ImportDeclaration(node: any) {
                    for(let n of node.specifiers){
                      logger.success(n.local.name,'import')
                    }
                  },Identifier(node:any){
                    logger.success(node.name)
                  }
                });
              }
            }
          }
        );
      }
    });
  });
}
