'use strict';

const Lab = require('lab');
const Code = require('code');
const Hapi = require('hapi');
const Plugin = require('../lib');


const lab = exports.lab = Lab.script();


lab.experiment('Plugin Registration', () => {

    lab.test('it registers successfully', (done) => {

        const server = new Hapi.Server();
        server.register(Plugin, (err) => {

            Code.expect(err).to.not.exist();
            done();
        });
    });
});

lab.experiment('functionality:', () => {

    let server;

    lab.beforeEach((done) => {

        server = new Hapi.Server();
        server.connection();
        server.register(Plugin, done);
    });

    lab.beforeEach((done) => {

        server.initialize(done);
    });

    lab.test('it exposes safeRoute function.', (done) => {

        Code.expect(server.plugins['hapi-safe-route']).to.exist();
        Code.expect(server.plugins['hapi-safe-route'].safeRoute).to.be.a.function();
        return done();
    });

    lab.test('it fail if not route were passed.', (done) => {

        const safeRoute = server.plugins['hapi-safe-route'].safeRoute;
        Code.expect(() => {

            safeRoute(() => {});
        }).to.throw();

        return done();
    });

    lab.test('it register a valid route.', (done) => {

        const safeRoute = server.plugins['hapi-safe-route'].safeRoute;
        safeRoute(require('./routes'), (err) => {

            Code.expect(err).to.not.exist();
            Code.expect(err).to.be.null();
            const routes = server.connections[0].table();
            Code.expect(routes).to.have.length(2);
            return done();
        });
    });

    lab.test('making sure routes can be reached. :D ', (done) => {

        const safeRoute = server.plugins['hapi-safe-route'].safeRoute;
        safeRoute(require('./routes'), (err) => {

            Code.expect(err).to.be.null();

            server.inject({
                method: 'GET',
                url: '/b'
            }, (res) => {

                Code.expect(res.statusCode).to.be.equal(200);
                return done();
            });
        });
    });

    lab.test('fail trying to register the same route.', (done) => {

        const safeRoute = server.plugins['hapi-safe-route'].safeRoute;
        safeRoute(require('./routes'), (err) => {

            Code.expect(err).to.be.null();

            safeRoute(require('./routes'), (err) => {

                Code.expect(err).to.be.an.instanceof(Error);
                return done();
            });
        });
    });
});
