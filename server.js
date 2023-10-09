import 'dotenv/config';
import express from 'express';
import { dbConnection } from './database/dbConnection.js';
import { initApp } from './src/initApp.js';
import { globalErrorHandler } from './src/utils/globalErrorHandler.js';
const app = express();
const port = 4000 || process.env.PORT;
initApp(app, express);
dbConnection();
app.use(globalErrorHandler);
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
