---
outline: deep
---

# mini-react之进军vdom的更新

## 实现事件绑定

写个按钮，绑定点击事件

```js
function Counter({ num }) {
    const handleClick = () => {
        console.log('click');
    }
    return (
        <div>
            counter: { num }
            <button onClick={handleClick}>click</button>
        </div>
    )
}
```

点击后肯定没有打印东西，因为还没有实现，在`initChildren`中打印下`fiber`，看下`button`的那个对象，能发现`props`里有`onClick`属性，以及对应的事件函数

实现的逻辑，就写在`updateProps`中
```js
function updateProps(dom, props) {
    Object.keys(props).forEach(key => {
        if (key !== 'children') {
            if (key.startsWith('on')) {
                const eventType = key.slice(2).toLowerCase()
                dom.addEventListener(eventType, props[key])
            } else {
                dom[key] = props[key]
            }
        }
    })
}
```
之后点击按钮就有打印了

## 实现更新props

对比，`new vdom tree` vs `old vdom tree`

### 如何得到新的dom树

初始化时调用render函数，渲染dom树，更新时我们需要update函数，实现逻辑类似，但我们不希望用户在传入el和container，那如何获取呢，只要拿到之前的节点就可以了（注意不能使用root，因为在commitRoot使用后改为空了），新写个变量`currentRoot`

```js
let currentRoot = null
...
function commitRoot () {
    commitWork(root.child)
    currentRoot = root
    root = null
}

function update() {
    nextWorkOfUnit = {
        dom: currentRoot.dom,
        props: currentRoot.props
    }
    root = nextWorkOfUnit
}

const React = {
    createElement,
    render,
    update
}
```

这样在update的时候我们就获取了新的dom树

### 如何找到老的节点

遍历树的方式去找效率太低了，之前把树转换成了链表，我们可以用一个属性，指向到老的节点就可以了

update函数中，指向老的节点
```diff
function update() {
    nextWorkOfUnit = {
        dom: currentRoot.dom,
        props: currentRoot.props,
+       alternate: currentRoot
    }
    root = nextWorkOfUnit
}
```

initChildren中处理指向问题
```js
function initChildren(fiber, children) {
    let oldFiber = fiber.alternate?.child
    // console.log(fiber);
    // 3. 转换列表 设置好指针
    let prevChild = null
    children.forEach((child, index) => {
        const isSameType = oldFiber && oldFiber.type === child.type
        let newFiber
        if (isSameType) {
            // update
            newFiber = {
                type: child.type,
                props: child.props,
                child: null,
                parent: fiber,
                sibling: null,
                dom: oldFiber.dom, // 更新不会创建新的dom
                effectTag: 'update', // 区分更新还是创建
                alternate: oldFiber
            }
        } else {
            // create
            newFiber = {
                type: child.type,
                props: child.props,
                child: null,
                parent: fiber,
                sibling: null,
                dom: null,
                effectTag: 'placement' // 区分更新还是创建
            }
        }
        if (oldFiber) {
            oldFiber = oldFiber.sibling // 多个孩子情况：更新oldFiber为他的兄弟节点
        }
        if (index === 0) {
            fiber.child = newFiber
        } else {
            prevChild.sibling = newFiber
        }
        prevChild = newFiber
    })
}
```

### 如何diff props

commitWork中区分创建和更新的逻辑
```js
function commitWork (fiber) {
    if (!fiber) return
    let fiberParent = fiber.parent
    while (!fiberParent.dom) {
        fiberParent = fiberParent.parent
    }
    if (fiber.effectTag === 'update') {
        // 更新
    } else if(fiber.effectTag === 'placement') {
        if (fiber.dom) {
            fiberParent.dom.append(fiber.dom)
        }
    }
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}
```

updateProps逻辑架子
```js
function updateProps(dom, nextProps, prevProps) {
    // 1. 老的有 新的没有 删除
    // 2. 新的有 老的没有 添加
    // 3. 新的有 老的也有 更新
}
```

updateProps实现逻辑
```js
function updateProps(dom, nextProps, prevProps) {
    // 1. 老的有 新的没有 删除
    Object.keys(prevProps).forEach(key => {
        if (key !== 'children') {
            if (!(key in nextProps)) {
                dom.removeAttribute(key)
            }
        }
    })
    // 2. 新的有 老的没有 添加
    // 3. 新的有 老的也有 更新
    Object.keys(nextProps).forEach(key => {
        if (key !== 'children') {
            if (nextProps[key] !== prevProps[key]) {
                if (key.startsWith('on')) {
                    const eventType = key.slice(2).toLowerCase()
                    dom.addEventListener(eventType, nextProps[key])
                } else {
                    dom[key] = nextProps[key]
                }
            }
        }
    })

}
```

创建时调用
```js
updateProps(dom, fiber.props, {})
```

更新时调用
```js
updateProps(fiber.dom, fiber.props, fiber.alternate?.props)
```

### 测试功能

由于还没有实现useState，我们先手动调用update函数

```jsx
let testNum = 10
let props = {id: 'test'}
function Counter({ num }) {
    const handleClick = () => {
        // console.log('click');
        testNum++
        props = {}
        React.update()
    }
    return (
        <div {...props}>
            counter: { num }
            <button onClick={handleClick}>click</button>
            testNum: { testNum }
        </div>
    )
}
```

事件多次调用的原因是还没有移除老的
```diff
if (key.startsWith('on')) {
    const eventType = key.slice(2).toLowerCase()
+    dom.removeEventListener(eventType, prevProps[key])
    dom.addEventListener(eventType, nextProps[key])
} 
```

### 重构

1. root的命名不是很规范，正在工作中的根节点可以取名为wipRoot
2. update函数及render函数，变量名调整
3. initChildren命名不合适，改为reconcileChildren

目前React.js的完整代码如下
```js
function createTextNode(nodeValue) {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue,
            children: []
        }
    }
}

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

function render(el, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [el]
        }
    }
    nextWorkOfUnit = wipRoot
}

let currentRoot = null
let wipRoot = null
let nextWorkOfUnit = null
function workLoop(IdleDeadline) {
    let shouldYield = false // 是否需要让步，初始值不让步，这样能进入while循环做任务
    while (!shouldYield && nextWorkOfUnit) {
        // run task
        nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)
        // 当剩余时间小于1的时候，我就让步不做任务了，跳出循环
        shouldYield = IdleDeadline.timeRemaining() < 1
    }

    if (!nextWorkOfUnit && wipRoot) {
        commitRoot()
    }

    requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop)

function commitRoot() {
    commitWork(wipRoot.child)
    currentRoot = wipRoot
    wipRoot = null
}

function commitWork(fiber) {
    if (!fiber) return
    let fiberParent = fiber.parent
    while (!fiberParent.dom) {
        fiberParent = fiberParent.parent
    }
    if (fiber.effectTag === 'update') {
        updateProps(fiber.dom, fiber.props, fiber.alternate?.props)
    } else if (fiber.effectTag === 'placement') {
        if (fiber.dom) {
            fiberParent.dom.append(fiber.dom)
        }
    }
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

function createDom(type) {
    return type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(type)
}

function updateProps(dom, nextProps, prevProps) {
    // 1. 老的有 新的没有 删除
    Object.keys(prevProps).forEach(key => {
        if (key !== 'children') {
            if (!(key in nextProps)) {
                dom.removeAttribute(key)
            }
        }
    })
    // 2. 新的有 老的没有 添加
    // 3. 新的有 老的也有 更新
    Object.keys(nextProps).forEach(key => {
        if (key !== 'children') {
            if (nextProps[key] !== prevProps[key]) {
                if (key.startsWith('on')) {
                    const eventType = key.slice(2).toLowerCase()
                    dom.removeEventListener(eventType, prevProps[key])
                    dom.addEventListener(eventType, nextProps[key])
                } else {
                    dom[key] = nextProps[key]
                }
            }
        }
    })

}

function reconcileChildren(fiber, children) {
    let oldFiber = fiber.alternate?.child
    // console.log(fiber);
    // 3. 转换列表 设置好指针
    let prevChild = null
    children.forEach((child, index) => {
        const isSameType = oldFiber && oldFiber.type === child.type
        let newFiber
        if (isSameType) {
            // update
            newFiber = {
                type: child.type,
                props: child.props,
                child: null,
                parent: fiber,
                sibling: null,
                dom: oldFiber.dom, // 更新不会创建新的dom
                effectTag: 'update', // 区分更新还是创建
                alternate: oldFiber
            }
        } else {
            // create
            newFiber = {
                type: child.type,
                props: child.props,
                child: null,
                parent: fiber,
                sibling: null,
                dom: null,
                effectTag: 'placement' // 区分更新还是创建
            }
        }
        if (oldFiber) {
            oldFiber = oldFiber.sibling // 多个孩子情况：更新oldFiber为他的兄弟节点
        }
        if (index === 0) {
            fiber.child = newFiber
        } else {
            prevChild.sibling = newFiber
        }
        prevChild = newFiber
    })
}

function updateFunctionComponent(fiber) {
    const children = [fiber.type(fiber.props)]
    reconcileChildren(fiber, children)
}

function updateHostComponent(fiber) {
    if (!fiber.dom) {
        // 1. 创建dom
        const dom = (fiber.dom = createDom(fiber.type))
        // fiber.parent.dom.append(dom)
        // 2. 处理props
        updateProps(dom, fiber.props, {})
    }
    const children = fiber.props.children
    reconcileChildren(fiber, children)
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
    while (nextFiber) {
        if (nextFiber.sibling) return nextFiber.sibling
        nextFiber = nextFiber.parent
    }
}

function update() {
    wipRoot = {
        dom: currentRoot.dom,
        props: currentRoot.props,
        alternate: currentRoot
    }
    nextWorkOfUnit = wipRoot
}

const React = {
    createElement,
    render,
    update
}

export default React
```