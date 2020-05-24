const processCorpus = require('./processCorpus');
const PLSA = require('./PLSA/PLSA');
const cosineSimilarity = require('./helpers/cosineSimilarity');
const { countContextWords } = require('./config');
const createXml = require('./createXml');

let CORPUS_DATA = {};

run = async () => {
    try {
        CORPUS_DATA = await processCorpus();
        printStats();

        let pLSAModel = new PLSA(
            CORPUS_DATA.tokens,
            CORPUS_DATA.vocabulary,
            CORPUS_DATA.documentsList
        );
        const wordVectors = pLSAModel.pLSA(1000);
        
        console.log('Save contexts words...');
        const contextMap = calculateContextMap(wordVectors);
        await createXml('PLSA.contextWords', contextMap);
        console.log('Contexts words was saved successfully!');

        process.exit(0);
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

calculateContextMap = (wordVectors) => {
    let contextMap = new Map();

    for (let wordIndex = 0; wordIndex < wordVectors.length; wordIndex++) {
        let context = [];
        for (let ctxWordIndex = 0; ctxWordIndex < wordVectors.length; ctxWordIndex++) {
            if (wordIndex !== ctxWordIndex) {
                const dist = cosineSimilarity(
                    wordVectors[wordIndex].vector,
                    wordVectors[ctxWordIndex].vector
                );

                context.push({word: wordVectors[ctxWordIndex].word, dist});
            }
        }

        contextMap.set(
            wordVectors[wordIndex].word,
            context.sort(contextSimilaritySortRule).slice(0, countContextWords)
        );
    }

    return contextMap;
}

contextSimilaritySortRule = (a, b) => b.dist - a.dist;


run();