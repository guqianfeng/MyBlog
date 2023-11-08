---
outline: deep
---

# 13-键鼠事件

本节来学习键盘鼠标监听事件

## 键盘

```ts
input.on(Input.EventType.KEY_DOWN, (e: EventKeyboard) => {
    console.log('keydown', e);
    if(KeyCode.ARROW_LEFT === e.keyCode) {
        console.log('left');
    }
    if (KeyCode.ARROW_RIGHT === e.keyCode) {
        console.log('right');
    }
})
```

## 鼠标

```ts
this.player.on(Node.EventType.MOUSE_DOWN, (e: EventMouse) => {
    console.log('mousedown', e.getLocation());
    console.log('判断鼠标按下哪个键', e.getButton());
})
this.player.on(Node.EventType.MOUSE_UP, (e: EventMouse) => {
    console.log('mouseup', e.getLocation());
})
```

## 完整代码

```ts
import { _decorator, Component, EventKeyboard, EventMouse, Input, input, KeyCode, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('main')
export class main extends Component {

    @property(Node)
    player: Node | null = null

    start() {
        this.player.on(Node.EventType.MOUSE_DOWN, (e: EventMouse) => {
            console.log('mousedown', e.getLocation());
            console.log('判断鼠标按下哪个键', e.getButton());
        })
        this.player.on(Node.EventType.MOUSE_UP, (e: EventMouse) => {
            console.log('mouseup', e.getLocation());
        })
        input.on(Input.EventType.KEY_DOWN, (e: EventKeyboard) => {
            console.log('keydown', e);
            if(KeyCode.ARROW_LEFT === e.keyCode) {
                console.log('left');
            }
            if (KeyCode.ARROW_RIGHT === e.keyCode) {
                console.log('right');
            }
        })
    }

    update(deltaTime: number) {
        
    }
}


```