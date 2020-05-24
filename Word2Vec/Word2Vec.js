const path = require('path');
const w2v = require('word2vec');

const {
    modelsPath,
    countContextWords
} = require('../config');

class Word2Vec {
    #modelParams = {
        size: 100,
        binary: 0,
        window: 5,
        cbow: 1
    };
    #modelPath;
    #model;

    constructor(newModelParams = undefined) {
        if (newModelParams !== undefined) {
            this.#modelParams = {...this.#modelParams, ...newModelParams};
        }

        this.#modelPath = path.resolve(modelsPath + 'word2vec.model.txt');
    }

    fit(lemmasFilePath, callback) {
        w2v.word2vec(
            path.resolve(lemmasFilePath),
            this.#modelPath,
            this.#modelParams,
            callback
        );
    }

    loadModel(callback) { w2v.loadModel(this.#modelPath, callback) }

    setModel(newModel) { this.#model = newModel }

    getMostSimilarWords(word) { return this.#model.mostSimilar(word, countContextWords) }

    getSimilarity(word1, word2) { return this.#model.similarity(word1, word2) }

    setPathToSavedModel(directory, modelName) { this.#modelPath = path.resolve(modelsPath + modelName) }
}


module.exports = Word2Vec;