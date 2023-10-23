---
outline: deep
---

# 10-预设体

假设我们精灵加脚本需要复用，该怎么办?

## 制作预设体

精灵加脚本处理后，将层级管理器的节点拖动到资源管理器，制作预设体成功

## 使用预设体

拖动资源管理器中的预设体到场景编辑器(或者层级管理器也行)，则能看到场景中就有效果了，并且观察下层级管理器中的节点颜色，和一般的节点是不一样的

属性选择器中的一些操作说明

- 编辑资源：编辑预制体
- 取消关联： 取消关联后该节点就不是预制体
- 定位资源： 可以找到放预制体资源的地方
- 从资源还原： 进行改动后，还原到预制体设置的参数
- 更新到资源： 更新预制体资源，所有预制体一起改变

## 代码使用预制体创建节点

```ts
import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameMgr')
export class GameMgr extends Component {
    @property(Prefab)
    prefab: null | Prefab = null

    start() {
        if (this.prefab) {
            const node = instantiate(this.prefab)
            // node.setParent(this.node)
            this.node.addChild(node)
        }
    }

    update(deltaTime: number) {
        
    }
}
```