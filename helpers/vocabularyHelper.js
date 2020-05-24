createVocabularySet = (wordsDocsList) => {
    let vocabularySet = new Set();

    wordsDocsList.forEach(doc => {
        doc.forEach(word => vocabularySet.add(word));
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