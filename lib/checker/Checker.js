"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_client_1 = __importDefault(require("../api-client"));
const IssueReporter_1 = __importDefault(require("../service/IssueReporter"));
const index_1 = __importDefault(require("./checks/index"));
const logger = IssueReporter_1.default.loggerFor('engine-check');
class Checker {
    constructor(server, session, externalAppConfig = {}) {
        this.server = server;
        this.session = session;
        this.externalAppConfig = externalAppConfig;
        this.checks = [...index_1.default];
    }
    check(onCheckBegin = () => { }, onCheckResult = () => { }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._addEngineVersion();
            logger.info('Engine check starting');
            for (let i = 0; i < this.checks.length; i++) {
                const { name, check, } = this.checks[i];
                logger.info(`Checking ${name} ...`);
                onCheckBegin(name);
                try {
                    // eslint-disable-next-line no-await-in-loop
                    const result = yield check(this.server, this.session, this.externalAppConfig);
                    logger.info(`Checking ${name} success.`, {
                        result,
                    });
                    onCheckResult(name, result);
                }
                catch (e) {
                    logger.info(`Checking ${name} failure`, {
                        message: e.message,
                    });
                    onCheckResult(name, e);
                }
            }
            logger.info('Engine check done.');
        });
    }
    addCheck(check) {
        this.checks.push(check);
    }
    _addEngineVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.session.engineVersion) {
                const apiClient = new api_client_1.default({
                    server: this.server,
                });
                apiClient.setToken(this.session.token);
                const { wazo_version: engineVersion, } = yield apiClient.confd.getInfos();
                this.session.engineVersion = engineVersion;
            }
        });
    }
}
exports.default = Checker;
