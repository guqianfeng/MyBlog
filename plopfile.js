module.exports = function (plop) {
    // cocos base 2d generator
    plop.setGenerator('cocos base 2d generate', {
        description: 'cocos base 2d generate',
        prompts: [{
            type: 'input',
            name: 'name',
            message: 'cocos base 2d title name please'
        }],
        actions: [{
            type: 'add',
            path: 'docs/cocos/base/2d/{{name}}/index.md',
            templateFile: 'plop-templates/cocos/base/2d/index.md.hbs'
        }]
    });
};