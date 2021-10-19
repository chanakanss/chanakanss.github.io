
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.5' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function getEventsAction() {
        const component = get_current_component();
        return node => {
          const events = Object.keys(component.$$.callbacks);
          const listeners = [];

          events.forEach(
              event => listeners.push(
                  listen(node, event, e =>  bubble(component, e))
                )
            );
      
          return {
            destroy: () => {
                listeners.forEach(
                    listener => listener()
                );
            }
          }
        };
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* node_modules\svelte-chota\cmp\Tabs.svelte generated by Svelte v3.42.5 */
    const file$5 = "node_modules\\svelte-chota\\cmp\\Tabs.svelte";

    function create_fragment$5(ctx) {
    	let nav;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);
    	let nav_levels = [/*$$restProps*/ ctx[3]];
    	let nav_data = {};

    	for (let i = 0; i < nav_levels.length; i += 1) {
    		nav_data = assign(nav_data, nav_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			if (default_slot) default_slot.c();
    			set_attributes(nav, nav_data);
    			toggle_class(nav, "tabs", 1);
    			toggle_class(nav, "is-full", /*full*/ ctx[0]);
    			add_location(nav, file$5, 19, 0, 419);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);

    			if (default_slot) {
    				default_slot.m(nav, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(/*events*/ ctx[1].call(null, nav));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(nav, nav_data = get_spread_update(nav_levels, [dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]]));
    			toggle_class(nav, "tabs", 1);
    			toggle_class(nav, "is-full", /*full*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const omit_props_names = ["active","full"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $active_tab;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tabs', slots, ['default']);
    	let { active = 0 } = $$props;
    	let { full = false } = $$props;
    	const events = getEventsAction();
    	const active_tab = writable(active);
    	validate_store(active_tab, 'active_tab');
    	component_subscribe($$self, active_tab, value => $$invalidate(5, $active_tab = value));
    	let num = 0;
    	setContext('tabs:getid', () => num++);
    	setContext('tabs:active', active_tab);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('active' in $$new_props) $$invalidate(4, active = $$new_props.active);
    		if ('full' in $$new_props) $$invalidate(0, full = $$new_props.full);
    		if ('$$scope' in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getEventsAction,
    		setContext,
    		writable,
    		active,
    		full,
    		events,
    		active_tab,
    		num,
    		$active_tab
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('active' in $$props) $$invalidate(4, active = $$new_props.active);
    		if ('full' in $$props) $$invalidate(0, full = $$new_props.full);
    		if ('num' in $$props) num = $$new_props.num;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$active_tab*/ 32) {
    			$$invalidate(4, active = $active_tab);
    		}
    	};

    	return [full, events, active_tab, $$restProps, active, $active_tab, $$scope, slots];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { active: 4, full: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get active() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get full() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set full(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-chota\cmp\Tab.svelte generated by Svelte v3.42.5 */
    const file$4 = "node_modules\\svelte-chota\\cmp\\Tab.svelte";

    function create_fragment$4(ctx) {
    	let span;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);
    	let span_levels = [/*$$restProps*/ ctx[5]];
    	let span_data = {};

    	for (let i = 0; i < span_levels.length; i += 1) {
    		span_data = assign(span_data, span_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			set_attributes(span, span_data);
    			toggle_class(span, "active", /*active*/ ctx[1]);
    			toggle_class(span, "svelte-3bldsl", true);
    			add_location(span, file$4, 14, 0, 324);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(/*events*/ ctx[2].call(null, span)),
    					listen_dev(span, "click", prevent_default(/*click_handler*/ ctx[9]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(span, span_data = get_spread_update(span_levels, [dirty & /*$$restProps*/ 32 && /*$$restProps*/ ctx[5]]));
    			toggle_class(span, "active", /*active*/ ctx[1]);
    			toggle_class(span, "svelte-3bldsl", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let active;
    	const omit_props_names = ["tabid"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $active_tab;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tab', slots, ['default']);
    	let { tabid = false } = $$props;
    	const events = getEventsAction();
    	const active_tab = getContext('tabs:active');
    	validate_store(active_tab, 'active_tab');
    	component_subscribe($$self, active_tab, value => $$invalidate(6, $active_tab = value));
    	const id = getContext('tabs:getid')();
    	const click_handler = () => active_tab.set(tabid === false ? id : tabid);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(5, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('tabid' in $$new_props) $$invalidate(0, tabid = $$new_props.tabid);
    		if ('$$scope' in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getEventsAction,
    		getContext,
    		tabid,
    		events,
    		active_tab,
    		id,
    		active,
    		$active_tab
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('tabid' in $$props) $$invalidate(0, tabid = $$new_props.tabid);
    		if ('active' in $$props) $$invalidate(1, active = $$new_props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$active_tab, tabid*/ 65) {
    			$$invalidate(1, active = $active_tab === tabid || $active_tab === id);
    		}
    	};

    	return [
    		tabid,
    		active,
    		events,
    		active_tab,
    		id,
    		$$restProps,
    		$active_tab,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class Tab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { tabid: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tab",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get tabid() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabid(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Circle.svelte generated by Svelte v3.42.5 */
    const file$3 = "src\\Circle.svelte";

    // (13:4) <Tab>
    function create_default_slot_2$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("คำนวณ");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(13:4) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (14:4) <Tab>
    function create_default_slot_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("สูตร");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(14:4) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (12:0) <Tabs bind:active={active_tab}>
    function create_default_slot$2(ctx) {
    	let tab0;
    	let t;
    	let tab1;
    	let current;

    	tab0 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_2$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab1 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tab0.$$.fragment);
    			t = space();
    			create_component(tab1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tab0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(tab1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tab0_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				tab0_changes.$$scope = { dirty, ctx };
    			}

    			tab0.$set(tab0_changes);
    			const tab1_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				tab1_changes.$$scope = { dirty, ctx };
    			}

    			tab1.$set(tab1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab0.$$.fragment, local);
    			transition_in(tab1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab0.$$.fragment, local);
    			transition_out(tab1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tab0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(tab1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(12:0) <Tabs bind:active={active_tab}>",
    		ctx
    	});

    	return block;
    }

    // (16:0) {#if active_tab==0}
    function create_if_block_1$3(ctx) {
    	let input;
    	let t0;
    	let div;
    	let h3;
    	let t1;
    	let t2_value = Math.PI * /*r*/ ctx[1] * /*r*/ ctx[1] + "";
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			div = element("div");
    			h3 = element("h3");
    			t1 = text("ได้ค่า ");
    			t2 = text(t2_value);
    			attr_dev(input, "placeholder", "ป้อนค่ารัสมีวงกลม");
    			add_location(input, file$3, 16, 0, 271);
    			add_location(h3, file$3, 18, 1, 338);
    			add_location(div, file$3, 17, 0, 330);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*r*/ ctx[1]);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t1);
    			append_dev(h3, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*r*/ 2 && input.value !== /*r*/ ctx[1]) {
    				set_input_value(input, /*r*/ ctx[1]);
    			}

    			if (dirty & /*r*/ 2 && t2_value !== (t2_value = Math.PI * /*r*/ ctx[1] * /*r*/ ctx[1] + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(16:0) {#if active_tab==0}",
    		ctx
    	});

    	return block;
    }

    // (22:0) {#if active_tab==1}
    function create_if_block$3(ctx) {
    	let h2;
    	let t0;
    	let sup;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text("สูตร : πr");
    			sup = element("sup");
    			sup.textContent = "2";
    			add_location(sup, file$3, 22, 14, 421);
    			add_location(h2, file$3, 22, 0, 407);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			append_dev(h2, sup);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(22:0) {#if active_tab==1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let tabs;
    	let updating_active;
    	let t2;
    	let t3;
    	let if_block1_anchor;
    	let current;

    	function tabs_active_binding(value) {
    		/*tabs_active_binding*/ ctx[2](value);
    	}

    	let tabs_props = {
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};

    	if (/*active_tab*/ ctx[0] !== void 0) {
    		tabs_props.active = /*active_tab*/ ctx[0];
    	}

    	tabs = new Tabs({ props: tabs_props, $$inline: true });
    	binding_callbacks.push(() => bind(tabs, 'active', tabs_active_binding));
    	let if_block0 = /*active_tab*/ ctx[0] == 0 && create_if_block_1$3(ctx);
    	let if_block1 = /*active_tab*/ ctx[0] == 1 && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "พื้นที่วงกลม";
    			t1 = space();
    			create_component(tabs.$$.fragment);
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			add_location(h2, file$3, 7, 4, 118);
    			add_location(div, file$3, 6, 0, 107);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			insert_dev(target, t1, anchor);
    			mount_component(tabs, target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabs_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				tabs_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_active && dirty & /*active_tab*/ 1) {
    				updating_active = true;
    				tabs_changes.active = /*active_tab*/ ctx[0];
    				add_flush_callback(() => updating_active = false);
    			}

    			tabs.$set(tabs_changes);

    			if (/*active_tab*/ ctx[0] == 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$3(ctx);
    					if_block0.c();
    					if_block0.m(t3.parentNode, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*active_tab*/ ctx[0] == 1) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			destroy_component(tabs, detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Circle', slots, []);
    	let active_tab = 0;
    	let r = "";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Circle> was created with unknown prop '${key}'`);
    	});

    	function tabs_active_binding(value) {
    		active_tab = value;
    		$$invalidate(0, active_tab);
    	}

    	function input_input_handler() {
    		r = this.value;
    		$$invalidate(1, r);
    	}

    	$$self.$capture_state = () => ({ Tabs, Tab, active_tab, r });

    	$$self.$inject_state = $$props => {
    		if ('active_tab' in $$props) $$invalidate(0, active_tab = $$props.active_tab);
    		if ('r' in $$props) $$invalidate(1, r = $$props.r);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [active_tab, r, tabs_active_binding, input_input_handler];
    }

    class Circle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Circle",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\Rectangle.svelte generated by Svelte v3.42.5 */
    const file$2 = "src\\Rectangle.svelte";

    // (13:8) <Tab>
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("คำนวณ");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(13:8) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (14:8) <Tab>
    function create_default_slot_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("สูตร");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(14:8) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (12:4) <Tabs bind:active={active_tab}>
    function create_default_slot$1(ctx) {
    	let tab0;
    	let t;
    	let tab1;
    	let current;

    	tab0 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab1 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tab0.$$.fragment);
    			t = space();
    			create_component(tab1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tab0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(tab1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tab0_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				tab0_changes.$$scope = { dirty, ctx };
    			}

    			tab0.$set(tab0_changes);
    			const tab1_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				tab1_changes.$$scope = { dirty, ctx };
    			}

    			tab1.$set(tab1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab0.$$.fragment, local);
    			transition_in(tab1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab0.$$.fragment, local);
    			transition_out(tab1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tab0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(tab1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(12:4) <Tabs bind:active={active_tab}>",
    		ctx
    	});

    	return block;
    }

    // (16:4) {#if active_tab==0}
    function create_if_block_1$2(ctx) {
    	let input0;
    	let t0;
    	let div0;
    	let input1;
    	let t1;
    	let div1;
    	let h2;
    	let t2;
    	let t3_value = /*กว้าง*/ ctx[1] * /*ยาว*/ ctx[2] + "";
    	let t3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input0 = element("input");
    			t0 = space();
    			div0 = element("div");
    			input1 = element("input");
    			t1 = space();
    			div1 = element("div");
    			h2 = element("h2");
    			t2 = text("ได้ค่า ");
    			t3 = text(t3_value);
    			attr_dev(input0, "placeholder", "ป้อนค่าความกว่าง");
    			add_location(input0, file$2, 16, 4, 342);
    			attr_dev(input1, "placeholder", "ป้อนค่าความยาว");
    			add_location(input1, file$2, 18, 4, 419);
    			add_location(div0, file$2, 17, 4, 408);
    			add_location(h2, file$2, 21, 8, 509);
    			add_location(div1, file$2, 20, 4, 494);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input0, anchor);
    			set_input_value(input0, /*กว้าง*/ ctx[1]);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, input1);
    			set_input_value(input1, /*ยาว*/ ctx[2]);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t2);
    			append_dev(h2, t3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*กว้าง*/ 2 && input0.value !== /*กว้าง*/ ctx[1]) {
    				set_input_value(input0, /*กว้าง*/ ctx[1]);
    			}

    			if (dirty & /*ยาว*/ 4 && input1.value !== /*ยาว*/ ctx[2]) {
    				set_input_value(input1, /*ยาว*/ ctx[2]);
    			}

    			if (dirty & /*กว้าง, ยาว*/ 6 && t3_value !== (t3_value = /*กว้าง*/ ctx[1] * /*ยาว*/ ctx[2] + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(16:4) {#if active_tab==0}",
    		ctx
    	});

    	return block;
    }

    // (25:4) {#if active_tab==1}
    function create_if_block$2(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "สูตร : กว้าง x ยาว";
    			add_location(h2, file$2, 25, 5, 592);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(25:4) {#if active_tab==1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let tabs;
    	let updating_active;
    	let t2;
    	let t3;
    	let if_block1_anchor;
    	let current;

    	function tabs_active_binding(value) {
    		/*tabs_active_binding*/ ctx[3](value);
    	}

    	let tabs_props = {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	if (/*active_tab*/ ctx[0] !== void 0) {
    		tabs_props.active = /*active_tab*/ ctx[0];
    	}

    	tabs = new Tabs({ props: tabs_props, $$inline: true });
    	binding_callbacks.push(() => bind(tabs, 'active', tabs_active_binding));
    	let if_block0 = /*active_tab*/ ctx[0] == 0 && create_if_block_1$2(ctx);
    	let if_block1 = /*active_tab*/ ctx[0] == 1 && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "พิ้นที่สี่เหลี่ยม";
    			t1 = space();
    			create_component(tabs.$$.fragment);
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			add_location(h2, file$2, 7, 8, 148);
    			add_location(div, file$2, 6, 4, 133);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			insert_dev(target, t1, anchor);
    			mount_component(tabs, target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabs_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				tabs_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_active && dirty & /*active_tab*/ 1) {
    				updating_active = true;
    				tabs_changes.active = /*active_tab*/ ctx[0];
    				add_flush_callback(() => updating_active = false);
    			}

    			tabs.$set(tabs_changes);

    			if (/*active_tab*/ ctx[0] == 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					if_block0.m(t3.parentNode, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*active_tab*/ ctx[0] == 1) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			destroy_component(tabs, detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Rectangle', slots, []);
    	let active_tab = 0;
    	let กว้าง = "";
    	let ยาว = "";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Rectangle> was created with unknown prop '${key}'`);
    	});

    	function tabs_active_binding(value) {
    		active_tab = value;
    		$$invalidate(0, active_tab);
    	}

    	function input0_input_handler() {
    		กว้าง = this.value;
    		$$invalidate(1, กว้าง);
    	}

    	function input1_input_handler() {
    		ยาว = this.value;
    		$$invalidate(2, ยาว);
    	}

    	$$self.$capture_state = () => ({ Tabs, Tab, active_tab, กว้าง, ยาว });

    	$$self.$inject_state = $$props => {
    		if ('active_tab' in $$props) $$invalidate(0, active_tab = $$props.active_tab);
    		if ('กว้าง' in $$props) $$invalidate(1, กว้าง = $$props.กว้าง);
    		if ('ยาว' in $$props) $$invalidate(2, ยาว = $$props.ยาว);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		active_tab,
    		กว้าง,
    		ยาว,
    		tabs_active_binding,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class Rectangle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Rectangle",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\Triangle.svelte generated by Svelte v3.42.5 */
    const file$1 = "src\\Triangle.svelte";

    // (13:7) <Tab>
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("คำนวณ");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(13:7) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (14:7) <Tab>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("สูตร");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(14:7) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (12:2) <Tabs bind:active={active_tab}>
    function create_default_slot(ctx) {
    	let tab0;
    	let t;
    	let tab1;
    	let current;

    	tab0 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab1 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tab0.$$.fragment);
    			t = space();
    			create_component(tab1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tab0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(tab1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tab0_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				tab0_changes.$$scope = { dirty, ctx };
    			}

    			tab0.$set(tab0_changes);
    			const tab1_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				tab1_changes.$$scope = { dirty, ctx };
    			}

    			tab1.$set(tab1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab0.$$.fragment, local);
    			transition_in(tab1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab0.$$.fragment, local);
    			transition_out(tab1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tab0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(tab1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(12:2) <Tabs bind:active={active_tab}>",
    		ctx
    	});

    	return block;
    }

    // (16:2) {#if active_tab==0}
    function create_if_block_1$1(ctx) {
    	let input0;
    	let t0;
    	let div0;
    	let input1;
    	let t1;
    	let div1;
    	let h2;
    	let t2;
    	let t3_value = 1 / 2 * /*ฐาณ*/ ctx[1] * /*สูง*/ ctx[2] + "";
    	let t3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input0 = element("input");
    			t0 = space();
    			div0 = element("div");
    			input1 = element("input");
    			t1 = space();
    			div1 = element("div");
    			h2 = element("h2");
    			t2 = text("ได้ค่า ");
    			t3 = text(t3_value);
    			attr_dev(input0, "placeholder", "ป้อนค่าความยาวฐาณ");
    			add_location(input0, file$1, 16, 2, 304);
    			attr_dev(input1, "placeholder", "ป้อนค่าความสูง");
    			add_location(input1, file$1, 18, 2, 376);
    			add_location(div0, file$1, 17, 2, 367);
    			add_location(h2, file$1, 21, 6, 459);
    			add_location(div1, file$1, 20, 2, 446);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input0, anchor);
    			set_input_value(input0, /*ฐาณ*/ ctx[1]);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, input1);
    			set_input_value(input1, /*สูง*/ ctx[2]);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t2);
    			append_dev(h2, t3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ฐาณ*/ 2 && input0.value !== /*ฐาณ*/ ctx[1]) {
    				set_input_value(input0, /*ฐาณ*/ ctx[1]);
    			}

    			if (dirty & /*สูง*/ 4 && input1.value !== /*สูง*/ ctx[2]) {
    				set_input_value(input1, /*สูง*/ ctx[2]);
    			}

    			if (dirty & /*ฐาณ, สูง*/ 6 && t3_value !== (t3_value = 1 / 2 * /*ฐาณ*/ ctx[1] * /*สูง*/ ctx[2] + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(16:2) {#if active_tab==0}",
    		ctx
    	});

    	return block;
    }

    // (26:2) {#if active_tab==1}
    function create_if_block$1(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "สูตร : ½ x ฐาณ x สูง";
    			add_location(h2, file$1, 26, 3, 538);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(26:2) {#if active_tab==1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let tabs;
    	let updating_active;
    	let t2;
    	let t3;
    	let if_block1_anchor;
    	let current;

    	function tabs_active_binding(value) {
    		/*tabs_active_binding*/ ctx[3](value);
    	}

    	let tabs_props = {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	if (/*active_tab*/ ctx[0] !== void 0) {
    		tabs_props.active = /*active_tab*/ ctx[0];
    	}

    	tabs = new Tabs({ props: tabs_props, $$inline: true });
    	binding_callbacks.push(() => bind(tabs, 'active', tabs_active_binding));
    	let if_block0 = /*active_tab*/ ctx[0] == 0 && create_if_block_1$1(ctx);
    	let if_block1 = /*active_tab*/ ctx[0] == 1 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "พื้นที่สามเหลี่ยม";
    			t1 = space();
    			create_component(tabs.$$.fragment);
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			add_location(h2, file$1, 7, 5, 129);
    			add_location(div, file$1, 6, 1, 117);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			insert_dev(target, t1, anchor);
    			mount_component(tabs, target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabs_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				tabs_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_active && dirty & /*active_tab*/ 1) {
    				updating_active = true;
    				tabs_changes.active = /*active_tab*/ ctx[0];
    				add_flush_callback(() => updating_active = false);
    			}

    			tabs.$set(tabs_changes);

    			if (/*active_tab*/ ctx[0] == 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(t3.parentNode, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*active_tab*/ ctx[0] == 1) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			destroy_component(tabs, detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Triangle', slots, []);
    	let active_tab = 0;
    	let ฐาณ = "";
    	let สูง = "";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Triangle> was created with unknown prop '${key}'`);
    	});

    	function tabs_active_binding(value) {
    		active_tab = value;
    		$$invalidate(0, active_tab);
    	}

    	function input0_input_handler() {
    		ฐาณ = this.value;
    		$$invalidate(1, ฐาณ);
    	}

    	function input1_input_handler() {
    		สูง = this.value;
    		$$invalidate(2, สูง);
    	}

    	$$self.$capture_state = () => ({ Tabs, Tab, active_tab, ฐาณ, สูง });

    	$$self.$inject_state = $$props => {
    		if ('active_tab' in $$props) $$invalidate(0, active_tab = $$props.active_tab);
    		if ('ฐาณ' in $$props) $$invalidate(1, ฐาณ = $$props.ฐาณ);
    		if ('สูง' in $$props) $$invalidate(2, สูง = $$props.สูง);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		active_tab,
    		ฐาณ,
    		สูง,
    		tabs_active_binding,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class Triangle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Triangle",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.42.5 */
    const file = "src\\App.svelte";

    // (16:0) {#if object=="2"}
    function create_if_block_2(ctx) {
    	let circle;
    	let current;
    	circle = new Circle({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(circle.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(circle, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(circle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(circle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(circle, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(16:0) {#if object==\\\"2\\\"}",
    		ctx
    	});

    	return block;
    }

    // (19:0) {#if object=="3"}
    function create_if_block_1(ctx) {
    	let rectangle;
    	let current;
    	rectangle = new Rectangle({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(rectangle.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(rectangle, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(rectangle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(rectangle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(rectangle, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(19:0) {#if object==\\\"3\\\"}",
    		ctx
    	});

    	return block;
    }

    // (22:0) {#if object=="4"}
    function create_if_block(ctx) {
    	let triangle;
    	let current;
    	triangle = new Triangle({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(triangle.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(triangle, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(triangle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(triangle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(triangle, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(22:0) {#if object==\\\"4\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let h1;
    	let t1;
    	let h3;
    	let t3;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let t7;
    	let t8;
    	let t9;
    	let if_block2_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*object*/ ctx[0] == "2" && create_if_block_2(ctx);
    	let if_block1 = /*object*/ ctx[0] == "3" && create_if_block_1(ctx);
    	let if_block2 = /*object*/ ctx[0] == "4" && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "สูตรหาพื้นที่";
    			t1 = space();
    			h3 = element("h3");
    			h3.textContent = "ใส่ค่าพื้นที่ที่ต้องการหา";
    			t3 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "วงกลม";
    			option1 = element("option");
    			option1.textContent = "สี่เหลียมผืนผ้า";
    			option2 = element("option");
    			option2.textContent = "สามเหลี่ยม";
    			t7 = space();
    			if (if_block0) if_block0.c();
    			t8 = space();
    			if (if_block1) if_block1.c();
    			t9 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			add_location(h1, file, 8, 0, 185);
    			add_location(h3, file, 9, 0, 209);
    			option0.__value = "2";
    			option0.value = option0.__value;
    			add_location(option0, file, 11, 1, 276);
    			option1.__value = "3";
    			option1.value = option1.__value;
    			add_location(option1, file, 12, 2, 312);
    			option2.__value = "4";
    			option2.value = option2.__value;
    			add_location(option2, file, 13, 2, 358);
    			if (/*object*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[1].call(select));
    			add_location(select, file, 10, 0, 245);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, select, anchor);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			select_option(select, /*object*/ ctx[0]);
    			insert_dev(target, t7, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t9, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*object*/ 1) {
    				select_option(select, /*object*/ ctx[0]);
    			}

    			if (/*object*/ ctx[0] == "2") {
    				if (if_block0) {
    					if (dirty & /*object*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t8.parentNode, t8);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*object*/ ctx[0] == "3") {
    				if (if_block1) {
    					if (dirty & /*object*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t9.parentNode, t9);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*object*/ ctx[0] == "4") {
    				if (if_block2) {
    					if (dirty & /*object*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(select);
    			if (detaching) detach_dev(t7);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t9);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let object = 1;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		object = select_value(this);
    		$$invalidate(0, object);
    	}

    	$$self.$capture_state = () => ({ Circle, Rectangle, Triangle, object });

    	$$self.$inject_state = $$props => {
    		if ('object' in $$props) $$invalidate(0, object = $$props.object);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [object, select_change_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
