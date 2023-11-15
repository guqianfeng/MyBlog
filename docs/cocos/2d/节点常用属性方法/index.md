---
outline: deep
---

# 节点常用属性方法

## 获取节点

```ts
// 获取节点
console.log(this.node);
// 获取节点孩子，返回数组
console.log(this.node.children);
// 获取其中一个孩子
const nodeAB = this.node.getChildByName('NodeAB');
console.log(nodeAB);
// 根据路径获取兄弟节点孩子
const nodeBB = find('Canvas/NodeB/NodeBB');
console.log(nodeBB);
// 获取父亲节点
console.log(this.node.parent, this.node.getParent());
        
```

## 删除节点

```ts
// 移除节点所有子节点
// this.node.removeAllChildren()
// 从父节点删除该节点
// this.node.removeFromParent()
// 移除节点指定子节点
// this.node.removeChild(nodeAB)
```

## 获取节点属性

```ts
// 获取节点属性
console.log(this.node.getPosition());
console.log(this.node.getScale());
console.log(this.node.getRotation())
```

## 设置节点属性

```ts
this.node.setPosition(-100, -100)
this.node.setScale(3, 3)
```

## 节点组件开关

```ts
// 节点开关
// this.node.active = false
// 组件开关
// this.enabled = false
```

## 获取节点其他组件

```ts
// 获取节点其他组件
const uiTransFormComp = this.node.getComponent(UITransform)
console.log(uiTransFormComp);
```


## 给节点添加组件

`addComponent`
