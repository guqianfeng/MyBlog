{
    /**
     * 观察者模式
     * 举例
     *  观察玩家（可以是多个观察者）
     *  玩家名字一变化，就通知所有观察者！
     */

    interface IObserver {
        nameChanged(newName: string): void
    }

    class Player {
        private _name: string = ''
        observers: IObserver[] = []
        get name() {
            return this._name
        }
        set name(val: string) {
            this._name = val
            for (const observer of this.observers) {
                observer.nameChanged(val)
            }
        }
    }

    class Test implements IObserver {
        nameChanged(newName: string): void {
            console.log('名字变化了是', newName);
        }
    }

    const player = new Player()
    const t = new Test()
    player.observers.push(t)
    player.name = 'hahaha'
}