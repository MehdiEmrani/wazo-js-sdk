class Subscription {
    name;
    events;
    config;
    uuid;
    service;
    eventsUserUuid;
    eventsWazoUuid;
    metadata;
    ownerTenantUuid;
    ownerUserUuid;
    static parse(plain) {
        return new Subscription({
            name: plain.name,
            events: plain.events,
            config: plain.config,
            uuid: plain.uuid,
            service: plain.service,
            eventsUserUuid: plain.events_user_uuid,
            eventsWazoUuid: plain.events_wazo_uuid,
            metadata: plain.metadata,
            ownerTenantUuid: plain.owner_tenant_uuid,
            ownerUserUuid: plain.owner_user_uuid,
        });
    }
    static parseMany(response) {
        return response.items.map(payload => Subscription.parse(payload));
    }
    constructor({ name, events, config, uuid, service, eventsUserUuid, eventsWazoUuid, metadata, ownerTenantUuid, ownerUserUuid, }) {
        this.name = name;
        this.events = events;
        this.config = config;
        this.uuid = uuid;
        this.service = service;
        this.eventsUserUuid = eventsUserUuid;
        this.eventsWazoUuid = eventsWazoUuid;
        this.metadata = metadata;
        this.ownerTenantUuid = ownerTenantUuid;
        this.ownerUserUuid = ownerUserUuid;
    }
}
export default Subscription;
