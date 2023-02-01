export default class BadResponse extends Error {
    static fromResponse(error, status) {
        return new BadResponse(error.message || JSON.stringify(error), status, error.timestamp, error.error_id, error.details, error);
    }
    static fromText(response, status) {
        return new BadResponse(response, status);
    }
    status;
    timestamp;
    errorId;
    details;
    error;
    constructor(message, status, timestamp = null, errorId = null, details = null, error = null) {
        super(message);
        this.timestamp = timestamp;
        this.status = status;
        this.errorId = errorId;
        this.details = details;
        this.error = error;
    }
}
