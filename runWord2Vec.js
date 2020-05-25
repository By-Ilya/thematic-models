const processCorpus = require('./processCorpus');
const Word2Vec = require('./Word2Vec/Word2Vec');
const createXml = require('./createXml');

const fs = require('fs');
const csv = require('csv-parser');
const {lemmatizer} = require('lemmatizer');
const {writeDataToFile} = require('./helpers/filesHelper');

let CORPUS_DATA = {};
let WORD2VEC_MODEL = new Word2Vec({ size: 300, minCount: 0, cbow: 0 });

run = async () => {
    await runProcessingCorpus();
    WORD2VEC_MODEL.fit(CORPUS_DATA.tokensFilePath, getFittingResult);
};

runProcessingCorpus = async () => {
    try {
        CORPUS_DATA = await processCorpus(true);
        printStats();
    } catch (err) {
        console.error(err);
        process.exit(0);
    }
};

printStats = () => {
    console.log(
        `- Documents: ${CORPUS_DATA.documentsList.length}` +
        `\n- Words count: ${CORPUS_DATA.tokens.reduce((accum, doc) => accum += doc.length, 0)}` +
        `\n- Vocabulary size: ${CORPUS_DATA.vocabulary.length}`
    );
};

getFittingResult = async (code) => {
    if (code !== 0) {
        console.error(`Some errors while fitting model. Error code: ${code}`);
        process.exit(0);
    }
    console.log('Model was fitted successfully!');
    console.log('Load trained model...');
    WORD2VEC_MODEL.loadModel(runLoadedModel);
};

runLoadedModel = async (error, model) => {
    if (error) {
        console.error(`Some errors while loading model. Error: ${error}`);
        process.exit(0);
    }
    console.log('Model stats:', model);
    WORD2VEC_MODEL.setModel(model);
    WORD2VEC_MODEL.updateModelParams({ silent: true });

    console.log('Save contexts words...');
    const contextMap = calculateContextMap();
    await createXml('word2vec.contextWords', contextMap);
    console.log('Contexts words was saved successfully!');

    console.log('Start comparison with WordSim353');
    const goldStandart = [];
    fs.createReadStream('./wordSim353/goldStandard.csv')
        .pipe(csv())
        .on('data', data => goldStandart.push(data))
        .on('end', () => startComparison(goldStandart));
};

calculateContextMap = () => {
    let wordContextMap = new Map();
    CORPUS_DATA.vocabulary.forEach(word => {
        wordContextMap.set(
            word,
            WORD2VEC_MODEL.getMostSimilarWords(word)
        );
    });

    return wordContextMap;
};

contextSimilaritySortRule = (a, b) => b.similarity - a.similarity;

startComparison = async (goldStandart) => {
    let normalizedGoldStandart = goldStandart.map(wordObj => {
        return {
            word1: wordObj.word1,
            word2: wordObj.word2,
            similarity: wordObj.similarity / 10,
            word2vecSimilarity: 0
        };
    });

    const goldStandartWithWord2Vec = normalizedGoldStandart.map(goldObj => {
        const similarity = WORD2VEC_MODEL.getSimilarity(
            lemmatizer(goldObj.word1),
            lemmatizer(goldObj.word2)
        );

        if (similarity) goldObj.word2vecSimilarity = similarity;
        
        return goldObj;
    });

    const csvFilePath = './wordSim353/word2vecComparison.csv';
    await writeComparisonInFile(
        csvFilePath,
        goldStandartWithWord2Vec
    );
    
    console.log(`Comparison was written in file: ${csvFilePath}`);
    process.exit(0);
}

writeComparisonInFile = async (filePath, comparison) => {
    let strToWrite = 'word1,word2,goldSimilarity,word2vecSimilarity\n';
    comparison.forEach(cmpObj => {
        strToWrite += `${cmpObj.word1},${cmpObj.word2},${cmpObj.similarity},${cmpObj.word2vecSimilarity}\n`;
    });

    await writeDataToFile(filePath, strToWrite);
}


run();