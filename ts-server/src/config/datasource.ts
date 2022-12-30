import { DataSource } from "typeorm";
import config from '.';

const AppDataSource = new DataSource({
  type: 'mariadb',
  host: config.DATABASE_HOST,
  port: Number(config.DATABASE_PORT),
  username: config.DATABASE_USERNAME,
  password: config.DATABASE_PASSWORD,
  database: config.DATABASE_NAME,
  charset: 'UTF8MB4_UNICODE_CI',
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  synchronize: false,
  connectTimeout: 10000,
  bigNumberStrings: false,
  extra: {
    connectionLimit: 500,
  },
  migrationsRun: false,
  migrations: [__dirname + '/../database/migrations/*.{ts,js}'],
  logger: 'file',
  logging: config.DATABASE_LOGGING === 'true' ? true : false,
});

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })

export default AppDataSource;