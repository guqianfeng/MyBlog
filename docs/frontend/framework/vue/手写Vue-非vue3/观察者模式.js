class ProductManager {
    constructor () {
        this.workers = []
    }
    addWorker (worker) {
        this.workers.push(worker)
    }
    notify (prd) {
        this.workers.forEach(item => {
            item.update(prd)
        })
    }
    setPrd (prd) {
        this.notify(prd)
    }
}
class Worker {
    constructor(name) {
        this.name = name
    }
    update(prd) {
        console.log(prd + `需求来了，${this.name}准备996`);
    }
}

const pm = new ProductManager()
const frontWorker = new Worker('前端')
const endWorker = new Worker('后端')
const testWorker = new Worker('测试')
pm.addWorker(frontWorker)
pm.addWorker(endWorker)
pm.addWorker(testWorker)
pm.setPrd('一个复杂的功能')