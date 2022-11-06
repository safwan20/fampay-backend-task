require('dotenv').config()
const moment = require('moment');
const express = require('express')
const { Database } = require('./execute-query');

const app = express()

const databaseClient = new Database();

/*
1. if publishedAt not provided -> fetch the 20 records and return the reverse publishedat with the key that will be used for next fetch.
2. if publishedAt provided -> fetch the 20 records which is greater the the key provided to fetch the next data.
*/
app.get('/api/youtube', async (req, res) => {
  const publishedAt = req.query.publishedat;
  let data, nextPublishedAt, query, cq;

  try {
    if (!publishedAt) {
      query = `select publishedate, title, description from ${process.env.POSTGRES_TABLE} order by publishedate limit 20`;
      data = await databaseClient.executeQuery(query);
      cq = `select MAX(publishedate) from (${query}) as YV;`
      const resp = await databaseClient.executeQuery(cq);
      nextPublishedAt = moment(resp.rows[0].max).toISOString();
    } else {
      query = `select publishedate, title, description from ${process.env.POSTGRES_TABLE} where publishedate >= '${publishedAt}' order by publishedate limit 20`;
      data = await databaseClient.executeQuery(query);
      cq = `select MAX(publishedate) from (${query}) as YV;`
      const resp = await databaseClient.executeQuery(cq);
      nextPublishedAt = moment(resp.rows[0].max).toISOString();
    }
  
    res.send({ data: data.rows.reverse(), key: nextPublishedAt });
  } catch(error) {
    console.log('Coudnt able to fetch the data.', error);
    await databaseClient.closeConnection();
    res.send('Error in fetching the data, Please try again later.');
  }
})

/*
1. if title provided -> fetch the data matches with the title (leverage full text search).
2. if description provided -> fetch the data matches with the description (leverage full text search).
*/
app.get('/api/search/youtube', async (req, res) => {
  const title = req.query.title;
  const description = req.query.description;
  let query, titleResult, descriptioResult;

  try {
    if (title) {
      query = `select publishedate, title, description FROM ${process.env.POSTGRES_TABLE} where title_ts @@ to_tsquery('english', '${title}');`;
      const data = await databaseClient.executeQuery(query);
      titleResult = data.rows.reverse();
    }

    if (description) {
      query = `select publishedate, title, description FROM ${process.env.POSTGRES_TABLE} where description_ts @@ to_tsquery('english', '${description}');`;
      const data = await databaseClient.executeQuery(query);
      descriptioResult = data.rows.reverse();
    }

    res.send({ titleResult, descriptioResult });
  } catch(error) {
    console.log('Coudnt able to search the data.', error);
    await databaseClient.closeConnection();
    res.send('Error in searching the data, Please try again later.');
  }
})

app.listen(process.env.NODE_PORT, () => {
  console.log(`Running on http://localhost:${process.env.NODE_PORT}`);
});
