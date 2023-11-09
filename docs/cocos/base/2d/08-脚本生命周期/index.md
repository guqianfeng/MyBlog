---
outline: deep
---

# 脚本生命周期

脚本中的生命周期函数，是自己会调用，[文档地址](https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html?h=%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F)

## 分析

### onLoad和start

onLoad比start先执行，有10个脚本，是先执行完所有脚本的onLoad在执行start。运用场景，枪的类和子弹类，枪的类会用到子弹，子弹必须先初始化好，所以子弹写在onLoad里。一般情况都在start写逻辑即可

### update和lateUpdate

update每帧都会调用，lateUpdate在更新后要做些额外操作可以使用

### onEnable和onDisable

onEnable在start和load之间调用

这2个生命周期函数会被多次执行，onEnable在启用的时候就会调用，onDisable在禁用的时候会被调用

PS: 组件启用禁用会执行，节点启用禁用也会执行

### onDestroy

组件销毁的时候调用

## 综合小案例

start的生命周期,通过代码修改节点位移，缩放，旋转
```ts
import { _decorator, Component, Label, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {

    curPos = new Vec3()
    curScale = new Vec3()

    start() {
        const labelComp = this.node.getComponent(Label)
        labelComp.string = '帅峰你好呀'
        console.log(this.node.position);
        console.log(this.node.rotation);
        console.log(this.node.scale);
    }

    update(deltaTime: number) {
        this.node.getPosition(this.curPos)
        this.curPos.x += 100 * deltaTime;
        this.node.setPosition(this.curPos)

        this.node.getScale(this.curScale)
        this.curScale.x += .5 * deltaTime;
        this.curScale.y += .5 * deltaTime;
        this.node.setScale(this.curScale)

        const angle = this.node.angle;
        this.node.angle = angle + 1
    }
}
```

