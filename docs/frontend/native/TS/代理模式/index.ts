{
    /**
     * 代理模式
     * 举例
     *  找代理去完成你想做的事
     *  你不想买烟，可以找室友帮忙去买烟
     *  你不想拿外卖，可以找室友帮忙拿外卖
     *  你不想做算法题，可以找室友帮忙算
     */

    interface ICalc {
        calc(a: number, b: number): number
    }

    class NpcA implements ICalc {
        calc(a: number, b: number): number {
            return a + b
        }
    }

    class NpcB implements ICalc {
        calc(a: number, b: number): number {
            return a * b
        }

    }

    class Person {
        delegate: ICalc | null = null
        // 不是你去计算，是让代理人去计算
        getResult(a: number, b: number) {
            return this.delegate?.calc(a, b)
        }
    }

    const p = new Person()
    // 设置代理人，不同代理人做的事情不一样
    // p.delegate = new NpcA()
    p.delegate = new NpcB()
    const r = p.getResult(10, 20)
    console.log(r)
}