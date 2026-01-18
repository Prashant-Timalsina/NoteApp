import { reactive, effect } from './reactive';
import { h } from './template';

// Global component registry
const components = {};
// Store active component instances for reactivity
const activeComponents = new WeakMap();

export function defineComponent(options) {
    const {
        name,
        data = () => ({}),
        render,
        methods = {},
        props = {},
        computed = {},
        mounted = null,
        created = null
    } = options;

    return function Component(propsData = {}) {
        // Create reactive data
        const componentData = reactive(data());

        // Merge props into data
        Object.keys(props).forEach(key => {
            if (propsData[key] !== undefined) {
                componentData[key] = propsData[key];
            }
        });

        // Create computed properties with getters for reactivity
        const computedValues = {};
        Object.keys(computed).forEach(key => {
            // Create getter that computes value on access
            // Dependencies are tracked through the reactive system when componentData is accessed
            Object.defineProperty(computedValues, key, {
                get() {
                    return computed[key].call(componentData);
                },
                enumerable: true,
                configurable: true
            });
        });

        // Bind methods to component context
        const boundMethods = {};
        Object.keys(methods).forEach(key => {
            boundMethods[key] = methods[key].bind(componentData);
        });

        // Component context (like Vue's 'this')
        const ctx = {
            ...componentData,
            ...boundMethods,
            ...computedValues,
            $props: propsData,
            $h: h // Make h() available in render function
        };

        // Lifecycle hooks
        if (created) {
            created.call(ctx);
        }

        // Render function
        const renderFn = () => {
            if (render) {
                return render.call(ctx);
            }
            return null;
        };

        // Mount lifecycle
        const mount = (el) => {
            const vnode = renderFn();
            if (mounted) {
                mounted.call(ctx, el);
            }
            return vnode;
        };

        const instance = {
            ctx,
            render: renderFn,
            mount,
            data: componentData
        };

        activeComponents.set(instance, componentData);
        return instance;
    };
}

export function registerComponent(name, component) {
    components[name] = component;
}

export function getComponent(name) {
    return components[name];
}
