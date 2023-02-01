import moment from 'moment';
export default class Recording {
    deleted;
    end;
    fileName;
    start;
    uuid;
    static parseMany(recordings = []) {
        if (!recordings) {
            return [];
        }
        return recordings.map(item => Recording.parse(item));
    }
    static parse(plain) {
        return new Recording({
            deleted: plain.deleted,
            fileName: plain.filename,
            end: plain.end_time ? moment(plain.end_time).toDate() : null,
            start: moment(plain.start_time).toDate(),
            uuid: plain.uuid,
        });
    }
    constructor({ deleted, end, fileName, start, uuid, }) {
        this.deleted = deleted;
        this.end = end;
        this.fileName = fileName;
        this.start = start;
        this.uuid = uuid;
    }
}
