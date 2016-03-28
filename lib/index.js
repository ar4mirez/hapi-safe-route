'use strict';

const _ = require('lodash');
const Hoek = require('hoek');
const Joi = require('joi');
const CastArray = require('cast-array');

const internals = {
    schema: {
        routes: Joi.alternatives().try(
            Joi.object(),
            Joi.array().items(Joi.object())
        )
    }
};

exports.register = function (server, options, next) {

    server.expose('safeRoute', (routes, callback) => {

        const result = Joi.validate(routes, internals.schema.routes);

        if (result.error) {
            Hoek.assert(result.error, result.error.annotate());
        }

        const connections = internals.getRouteInfo(server, options);
        const _routes = internals.matchRoutes(routes, connections);
        return internals.registerRoutes(_routes, server, callback);
    });

    return next();
};

exports.register.attributes = {
    pkg: require('../package.json')
};

internals.registerRoutes = (routes, server, callback) => {

    try {
        server.route(routes);
        return callback(null, routes);
    }
    catch (err) {

        return callback(err);
    }
};

internals.getRouteInfo = (server, options) => {

    const connections = [];

    const routingTable = server.table();

    routingTable.forEach((connection) => {

        const connectionInfo = {
            uri: connection.info.uri,
            labels: connection.labels,
            routes: []
        };

        internals.connectionInfo(connection.table, options, connectionInfo);
        connections.push(connectionInfo);
    });

    return connections;
};

internals.connectionInfo = (routes, options, connectionInfo) => {

    for (let i = 0; i < routes.length; ++i) {
        const route = routes[i];

        const show = {
            method: route.method.toUpperCase(),
            path: route.path
        };

        connectionInfo.routes.push(show);
    }

    connectionInfo.routes.sort((a, b) => {

        return a.path.localeCompare(b.path);
    });
};

internals.matchRoutes = (routes, connections) => {

    routes = CastArray(routes);
    const _routes = [];

    for (let i = 0; i < routes.length; ++i) {
        const route = routes[i];
        const find = {
            method: route.method.toUpperCase(),
            path: route.path
        };

        for (let j = 0; j < connections.length; ++j) {
            const conn = connections[j];

            if (!_.find(conn.routes, find)) {
                _routes.push(route);
            }
        }
    }

    return _routes;
};
