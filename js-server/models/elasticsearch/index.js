const { Client } = require('@elastic/elasticsearch')
const config = require('config');
const elasticConfig = config.get('elastic');
const { env } = require('../../config');

const elasticClient = new Client({
    node: env.ELASTICSEARCH_NODE,
    auth: {
        username: elasticConfig.username,
        password: elasticConfig.password
    }
})

const index = async (index, body) => {
    try {
        elasticClient.index({
            index,
            body
        }).then(async ({ statusCode }) => {
            if (statusCode === 201) elasticClient.indices.refresh({ index })
            else console.log("error when indexing to elasticsearch with status code: ", statusCode);
        })

    } catch (error) {
        console.log("error while trying to index to elasticsearch: ", error);
    }
}

const read = async (index, query) => {
    try {
        const { body, statusCode } = await elasticClient.search({
            index,
            body: {
                query
            }
        })
        if (statusCode === 200) return body.hits.hits;
        return null; // error case
    } catch (error) {
        console.log("error reading data from elasticsearch: ", error);
        return null;
    }
}

module.exports = { index, read };