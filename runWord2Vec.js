const processCorpus = require('./processCorpus');
const Word2Vec = require('./Word2Vec/Word2Vec');
const createXml = require('./createXml');

let CORPUS_DATA = {};
let WORD2VEC_MODEL = new Word2Vec({ size: 300, minCount: 0 });

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
    
    process.exit(0);
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


run();