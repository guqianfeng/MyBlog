---
outline: deep
---
# 01-节点的使用

面向组件开发，组件是挂载节点上的，所以我们先来学习下节点的基本使用

## 层级管理器

### 创建空节点

- canvas节点下右键创建空节点
  - 该节点就是空的，没法显示任何东西
  - 演示拖动

## 属性检查器

### 看Node节点文档

Node不可以删除

### 看UI 变换组件文档

属性检查器可以看组件部分，如空节点上挂了UI变化组件

## 资源管理器

这次我们玩个新的组件，叫精灵组件。

- 随便拖动一张图到左下角资源管理器assets资源文件夹下
- 在将图片直接拖入场景编辑器
- 看该节点的属性选择器
- 演示不使用组件，组件不勾选
- 演示节点不使用，节点不勾选

## 节点的使用

### Node的属性

- position 相对父节点的位置坐标
  - 场景编辑器 W快捷键 演示操作
- rotation 旋转
  - 场景编辑器 E快捷键 演示操作
- scale 缩放
  - 场景编辑器 R快捷键 演示操作

额外补充，通过代码修改
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

### UI 变换组件的属性

- Content Size 内容尺寸
  - 场景编辑器 T快捷键 演示操作
- Anchor Point 锚点(下节课讲解)  

### Sprite 组件的属性

- Color 渲染颜色
