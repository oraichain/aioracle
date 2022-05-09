const Axios = require('axios').default;
const { cacheAdapterEnhancer } = require('axios-extensions');
const { AXIOS_TIMEOUT } = require('./config').constants;

const axios = Axios.create({
    timeout: AXIOS_TIMEOUT,
    retryTimes: 3,
    adapter: cacheAdapterEnhancer(Axios.defaults.adapter)
});

export default axios;
