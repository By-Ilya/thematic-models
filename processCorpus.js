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

readCorpus = async () => {
    try {
        const documentsList = removeRedundantDocuments(
            await getFilesListFromCorpus(corpusFolder)
        );
        const tokens = await getTokensFromDocuments(
            corpusFolder, documentsList
        );
        const lemmas = getLemmasFromTokens(tokens);
        const vocabulary = Array.from(
            createVocabularySet(lemmas)
        );

        console.log('Save processed lemmas to file...');
        const lemmasFilePath = await saveProcessedLemmasToFile(lemmas);

        return {documentsList, lemmas, vocabulary, lemmasFilePath};
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

getTokensFromDocuments = async (corpusDirectory, documentsList) => {
    console.log('Getting tokens from documents...');
    let tokens = [];
    try {
        for (let fileName of documentsList) {
            const dataFromFile = await readDataFromFile(
                corpusDirectory + fileName
            );
            tokens = tokens.concat(
                tokenizer.tokenize(dataFromFile)
            );
        }

        return tokens.map(t => {
            return t.toLowerCase();
        });
    } catch (err) {
        throw err;
    }
};

getLemmasFromTokens = tokens => {
    console.log('Getting lemmas from tokens without stop words and single character words...');
    return tokens
        .map(token => lemmatizer(token))
        .filter(lemma =>
            stopwords.english.indexOf(lemma) === -1
        )
        .filter(lemma =>
            lemma.length > 1
        );
};

saveProcessedLemmasToFile = async (lemmas) => {
    const lemmasText = lemmas.join(' ');
    const pathToSave = modelsPath + 'lemmas.txt';
    await writeDataToFile(pathToSave, lemmasText);

    return pathToSave;
};


module.exports = readCorpus;