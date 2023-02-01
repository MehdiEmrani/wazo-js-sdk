import Participant from './Participant';
class RemoteParticipant extends Participant {
    constructor(room, rawParticipant, extra = {}) {
        super(room, rawParticipant, extra);
        if (this.name === '<unknown>') {
            this.name = String(this.number);
        }
    }
}
export default RemoteParticipant;
