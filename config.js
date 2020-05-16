require('dotenv').config();

const corpusFolder = process.env.CORPUS_FOLDER || './corpus/';
const modelsPath = process.env.MODELS_PATH || './models/';
const countContextWords = parseInt(process.env.COUNT_CONTEXT) || 20;
const outputFolder = process.env.OUTPUT_FOLDER || './output-data/';

module.exports = {
    corpusFolder,
    modelsPath,
    countContextWords,
    outputFolder
};