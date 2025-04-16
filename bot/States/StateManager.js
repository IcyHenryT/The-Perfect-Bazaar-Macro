const { randomUUID } = require('crypto');

class StateManager {
    constructor(bot) {
        this.bot = bot;
        this.state = null;
        this.queue = [];
        this.queueInterval = null;

        this.initQueue();
    }

    get() {
        return this.state;
    }

    set(state) {
        this.state = state;
    }

    add(func, state, priority) {
        let uuid = randomUUID();

        this.queue.push({ func, state, priority, uuid });
        this.queue.sort((a, b) => a.priority - b.priority);

        return uuid;
    }

    clearQueue() {
        this.queue = [];
    }

    removeFromQueue(uuid) {
        this.queue = this.queue.filter(item => item.uuid !== uuid);
    }
    
    initQueue() {
        this.queueInterval = setInterval(() => {
            if (this.queue.length > 0 && this.state == null) {
                const { func, state } = this.queue.shift();
                this.set(state);
                func();
            }
        }, 250);
    }

    stopQueue() {
        clearInterval(this.queueInterval);
    }

}

module.exports = StateManager;