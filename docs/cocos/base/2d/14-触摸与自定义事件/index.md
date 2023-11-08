---
outline: deep
---

# 14-触摸与自定义事件

本节来学习触摸与自定义事件

## 触摸事件

在模拟器上，触摸事件也可以用鼠标模拟，不同的是，触摸其实可能有多个手指触摸，比如2个手指触摸到屏幕，就会触发2次事件，但依然可以区分，代码如下

```ts
// 触摸开始事件
this.player.on(Node.EventType.TOUCH_START, (e: EventTouch) => {
    // getID() 获取触点的标识 ID，可以用来在多点触摸中跟踪触点。
    // getLocation() 获取触点位置。
    console.log('touch start', e.getID(), e.getLocation());
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