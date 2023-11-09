---
outline: deep
---

# 15-缓动系统

## tween的初步使用

## 综合案例

需求
1. label展示跳跃高度
2. player控制玩家跳跃，左右移动
3. start按钮上下跳动
4. left和right控制左右移动

完整代码

```ts
import { _decorator, Color, Component, EventTouch, Label, Node, Tween, tween, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameRoot')
export class GameRoot extends Component {

    @property(Node)
    player: Node | null = null
    @property(Node)
    button: Node | null = null
    @property(Node)
    label: Node | null = null

    upTween: Tween<object>

    start() {
        if (this.button) {
            this.button.on(Node.EventType.TOUCH_START, this.onTouchStart, this)
            this.button.on(Node.EventType.TOUCH_END, this.onTouchEnd, this)
            this.button.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this)
        }
    }

    update(deltaTime: number) {

    }

    animStart() {
        // tween(this.player)
        //     .to(2, {
        //        position: v3(0, 100, 0) 
        //     })
        //     .start()
        // const obj = {count: 0}
        // tween(obj)   
        //     .to(2, {
        //         count: 1000
        //     }, {
        //         // 箭头函数，否则this指向有问题
        //         onUpdate: (target, ratio) => {
        //             // console.log(target, ratio);
        //             // console.log(this.label);
        //             if (this.label) {
        //                 const comp = this.label.getComponent(Label)
        //                 // console.log(comp);
        //                 comp.string = `${obj.count.toFixed(2)}`
        //             }
        //         },
        //         easing: 'elasticIn'
        //     })
        //     .start()
        const obj = { y: 0 }
        // console.log(obj);
        this.upTween = tween(obj)
            .repeatForever(
                tween(obj)
                    .to(0.5, {
                        y: 200
                    }, {
                        onUpdate: (target, ratio) => {
                            // console.log(target, ratio);
                            this.player.setPosition(this.player.position.x, obj.y)
                            this.label.getComponent(Label).string = `${obj.y.toFixed(2)}`
                        },
                    })
                    .to(0.5, {
                        y: 0
                    }, {
                        onUpdate: (target, ratio) => {
                            // console.log(target, ratio);
                            this.player.setPosition(this.player.position.x, obj.y)
                            this.label.getComponent(Label).string = `${obj.y.toFixed(2)}`
                        },
                    })
            )
            .start()

        const color = v3(255, 255, 255)
        tween(color)
            .to(2, {
                x: 100, y: 150, z: 200
            }, {
                onUpdate: () => {
                    this.label.getComponent(Label).color = new Color(color.x, color.y, color.z)
                }
            })
            .to(2, {
                x: 200, y: 150, z: 100
            }, {
                onUpdate: () => {
                    this.label.getComponent(Label).color = new Color(color.x, color.y, color.z) 
                }
            })
            .union()
            .repeatForever()
            .start()
    }

    onTouchStart(e: EventTouch) {
        this.button.setScale(0.9, 0.9)
        this.animStart()
    }

    onTouchEnd(e: EventTouch) {
        this.button.setScale(1, 1)
        // this.upTween.stop()
    }

    onTouchCancel(e: EventTouch) {
        this.button.setScale(1, 1)
        // this.upTween.stop()
    }

    onClickLeft() {
        console.log('left');
        const obj = {
            x: this.player.position.x
        }
        tween(obj)
            .to(1, {
                x: this.player.position.x - 50
            },
                {
                    onUpdate: (target, ratio) => {
                        // console.log(target);
                        this.player.setPosition(obj.x, this.player.position.y)
                    },
                }
            )
            .start()
    }

    onClickRight() {
        console.log('right')
        const obj = {
            x: this.player.position.x
        }
        tween(obj)
            .to(1, {
                x: this.player.position.x + 50
            }, {
                onUpdate: () => {
                    this.player.setPosition(obj.x, this.player.position.y)
                }
            })
            .start()
    }
}
```