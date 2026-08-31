const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    dialect: "mysql",
    logging: false,
    timezone: "+00:00",

    dialectOptions: {
      ssl: {
        ca: process.env.MYSQL_SSL_CA,
        rejectUnauthorized: true,
      },
    },
  },
);

sequelize
  .authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.error("MYSQL ERROR:", err));

module.exports = sequelize;
