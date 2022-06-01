const axios = require('axios');
const { cacheAdapterEnhancer } = require('axios-extensions');

const http = axios.create({
    // baseURL: '/',
    headers: { 'Cache-Control': 'no-cache' },
    // cache will be enabled by default
    adapter: cacheAdapterEnhancer(axios.defaults.adapter, {threshold: 5 * 1000 })
});

module.exports = { http };