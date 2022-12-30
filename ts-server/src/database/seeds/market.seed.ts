import { MarketRepository } from 'src/repositories';

const MARKET = [
    {
        name: 'airight',
    },
    {
        name: 'opensea',
    },
    {
        name: 'rarible',
    }
];

export class MarketSeed {
    async run() {
        for (const i in MARKET) {
            await this.insertChainItem(MARKET[i]);
        }
        console.log('Seed market success');
    }

    async insertChainItem(item) {
        const chainItem = await MarketRepository.findOne({
            where: {
                name: item.name,
            },
        });
        if (!chainItem) {
            const newItem = MarketRepository.create(item);
            console.log('seed market item', newItem);
            await MarketRepository.save(newItem);
        }
    }
};
