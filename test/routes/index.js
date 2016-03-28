'use strict';

module.exports = [{
    method: 'GET',
    path: '/a',
    handler: (request, reply) => {

        return reply({ route: 'a' });
    }
}, {
    method: 'GET',
    path: '/b',
    handler: (request, reply) => {

        return reply({ route: 'a' });
    }
}];
