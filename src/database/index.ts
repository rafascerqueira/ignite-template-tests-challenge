import { createConnection, getConnectionOptions } from "typeorm";

interface IOptions {
  host: string;
}

getConnectionOptions().then((options) => {
  const defaultOptions = options as IOptions;

  defaultOptions.host = "database";
  createConnection({
    ...options,
  });
});
