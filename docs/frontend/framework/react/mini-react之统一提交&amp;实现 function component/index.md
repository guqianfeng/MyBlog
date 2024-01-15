---
outline: deep
---

# mini-react之统一提交&amp;实现 function component

## 实现统一提交功能

中途可能没有空闲时间，用户会看到渲染一半的dom，解决思路为计算结束后统一添加

需要知道什么时候结束，以及根节点是谁（render一开始的那个节点）

### 记录根节点

```js
function render(el, container) {
    nextWorkOfUnit = {
        dom: container,
        props: {
            children: [el]
        }
    }
    root = nextWorkOfUnit
}

let root = null
```


### 实现提交

```diff
function workLoop(IdleDeadline) {
    let shouldYield = false // 是否需要让步，初始值不让步，这样能进入while循环做任务
    while (!shouldYield && nextWorkOfUnit) {
        // run task
        nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)
        // 当剩余时间小于1的时候，我就让步不做任务了，跳出循环
        shouldYield = IdleDeadline.timeRemaining() < 1
    }

+    if (!nextWorkOfUnit && root) {
+        commitRoot()
+    }

    requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop)

+ function commitRoot () {
+     commitWork(root.child)
+     root = null
+ }

+ function commitWork (fiber) {
+     if (!fiber) return
+     fiber.parent.dom.append(fiber.dom)
+     commitWork(fiber.child)
+     commitWork(fiber.sibling)
+ }
```

方法performWorkOfUnit中，添加dom的代码删除，把`fiber.parent.dom.append(dom)`注释掉


## 实现function component