const dns = require('dns');
dns.setServers(['8.8.8.8']);

const srvHostname = '_mongodb._tcp.cluster0.ohypbqc.mongodb.net';

console.log(`🔍 Resolving SRV for: ${srvHostname}`);

dns.resolveSrv(srvHostname, (err, addresses) => {
    if (err) {
        console.error(`❌ SRV Resolution Failed: ${err.message}`);
        return;
    }

    console.log('✅ SRV Records found:', addresses);

    if (addresses && addresses.length > 0) {
        const target = addresses[0].name;
        console.log(`\n🔍 Now resolving A record for target: ${target}`);

        dns.resolve4(target, (err, ips) => {
            if (err) {
                console.error(`❌ A Record Resolution Failed: ${err.message}`);
            } else {
                console.log(`✅ A Record resolved to: ${ips.join(', ')}`);
            }
        });
    }
});
