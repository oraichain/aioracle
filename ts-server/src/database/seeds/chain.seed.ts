import { ChainRepository } from 'src/repositories';

const CHAIN = [
    {
        name: 'oraichain',
    },
    {
        name: 'ethereum',
    },
    {
        name: 'polygon',
    },
    {
        name: 'solana',
    },
    {
        name: 'arbitrum',
    },
    {
        name: 'klaytn',
    },
    {
        name: 'tezos',
    },
    {
        name: 'flow',
    },
];

export class ChainSeed {
    async run() {
        for (const i in CHAIN) {
            await this.insertChainItem(CHAIN[i]);
        }
        console.log('Seed chain success');
    }

    async insertChainItem(item) {
        const chainItem = await ChainRepository.findOne({
            where: {
                name: item.name,
            },
        });
        if (!chainItem) {
            const newItem = ChainRepository.create(item);
            console.log('seed chain item', newItem);
            await ChainRepository.save(newItem);
        }
    }
};
