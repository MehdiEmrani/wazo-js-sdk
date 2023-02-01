import newFrom from '../utils/new-from';
import updateFrom from '../utils/update-from';
export default class IndirectTransfer {
    status;
    id;
    sourceId;
    destinationId;
    constructor({ sourceId, destinationId, status, id, }) {
        this.sourceId = sourceId;
        this.destinationId = destinationId;
        this.status = status;
        this.id = id;
    }
    static parseFromCallSession(source, destination) {
        return new IndirectTransfer({
            sourceId: source.getId(),
            destinationId: destination.getId(),
        });
    }
    static parseFromApi(plain) {
        return new IndirectTransfer({
            id: plain.id,
            status: plain.status,
            sourceId: plain.initiator_call,
            destinationId: plain.recipient_call,
        });
    }
    destinationIs(callSession) {
        return callSession.isId(this.destinationId);
    }
    sourceIs(callSession) {
        return callSession.isId(this.sourceId);
    }
    updateFrom(indirectTransfer) {
        updateFrom(this, indirectTransfer);
    }
    static newFrom(indirectTransfer) {
        return newFrom(indirectTransfer, IndirectTransfer);
    }
}
