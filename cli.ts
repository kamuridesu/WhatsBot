#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { load } from './src/modules/dynamicModules.js';
import { botFactory } from './libs/util.js';
import { MessageHandler } from './src/modules/messageHandler.js';
import { EntryPoint } from 'src/types/bot.js';

const SUPPORTED_LANGUAGES = ["en-us", "pt-br"];

async function initializeFramework(): Promise<void> {
    const rootPath = process.cwd();
    const modulesPath = process.env.DEBUG
        ? path.join(rootPath, 'test_modules')
        : path.join(rootPath, 'modules');

    fs.mkdirSync('./temp', { recursive: true });

    const entryPoint = path.join(modulesPath, 'entrypoint.js');
    const entryPointModule = await load(entryPoint);
    const entryPointClass: EntryPoint = new (entryPointModule.Entrypoint as any)();
    const messageHandler = new MessageHandler(entryPointClass);
    if (entryPointClass.language) {
        if (!SUPPORTED_LANGUAGES.includes(entryPointClass.language)) {
            throw new Error("Language is not supported!");
        }
    }
    const commandsFilename = path.join(modulesPath, 
        entryPointClass.commandsFilename
        ? entryPointClass.commandsFilename 
        : "");
    const bot = botFactory(entryPointClass, commandsFilename);
    await bot.init(messageHandler);
}

initializeFramework();

export default initializeFramework;
