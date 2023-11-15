module.exports = function (plop) {
    // cocos base 2d generator
    plop.setGenerator('cocos base 2d generate', {
        description: 'cocos base 2d generate',
        prompts: [{
            type: 'input',
            name: 'name',
            message: 'cocos base 2d title name please'
        }],
        actions: [
            {
                type: 'add',
                path: 'docs/cocos/2d/{{name}}/index.md',
                templateFile: 'plop-templates/cocos/2d/index.md.hbs'
            },
            {
                type: 'modify', // 修改文件
                path: 'docs/.vitepress/router/cocos/2d.mts', // 修改文件路径
                pattern: /(\/\/ -- append route here --)/gi, // 正则找到标识位置(在文件哪里修改)
                templateFile: 'plop-templates/cocos/2d/route.ts.hbs' // 模板路径
            }
        ]
    });
};