"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pm2 = require("pm2");
const detect = require("detect-port");
const _ = require("lodash");
const logger_1 = require("../lib/logger");
exports.SERVER_NAME = 'mockware-server';
const config = require('dotenv').config().parsed;
const { DEFAULT_MOCK_PORT } = config;
const mockLogger = new logger_1.Logger();
function start(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name, file, port = DEFAULT_MOCK_PORT } = opts;
        const serverMode = name === exports.SERVER_NAME;
        return yield new Promise((resolve, reject) => pm2.connect((err) => __awaiter(this, void 0, void 0, function* () {
            if (err) {
                mockLogger.error(err);
                process.exit(2);
            }
            const nameExist = yield new Promise((_resolve) => {
                pm2.list((err, processList) => {
                    if (err) {
                        mockLogger.error(err);
                        reject(err);
                    }
                    else {
                        _resolve(!!_.filter(processList, proc => proc.name === name).length);
                    }
                });
            });
            if (nameExist) {
                const err = serverMode ? 'Mock server is exist' : `Mock(${name}) is exist`;
                mockLogger.error(err);
                pm2.disconnect();
                return resolve();
            }
            detect(port).then(_port => {
                const args = serverMode ? [] : [file, name];
                pm2.start({
                    name,
                    script: serverMode ? `./dist/main.js` : `./dist/mockware/index.js`,
                    max_restarts: 0,
                    args,
                    env: {
                        PORT: _port
                    },
                }, (err, processList) => {
                    pm2.disconnect();
                    if (err) {
                        mockLogger.error(err);
                        resolve(err);
                    }
                    else {
                        resolve(processList);
                    }
                });
            });
        })));
    });
}
exports.start = start;
;
function status(serverMode = false) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new Promise((resolve, reject) => pm2.connect(err => {
            if (err) {
                mockLogger.error(err);
            }
            pm2.list((err, processList) => {
                pm2.disconnect();
                if (err) {
                    mockLogger.error(err);
                    reject(err);
                }
                else {
                    const res = processList.map((processDescription) => {
                        const { pm_id, name, pid, monit, pm2_env } = processDescription;
                        const { status, pm_uptime, restart_time, PORT } = pm2_env;
                        return Object.assign({ pm_id,
                            name, update_time: pm_uptime, restarts: restart_time, status }, monit, { pid, port: PORT });
                    });
                    if (!serverMode) {
                        resolve(_.filter(res, proc => proc.name !== exports.SERVER_NAME));
                    }
                    else {
                        resolve(_.get(_.filter(res, proc => proc.name === exports.SERVER_NAME), '[0]'));
                    }
                }
            });
        }));
    });
}
exports.status = status;
function stop(mockIdOrNames) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new Promise((resolve, reject) => pm2.connect(function (err) {
            return __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    mockLogger.error(err);
                }
                for (let i = 0; i < mockIdOrNames.length; i++) {
                    yield new Promise((_resolve) => {
                        const symbol = mockIdOrNames[i];
                        pm2.delete(symbol, (err, processList) => {
                            if (err) {
                                pm2.disconnect();
                                mockLogger.error(err);
                                resolve(false);
                            }
                            _resolve();
                        });
                    });
                }
                resolve(true);
                pm2.disconnect();
            });
        }));
    });
}
exports.stop = stop;
function restart(mockIdOrNames) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new Promise((resolve, reject) => pm2.connect(function (err) {
            return __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    mockLogger.error(err);
                }
                for (let i = 0; i < mockIdOrNames.length; i++) {
                    yield new Promise((_resolve) => {
                        const symbol = mockIdOrNames[i];
                        pm2.restart(symbol, (err, processList) => {
                            if (err) {
                                pm2.disconnect();
                                mockLogger.error(err);
                                return resolve(err);
                            }
                            _resolve();
                        });
                    });
                }
                resolve(true);
                pm2.disconnect();
            });
        }));
    });
}
exports.restart = restart;
//# sourceMappingURL=mock.action.js.map