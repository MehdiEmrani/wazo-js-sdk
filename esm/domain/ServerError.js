import BadResponse from './BadResponse';
export default class ServerError extends BadResponse {
    static fromResponse(error, status) {
        return new ServerError(error.message || JSON.stringify(error), status, error.timestamp, error.error_id, error.details);
    }
    static fromText(response, status) {
        return new ServerError(response, status);
    }
}
