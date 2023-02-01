"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST_PROCESSED_ERROR = exports.POST_PROCESSED_SUCCESS = exports.POST_PROCESSING = exports.REJECTED = exports.ACCEPTED = exports.PENDING = void 0;
exports.PENDING = 'pending';
exports.ACCEPTED = 'accepted';
exports.REJECTED = 'rejected';
exports.POST_PROCESSING = 'post_processing';
exports.POST_PROCESSED_SUCCESS = 'post_processed_success';
exports.POST_PROCESSED_ERROR = 'post_processed_error';
class MeetingAuthorization {
    constructor({ meetingUuid, uuid, userUuid, userName, } = {}) {
        this.meetingUuid = meetingUuid;
        this.uuid = uuid;
        this.userUuid = userUuid;
        this.userName = userName;
    }
    setStatus(status) {
        this.status = status;
    }
    getStatus() {
        return this.status;
    }
    static parse(plain) {
        const { meeting_uuid: meetingUuid, uuid, guest_uuid: userUuid, guest_name: userName, } = plain;
        return new MeetingAuthorization({
            meetingUuid,
            uuid,
            userUuid,
            userName,
        });
    }
    static parseMany(items) {
        if (!items) {
            return [];
        }
        return items.map(MeetingAuthorization.parse);
    }
}
exports.default = MeetingAuthorization;
