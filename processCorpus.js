const natural = require('natural');
const { lemmatizer } = require('lemmatizer');
const stopwords = require('stopwords');

const { corpusFolder, modelsPath } = require('./config');
const {
    getFilesFromDirectory,
    readDataFromFile,
    writeDataToFile
} = require('./helpers/filesHelper');
const createVocabularySet = require('./helpers/vocabularyHelper');

const tokenizer = new natural.WordTokenizer();

const REDUNDANT_FILE_NAMES = ['.DS_Store'];
const NUMBER_REG_EXP = /\d+/g;

readCorpus = async () => {
    try {
        const documentsList = removeRedundantDocuments(
            await getFilesListFromCorpus(corpusFolder)
        );
        const tokens = await getNormalizedTokensFromDocuments(
            corpusFolder, documentsList
        );

        const vocabulary = Array.from(
            createVocabularySet(tokens)
        );

        // console.log('Save processed lemmas to file...');
        // const lemmasFilePath = await saveProcessedLemmasToFile(lemmas);

        return {documentsList, tokens, vocabulary};
    } catch (err) {
        throw err;
    }
};

getFilesListFromCorpus = async (corpusDirectory) => {
    console.log('Getting documents from corpus folder...');
    try {
        return await getFilesFromDirectory(
            corpusDirectory
        );
    } catch (err) {
        throw err;
    }
};

removeRedundantDocuments = documentsList => {
    return documentsList.filter(fileName =>
        REDUNDANT_FILE_NAMES.indexOf(fileName) === -1
    );
};

getNormalizedTokensFromDocuments = async (
    corpusDirectory, documentsList
) => {
    console.log('Getting tokens from documents...');
    let tokens = [];
    try {
        for (let fileName of documentsList) {
            const dataFromFile = await readDataFromFile(
                corpusDirectory + fileName
            );
            const docTokens = tokenizer.tokenize(dataFromFile);
            tokens.push(
                docTokens
                    .filter(token => !token.match(NUMBER_REG_EXP))
                    .map(token => lemmatizer(token.toLowerCase()))
                    .filter(lemma =>
                        stopwords.english.indexOf(lemma) === -1
                    )
                    .filter(lemma => lemma.length > 1)
            );
        }

        return tokens;
    } catch (err) {
        throw err;
    }
};

// saveProcessedLemmasToFile = async (lemmas) => {
//     const lemmasText = lemmas.join(' ');
//     const pathToSave = modelsPath + 'lemmas.txt';
//     await writeDataToFile(pathToSave, lemmasText);
//
//     return pathToSave;
// };


module.exports = readCorpus;