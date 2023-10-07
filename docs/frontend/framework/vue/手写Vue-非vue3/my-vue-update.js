// 先不用dep做测试，只要实例化Watcher 就添加进数组，并且在劫持set的时候，直接更新
// const watchers = []
function defineReactive(obj, key, value) {
    // 实例化管家 管家里有2个方法，一个是addDep 还有一个notify
    const dep = new Dep()
    observe(value)
    Object.defineProperty(obj, key, {
        get() {
            // console.log('get', { key, value });
            if (Dep.target) {
                // dep.addSub(watcher实例)
                dep.addSub(Dep.target)
            }
            return value
        },
        set(newValue) {
            if (newValue !== value) {
                observe(newValue)
                // console.log('set', {key, newValue});
                value = newValue
                // watchers.forEach(item => item.update())
                dep.notify()
            }
        }
    })
}

function observe(obj) {
    // 递归要注意 终止条件 判断不是对象 或者是null 就return 
    if (typeof obj !== 'object' || obj === null) return
    Object.keys(obj).forEach(key => defineReactive(obj, key, obj[key]))
}

// set方法 劫持新的属性
function set(target, key, value) {
    defineReactive(target, key, value)
}


function proxy(vm) {
    // console.log(vm);
    Object.keys(vm.$data).forEach(key => {
        Object.defineProperty(vm, key, {
            get() {
                return vm.$data[key]
            },
            set(val) {
                vm.$data[key] = val
            }
        })
    })
}

class Vue {
    constructor(options) {
        // console.log(options);
        // $options
        this.$options = options
        // $data 判断data是对象还是函数 函数执行取返回值
        this.$data = options.data
        // data数据是响应式的
        observe(options.data)
        // 代理 希望
        // 访问 vm.count => vm.$data.count
        // 修改 vm.count++ => vm.$data.count++
        proxy(this) // this在这里就是实例 就是vm
        // new Compile(options.el, this)
        // 如果设置el则挂载
        if (options.el) {
            this.$mount(options.el)
        }
    }
    $mount(elSelector) {
        // console.log(el);
        // 获取宿主
        this.$el = document.querySelector(elSelector)
        // console.log(this.$el);
        // console.log(this.$options.render);
        // 声明更新函数
        const updateComponent = () => {
            // const el = this.$options.render.call(this)
            // // console.log(el);
            // const parent = this.$el.parentElement
            // // console.log(parent);
            // parent.insertBefore(el, this.$el.nextSibling)
            // parent.removeChild(this.$el)
            // this.$el = el

            const vnode = this.$options.render.call(this, this.$createElement)
            // console.log(vnode);
            this._update(vnode)
        }
        // new Watcher
        new Watcher(this, updateComponent)
    }
    $createElement(tag, props, children) {
        return {
            tag,
            props,
            children
        }
    }
    // vnode转换，初始化则创建，更新则patch
    _update(vnode) {
        // 上次vnode
        const prevVnode = this._vnode
        // console.log(prevVnode);
        if (!prevVnode) {
            // init
            this.__patch__(this.$el, vnode)
        } else {
            // patch
            this.__patch__(prevVnode, vnode)
        }
        // 记录_vnode
        this._vnode = vnode
    }
    __patch__(oldVnode, vnode) {
        // console.log(oldVnode, vnode);
        // 判断oldVnode是否是真实dom
        if (oldVnode.nodeType) {
            const parent = oldVnode.parentElement
            const refElm = oldVnode.nextSibling
            // console.log(refElm);    
            const el = this.createElm(vnode)
            parent.insertBefore(el, refElm)
            parent.removeChild(oldVnode)
            // 记录_vnode
            this._vnode = vnode
        } else {
            // 获取要更新的元素
            const el = vnode.el = oldVnode.el
            // 同层比较相同节点
            if (oldVnode.tag === vnode.tag) {
                // diff
                // TODO: props
                // children
                const oldCh = oldVnode.children
                const newCh = vnode.children
                if (typeof newCh === 'string') {
                    if (typeof oldCh === 'string') {
                        if (newCh !== oldCh) {
                            el.textContent = newCh
                        }
                    } else {
                        // 新的是字符串，老的是子节点，replace elements with text
                        el.textContent = newCh
                    }
                } else {
                    if (typeof oldCh === 'string') {
                        // 新的是子节点 老的是字符串 replace text with elements
                        // TODO: 先clear text
                        // TODO: 再批量创建
                    } else {
                        // 新老节点都有子节点
                        this.updateChildren(el, oldCh, newCh)
                    }
                }
            } else {
                // TODO:replace
            }
        }
    }

    createElm(vnode) {
        const el = document.createElement(vnode.tag)
        // TODO:props
        // children
        if (vnode.children) {
            if (typeof vnode.children === 'string') {
                el.textContent = vnode.children
            } else {
                // 子节点递归
                vnode.children.forEach(vnode => {
                    el.appendChild(this.createElm(vnode))
                })
            }
        }
        // 保存真实元素，更新时要用
        vnode.el = el
        return el
    }
    // 简写版，没有key强制更新
    updateChildren(parentElm, oldCh, newCh) {
        const len = Math.min(oldCh.length, newCh.length)
        for(let i = 0; i< len; i++){
            this.__patch__(oldCh[i], newCh[i])
        }
        if (newCh.length > oldCh.length) {
            // 新的比老的长 新增
            newCh.slice(len).forEach(child => {
                parentElm.appendChild(this.createElm(child))
            })
        } else if (newCh.length < oldCh.length) {
            // 老的比新的长 删除
            oldCh.slice(len).forEach(child => {
                parentElm.removeChild(child.el)
            })
        }
    }
}

class Watcher {
    // new Watcher(vm, key, updater函数)
    // new Watcher(vm, key, val => {渲染的逻辑})
    // 有值就能做渲染 node.textContent = vm[key]
    constructor(vm, fn) {
        this.vm = vm;
        this.getter = fn
        this.get()
    }
    get() {
        Dep.target = this
        this.getter.call(this.vm)
        Dep.target = null
    }
    // dep通知所有对应的watcher 遍历执行update
    update() {
        // 执行updater函数就可以了
        this.get()
    }
}

class Dep {
    constructor() {
        this.subs = new Set() // watcher数组
    }
    // 添加watcher
    addSub(sub) {
        this.subs.add(sub)
    }
    // 通知对应的watchers里的每一个观察者做更新
    notify() {
        this.subs.forEach(item => item.update())
    }
}



