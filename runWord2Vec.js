const processCorpus = require('./processCorpus');
const Word2Vec = require('./Word2Vec/Word2Vec');
const createXml = require('./createXml');

let CORPUS_DATA = {};
let WORD2VEC_MODEL = new Word2Vec({ size: 300 });

run = async () => {
    await runProcessingCorpus();
    WORD2VEC_MODEL.fit(CORPUS_DATA.lemmasFilePath, getFittingResult);
};

runProcessingCorpus = async () => {
    try {
        CORPUS_DATA = await processCorpus();
        printStats();
    } catch (err) {
        console.error(err);
        process.exit(0);
    }
};

printStats = () => {
    console.log(
        `- Documents: ${CORPUS_DATA.documentsList.length}` +
        `\n- Words: ${CORPUS_DATA.lemmas.length}` +
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

    console.log('Save contexts words...');
    const contextMap = calculateContextMap();
    await createXml('word2vec.contextWords', contextMap);
    console.log('Contexts words was saved successfully!');
    process.exit(0);
};

calculateContextMap = () => {
    let wordContextMap = new Map();
    CORPUS_DATA.vocabulary.forEach(lemma => {
        wordContextMap.set(
            lemma,
            WORD2VEC_MODEL.getMostSimilarWords(lemma)
        );
    });

    return wordContextMap;
};

contextSimilaritySortRule = (a, b) => b.similarity - a.similarity;


run();