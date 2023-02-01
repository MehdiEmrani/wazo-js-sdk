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
const api_client_1 = __importDefault(require("../../api-client"));
exports.default = {
    name: 'List of AOR',
    check: (server, session) => __awaiter(void 0, void 0, void 0, function* () {
        const apiClient = new api_client_1.default({
            server,
        });
        apiClient.setToken(session.token);
        apiClient.disableErrorLogging();
        const line = session.primaryWebRtcLine();
        if (!line) {
            return 'No WebRTC line for this user';
        }
        const { username, } = line;
        try {
            const aors = yield apiClient.amid.getAors(username);
            const nbAors = aors.length;
            const availableAors = aors.filter(aor => aor.status === 'Reachable');
            return `Number of AOR: ${nbAors} (${availableAors.length} Avail, ${nbAors - availableAors.length} Unavail)`;
        }
        catch (e) {
            if (e.status === 401) {
                return 'Not available for this user';
            }
            throw e;
        }
    }),
};
