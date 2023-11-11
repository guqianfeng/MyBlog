---
outline: deep
---

# 资源动态加载


## AB 加载

[Asset Bundle 介绍](https://docs.cocos.com/creator/manual/zh/asset/bundle.html#asset-bundle-%E4%BB%8B%E7%BB%8D)


### 资源目录结构

新建`AssetsPackage` -> `GUI` -> `xxx文件夹` -> `yyy`图集，`GUI`设置为`Bundle`

### 代码实现加载

创建精灵节点，挂载脚本，代码如下

```ts
import { _decorator, assetManager, Component, Sprite, SpriteAtlas } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {
    start() {
        assetManager.loadBundle('GUI', (err, bundle) => {
            if (err) return;
            bundle.load('xxx/yyy', SpriteAtlas, (err, sa) => {
                if (err) return;
                const sf = sa.getSpriteFrame('add')
                const comp = this.node.getComponent(Sprite)
                comp.spriteFrame = sf
            })
        })
    }

    update(deltaTime: number) {

    }
}
```

## resources加载

加载图片示例
```ts
resources.loadDir('xxx', SpriteFrame, (err, sp) => {
    // sp返回的是数组
    this.node.getComponent(Sprite).spriteFrame = sp[索引]
})
```