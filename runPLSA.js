const processCorpus = require('./processCorpus');
const PLSA = require('./PLSA/PLSA');
const cosineSimilarity = require('./helpers/cosineSimilarity');
const createXml = require('./createXml');

const fs = require('fs');
const csv = require('csv-parser');
const {lemmatizer} = require('lemmatizer');
const {writeDataToFile} = require('./helpers/filesHelper');

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
        const wordVectors = pLSAModel.pLSA(100);
        
        console.log('Save contexts words...');
        const contextMap = calculateContextMap(wordVectors);
        await createXml('PLSA.contextWords', contextMap);
        console.log('Contexts words was saved successfully!');

        console.log('Start comparison with WordSim353');
        const goldStandart = [];
        fs.createReadStream('./wordSim353/goldStandard.csv')
            .pipe(csv())
            .on('data', data => goldStandart.push(data))
            .on('end', () => startComparison(goldStandart, contextMap));
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
            context.sort(contextSimilaritySortRule)
        );
    }

    return contextMap;
}

contextSimilaritySortRule = (a, b) => b.dist - a.dist;

startComparison = async (goldStandart, contextMap) => {
    let normalizedGoldStandart = goldStandart.map(wordObj => {
        return {
            word1: wordObj.word1,
            word2: wordObj.word2,
            similarity: wordObj.similarity / 10,
            plsaSimilarity: 0
        };
    });

    const goldStandartWithPLSA = normalizedGoldStandart.map(goldObj => {
        let wordContext = contextMap.get(lemmatizer(goldObj.word1));
        if (wordContext) {
            wordContext.forEach(ctxObj => {
                if (ctxObj.word === lemmatizer(goldObj.word2)) {
                    goldObj.plsaSimilarity = ctxObj.dist;
                }
            });
        }

        wordContext = contextMap.get(goldObj.word2);
        if (wordContext) {
            wordContext.forEach(ctxObj => {
                if (
                    ctxObj.word === lemmatizer(goldObj.word1) &&
                    ctxObj.dist > goldObj.similarity
                ) {
                    goldObj.plsaSimilarity = ctxObj.dist;
                }
            });
        }
        
        return goldObj;
    });

    const csvFilePath = './wordSim353/plsaComparison.csv';
    await writeComparisonInFile(
        csvFilePath,
        goldStandartWithPLSA
    );
    
    console.log(`Comparison was written in file: ${csvFilePath}`);
    process.exit(0);
}

writeComparisonInFile = async (filePath, comparison) => {
    let strToWrite = 'word1,word2,goldSimilarity,plsaSimilarity\n';
    comparison.forEach(cmpObj => {
        strToWrite += `${cmpObj.word1},${cmpObj.word2},${cmpObj.similarity},${cmpObj.plsaSimilarity}\n`;
    });

    await writeDataToFile(filePath, strToWrite);
}


run();