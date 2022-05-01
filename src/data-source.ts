import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "node_auth_2fa",
  synchronize: true,
  logging: false,
  entities: ["src/entity/*.ts"],
  migrations: [],
});
