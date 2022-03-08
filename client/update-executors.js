const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env") })

const { execute } = require('./cosmjs');

const testnetList = ["A1fYW/anP4EOhw0FCaxG2XXlkjNeGTK2dX17q1xAAwH8", "ArotF4zVF5/YfnJLRRuxdaZmxjTATb78dqNMCC9SJQ1g", "AwfjbHhq6e+tIdRSrPWj4BNYUu9vZLC9Plg3OcF+86Mp", "Agq2Xl1IcoOt4IRhaA2pO7xq2SBGBfsQuopQnptmos1q", "Ah11L/hsl9J9mXkH9xFzKQbw9F/wh0n6JaKitTzptYqR", "Artae0tzKLfF76iW94aaAvBSdZkd5wTKHM5TKEX9CFg1", "AylGEo6tXifndS2iyEPgPEbtRg7kJmJdRlQojNUBYZh/", "Aj6q7ZM9cZZV3Fjgum3la1RDECPa82bXtlsQy/r6FCdr", "Ahc1poKD9thmAX8dMgFCVKhpUjyVYHfB0q/XTwPuD/J/", "A7Qed3Y43WZKaHYdE2aCWu8l42kgTs1dImmvC9U5r86G", "AjqhEziw3yaNe23rJEQpVRmrlnIxWiAtE5fZA7qXCbeY", "A7ryGyopSgThuQNTloBRxbQDhqwCMch66SFWzCkkuk1z", "AknZh4D7IjevbApGEojCac/kYmuX6vQgA16YMGTbuyJS", "AiIhSld8auqXnAE2Hzcr5gBrmLaHxbFrIbZcpb3iG0Zz", "Ar4bGMz+j5WAgT2PXGn6zwFVsfrPZ2eC51W1By2feusC", "AipQCudhlHpWnHjSgVKZ+SoSicvjH7Mp5gCFyDdlnQtn", "AjqcDJ6IlUtYbpuPNRdsOsSGQWxuOmoEMZag29oROhSX"];

const localList = ['AipQCudhlHpWnHjSgVKZ+SoSicvjH7Mp5gCFyDdlnQtn', 'AjqcDJ6IlUtYbpuPNRdsOsSGQWxuOmoEMZag29oROhSX', 'A2HrrMOjpdw79qseOpuOmL5EJKZ+Br1X6KDTWs47zyjV', 'A/FQa9Md3EnHnqX1M0bDbZg0mQRJyx5SykfQ7QDg4OQd', 'A/HVbhErbqkbH+EA8HkOh96dmiUhBPPQcwetMXcwQLPZ', 'AnLNuKXVa9KOHdeNiUB3GucoktnuOZYkjvYfq8hD6Opb', 'Ak3+dtUqUOzlvdHkPriF1leYrwSV/lBKTYkG22SzrtrS', 'Ax2zewIqsMVrOr6FRng/wd8SXMYxAtAptsRpg0sF6Ig8', 'AnLZeltMEYdKo1vwWTryna2TaY3zk1jV2iA6l9SAGrDk', 'A6t70ezcu8oN2lju3OhqKKdQKuUgvAepyOOsu5nSefJp', 'Axrn8OzUXUgQ/0bQHQJ8lhBzAqDGUHbB+0iUkm9YqWgh', 'A98fVO3gNtw8g+9uFxtGCQ8IZ2E6SPTLTrENgTiAUGPj', 'A7jQAYH+kTFR48WKsOkfghw7xeUqmN947pSJYuBH53Em'];

const mainnetList = [];

const updateExecutors = async () => {
    const contractAddr = process.env.CONTRACT_ADDRESS;
    const wallet = process.env.MNEMONIC;
    const input = JSON.stringify({
        update_config: {
            update_config_msg: {
                new_executors: process.env.LOCAL ? testnetList : process.env.TESTNET ? localList : process.env.MAINNET ? mainnetList : undefined
            }
        }
    })

    // // store the merkle root on-chain
    const txHash = await execute({ mnemonic: wallet, address: contractAddr, handleMsg: input, gasData: { gasAmount: "0", denom: "orai" } });
    console.log("update config result: ", txHash);
}

updateExecutors();