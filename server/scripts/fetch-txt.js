const dns = require('dns');
try {
    dns.setServers(['8.8.8.8']);
} catch (e) {
    console.log('Could not set custom DNS servers, trying default');
}

console.log('Resolving TXT for cluster0.ohypbqc.mongodb.net...');
dns.resolveTxt('cluster0.ohypbqc.mongodb.net', (err, records) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.log('TXT Records:', JSON.stringify(records, null, 2));

    // Parse for replicaSet
    const flat = records.flat().join('');
    const match = flat.match(/replicaSet=([^&]+)/);
    if (match) {
        console.log('FOUND REPLICA SET:', match[1]);
    }
});
