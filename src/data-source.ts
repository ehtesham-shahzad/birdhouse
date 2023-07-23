
import { DataSource } from 'typeorm';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST as string,
    port: parseInt(process.env.PORT as string, 10),
    username: process.env.USERNAME as string,
    password: process.env.PASSWORD as string,
    database: process.env.DATABASE as string,
    entities: ['dist/**/*.entity{.ts,.js}'],
    synchronize: true,
});

AppDataSource.initialize();