---
outline: deep
---

# 触摸与自定义事件

本节来学习触摸与自定义事件

## 触摸事件

在模拟器上，触摸事件也可以用鼠标模拟，不同的是，触摸其实可能有多个手指触摸，比如2个手指触摸到屏幕，就会触发2次事件，但依然可以区分，代码如下

```ts
// 触摸开始事件
this.player.on(Node.EventType.TOUCH_START, (e: EventTouch) => {
    // getID() 获取触点的标识 ID，可以用来在多点触摸中跟踪触点。
    // getLocation() 获取触点位置。canvas的大小会随着设备切换变化
    console.log('touch start', e.getID(), e.getLocation());
    // 获取 UI 坐标系下的触点位置，UI坐标系下的不会变化
    console.log('getUILocation', e.getUILocation());
})
// 触摸移动事件
this.player.on(Node.EventType.TOUCH_MOVE, (e: EventTouch) => {
    console.log('touch move', e.getID(), e.getLocation());
})
// 在目标区域内手指结束触摸事件
this.player.on(Node.EventType.TOUCH_END, (e: EventTouch) => {
    console.log('touch end', e.getID(), e.getLocation());
})
// 当手指在目标节点区域外离开屏幕时
this.player.on(Node.EventType.TOUCH_CANCEL, (e: EventTouch) => {
    console.log('touch cancel', e.getID(), e.getLocation());
})
```

## 自定义事件

自定义事件有2种方式通知事件触发，首先先监听自定义事件，紧接着我们在前面cancel的事件模拟通知事件触发

监听事件代码如下

```ts
// 监听自定义事件my-event
this.node.on('my-event', () => {
    console.log('my-event')
})
// 监听自定义事件other-event
this.node.on('other-event', () => {
    console.log('other-event');
})
```

触发事件代码如下

```ts
// 当手指在目标节点区域外离开屏幕时
this.player.on(Node.EventType.TOUCH_CANCEL, (e: EventTouch) => {
    console.log('touch cancel', e.getID(), e.getLocation());
    // 在cancel事件中派发自定义事件
    this.node.emit('my-event')
    this.node.dispatchEvent(new Event('other-event'))
})
```

## 综合案例

### 完成按钮特效

触摸开始，缩小，抬起恢复

```ts
import { _decorator, Component, EventTouch, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Button')
export class Button extends Component {
    start() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this)
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this)
    }

    update(deltaTime: number) {
        
    }

    onTouchStart (e: EventTouch) {
        console.log('touch start');
        this.node.setScale(0.9, 0.9)
    }
    onTouchMove (e: EventTouch) {
        console.log('touch move');
    }
    onTouchEnd (e: EventTouch) {
        console.log('touch end');
        this.node.setScale(1, 1)
    }
    onTouchCancel (e: EventTouch) {
        console.log('touch cancel');
        this.node.setScale(1, 1)
    }
}
```

### 拖拽按钮

```ts
onTouchMove (e: EventTouch) {
    console.log('touch move');
    const delta = e.getUIDelta()
    const p = this.node.position
    this.node.setPosition(p.x + delta.x, p.y + delta.y)
}
```

### 点击移动精灵

需求，点击精灵左侧往左移动，点击精灵右侧向右移动
目前坐标相对的是左下角的坐标，要转换成自身`node`的坐标

```ts
onTouchStart (e: EventTouch) {
    // console.log('touch start');
    // console.log('getLocation', e.getLocation());
    // 获取 UI 坐标系下的触点位置
    // console.log('getUILocation', e.getUILocation());
    const transform = this.node.getComponent(UITransform)
    const uiLocation = e.getUILocation()
    const nodePos = transform.convertToNodeSpaceAR(v3(uiLocation.x, uiLocation.y))
    // console.log(nodePos); // 此时0，0就是节点正中间
    const dx = nodePos.x > 0 ? 50 : -50
    this.node.setPosition(this.node.position.x + dx, this.node.position.y)
    this.node.setScale(0.9, 0.9)
}
```
