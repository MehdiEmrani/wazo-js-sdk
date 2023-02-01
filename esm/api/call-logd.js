import CallLog from '../domain/CallLog';
export default ((client, baseUrl) => ({
    search: (search, limit = 5) => client.get(`${baseUrl}/users/me/cdr`, {
        search,
        limit,
    }).then(CallLog.parseMany),
    searchBy: (field, value, limit = 5) => client.get(`${baseUrl}/users/me/cdr`, {
        [field]: value,
        limit,
    }).then(CallLog.parseMany),
    listCallLogs: (offset, limit = 5) => client.get(`${baseUrl}/users/me/cdr`, {
        offset,
        limit,
    }).then(CallLog.parseMany),
    listDistinctCallLogs: (offset, limit = 5, distinct = undefined) => client.get(`${baseUrl}/users/me/cdr`, {
        offset,
        limit,
        distinct,
    }).then(CallLog.parseMany),
    listCallLogsFromDate: (from, number) => client.get(`${baseUrl}/users/me/cdr`, {
        from: from.toISOString(),
        number,
    }).then(CallLog.parseMany),
}));
