---
outline: deep
---

# 摄像机跟随

## 最简单的方式

将摄像机节点拖动到玩家节点，成为玩家节点的子节点，这样就能跟随了。但是因为玩家是父节点，所以玩家发生旋转的时候摄像机也会旋转，所以如果不希望这样，只能使用脚本去处理

## 脚本实现

### 新建脚本

新建`FollowTarget.ts`，在`Camera`节点上挂载

### 实现逻辑

```ts
import { _decorator, Component, Node, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FollowTarget')
export class FollowTarget extends Component {

    @property(Node)
    target: Node | null = null

    @property(Vec3)
    offset = v3(0, 0, 0)

    tmpPos = v3(0, 0, 0)

    start() {

    }

    update(deltaTime: number) {
        this.target.getPosition(this.tmpPos)
        this.tmpPos.add(this.offset)
        this.node.setPosition(this.tmpPos)
    }
}
```