import 'dotenv/config';
import { type Config } from 'drizzle-kit';

export default {
    //gde je moja sema
    schema: './src/db/schema.ts',
    
    //gde snima migracije swl fajlove
    out: './src/db/migrations',

    //koju bazu koristim
    dialect: 'postgresql',

    //kako da se poveze na bazu
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
}satisfies Config;
