{
    /**
     * 需求，用户名字一更改就通知
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