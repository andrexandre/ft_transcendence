module.exports = {
    type: 'object',
    properties: {
        name: {type: 'string'},
        pass: {type: 'string'},
    },
    required: ['name', 'pass'],
};