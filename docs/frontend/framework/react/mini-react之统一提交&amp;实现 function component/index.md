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

### 写一个函数式组件

在App.jsx中，写这样一段代码
```jsx
import React from './core/React.js';

function Counter () {
    return (
        <div>
            counter
        </div>
    )
}

const App = (
    <div id="app">
        <div>jsx-heihei</div>
        <div>jsx-haha</div>
        <div>jsx-hehe</div>
        <Counter />
    </div>
)

export default App
```

打开控制台后发现报错了，tag name提供函数，在之前实现的方法`createDom`打印下`type`，发现的确是个函数，那如何才能拿到函数返回的东西呢，答案就是执行他！

### 判断函数式组件并处理

找到执行任务的方法`performWorkOfUnit`，在一开始就判断`fiber.type`是否是个函数

```js
    // 判断是否是函数式组件
    const isFunctionComponent = (typeof fiber.type === 'function')
    if (isFunctionComponent) {
        console.log(fiber.type()); // 返回的就是jsx，虚拟dom
    }
```
函数式组件是不需要创建dom的所以追加判断逻辑
```js
if (!isFunctionComponent) {
    if (!fiber.dom) {
        // 1. 创建dom
        const dom = (fiber.dom = createDom(fiber.type))
        // fiber.parent.dom.append(dom)
        // 2. 处理props
        updateProps(dom, fiber.props)
    }
}
```

initChildren中，children根据不同类型进行处理，所以作为形参传入
```js
    // 3. 转换列表 设置好指针
    // children需要用数组包裹下，所以函数式组件执行后，数组包裹下
    const children = isFunctionComponent ? [fiber.type()] : fiber.props.children
    initChildren(fiber, children)
```

### 添加元素逻辑

由于函数式组件没有dom，添加元素应该一直往父级找，直到找到为止
```
    App
    / \
xxx    Counter
        /  \
      xxx  xxx
```

在commitWork方法中，实现该逻辑
```js
function commitWork (fiber) {
    if (!fiber) return
    let fiberParent = fiber.parent
    if (!fiberParent.dom) {
        fiberParent = fiberParent.parent
    }
    if (fiber.dom) {
        fiberParent.dom.append(fiber.dom)
    }
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}
```

### 组件嵌套的逻辑

接下去我们要完成这样的case

```jsx
function Counter () {
    return (
        <div>
            counter
        </div>
    )
}

function CounterContainer () {
    return (
        <Counter />
    )
}

const App = (
    <div id="app">
        <div>jsx-heihei</div>
        <div>jsx-haha</div>
        <div>jsx-hehe</div>
        {/* <Counter /> */}
        <CounterContainer></CounterContainer>
    </div>
)
```

由于嵌套的关系，我们又报错了，其实就是要一直往上找父亲，修改下前面`commitWork`的逻辑

```js
// 把if改成while，直到找到为止
while (!fiberParent.dom) {
    fiberParent = fiberParent.parent
}
```
此时我们也可以把App改成函数式组件，入口文件同样做下修改

### 处理props

父传子使用props，我们代码一般这么处理
```jsx
function Counter({ num }) {
    return (
        <div>
            counter: { num }
        </div>
    )
}



function App() {
    return (
        <div id="app">
            <div>jsx-heihei</div>
            <div>jsx-haha</div>
            <div>jsx-hehe</div>
            <Counter num={ 10 }></Counter>
        </div>
    )
}
```
如何支持props，我们需要再执行函数的时候把props传入

```js
    const children = isFunctionComponent ? [fiber.type(fiber.props)] : fiber.props.children
```

但依然有报错，那是因为我们处理`createElement`，判断了只有字符串的逻辑，数字也是文本节点，所以需要再判断下
```js
function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map(child => {
                const isTextNode = typeof child === 'string' || typeof child === 'number'
                return isTextNode ? createTextNode(child) : child
            })
        }
    }
}
```
此时，就函数式组件支持了props

### 多个Counter组件

```js
function performWorkOfUnit(fiber) {
    // 判断是否是函数式组件
    const isFunctionComponent = (typeof fiber.type === 'function')
    if (!isFunctionComponent) {
        if (!fiber.dom) {
            // 1. 创建dom
            const dom = (fiber.dom = createDom(fiber.type))
            // fiber.parent.dom.append(dom)
            // 2. 处理props
            updateProps(dom, fiber.props)
        }
    }
    // 3. 转换列表 设置好指针
    const children = isFunctionComponent ? [fiber.type(fiber.props)] : fiber.props.children
    initChildren(fiber, children)
    // 4. 返回下个任务 （先是孩子，再是兄弟，最后才是叔叔）
    if (fiber.child) {
        return fiber.child
    }

    let nextFiber = fiber
    while(nextFiber) {
        if(nextFiber.sibling) return nextFiber.sibling
        nextFiber = nextFiber.parent
    }
```

### 函数式组件重构

处理函数式组件的时候抽离一个函数，处理正常节点的时候抽离一个函数

```js
function updateFunctionComponent (fiber) {
    const children = [fiber.type(fiber.props)]
    initChildren(fiber, children)
}

function updateHostComponent (fiber) {
    if (!fiber.dom) {
        // 1. 创建dom
        const dom = (fiber.dom = createDom(fiber.type))
        // fiber.parent.dom.append(dom)
        // 2. 处理props
        updateProps(dom, fiber.props)
    }
    const children = fiber.props.children
    initChildren(fiber, children)
}

/**
 * @param {*} fiber 任务
 * @returns 返回下一个任务
 */
function performWorkOfUnit(fiber) {
    // 判断是否是函数式组件
    const isFunctionComponent = (typeof fiber.type === 'function')
    if (isFunctionComponent) {
        updateFunctionComponent(fiber)
    } else {
        updateHostComponent(fiber)
    }
    // 4. 返回下个任务 （先是孩子，再是兄弟，最后才是叔叔）
    if (fiber.child) {
        return fiber.child
    }

    let nextFiber = fiber
    while(nextFiber) {
        if(nextFiber.sibling) return nextFiber.sibling
        nextFiber = nextFiber.parent
    }
}
```

