import * as express from 'express';
import * as createMiddleware from 'swagger-express-middleware';
import * as _ from 'lodash';
import {mockResponse} from './mock.response';

const app = express();
const MOCK_SERVER_PORT = process.env.PORT || 3001;
const DEFAULT_URI = 'http://apispec.aecg.com.cn/schemas/ecgcloud/diagnosis.yaml';
const DEFAULT_NAME = 'diagnosis';
const RESPONSE_CODE = {
  SUCCESS: 0,
  ERROR: 1
}

const mockMiddleware = (api) => (req, res, next) => {

  const {paths, basePath} = api;
  const path = req.path.replace(new RegExp(`^${basePath}(.*)$`), '$1');
  const method = req.method.toLowerCase();
  const response = _.get(paths, `[${path}][${method}]['responses'][${res.statusCode}]`);

  // get schema
  if (response) {
    const schema = _.get(response, 'schema.properties.data', {});
    const result = mockResponse(schema);

    res.json({
      code: RESPONSE_CODE.SUCCESS, 
      data: result, 
      msg: response.description, 
      serverTime: new Date().getTime()
    });

    res.end();
  } else {
    next();
  }
}

const startServer = (uri = DEFAULT_URI, name = DEFAULT_NAME) => createMiddleware(uri, app, function(err, middleware, api) {

  const port = MOCK_SERVER_PORT;

  if (err) {
    return console.log(err);
  }

  // Add all the Swagger Express Middleware, or just the ones you need.
  // NOTE: Some of these accept optional options (omitted here for brevity)
  app.use(
      middleware.metadata(),
      middleware.CORS(),
      middleware.files(),
      middleware.parseRequest(),
      middleware.validateRequest(),
      mockMiddleware(api)
  );

  app.listen(port, function() {
      console.log(`Mock server(${name}) is now running at http://localhost:${port}`);
  });
});

if (process.argv && process.argv.length >= 3) {
  const uri = process.argv[2];
  const name = process.argv[3];

  startServer(uri, name);
}
