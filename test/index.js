'use strict';

const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const Hapi = require('@hapi/hapi');
const Plugin = require('../lib');

const { describe, it, beforeEach } = exports.lab = Lab.script();
const { expect } = Code;

describe('Plugin Registration', () => {

    it('it registers successfully', async () => {

        const server = new Hapi.Server();
        await server.register(Plugin);
    });
});

describe('functionality:', () => {

    let server;

    beforeEach(async () => {

        server = new Hapi.Server();
        await server.register(Plugin);
        await server.initialize();
    });

    it('it exposes safeRoute function', () => {

        expect(server.plugins['hapi-safe-route']).to.exist();
        expect(server.plugins['hapi-safe-route'].safeRoute).to.be.a.function();
    });

    it('it fails if no route is passed', async () => {

        const { safeRoute } = server.plugins['hapi-safe-route'];
        let err;

        try {
            await safeRoute(null);
        }
        catch (e) {
            err = e;
        }

        expect(err).to.exist();
    });

    it('it registers a valid route', async () => {

        const { safeRoute } = server.plugins['hapi-safe-route'];
        const routes = await safeRoute(require('./routes'));

        expect(routes).to.have.length(2);
        const table = server.table();
        expect(table).to.have.length(2);
    });

    it('making sure routes can be reached', async () => {

        const { safeRoute } = server.plugins['hapi-safe-route'];
        await safeRoute(require('./routes'));

        const res = await server.inject({ method: 'GET', url: '/b' });
        expect(res.statusCode).to.equal(200);
    });

    it('silently skips duplicate routes instead of crashing', async () => {

        const { safeRoute } = server.plugins['hapi-safe-route'];
        await safeRoute(require('./routes'));

        const newRoutes = await safeRoute(require('./routes'));
        expect(newRoutes).to.have.length(0);
    });
});
