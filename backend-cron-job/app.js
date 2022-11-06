require('dotenv').config()
const phin = require('phin')
const { Pool } = require("pg");

const client = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRED_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.PORT,
    max: 20,
}); // client initialization can be done in some separate service.

let pageToken = null; // rethink this on setting this as a global variable.
const table = process.env.POSTGRES_TABLE;
const indexName = process.env.INDEX_NAME;

// Above function can be moved to some separate service.
const setupDatabase = async () => {
  const dropTableQuery = `drop table if exists ${table};`;
  const createTableQuery = `create table if not exists ${table} (publishedate timestamptz, title text, description text);`;
  const createIndexQuery = `create index if not exists ${indexName} on ${table}(publishedate)`;
  const addTitleVector = `alter table ${table} add column title_ts tsvector generated always as (to_tsvector('english', title)) STORED;`;
  const addDescriptionVector = `alter table ${table} add column description_ts tsvector generated always as (to_tsvector('english', description)) STORED;`;

  await client.query(dropTableQuery);
  await client.query(createTableQuery);
  await client.query(createIndexQuery);
  await client.query(addTitleVector);
  await client.query(addDescriptionVector);
}

/*
  1. fetch the data from the youtube api.
  2. parse the data to insert in the DB.
*/
const insertData = async (nextPageToken) => {
    const token = nextPageToken ? `pageToken=${nextPageToken}&` : '';
    const resp = await phin(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&${token}videoCategoryId=17&key=${process.env.API_KEY}`);
    const body = JSON.parse(resp.body.toString());
    body.items.forEach(async (element) => {
        try {
            await client.query(`insert into ${table}(publishedate, title, description) values ('${element.snippet.publishedAt}', '${element.snippet.title}', '${element.snippet.description}');`)
        } catch(error) {
            console.log('Insert query got failed.', error);
        }
    });
    pageToken = body.nextPageToken;
}


// set up database,tables,indexes and vector for full text search.
setupDatabase().then(() => {
    console.log('Database setup successfully.');
}).catch(async (error) => {
    console.log('Coudnt able to setup Database.', error);
    await client.end();
})

// runs every 5 sec.
setInterval(async () => {
    insertData(pageToken).then()
      .catch(async (error) => {
        console.log('Coudnt able to insert the data.', error);
        await client.end();
    });
}, 5000);
