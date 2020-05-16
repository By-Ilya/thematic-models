const {writeDataToFile} = require('./helpers/filesHelper');
const {
    createXmlHeader,
    createXmlContext,
    createXmlWord
} = require('./helpers/xmlHelper');

const { outputFolder } = require('./config');

createXmlFile = async (documentName, wordContextMap) => {
    console.log(`Create XML file with contexts...`);
    let xmlRoot = createXmlHeader(documentName);

    for (let [word, context] of wordContextMap) {
        let xmlContext = createXmlContext(xmlRoot, word);
        if (context !== null) {
            context.forEach(wordObject => {
                createXmlWord(xmlContext, wordObject);
            });
        }
    }

    let xml = xmlRoot.end({ pretty: true });

    await writeDataToFile(
        outputFolder + `${documentName}.xml`,
        xml
    );
};


module.exports = createXmlFile;