module.exports = function (plop) {
    plop.setGenerator('2DBase', {
        description: '请输入2D游戏相关-基础知识标题',
        prompts: [{
            type: 'input',
            name: 'name',
            message: '请输入2D游戏相关-基础知识标题'
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
                pattern: /(\/\/ -- append base route here --)/gi, // 正则找到标识位置(在文件哪里修改)
                templateFile: 'plop-templates/cocos/2d/base.route.ts.hbs' // 模板路径
            }
        ]
    });
};