---
outline: deep
---

# 碰撞系统

给物体添加刚体组件及碰撞器组件

## 代码演示

```ts
import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, RigidBody2D, v2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerCtrl')
export class PlayerCtrl extends Component {
    start() {
        const rbody = this.getComponent(RigidBody2D)
        console.log(rbody);
        // 力
        // rbody.applyForce(v2(1000, 0), v2(0, 0), true)
        // rbody.applyForceToCenter(v2(0, 1000), true)
        // 速度
        // rbody.linearVelocity = v2(50, 0)

        let collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);

        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        console.log({ selfCollider, otherCollider, contact });
        // 得到碰撞点 法线
        const { points, normal } = contact.getWorldManifold()
        console.log(points, normal);
    }

    update(deltaTime: number) {

    }
}
```

## 传感器

不会有物理碰撞效果（把传感器隐藏-精灵渲染关闭），但会触发事件，实际游戏中有很多对应例子
1. 玩家走到个点，开始刷怪了，实质碰到了传感器
2. 玩家走到个隐藏点，获得隐藏宝箱，实质碰到了传感器