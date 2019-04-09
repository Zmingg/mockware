"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const createMiddleware = require("swagger-express-middleware");
const _ = require("lodash");
const mock_response_1 = require("./mock.response");
const logger_1 = require("../lib/logger");
const logger = new logger_1.Logger();
const app = express();
const MOCK_SERVER_PORT = process.env.PORT || 3001;
const RESPONSE_CODE = {
    SUCCESS: 0,
    ERROR: 1
};
const errorHandler = function (err, req, res, next) {
    res.status(err.status);
    res.json({ code: err.status, msg: err.message, serverTime: new Date().getTime() });
};
const mockMiddleware = (api) => (req, res, next) => {
    const { paths } = api;
    const path = req.swagger.pathName;
    const method = req.method.toLowerCase();
    const response = _.get(paths, `[${path}][${method}]['responses'][${res.statusCode}]`);
    if (response) {
        const schema = _.get(response, 'schema', {});
        const result = mock_response_1.mockHandle(schema);
        res.status(200).json(result);
    }
    next();
};
const startServer = (path, name) => createMiddleware(path, app, function (err, middleware, api) {
    const port = MOCK_SERVER_PORT;
    if (err) {
        return logger.error(err);
    }
    app.use(middleware.metadata(), middleware.CORS(), middleware.files(), middleware.parseRequest(), middleware.validateRequest(), mockMiddleware(api), errorHandler);
    app.listen(port);
});
if (process.argv && process.argv.length >= 4) {
    const path = process.argv[2];
    const name = process.argv[3];
    startServer(path, name);
}
else {
    console.log('missing args: name or uri');
}
//# sourceMappingURL=index.js.map