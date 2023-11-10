---
outline: deep
---

# 16-接鸡蛋案例

本节做个综合案例，会学习计时器以及非物理碰撞系统

## 完整代码

```ts
import { _decorator, Collider2D, Component, Contact2DType, Director, director, EventKeyboard, Input, input, instantiate, KeyCode, Label, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameRoot')
export class GameRoot extends Component {
    @property(Node)
    player: Node | null = null
    @property(Node)
    hensRoot: Node | null = null
    @property(Node)
    eggsRoot: Node | null = null
    @property(Prefab)
    eggPrefab: Prefab | null = null
    @property(Label)
    scoreLabel: Label | null = null
    @property(Label)
    hpLabel: Label | null = null

    // 5个鸡，中间的索引是2
    playerPosIndex = 2
    hensPosArr = []
    score = 0
    hp = 3

    start() {
        this.addInputEvent()
        this.initData()
        this.startCreateEggs()
        this.addColliderEvent()
    }

    addColliderEvent() {
        const comp = this.player.getComponent(Collider2D)
        // console.log(comp);
        comp.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)
    }

    onBeginContact (self: Collider2D, other: Collider2D) {
        director.once(Director.EVENT_AFTER_PHYSICS, () => {
            other.node.destroy()
            this.score += 1
            this.renderScore()
        }, this)
    }

    renderScore () {
        if (this.scoreLabel) {
            this.scoreLabel.string = `${this.score} 分`
        }
    }

    startCreateEggs() {
        this.schedule(this.createOneEgg, 1.5)
    }

    createOneEgg () {
        const randomNum = Math.floor(Math.random() * 5)
        const egg = instantiate(this.eggPrefab)
        this.eggsRoot.addChild(egg)
        egg.setPosition(this.hensPosArr[randomNum], this.hensRoot.position.y)
    }

    initData () {
        for (let index = 0; index < this.hensRoot.children.length; index++) {
            const element = this.hensRoot.children[index];
            // console.log(element);
            this.hensPosArr.push(element.position.x)
        }
        // console.log(this.hensPosArr);
        this.renderPlayer()
        this.renderScore()
        this.renderHp()
    }

    renderHp () {
        if (this.hpLabel) {
            this.hpLabel.string = `HP: ${this.hp}`
        }
    }

    addInputEvent () {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this)
    }

    onKeyDown (e: EventKeyboard) {
        switch(e.keyCode) {
            case KeyCode.ARROW_LEFT: 
                // console.log('left')
                this.movePlayer(-1)
                break;
            case KeyCode.ARROW_RIGHT:
                // console.log('right')
                this.movePlayer(1)
                break;
        }
    }

    movePlayer(dir: 1 | -1) {
        this.playerPosIndex += dir
        if (this.playerPosIndex < 0) {
            this.playerPosIndex = 0
        }
        if (this.playerPosIndex > 4) {
            this.playerPosIndex = 4
        }
        this.renderPlayer()
        
    }

    renderPlayer () {
        const x = this.hensPosArr[this.playerPosIndex]
        const y = this.player.position.y
        this.player.setPosition(x, y)
    }

    update(deltaTime: number) {
       for (let index = 0; index < this.eggsRoot.children.length; index++) {
        const element = this.eggsRoot.children[index];
        const x = element.position.x
        const y = element.position.y - 200 * deltaTime
        element.setPosition(x, y)
        if (y < -640) {
            element.destroy()
            this.hp -= 1
            this.renderHp()
            this.checkGameOver()
        }
       } 
    }

    checkGameOver () {
        if (this.hp < 0) {
            console.log('game over');
        }
    }
}
```