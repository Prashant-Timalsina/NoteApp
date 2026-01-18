// Vue-style reactive system
const reactiveMap = new WeakMap();
let activeEffect = null;

// Keys to skip tracking (Object.prototype methods, internal properties)
const skipKeys = new Set([
    'hasOwnProperty', 'toString', 'valueOf', 'constructor',
    '__proto__', '__defineGetter__', '__defineSetter__',
    '__lookupGetter__', '__lookupSetter__', 'isPrototypeOf',
    'propertyIsEnumerable', 'toLocaleString'
]);

function shouldTrack(key) {
    // Skip Symbol keys, internal properties, and Object.prototype methods
    if (typeof key === 'symbol') return false;
    if (key.startsWith('_')) return false; // Skip internal properties like _deps
    if (skipKeys.has(key)) return false;
    return true;
}

export function reactive(obj) {
    // If already reactive, return cached proxy
    if (reactiveMap.has(obj)) {
        return reactiveMap.get(obj);
    }

    const proxy = new Proxy(obj, {
        get(target, key) {
            // Track dependencies only for trackable keys and when effect is active
            if (activeEffect && shouldTrack(key)) {
                if (!target._deps) target._deps = {};
                if (!target._deps[key]) {
                    target._deps[key] = new Set();
                }
                target._deps[key].add(activeEffect);
            }
            
            // Return the property value
            const value = target[key];
            
            // If value is an object/array, make it reactive too
            if (value && typeof value === 'object' && !reactiveMap.has(value)) {
                return reactive(value);
            }
            
            return value;
        },
        set(target, key, value) {
            const oldValue = target[key];
            target[key] = value;

            // Trigger effects only for trackable keys
            if (shouldTrack(key) && target._deps && target._deps[key]) {
                target._deps[key].forEach(effect => {
                    try {
                        effect();
                    } catch (e) {
                        console.error('Error in effect:', e);
                    }
                });
            }

            return true;
        },
        has(target, key) {
            return key in target;
        },
        ownKeys(target) {
            return Reflect.ownKeys(target).filter(key => key !== '_deps');
        }
    });

    reactiveMap.set(obj, proxy);
    return proxy;
}

export function effect(fn) {
    activeEffect = fn;
    fn();
    activeEffect = null;
}

export function ref(value) {
    return reactive({ value });
}
