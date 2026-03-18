'use strict';

module.exports = [{
    method: 'GET',
    path: '/a',
    handler: (request, h) => {

        return h.response({ route: 'a' });
    }
}, {
    method: 'GET',
    path: '/b',
    handler: (request, h) => {

        return h.response({ route: 'b' });
    }
}];
