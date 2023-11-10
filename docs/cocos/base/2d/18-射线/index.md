---
outline: deep
---

# 18-射线

射出射线，检测是否有碰撞物体，应用场景如怪物巡逻（碰到墙回头，碰到玩家追踪）

[射线测试](https://docs.cocos.com/creator/manual/zh/physics-2d/physics-2d-system.html#%E5%B0%84%E7%BA%BF%E6%B5%8B%E8%AF%95)

## 射线检测类型

- ERaycast2DType.Any (返回一个任意的结果)

检测射线路径上任意的碰撞体，一旦检测到任何碰撞体，将立刻结束检测其他的碰撞体，最快。

- ERaycast2DType.Closest (返回最近的一个结果)

检测射线路径上最近的碰撞体，这是射线检测的默认值，稍慢。

- ERaycast2DType.All (返回所有的结果)

检测射线路径上的所有碰撞体，检测到的结果顺序不是固定的。在这种检测类型下，一个碰撞体可能会返回多个结果，这是因为 Box2D 是通过检测夹具（fixture）来进行物体检测的，而一个碰撞体中可能由多个夹具（fixture）组成的，慢。

- ERaycast2DType.AllClosest (一个射线穿过物体获取2个点，返回所有穿过物体离射线最近的点)

检测射线路径上所有碰撞体，但是会对返回值进行删选，只返回每一个碰撞体距离射线起始点最近的那个点的相关信息，最慢。


## 综合练习

上下两堵墙，敌人自动巡逻

```ts
import { _decorator, Component, ERaycast2DType, Node, PhysicsSystem2D, UITransform, v2, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EnemyCtrl')
export class EnemyCtrl extends Component {
    dir = v2(0, 1)

    start() {

    }

    update(deltaTime: number) {
        this.node.setPosition(this.node.position.x, this.node.position.y + this.dir.y * 100 * deltaTime)
        const transform = this.node.getComponent(UITransform)
        const p1 = transform.convertToWorldSpaceAR(v3(this.node.position.x, this.node.position.y))
        const p2 = transform.convertToWorldSpaceAR(v3(this.node.position.x, this.node.position.y + this.dir.y * 100))
        const results = PhysicsSystem2D.instance.raycast(p1, p2, ERaycast2DType.Closest);
        if (results.length > 0) {
            this.dir.y *= -1
        }
    }
}
```
