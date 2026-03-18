'use strict';

const Joi = require('joi');

const internals = {
    schema: {
        routes: Joi.alternatives().try(
            Joi.object(),
            Joi.array().items(Joi.object())
        )
    }
};

exports.plugin = {
    pkg: require('../package.json'),
    register: async (server) => {

        server.expose('safeRoute', async (routes) => {

            const { error, value } = internals.schema.routes.validate(routes);

            if (error) {
                throw error;
            }

            const existingRoutes = internals.getRouteInfo(server);
            const newRoutes = internals.matchRoutes(value, existingRoutes);

            if (newRoutes.length) {
                server.route(newRoutes);
            }

            return newRoutes;
        });
    }
};

internals.getRouteInfo = (server) => {

    return server.table().map((route) => ({
        method: route.method.toUpperCase(),
        path: route.path
    }));
};

internals.matchRoutes = (routes, existingRoutes) => {

    const routeArray = Array.isArray(routes) ? routes : [routes];

    return routeArray.filter((route) => {

        const method = route.method.toUpperCase();
        const path = route.path;
        return !existingRoutes.find((r) => r.method === method && r.path === path);
    });
};
