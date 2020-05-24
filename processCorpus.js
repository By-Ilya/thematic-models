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

readCorpus = async (isWord2VecProcessing = false) => {
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

        if (isWord2VecProcessing) {
            console.log('Save processed lemmas to file...');
            const tokensFilePath = await saveProcessedLemmasToFile(tokens);

            return {documentsList, tokens, vocabulary, tokensFilePath};
        }

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

saveProcessedLemmasToFile = async (tokens) => {
    let strTokens = '';
    tokens.forEach(doc => {
        strTokens += (doc.join(' ') + '\n')
    });
    const pathToSave = modelsPath + 'tokens.txt';
    await writeDataToFile(pathToSave, strTokens);

    return pathToSave;
};


module.exports = readCorpus;