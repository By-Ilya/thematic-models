const {writeDataToFile} = require('./helpers/filesHelper');
const {
    createXmlHeader,
    createXmlContext,
    createXmlWord
} = require('./helpers/xmlHelper');

const { countContextWords, outputFolder } = require('./config');

createXmlFile = async (documentName, wordContextMap) => {
    console.log(`Create XML file with contexts...`);
    let xmlRoot = createXmlHeader(documentName);

    for (let [word, context] of wordContextMap) {
        let xmlContext = createXmlContext(xmlRoot, word);

        let index = 0;
        if (context !== null) {
            context.every(wordObject => {
                if (index < countContextWords) {
                    createXmlWord(xmlContext, wordObject);
                    index++;
                    return true;
                } else return false;
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