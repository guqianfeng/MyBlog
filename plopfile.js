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
                path: 'docs/cocos/2d/base/{{name}}/index.md',
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

    plop.setGenerator('2DGame', {
        description: '请输入2D游戏相关-游戏案例名',
        prompts: [{
            type: 'input',
            name: 'name',
            message: '请输入2D游戏相关-游戏案例名'
        }],
        actions: [
            {
                type: 'add',
                path: 'docs/cocos/2d/game/案例-{{name}}/index.md',
                templateFile: 'plop-templates/cocos/2d/index.md.hbs'
            },
            {
                type: 'modify', // 修改文件
                path: 'docs/.vitepress/router/cocos/2d.mts', // 修改文件路径
                pattern: /(\/\/ -- append game route here --)/gi, // 正则找到标识位置(在文件哪里修改)
                templateFile: 'plop-templates/cocos/2d/game.route.ts.hbs' // 模板路径
            }
        ]
    });

    plop.setGenerator('3DBase', {
        description: '请输入3D游戏相关-基础知识标题',
        prompts: [{
            type: 'input',
            name: 'name',
            message: '请输入3D游戏相关-基础知识标题'
        }],
        actions: [
            {
                type: 'add',
                path: 'docs/cocos/3d/base/{{name}}/index.md',
                templateFile: 'plop-templates/cocos/3d/index.md.hbs'
            },
            {
                type: 'modify', // 修改文件
                path: 'docs/.vitepress/router/cocos/3d.mts', // 修改文件路径
                pattern: /(\/\/ -- append base route here --)/gi, // 正则找到标识位置(在文件哪里修改)
                templateFile: 'plop-templates/cocos/3d/base.route.ts.hbs' // 模板路径
            }
        ]
    });

    plop.setGenerator('3DGame', {
        description: '请输入3D游戏相关-游戏案例名',
        prompts: [{
            type: 'input',
            name: 'name',
            message: '请输入3D游戏相关-游戏案例名'
        }],
        actions: [
            {
                type: 'add',
                path: 'docs/cocos/3d/game/案例-{{name}}/index.md',
                templateFile: 'plop-templates/cocos/3d/index.md.hbs'
            },
            {
                type: 'modify', // 修改文件
                path: 'docs/.vitepress/router/cocos/3d.mts', // 修改文件路径
                pattern: /(\/\/ -- append game route here --)/gi, // 正则找到标识位置(在文件哪里修改)
                templateFile: 'plop-templates/cocos/3d/game.route.ts.hbs' // 模板路径
            }
        ]
    });
};