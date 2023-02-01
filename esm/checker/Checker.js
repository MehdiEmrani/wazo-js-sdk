import WazoApiClient from '../api-client';
import IssueReporter from '../service/IssueReporter';
import checks from './checks/index';
const logger = IssueReporter.loggerFor('engine-check');
class Checker {
    session;
    server;
    externalAppConfig;
    checks;
    constructor(server, session, externalAppConfig = {}) {
        this.server = server;
        this.session = session;
        this.externalAppConfig = externalAppConfig;
        this.checks = [...checks];
    }
    async check(onCheckBegin = () => { }, onCheckResult = () => { }) {
        await this._addEngineVersion();
        logger.info('Engine check starting');
        for (let i = 0; i < this.checks.length; i++) {
            const { name, check, } = this.checks[i];
            logger.info(`Checking ${name} ...`);
            onCheckBegin(name);
            try {
                // eslint-disable-next-line no-await-in-loop
                const result = await check(this.server, this.session, this.externalAppConfig);
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
    }
    addCheck(check) {
        this.checks.push(check);
    }
    async _addEngineVersion() {
        if (!this.session.engineVersion) {
            const apiClient = new WazoApiClient({
                server: this.server,
            });
            apiClient.setToken(this.session.token);
            const { wazo_version: engineVersion, } = await apiClient.confd.getInfos();
            this.session.engineVersion = engineVersion;
        }
    }
}
export default Checker;
