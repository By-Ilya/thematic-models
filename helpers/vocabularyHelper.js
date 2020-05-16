createVocabularySet = (wordsList) => {
    let vocabularySet = new Set();
    wordsList.forEach(word => {
        vocabularySet.add(word);
    });

    return vocabularySet;
};

union = (setA, setB) => {
    return new Set([...setA, ...setB]);
};

intersection = (setA, setB) => {
    return new Set([...setA].filter(elem => setB.has(elem)));
};


module.exports = createVocabularySet;