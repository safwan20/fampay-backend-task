const { Pool } = require("pg");

class Database {
    constructor() {
      this.client = new Pool({
          user: process.env.POSTGRES_USER,
          host: process.env.POSTGRES_HOST,
          database: process.env.POSTGRES_DATABASE,
          password: process.env.POSTGRES_PASSWORD,
          port: process.env.PORT,
          max: 20,
      })
    }

    async executeQuery(query) {
      return await this.client.query(query);
    }

    async closeConnection() {
      await this.client.end();
    }
}

module.exports = { Database };
