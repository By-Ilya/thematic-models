# thematic-models
PLSA model implemantation for getting word vectors, using thematic classification
and Word2Vec model for creating comparison with PLSA model.

## PLSA model
Algorithm performs the following steps:
1. Extracts texts from `.txt` files that contains texts from `corpus` folder.
2. Analyzes corpus, tokenizes texts to words, remove stop words, digits and single character words and creates list with lemmas (base form of the word).
3. Calculates word vectors, using thematic classification via PLSA method.
4. Calculates similarities between word vectors (using cosine similarity).
5. Create an `XML`-file with potential context for each word.
6. Run comparison between words from **WordSim353** (http://alfonseca.org/eng/research/wordsim353.html) and creates
`.csv` file with normalized similarities from gold standart and PLSA model.

## Word2Vec model
Algorithm performs the following steps:
1. Extracts texts from `.txt` files that contains texts from `corpus` folder.
2. Analyzes corpus, tokenizes texts to words, remove stop words, digits and single character words and creates list with lemmas (base form of the word).
3. Calculates word vectors, using thematic classification via `word2vec` library (https://www.npmjs.com/package/word2vec).
4. Calculates similarities between word vectors (using cosine similarity).
5. Create an `XML`-file with potential context for each word.
6. Run comparison between words from **WordSim353** (http://alfonseca.org/eng/research/wordsim353.html) and creates
`.csv` file with normalized similarities from gold standart and Word2Vec model.

## Requirements
1. `Node JS` library and `NPM` package manager.
2. Libraries installed from `package.json` file.

## Install and configure
1. Go to the project root directory.
2. Run `npm i` or `npm install` command. This command installs necessary libraries.
3. Open `.env` file and configure the following parameters:
- `CORPUS_FOLDER`: `string` value, that specifies directory to the corpus with texts
(absolute or relative path).
- `MODELS_PATH`: `string` value, that specifies directory to the Word2Vec fitted model
(absolute or relative path).
- `COUNT_CONTEXT`: `integer` value, that specifies count of top context words for each word,
that are shown in output `XML`-files.
- `OUTPUT_FOLDER`: `string` value, that specifies location for output `XML`-files
(absolute or relative path).

After that, place into `CORPUS_DIRECTORY` folders `.txt`-files with texts.

### Configuration for getting comparison with WordSim353
For getting comparison with WordSim353, perform the following steps:
1. Go to the `./wordSim353` folder from the project root directory
2. Rename `goldStandard.csv.in` into `goldStandard.csv`.
3. Fill in file with rows from `wordsim_similarity_goldstandard.txt` file
(that will be downloaded from **WordSim353** offical site), separate each value in rows with `,`.

## Running command
In the project root directory run one of following commands:
- `node runPLSA.js` for running PLSA model.
- `node runWord2Vec.js` for running Word2Vec model.

See the result in the `OUTPUT_FOLDER` and comparison results in `./wordSim353` folder.

## Used `Node JS` libraries
- `natural` (version `2.1.5`) is used for _tokenizing_ input texts from corpus to words.
- `stopwords` (version `0.0.9`) is used to _remove stopwords_ from corpus.
- `lemmatizer` (version `0.0.1`) is used for _creating lemmas_ from words.
- `word2vec` (version `1.1.2`) is used for _running word2vec model_.
- `xmlbuilder` (version `15.1.0`) is used for _creating XML-file_ with context words.
- `csv-parser` (version `2.3.2`) is used for _parsing CSV-file_ with gold standard words
from WordSim353.
