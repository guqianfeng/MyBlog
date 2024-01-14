---
outline: deep
---

# mini-react之任务调度器&amp;fiber架构

## 实现任务调度器

上一次的实现，遗留下来个问题，就是dom树特别大会导致渲染卡顿，那接下去就来看下原理及演示

### 卡顿的原理及演示

先来看下以下的代码
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <script>
        const el = document.createElement('div')
        el.innerHTML = '哈哈'
        document.body.append(el)
        let i = 0;
        while(i < 1e5) {
            i++
        }
    </script>
</body>
</html>
```

循环10万次，哈哈依然可以渲染出来，但如果把`1e5`改成`1e10`会怎么样呢？然后就能发现渲染卡顿了。因为js是单线程的，所以这段大循环逻辑阻塞了渲染，所以这就是卡顿的原因，我们之前render递归也同样会造成这样的问题

那该如何解决，之前我们的思路是一口气递归把整个dom树渲染出来，现在可以采用分治的思想，拆分任务！那接下去就要来学习个Api`requestIdleCallback`

### requestIdleCallback

[MDN-requestIdleCallback](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback)

小试牛刀，试下这个api
```js
function workLoop (IdleDeadline) {
    // 打印当前任务剩余时间
    console.log(IdleDeadline.timeRemaining());
    requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop)
```

紧接着可以追加完善下逻辑，有时间就做任务，没时间就不做任务

```js
let taskId = 0
function workLoop(IdleDeadline) {
    taskId++;
    let shouldYield = false // 是否需要让步，初始值不让步，这样能进入while循环做任务
    while (!shouldYield) {
        // run task
        console.log(`taskId: ${taskId}`);
        // 当剩余时间小于1的时候，我就让步不做任务了，跳出循环
        shouldYield = IdleDeadline.timeRemaining() < 1
    }
    requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop)
```
这就是任务调度器的初步玩法

## 实现fiber架构

### 树转换为链表

依次进行的任务，采用链表更合适

规则如下
1. 找孩子 child
2. 找兄弟 sibling
3. 找叔叔 parent.sibling

```
         A
       /   \
      B     C
     / \   / \
    D   E  F  G 
```

```
A -> B -> D -> E -> C -> F -> G -> END(结束)
```
比较好的方案是，边转换为列表，边去渲染，根据任务调度器依次执行任务

### 准备工作

上一节实现的任务调度器，拷贝到`React.js`，做些简单的处理
- 下一个任务初始值为null
- 任务调度执行方法performWorkOfUnit，传入任务，返回下一个任务
- render函数给任务赋值

```js

function render(el, container) {
    nextWorkOfUnit = {
        
    }
}

let nextWorkOfUnit = null
function workLoop(IdleDeadline) {
    let shouldYield = false // 是否需要让步，初始值不让步，这样能进入while循环做任务
    while (!shouldYield && nextWorkofUnit) {
        // run task
        nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)
        // 当剩余时间小于1的时候，我就让步不做任务了，跳出循环
        shouldYield = IdleDeadline.timeRemaining() < 1
    }
    requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop)

/**
 * @param {*} fiber 任务
 * @returns 返回下一个任务
 */
function performWorkOfUnit(fiber) {
    // 1. 创建dom
    // 2. 处理props
    // 3. 转换列表 设置好指针
    // 4. 返回下个任务 （先是孩子，再是兄弟，最后才是叔叔）
}
```

### 实现performWorkOfUnit和render

```js
function render(el, container) {
    nextWorkOfUnit = {
        dom: container,
        props: {
            children: [el]
        }
    }
}
/**
 * @param {*} fiber 任务
 * @returns 返回下一个任务
 */
function performWorkOfUnit(fiber) {
    if (!fiber.dom) {
        // 1. 创建dom
        const dom = (fiber.dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(fiber.type))
        fiber.parent.dom.append(dom)
        // 2. 处理props
        Object.keys(fiber.props).forEach(key => {
            if (key !== 'children') {
                dom[key] = fiber.props[key]
            }
        })
    }
    // 3. 转换列表 设置好指针
    const children = fiber.props.children
    let prevChild = null
    children.forEach((child, index) => {
        const newFiber = {
            type: child.type,
            props: child.props,
            child: null,
            parent: fiber,
            sibling: null,
            dom: null,
        }
        if (index === 0) {
            fiber.child = newFiber
        } else {
            prevChild.sibling = newFiber
        }
        prevChild = newFiber
    })
    // 4. 返回下个任务 （先是孩子，再是兄弟，最后才是叔叔）
    if (fiber.child) {
        return fiber.child
    }

    if (fiber.sibling) {
        return fiber.sibling
    }

    return fiber.parent?.sibling
}
```

### 重构代码

```js
function createDom(type) {
    return type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(type)
}

function updateProps(dom, props) {
    Object.keys(props).forEach(key => {
        if (key !== 'children') {
            dom[key] = props[key]
        }
    })
}

function initChildren(fiber) {
    // 3. 转换列表 设置好指针
    const children = fiber.props.children
    let prevChild = null
    children.forEach((child, index) => {
        const newFiber = {
            type: child.type,
            props: child.props,
            child: null,
            parent: fiber,
            sibling: null,
            dom: null,
        }
        if (index === 0) {
            fiber.child = newFiber
        } else {
            prevChild.sibling = newFiber
        }
        prevChild = newFiber
    })
}

/**
 * @param {*} fiber 任务
 * @returns 返回下一个任务
 */
function performWorkOfUnit(fiber) {
    if (!fiber.dom) {
        // 1. 创建dom
        const dom = (fiber.dom = createDom(fiber.type))
        fiber.parent.dom.append(dom)
        // 2. 处理props
        updateProps(dom, fiber.props)
    }
    // 3. 转换列表 设置好指针
    initChildren(fiber)
    // 4. 返回下个任务 （先是孩子，再是兄弟，最后才是叔叔）
    if (fiber.child) {
        return fiber.child
    }

    if (fiber.sibling) {
        return fiber.sibling
    }

    return fiber.parent?.sibling
}
```





