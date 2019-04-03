import * as express from 'express';
import * as createMiddleware from 'swagger-express-middleware';
import * as _ from 'lodash';
import {mockResponse} from './mock.response';
import {Logger} from '../lib/logger'

const logger = new Logger();

const app = express();
const MOCK_SERVER_PORT = process.env.PORT || 3001;
const RESPONSE_CODE = {
  SUCCESS: 0,
  ERROR: 1
}

const errorHandler = function (err, req, res, next) {
  res.status(err.status);
  res.json({code: err.status, msg: err.message, serverTime: new Date().getTime()});
}

const mockMiddleware = (api) => (req, res, next) => {

  const {paths} = api;
  const path = req.swagger.pathName;
  const method = req.method.toLowerCase();
  const response = _.get(paths, `[${path}][${method}]['responses'][${res.statusCode}]`);

  // get schema
  if (response) {
    const schema = _.get(response, 'schema.properties.data', {});
    const result = mockResponse(schema);

    res.status(200).json({
      code: result === false ? RESPONSE_CODE.ERROR : RESPONSE_CODE.SUCCESS, 
      data: result, 
      msg: response.description, 
      serverTime: new Date().getTime()
    });
  }
  
  next();
}

const startServer = (path, name) => createMiddleware(path, app, function(err, middleware, api) {

  const port = MOCK_SERVER_PORT;

  if (err) {
    return logger.error(err);
  }

  // Add all the Swagger Express Middleware, or just the ones you need.
  // NOTE: Some of these accept optional options (omitted here for brevity)
  app.use(
      middleware.metadata(),
      middleware.CORS(),
      middleware.files(),
      middleware.parseRequest(),
      middleware.validateRequest(),
      mockMiddleware(api),
      errorHandler
  );

  app.listen(port);
});

if (process.argv && process.argv.length >= 4) {
  const path = process.argv[2];
  const name = process.argv[3];

  startServer(path, name);
} else {
  console.log('missing args: name or uri');
}
