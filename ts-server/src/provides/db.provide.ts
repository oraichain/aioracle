import AppDataSource from '../config/datasource';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function waitConnectDB() {
  var countLoop = 1;
  while (!AppDataSource.isInitialized) {
    console.log('wait connect db ...');
    await sleep(100);
    countLoop++;
    if (countLoop > 100) {
      break;
    }
  }
}

export const dbProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      await waitConnectDB();
    },
  },
];