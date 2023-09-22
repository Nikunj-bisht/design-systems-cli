/* eslint-disable no-console */
import { createLogger, getMonorepoRoot } from '@design-systems/cli-utils';
import { Plugin } from '@design-systems/plugin';
import fs = require('fs-extra');
import path = require('path');

const logger = createLogger({ scope: 'rui' });

interface RuiArgs {
  /** param to pass folder name you wan to find */
  nameOfFolder?: string
}

const excludedDirectories = ["node_modules"];

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
          if(!excludedDirectories.includes(item) && item === 'scripts'){

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
      if (fs.statSync(item).isDirectory()) {
        logger.info(path.join(filePath,item))
        // getFilesOfDir(item);
      }else{
        logger.info(path.join(filePath,item),item)

      }
    });
  });
}
