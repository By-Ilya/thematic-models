class PLSA {
    #wordsDocs;
    #vocabulary;
    #topics;
    #docTopicProb;
    #topicWordProb;
    #topicProb;

    initArrayWithValue;
    initMatrixWithValue;
    initThreeDimMatrixWithValue;
    normalize;
    multiply;

    constructor(wordsDocsList, vocabularySet, topicsList) {
        this.#wordsDocs = wordsDocsList;
        this.#vocabulary = [...vocabularySet];
        this.#topics = topicsList;

        this.initArrayWithValue = (n, value) => {
            let array = new Array(n);
            for (let i = 0; i < n; i++) 
                array[i] = value === undefined 
                    ? Math.random()
                    : value;

            return array;
        };

        this.initMatrixWithValue = (m, n, value) => {
            let matrix = new Array(m);
            for (let i = 0; i < m; i++) {
                matrix[i] = this.initArrayWithValue(n, value);
            }

            return matrix;
        };

        this.initThreeDimMatrixWithValue = (m, n, k, value) => {
            let threeDimMatrix = new Array(m);
            for (let i = 0; i < m; i++) {
                threeDimMatrix[i] = this.initMatrixWithValue(n, k, value);
            }

            return threeDimMatrix;
        };

        this.normalize = (vector) => {
            const sumComponents = vector.reduce((accum, elem) => accum += elem, 0);
            if (sumComponents === 0) return vector;

            return vector.map(elem => elem * 1.0 / sumComponents);
        };

        this.multiply = (vector1, vector2) => {
            if (vector1.length !== vector2.length) return 0;

            let result = [];
            for (let i = 0; i < vector1.length; i++)
                result.push(vector1[i] * vector2[i]);

            return result;
        }
    }


    pLSA(maxCountIterations) {
        const docsCount = this.#wordsDocs.length;
        const vocSize = this.#vocabulary.length;
        const topicsCount = this.#topics.length;

        /** Construct terms-document matrix */
        let termsDocMatrix = this.initMatrixWithValue(docsCount, vocSize, 0);
        for (let i = 0; i < docsCount; i++) {
            let termCount = this.initArrayWithValue(vocSize, 0);
            this.#wordsDocs[i].forEach(word => {
                const wordIndex = this.#vocabulary.indexOf(word);
                if (wordIndex !== -1) termCount[wordIndex] += 1;
            });
            termsDocMatrix[i] = termCount;
        }

        /** Initialize counter arrays */
        this.#docTopicProb = this.initMatrixWithValue(docsCount, topicsCount, undefined);
        this.#topicWordProb = this.initMatrixWithValue(topicsCount, vocSize, undefined);
        this.#topicProb = this.initThreeDimMatrixWithValue(docsCount, vocSize, topicsCount, undefined);

        /** Run EM-algorithm */
        for (let iteration = 0; iteration < maxCountIterations; iteration++) {
            console.log(`Iteration #${iteration + 1}`);
            console.log('E-step:');
            for (let docIndex = 0; docIndex < docsCount; docIndex++) {
                for (let wordIndex = 0; wordIndex < vocSize; wordIndex++) {
                    const topicsForWord = [];
                    for (let i = 0; i < topicsCount; i++)
                        topicsForWord.push(this.#topicWordProb[i][wordIndex]);
                    const prob = this.multiply(
                        this.#docTopicProb[docIndex], topicsForWord
                    );

                    if (prob.reduce((accum, elem) => accum += elem, 0) === 0) {
                        console.log(`Document index = ${docIndex}, word index = ${wordIndex}`);
                        console.log(`Document-topic probability = ${this.#docTopicProb[docIndex]}`);
                        console.log(`Topic-word probability = ${topicsForWord}`);
                        console.log(`Topic probability = ${prob}`);
                        console.log('Exiting...');
                        return this.createJSONObjectFromVectors();
                    }
                    this.#topicProb[docIndex][wordIndex] = this.normalize(prob);
                }
            }

            console.log('M-step:');

            /** Update P(word | topic)*/
            for (let topicIndex = 0; topicIndex < topicsCount; topicIndex++) {
                for (let wordIndex = 0; wordIndex < vocSize; wordIndex++) {
                    let sum = 0;
                    for (let docIndex = 0; docIndex < docsCount; docIndex++) {
                        const count = termsDocMatrix[docIndex][wordIndex];
                        sum += count * this.#topicProb[docIndex][wordIndex][topicIndex];
                    }

                    this.#topicWordProb[topicIndex][wordIndex] = sum;
                }
                this.#topicWordProb[topicIndex] = this.normalize(
                    this.#topicWordProb[topicIndex]
                );
            }

            /** Update P(topic | document) */
            for (let docIndex = 0; docIndex < docsCount; docIndex++) {
                for (let topicIndex = 0; topicIndex < topicsCount; topicIndex++) {
                    let sum = 0;
                    for (let wordIndex = 0; wordIndex < vocSize; wordIndex++) {
                        const count = termsDocMatrix[docIndex][wordIndex];
                        sum += count * this.#topicProb[docIndex][wordIndex][topicIndex];
                    }

                    this.#docTopicProb[docIndex][topicIndex] = sum;
                }
                this.#docTopicProb[docIndex] = this.normalize(
                    this.#docTopicProb[docIndex]
                );
            }
        }

        return this.createJSONObjectFromVectors();
    }

    createJSONObjectFromVectors() {
        let wordVectors = [];
        for (let wordIndex = 0; wordIndex < this.#vocabulary.length; wordIndex++) {
            let wordVec = [];
            for (let topicIndex = 0; topicIndex < this.#topicWordProb.length; topicIndex++) {
                wordVec.push(this.#topicWordProb[topicIndex][wordIndex]);
            }

            wordVectors.push({
                word: this.#vocabulary[wordIndex],
                vector: wordVec
            });
        }

        return wordVectors;
    }
}


module.exports = PLSA;
