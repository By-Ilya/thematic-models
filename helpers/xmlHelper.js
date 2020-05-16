const xmlBuilder = require('xmlbuilder');

const XML_PROPS = {
    documentTag: 'document',
    contextTag: 'context',
    wordTag: 'word',

    documentProps: {
        attribute: 'name',
        defaultValue: 'documentName'
    },
};

createXmlHeader = (documentName) => {
    let xmlHeader = xmlBuilder.create(XML_PROPS.documentTag);
    xmlHeader.att(
        XML_PROPS.documentProps.attribute,
        documentName
            ? documentName
            : XML_PROPS.documentProps.defaultValue
    );

    return xmlHeader;
};

createXmlContext = (xmlHeader, data) => {
    const contextElemAttributes = {
        'type': 'contextWords',
        'word': data
    };
    return xmlHeader.ele(
        XML_PROPS.contextTag,
        contextElemAttributes
    );
};

createXmlWord = (xmlContext, data) => {
    const wordElemAttributes = {
        'type': 'word',
        'similarity': data.dist
    };
    return xmlContext.ele(
        XML_PROPS.wordTag,
        wordElemAttributes,
        data.word
    );
};


module.exports = {
    createXmlHeader,
    createXmlContext,
    createXmlWord
};