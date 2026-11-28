var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target2, value) => __defProp(target2, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target2) => (target2 = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target2, "default", { value: mod, enumerable: true }) : target2,
  mod
));

// node_modules/ajv/dist/compile/codegen/code.js
var require_code = __commonJS({
  "node_modules/ajv/dist/compile/codegen/code.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.regexpCode = exports.getEsmExportName = exports.getProperty = exports.safeStringify = exports.stringify = exports.strConcat = exports.addCodeArg = exports.str = exports._ = exports.nil = exports._Code = exports.Name = exports.IDENTIFIER = exports._CodeOrName = void 0;
    var _CodeOrName = class {
      static {
        __name(this, "_CodeOrName");
      }
    };
    exports._CodeOrName = _CodeOrName;
    exports.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    var Name = class extends _CodeOrName {
      static {
        __name(this, "Name");
      }
      constructor(s) {
        super();
        if (!exports.IDENTIFIER.test(s))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = s;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return false;
      }
      get names() {
        return { [this.str]: 1 };
      }
    };
    exports.Name = Name;
    var _Code = class extends _CodeOrName {
      static {
        __name(this, "_Code");
      }
      constructor(code) {
        super();
        this._items = typeof code === "string" ? [code] : code;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return false;
        const item = this._items[0];
        return item === "" || item === '""';
      }
      get str() {
        var _a;
        return (_a = this._str) !== null && _a !== void 0 ? _a : this._str = this._items.reduce((s, c) => `${s}${c}`, "");
      }
      get names() {
        var _a;
        return (_a = this._names) !== null && _a !== void 0 ? _a : this._names = this._items.reduce((names, c) => {
          if (c instanceof Name)
            names[c.str] = (names[c.str] || 0) + 1;
          return names;
        }, {});
      }
    };
    exports._Code = _Code;
    exports.nil = new _Code("");
    function _(strs, ...args) {
      const code = [strs[0]];
      let i = 0;
      while (i < args.length) {
        addCodeArg(code, args[i]);
        code.push(strs[++i]);
      }
      return new _Code(code);
    }
    __name(_, "_");
    exports._ = _;
    var plus = new _Code("+");
    function str(strs, ...args) {
      const expr = [safeStringify(strs[0])];
      let i = 0;
      while (i < args.length) {
        expr.push(plus);
        addCodeArg(expr, args[i]);
        expr.push(plus, safeStringify(strs[++i]));
      }
      optimize(expr);
      return new _Code(expr);
    }
    __name(str, "str");
    exports.str = str;
    function addCodeArg(code, arg) {
      if (arg instanceof _Code)
        code.push(...arg._items);
      else if (arg instanceof Name)
        code.push(arg);
      else
        code.push(interpolate(arg));
    }
    __name(addCodeArg, "addCodeArg");
    exports.addCodeArg = addCodeArg;
    function optimize(expr) {
      let i = 1;
      while (i < expr.length - 1) {
        if (expr[i] === plus) {
          const res = mergeExprItems(expr[i - 1], expr[i + 1]);
          if (res !== void 0) {
            expr.splice(i - 1, 3, res);
            continue;
          }
          expr[i++] = "+";
        }
        i++;
      }
    }
    __name(optimize, "optimize");
    function mergeExprItems(a, b) {
      if (b === '""')
        return a;
      if (a === '""')
        return b;
      if (typeof a == "string") {
        if (b instanceof Name || a[a.length - 1] !== '"')
          return;
        if (typeof b != "string")
          return `${a.slice(0, -1)}${b}"`;
        if (b[0] === '"')
          return a.slice(0, -1) + b.slice(1);
        return;
      }
      if (typeof b == "string" && b[0] === '"' && !(a instanceof Name))
        return `"${a}${b.slice(1)}`;
      return;
    }
    __name(mergeExprItems, "mergeExprItems");
    function strConcat(c1, c2) {
      return c2.emptyStr() ? c1 : c1.emptyStr() ? c2 : str`${c1}${c2}`;
    }
    __name(strConcat, "strConcat");
    exports.strConcat = strConcat;
    function interpolate(x) {
      return typeof x == "number" || typeof x == "boolean" || x === null ? x : safeStringify(Array.isArray(x) ? x.join(",") : x);
    }
    __name(interpolate, "interpolate");
    function stringify(x) {
      return new _Code(safeStringify(x));
    }
    __name(stringify, "stringify");
    exports.stringify = stringify;
    function safeStringify(x) {
      return JSON.stringify(x).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    __name(safeStringify, "safeStringify");
    exports.safeStringify = safeStringify;
    function getProperty(key) {
      return typeof key == "string" && exports.IDENTIFIER.test(key) ? new _Code(`.${key}`) : _`[${key}]`;
    }
    __name(getProperty, "getProperty");
    exports.getProperty = getProperty;
    function getEsmExportName(key) {
      if (typeof key == "string" && exports.IDENTIFIER.test(key)) {
        return new _Code(`${key}`);
      }
      throw new Error(`CodeGen: invalid export name: ${key}, use explicit $id name mapping`);
    }
    __name(getEsmExportName, "getEsmExportName");
    exports.getEsmExportName = getEsmExportName;
    function regexpCode(rx) {
      return new _Code(rx.toString());
    }
    __name(regexpCode, "regexpCode");
    exports.regexpCode = regexpCode;
  }
});

// node_modules/ajv/dist/compile/codegen/scope.js
var require_scope = __commonJS({
  "node_modules/ajv/dist/compile/codegen/scope.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ValueScope = exports.ValueScopeName = exports.Scope = exports.varKinds = exports.UsedValueState = void 0;
    var code_1 = require_code();
    var ValueError = class extends Error {
      static {
        __name(this, "ValueError");
      }
      constructor(name) {
        super(`CodeGen: "code" for ${name} not defined`);
        this.value = name.value;
      }
    };
    var UsedValueState;
    (function(UsedValueState2) {
      UsedValueState2[UsedValueState2["Started"] = 0] = "Started";
      UsedValueState2[UsedValueState2["Completed"] = 1] = "Completed";
    })(UsedValueState || (exports.UsedValueState = UsedValueState = {}));
    exports.varKinds = {
      const: new code_1.Name("const"),
      let: new code_1.Name("let"),
      var: new code_1.Name("var")
    };
    var Scope = class {
      static {
        __name(this, "Scope");
      }
      constructor({ prefixes, parent } = {}) {
        this._names = {};
        this._prefixes = prefixes;
        this._parent = parent;
      }
      toName(nameOrPrefix) {
        return nameOrPrefix instanceof code_1.Name ? nameOrPrefix : this.name(nameOrPrefix);
      }
      name(prefix) {
        return new code_1.Name(this._newName(prefix));
      }
      _newName(prefix) {
        const ng = this._names[prefix] || this._nameGroup(prefix);
        return `${prefix}${ng.index++}`;
      }
      _nameGroup(prefix) {
        var _a, _b;
        if (((_b = (_a = this._parent) === null || _a === void 0 ? void 0 : _a._prefixes) === null || _b === void 0 ? void 0 : _b.has(prefix)) || this._prefixes && !this._prefixes.has(prefix)) {
          throw new Error(`CodeGen: prefix "${prefix}" is not allowed in this scope`);
        }
        return this._names[prefix] = { prefix, index: 0 };
      }
    };
    exports.Scope = Scope;
    var ValueScopeName = class extends code_1.Name {
      static {
        __name(this, "ValueScopeName");
      }
      constructor(prefix, nameStr) {
        super(nameStr);
        this.prefix = prefix;
      }
      setValue(value, { property, itemIndex }) {
        this.value = value;
        this.scopePath = (0, code_1._)`.${new code_1.Name(property)}[${itemIndex}]`;
      }
    };
    exports.ValueScopeName = ValueScopeName;
    var line = (0, code_1._)`\n`;
    var ValueScope = class extends Scope {
      static {
        __name(this, "ValueScope");
      }
      constructor(opts) {
        super(opts);
        this._values = {};
        this._scope = opts.scope;
        this.opts = { ...opts, _n: opts.lines ? line : code_1.nil };
      }
      get() {
        return this._scope;
      }
      name(prefix) {
        return new ValueScopeName(prefix, this._newName(prefix));
      }
      value(nameOrPrefix, value) {
        var _a;
        if (value.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const name = this.toName(nameOrPrefix);
        const { prefix } = name;
        const valueKey = (_a = value.key) !== null && _a !== void 0 ? _a : value.ref;
        let vs = this._values[prefix];
        if (vs) {
          const _name = vs.get(valueKey);
          if (_name)
            return _name;
        } else {
          vs = this._values[prefix] = /* @__PURE__ */ new Map();
        }
        vs.set(valueKey, name);
        const s = this._scope[prefix] || (this._scope[prefix] = []);
        const itemIndex = s.length;
        s[itemIndex] = value.ref;
        name.setValue(value, { property: prefix, itemIndex });
        return name;
      }
      getValue(prefix, keyOrRef) {
        const vs = this._values[prefix];
        if (!vs)
          return;
        return vs.get(keyOrRef);
      }
      scopeRefs(scopeName, values = this._values) {
        return this._reduceValues(values, (name) => {
          if (name.scopePath === void 0)
            throw new Error(`CodeGen: name "${name}" has no value`);
          return (0, code_1._)`${scopeName}${name.scopePath}`;
        });
      }
      scopeCode(values = this._values, usedValues, getCode) {
        return this._reduceValues(values, (name) => {
          if (name.value === void 0)
            throw new Error(`CodeGen: name "${name}" has no value`);
          return name.value.code;
        }, usedValues, getCode);
      }
      _reduceValues(values, valueCode, usedValues = {}, getCode) {
        let code = code_1.nil;
        for (const prefix in values) {
          const vs = values[prefix];
          if (!vs)
            continue;
          const nameSet = usedValues[prefix] = usedValues[prefix] || /* @__PURE__ */ new Map();
          vs.forEach((name) => {
            if (nameSet.has(name))
              return;
            nameSet.set(name, UsedValueState.Started);
            let c = valueCode(name);
            if (c) {
              const def = this.opts.es5 ? exports.varKinds.var : exports.varKinds.const;
              code = (0, code_1._)`${code}${def} ${name} = ${c};${this.opts._n}`;
            } else if (c = getCode === null || getCode === void 0 ? void 0 : getCode(name)) {
              code = (0, code_1._)`${code}${c}${this.opts._n}`;
            } else {
              throw new ValueError(name);
            }
            nameSet.set(name, UsedValueState.Completed);
          });
        }
        return code;
      }
    };
    exports.ValueScope = ValueScope;
  }
});

// node_modules/ajv/dist/compile/codegen/index.js
var require_codegen = __commonJS({
  "node_modules/ajv/dist/compile/codegen/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.or = exports.and = exports.not = exports.CodeGen = exports.operators = exports.varKinds = exports.ValueScopeName = exports.ValueScope = exports.Scope = exports.Name = exports.regexpCode = exports.stringify = exports.getProperty = exports.nil = exports.strConcat = exports.str = exports._ = void 0;
    var code_1 = require_code();
    var scope_1 = require_scope();
    var code_2 = require_code();
    Object.defineProperty(exports, "_", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return code_2._;
    }, "get") });
    Object.defineProperty(exports, "str", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return code_2.str;
    }, "get") });
    Object.defineProperty(exports, "strConcat", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return code_2.strConcat;
    }, "get") });
    Object.defineProperty(exports, "nil", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return code_2.nil;
    }, "get") });
    Object.defineProperty(exports, "getProperty", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return code_2.getProperty;
    }, "get") });
    Object.defineProperty(exports, "stringify", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return code_2.stringify;
    }, "get") });
    Object.defineProperty(exports, "regexpCode", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return code_2.regexpCode;
    }, "get") });
    Object.defineProperty(exports, "Name", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return code_2.Name;
    }, "get") });
    var scope_2 = require_scope();
    Object.defineProperty(exports, "Scope", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return scope_2.Scope;
    }, "get") });
    Object.defineProperty(exports, "ValueScope", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return scope_2.ValueScope;
    }, "get") });
    Object.defineProperty(exports, "ValueScopeName", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return scope_2.ValueScopeName;
    }, "get") });
    Object.defineProperty(exports, "varKinds", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return scope_2.varKinds;
    }, "get") });
    exports.operators = {
      GT: new code_1._Code(">"),
      GTE: new code_1._Code(">="),
      LT: new code_1._Code("<"),
      LTE: new code_1._Code("<="),
      EQ: new code_1._Code("==="),
      NEQ: new code_1._Code("!=="),
      NOT: new code_1._Code("!"),
      OR: new code_1._Code("||"),
      AND: new code_1._Code("&&"),
      ADD: new code_1._Code("+")
    };
    var Node = class {
      static {
        __name(this, "Node");
      }
      optimizeNodes() {
        return this;
      }
      optimizeNames(_names, _constants) {
        return this;
      }
    };
    var Def = class extends Node {
      static {
        __name(this, "Def");
      }
      constructor(varKind, name, rhs) {
        super();
        this.varKind = varKind;
        this.name = name;
        this.rhs = rhs;
      }
      render({ es5, _n }) {
        const varKind = es5 ? scope_1.varKinds.var : this.varKind;
        const rhs = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${varKind} ${this.name}${rhs};` + _n;
      }
      optimizeNames(names, constants) {
        if (!names[this.name.str])
          return;
        if (this.rhs)
          this.rhs = optimizeExpr(this.rhs, names, constants);
        return this;
      }
      get names() {
        return this.rhs instanceof code_1._CodeOrName ? this.rhs.names : {};
      }
    };
    var Assign = class extends Node {
      static {
        __name(this, "Assign");
      }
      constructor(lhs, rhs, sideEffects) {
        super();
        this.lhs = lhs;
        this.rhs = rhs;
        this.sideEffects = sideEffects;
      }
      render({ _n }) {
        return `${this.lhs} = ${this.rhs};` + _n;
      }
      optimizeNames(names, constants) {
        if (this.lhs instanceof code_1.Name && !names[this.lhs.str] && !this.sideEffects)
          return;
        this.rhs = optimizeExpr(this.rhs, names, constants);
        return this;
      }
      get names() {
        const names = this.lhs instanceof code_1.Name ? {} : { ...this.lhs.names };
        return addExprNames(names, this.rhs);
      }
    };
    var AssignOp = class extends Assign {
      static {
        __name(this, "AssignOp");
      }
      constructor(lhs, op, rhs, sideEffects) {
        super(lhs, rhs, sideEffects);
        this.op = op;
      }
      render({ _n }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + _n;
      }
    };
    var Label = class extends Node {
      static {
        __name(this, "Label");
      }
      constructor(label) {
        super();
        this.label = label;
        this.names = {};
      }
      render({ _n }) {
        return `${this.label}:` + _n;
      }
    };
    var Break = class extends Node {
      static {
        __name(this, "Break");
      }
      constructor(label) {
        super();
        this.label = label;
        this.names = {};
      }
      render({ _n }) {
        const label = this.label ? ` ${this.label}` : "";
        return `break${label};` + _n;
      }
    };
    var Throw = class extends Node {
      static {
        __name(this, "Throw");
      }
      constructor(error2) {
        super();
        this.error = error2;
      }
      render({ _n }) {
        return `throw ${this.error};` + _n;
      }
      get names() {
        return this.error.names;
      }
    };
    var AnyCode = class extends Node {
      static {
        __name(this, "AnyCode");
      }
      constructor(code) {
        super();
        this.code = code;
      }
      render({ _n }) {
        return `${this.code};` + _n;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(names, constants) {
        this.code = optimizeExpr(this.code, names, constants);
        return this;
      }
      get names() {
        return this.code instanceof code_1._CodeOrName ? this.code.names : {};
      }
    };
    var ParentNode = class extends Node {
      static {
        __name(this, "ParentNode");
      }
      constructor(nodes = []) {
        super();
        this.nodes = nodes;
      }
      render(opts) {
        return this.nodes.reduce((code, n) => code + n.render(opts), "");
      }
      optimizeNodes() {
        const { nodes } = this;
        let i = nodes.length;
        while (i--) {
          const n = nodes[i].optimizeNodes();
          if (Array.isArray(n))
            nodes.splice(i, 1, ...n);
          else if (n)
            nodes[i] = n;
          else
            nodes.splice(i, 1);
        }
        return nodes.length > 0 ? this : void 0;
      }
      optimizeNames(names, constants) {
        const { nodes } = this;
        let i = nodes.length;
        while (i--) {
          const n = nodes[i];
          if (n.optimizeNames(names, constants))
            continue;
          subtractNames(names, n.names);
          nodes.splice(i, 1);
        }
        return nodes.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((names, n) => addNames(names, n.names), {});
      }
    };
    var BlockNode = class extends ParentNode {
      static {
        __name(this, "BlockNode");
      }
      render(opts) {
        return "{" + opts._n + super.render(opts) + "}" + opts._n;
      }
    };
    var Root = class extends ParentNode {
      static {
        __name(this, "Root");
      }
    };
    var Else = class extends BlockNode {
      static {
        __name(this, "Else");
      }
    };
    Else.kind = "else";
    var If = class _If extends BlockNode {
      static {
        __name(this, "If");
      }
      constructor(condition, nodes) {
        super(nodes);
        this.condition = condition;
      }
      render(opts) {
        let code = `if(${this.condition})` + super.render(opts);
        if (this.else)
          code += "else " + this.else.render(opts);
        return code;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const cond = this.condition;
        if (cond === true)
          return this.nodes;
        let e = this.else;
        if (e) {
          const ns = e.optimizeNodes();
          e = this.else = Array.isArray(ns) ? new Else(ns) : ns;
        }
        if (e) {
          if (cond === false)
            return e instanceof _If ? e : e.nodes;
          if (this.nodes.length)
            return this;
          return new _If(not(cond), e instanceof _If ? [e] : e.nodes);
        }
        if (cond === false || !this.nodes.length)
          return void 0;
        return this;
      }
      optimizeNames(names, constants) {
        var _a;
        this.else = (_a = this.else) === null || _a === void 0 ? void 0 : _a.optimizeNames(names, constants);
        if (!(super.optimizeNames(names, constants) || this.else))
          return;
        this.condition = optimizeExpr(this.condition, names, constants);
        return this;
      }
      get names() {
        const names = super.names;
        addExprNames(names, this.condition);
        if (this.else)
          addNames(names, this.else.names);
        return names;
      }
    };
    If.kind = "if";
    var For = class extends BlockNode {
      static {
        __name(this, "For");
      }
    };
    For.kind = "for";
    var ForLoop = class extends For {
      static {
        __name(this, "ForLoop");
      }
      constructor(iteration) {
        super();
        this.iteration = iteration;
      }
      render(opts) {
        return `for(${this.iteration})` + super.render(opts);
      }
      optimizeNames(names, constants) {
        if (!super.optimizeNames(names, constants))
          return;
        this.iteration = optimizeExpr(this.iteration, names, constants);
        return this;
      }
      get names() {
        return addNames(super.names, this.iteration.names);
      }
    };
    var ForRange = class extends For {
      static {
        __name(this, "ForRange");
      }
      constructor(varKind, name, from, to) {
        super();
        this.varKind = varKind;
        this.name = name;
        this.from = from;
        this.to = to;
      }
      render(opts) {
        const varKind = opts.es5 ? scope_1.varKinds.var : this.varKind;
        const { name, from, to } = this;
        return `for(${varKind} ${name}=${from}; ${name}<${to}; ${name}++)` + super.render(opts);
      }
      get names() {
        const names = addExprNames(super.names, this.from);
        return addExprNames(names, this.to);
      }
    };
    var ForIter = class extends For {
      static {
        __name(this, "ForIter");
      }
      constructor(loop, varKind, name, iterable) {
        super();
        this.loop = loop;
        this.varKind = varKind;
        this.name = name;
        this.iterable = iterable;
      }
      render(opts) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(opts);
      }
      optimizeNames(names, constants) {
        if (!super.optimizeNames(names, constants))
          return;
        this.iterable = optimizeExpr(this.iterable, names, constants);
        return this;
      }
      get names() {
        return addNames(super.names, this.iterable.names);
      }
    };
    var Func = class extends BlockNode {
      static {
        __name(this, "Func");
      }
      constructor(name, args, async) {
        super();
        this.name = name;
        this.args = args;
        this.async = async;
      }
      render(opts) {
        const _async = this.async ? "async " : "";
        return `${_async}function ${this.name}(${this.args})` + super.render(opts);
      }
    };
    Func.kind = "func";
    var Return = class extends ParentNode {
      static {
        __name(this, "Return");
      }
      render(opts) {
        return "return " + super.render(opts);
      }
    };
    Return.kind = "return";
    var Try = class extends BlockNode {
      static {
        __name(this, "Try");
      }
      render(opts) {
        let code = "try" + super.render(opts);
        if (this.catch)
          code += this.catch.render(opts);
        if (this.finally)
          code += this.finally.render(opts);
        return code;
      }
      optimizeNodes() {
        var _a, _b;
        super.optimizeNodes();
        (_a = this.catch) === null || _a === void 0 ? void 0 : _a.optimizeNodes();
        (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNodes();
        return this;
      }
      optimizeNames(names, constants) {
        var _a, _b;
        super.optimizeNames(names, constants);
        (_a = this.catch) === null || _a === void 0 ? void 0 : _a.optimizeNames(names, constants);
        (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNames(names, constants);
        return this;
      }
      get names() {
        const names = super.names;
        if (this.catch)
          addNames(names, this.catch.names);
        if (this.finally)
          addNames(names, this.finally.names);
        return names;
      }
    };
    var Catch = class extends BlockNode {
      static {
        __name(this, "Catch");
      }
      constructor(error2) {
        super();
        this.error = error2;
      }
      render(opts) {
        return `catch(${this.error})` + super.render(opts);
      }
    };
    Catch.kind = "catch";
    var Finally = class extends BlockNode {
      static {
        __name(this, "Finally");
      }
      render(opts) {
        return "finally" + super.render(opts);
      }
    };
    Finally.kind = "finally";
    var CodeGen = class {
      static {
        __name(this, "CodeGen");
      }
      constructor(extScope, opts = {}) {
        this._values = {};
        this._blockStarts = [];
        this._constants = {};
        this.opts = { ...opts, _n: opts.lines ? "\n" : "" };
        this._extScope = extScope;
        this._scope = new scope_1.Scope({ parent: extScope });
        this._nodes = [new Root()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(prefix) {
        return this._scope.name(prefix);
      }
      // reserves unique name in the external scope
      scopeName(prefix) {
        return this._extScope.name(prefix);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(prefixOrName, value) {
        const name = this._extScope.value(prefixOrName, value);
        const vs = this._values[name.prefix] || (this._values[name.prefix] = /* @__PURE__ */ new Set());
        vs.add(name);
        return name;
      }
      getScopeValue(prefix, keyOrRef) {
        return this._extScope.getValue(prefix, keyOrRef);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(scopeName) {
        return this._extScope.scopeRefs(scopeName, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(varKind, nameOrPrefix, rhs, constant) {
        const name = this._scope.toName(nameOrPrefix);
        if (rhs !== void 0 && constant)
          this._constants[name.str] = rhs;
        this._leafNode(new Def(varKind, name, rhs));
        return name;
      }
      // `const` declaration (`var` in es5 mode)
      const(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.const, nameOrPrefix, rhs, _constant);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.let, nameOrPrefix, rhs, _constant);
      }
      // `var` declaration with optional assignment
      var(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.var, nameOrPrefix, rhs, _constant);
      }
      // assignment code
      assign(lhs, rhs, sideEffects) {
        return this._leafNode(new Assign(lhs, rhs, sideEffects));
      }
      // `+=` code
      add(lhs, rhs) {
        return this._leafNode(new AssignOp(lhs, exports.operators.ADD, rhs));
      }
      // appends passed SafeExpr to code or executes Block
      code(c) {
        if (typeof c == "function")
          c();
        else if (c !== code_1.nil)
          this._leafNode(new AnyCode(c));
        return this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...keyValues) {
        const code = ["{"];
        for (const [key, value] of keyValues) {
          if (code.length > 1)
            code.push(",");
          code.push(key);
          if (key !== value || this.opts.es5) {
            code.push(":");
            (0, code_1.addCodeArg)(code, value);
          }
        }
        code.push("}");
        return new code_1._Code(code);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(condition, thenBody, elseBody) {
        this._blockNode(new If(condition));
        if (thenBody && elseBody) {
          this.code(thenBody).else().code(elseBody).endIf();
        } else if (thenBody) {
          this.code(thenBody).endIf();
        } else if (elseBody) {
          throw new Error('CodeGen: "else" body without "then" body');
        }
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(condition) {
        return this._elseNode(new If(condition));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new Else());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(If, Else);
      }
      _for(node, forBody) {
        this._blockNode(node);
        if (forBody)
          this.code(forBody).endFor();
        return this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(iteration, forBody) {
        return this._for(new ForLoop(iteration), forBody);
      }
      // `for` statement for a range of values
      forRange(nameOrPrefix, from, to, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.let) {
        const name = this._scope.toName(nameOrPrefix);
        return this._for(new ForRange(varKind, name, from, to), () => forBody(name));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(nameOrPrefix, iterable, forBody, varKind = scope_1.varKinds.const) {
        const name = this._scope.toName(nameOrPrefix);
        if (this.opts.es5) {
          const arr = iterable instanceof code_1.Name ? iterable : this.var("_arr", iterable);
          return this.forRange("_i", 0, (0, code_1._)`${arr}.length`, (i) => {
            this.var(name, (0, code_1._)`${arr}[${i}]`);
            forBody(name);
          });
        }
        return this._for(new ForIter("of", varKind, name, iterable), () => forBody(name));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(nameOrPrefix, obj, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.const) {
        if (this.opts.ownProperties) {
          return this.forOf(nameOrPrefix, (0, code_1._)`Object.keys(${obj})`, forBody);
        }
        const name = this._scope.toName(nameOrPrefix);
        return this._for(new ForIter("in", varKind, name, obj), () => forBody(name));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(For);
      }
      // `label` statement
      label(label) {
        return this._leafNode(new Label(label));
      }
      // `break` statement
      break(label) {
        return this._leafNode(new Break(label));
      }
      // `return` statement
      return(value) {
        const node = new Return();
        this._blockNode(node);
        this.code(value);
        if (node.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(Return);
      }
      // `try` statement
      try(tryBody, catchCode, finallyCode) {
        if (!catchCode && !finallyCode)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const node = new Try();
        this._blockNode(node);
        this.code(tryBody);
        if (catchCode) {
          const error2 = this.name("e");
          this._currNode = node.catch = new Catch(error2);
          catchCode(error2);
        }
        if (finallyCode) {
          this._currNode = node.finally = new Finally();
          this.code(finallyCode);
        }
        return this._endBlockNode(Catch, Finally);
      }
      // `throw` statement
      throw(error2) {
        return this._leafNode(new Throw(error2));
      }
      // start self-balancing block
      block(body, nodeCount) {
        this._blockStarts.push(this._nodes.length);
        if (body)
          this.code(body).endBlock(nodeCount);
        return this;
      }
      // end the current self-balancing block
      endBlock(nodeCount) {
        const len = this._blockStarts.pop();
        if (len === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const toClose = this._nodes.length - len;
        if (toClose < 0 || nodeCount !== void 0 && toClose !== nodeCount) {
          throw new Error(`CodeGen: wrong number of nodes: ${toClose} vs ${nodeCount} expected`);
        }
        this._nodes.length = len;
        return this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(name, args = code_1.nil, async, funcBody) {
        this._blockNode(new Func(name, args, async));
        if (funcBody)
          this.code(funcBody).endFunc();
        return this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(Func);
      }
      optimize(n = 1) {
        while (n-- > 0) {
          this._root.optimizeNodes();
          this._root.optimizeNames(this._root.names, this._constants);
        }
      }
      _leafNode(node) {
        this._currNode.nodes.push(node);
        return this;
      }
      _blockNode(node) {
        this._currNode.nodes.push(node);
        this._nodes.push(node);
      }
      _endBlockNode(N1, N2) {
        const n = this._currNode;
        if (n instanceof N1 || N2 && n instanceof N2) {
          this._nodes.pop();
          return this;
        }
        throw new Error(`CodeGen: not in block "${N2 ? `${N1.kind}/${N2.kind}` : N1.kind}"`);
      }
      _elseNode(node) {
        const n = this._currNode;
        if (!(n instanceof If)) {
          throw new Error('CodeGen: "else" without "if"');
        }
        this._currNode = n.else = node;
        return this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const ns = this._nodes;
        return ns[ns.length - 1];
      }
      set _currNode(node) {
        const ns = this._nodes;
        ns[ns.length - 1] = node;
      }
    };
    exports.CodeGen = CodeGen;
    function addNames(names, from) {
      for (const n in from)
        names[n] = (names[n] || 0) + (from[n] || 0);
      return names;
    }
    __name(addNames, "addNames");
    function addExprNames(names, from) {
      return from instanceof code_1._CodeOrName ? addNames(names, from.names) : names;
    }
    __name(addExprNames, "addExprNames");
    function optimizeExpr(expr, names, constants) {
      if (expr instanceof code_1.Name)
        return replaceName(expr);
      if (!canOptimize(expr))
        return expr;
      return new code_1._Code(expr._items.reduce((items, c) => {
        if (c instanceof code_1.Name)
          c = replaceName(c);
        if (c instanceof code_1._Code)
          items.push(...c._items);
        else
          items.push(c);
        return items;
      }, []));
      function replaceName(n) {
        const c = constants[n.str];
        if (c === void 0 || names[n.str] !== 1)
          return n;
        delete names[n.str];
        return c;
      }
      __name(replaceName, "replaceName");
      function canOptimize(e) {
        return e instanceof code_1._Code && e._items.some((c) => c instanceof code_1.Name && names[c.str] === 1 && constants[c.str] !== void 0);
      }
      __name(canOptimize, "canOptimize");
    }
    __name(optimizeExpr, "optimizeExpr");
    function subtractNames(names, from) {
      for (const n in from)
        names[n] = (names[n] || 0) - (from[n] || 0);
    }
    __name(subtractNames, "subtractNames");
    function not(x) {
      return typeof x == "boolean" || typeof x == "number" || x === null ? !x : (0, code_1._)`!${par(x)}`;
    }
    __name(not, "not");
    exports.not = not;
    var andCode = mappend(exports.operators.AND);
    function and(...args) {
      return args.reduce(andCode);
    }
    __name(and, "and");
    exports.and = and;
    var orCode = mappend(exports.operators.OR);
    function or(...args) {
      return args.reduce(orCode);
    }
    __name(or, "or");
    exports.or = or;
    function mappend(op) {
      return (x, y) => x === code_1.nil ? y : y === code_1.nil ? x : (0, code_1._)`${par(x)} ${op} ${par(y)}`;
    }
    __name(mappend, "mappend");
    function par(x) {
      return x instanceof code_1.Name ? x : (0, code_1._)`(${x})`;
    }
    __name(par, "par");
  }
});

// node_modules/ajv/dist/compile/util.js
var require_util = __commonJS({
  "node_modules/ajv/dist/compile/util.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkStrictMode = exports.getErrorPath = exports.Type = exports.useFunc = exports.setEvaluated = exports.evaluatedPropsToName = exports.mergeEvaluated = exports.eachItem = exports.unescapeJsonPointer = exports.escapeJsonPointer = exports.escapeFragment = exports.unescapeFragment = exports.schemaRefOrVal = exports.schemaHasRulesButRef = exports.schemaHasRules = exports.checkUnknownRules = exports.alwaysValidSchema = exports.toHash = void 0;
    var codegen_1 = require_codegen();
    var code_1 = require_code();
    function toHash(arr) {
      const hash = {};
      for (const item of arr)
        hash[item] = true;
      return hash;
    }
    __name(toHash, "toHash");
    exports.toHash = toHash;
    function alwaysValidSchema(it, schema) {
      if (typeof schema == "boolean")
        return schema;
      if (Object.keys(schema).length === 0)
        return true;
      checkUnknownRules(it, schema);
      return !schemaHasRules(schema, it.self.RULES.all);
    }
    __name(alwaysValidSchema, "alwaysValidSchema");
    exports.alwaysValidSchema = alwaysValidSchema;
    function checkUnknownRules(it, schema = it.schema) {
      const { opts, self } = it;
      if (!opts.strictSchema)
        return;
      if (typeof schema === "boolean")
        return;
      const rules = self.RULES.keywords;
      for (const key in schema) {
        if (!rules[key])
          checkStrictMode(it, `unknown keyword: "${key}"`);
      }
    }
    __name(checkUnknownRules, "checkUnknownRules");
    exports.checkUnknownRules = checkUnknownRules;
    function schemaHasRules(schema, rules) {
      if (typeof schema == "boolean")
        return !schema;
      for (const key in schema)
        if (rules[key])
          return true;
      return false;
    }
    __name(schemaHasRules, "schemaHasRules");
    exports.schemaHasRules = schemaHasRules;
    function schemaHasRulesButRef(schema, RULES) {
      if (typeof schema == "boolean")
        return !schema;
      for (const key in schema)
        if (key !== "$ref" && RULES.all[key])
          return true;
      return false;
    }
    __name(schemaHasRulesButRef, "schemaHasRulesButRef");
    exports.schemaHasRulesButRef = schemaHasRulesButRef;
    function schemaRefOrVal({ topSchemaRef, schemaPath }, schema, keyword, $data) {
      if (!$data) {
        if (typeof schema == "number" || typeof schema == "boolean")
          return schema;
        if (typeof schema == "string")
          return (0, codegen_1._)`${schema}`;
      }
      return (0, codegen_1._)`${topSchemaRef}${schemaPath}${(0, codegen_1.getProperty)(keyword)}`;
    }
    __name(schemaRefOrVal, "schemaRefOrVal");
    exports.schemaRefOrVal = schemaRefOrVal;
    function unescapeFragment(str) {
      return unescapeJsonPointer(decodeURIComponent(str));
    }
    __name(unescapeFragment, "unescapeFragment");
    exports.unescapeFragment = unescapeFragment;
    function escapeFragment(str) {
      return encodeURIComponent(escapeJsonPointer(str));
    }
    __name(escapeFragment, "escapeFragment");
    exports.escapeFragment = escapeFragment;
    function escapeJsonPointer(str) {
      if (typeof str == "number")
        return `${str}`;
      return str.replace(/~/g, "~0").replace(/\//g, "~1");
    }
    __name(escapeJsonPointer, "escapeJsonPointer");
    exports.escapeJsonPointer = escapeJsonPointer;
    function unescapeJsonPointer(str) {
      return str.replace(/~1/g, "/").replace(/~0/g, "~");
    }
    __name(unescapeJsonPointer, "unescapeJsonPointer");
    exports.unescapeJsonPointer = unescapeJsonPointer;
    function eachItem(xs, f) {
      if (Array.isArray(xs)) {
        for (const x of xs)
          f(x);
      } else {
        f(xs);
      }
    }
    __name(eachItem, "eachItem");
    exports.eachItem = eachItem;
    function makeMergeEvaluated({ mergeNames, mergeToName, mergeValues, resultToName }) {
      return (gen, from, to, toName) => {
        const res = to === void 0 ? from : to instanceof codegen_1.Name ? (from instanceof codegen_1.Name ? mergeNames(gen, from, to) : mergeToName(gen, from, to), to) : from instanceof codegen_1.Name ? (mergeToName(gen, to, from), from) : mergeValues(from, to);
        return toName === codegen_1.Name && !(res instanceof codegen_1.Name) ? resultToName(gen, res) : res;
      };
    }
    __name(makeMergeEvaluated, "makeMergeEvaluated");
    exports.mergeEvaluated = {
      props: makeMergeEvaluated({
        mergeNames: /* @__PURE__ */ __name((gen, from, to) => gen.if((0, codegen_1._)`${to} !== true && ${from} !== undefined`, () => {
          gen.if((0, codegen_1._)`${from} === true`, () => gen.assign(to, true), () => gen.assign(to, (0, codegen_1._)`${to} || {}`).code((0, codegen_1._)`Object.assign(${to}, ${from})`));
        }), "mergeNames"),
        mergeToName: /* @__PURE__ */ __name((gen, from, to) => gen.if((0, codegen_1._)`${to} !== true`, () => {
          if (from === true) {
            gen.assign(to, true);
          } else {
            gen.assign(to, (0, codegen_1._)`${to} || {}`);
            setEvaluated(gen, to, from);
          }
        }), "mergeToName"),
        mergeValues: /* @__PURE__ */ __name((from, to) => from === true ? true : { ...from, ...to }, "mergeValues"),
        resultToName: evaluatedPropsToName
      }),
      items: makeMergeEvaluated({
        mergeNames: /* @__PURE__ */ __name((gen, from, to) => gen.if((0, codegen_1._)`${to} !== true && ${from} !== undefined`, () => gen.assign(to, (0, codegen_1._)`${from} === true ? true : ${to} > ${from} ? ${to} : ${from}`)), "mergeNames"),
        mergeToName: /* @__PURE__ */ __name((gen, from, to) => gen.if((0, codegen_1._)`${to} !== true`, () => gen.assign(to, from === true ? true : (0, codegen_1._)`${to} > ${from} ? ${to} : ${from}`)), "mergeToName"),
        mergeValues: /* @__PURE__ */ __name((from, to) => from === true ? true : Math.max(from, to), "mergeValues"),
        resultToName: /* @__PURE__ */ __name((gen, items) => gen.var("items", items), "resultToName")
      })
    };
    function evaluatedPropsToName(gen, ps) {
      if (ps === true)
        return gen.var("props", true);
      const props = gen.var("props", (0, codegen_1._)`{}`);
      if (ps !== void 0)
        setEvaluated(gen, props, ps);
      return props;
    }
    __name(evaluatedPropsToName, "evaluatedPropsToName");
    exports.evaluatedPropsToName = evaluatedPropsToName;
    function setEvaluated(gen, props, ps) {
      Object.keys(ps).forEach((p) => gen.assign((0, codegen_1._)`${props}${(0, codegen_1.getProperty)(p)}`, true));
    }
    __name(setEvaluated, "setEvaluated");
    exports.setEvaluated = setEvaluated;
    var snippets = {};
    function useFunc(gen, f) {
      return gen.scopeValue("func", {
        ref: f,
        code: snippets[f.code] || (snippets[f.code] = new code_1._Code(f.code))
      });
    }
    __name(useFunc, "useFunc");
    exports.useFunc = useFunc;
    var Type;
    (function(Type2) {
      Type2[Type2["Num"] = 0] = "Num";
      Type2[Type2["Str"] = 1] = "Str";
    })(Type || (exports.Type = Type = {}));
    function getErrorPath(dataProp, dataPropType, jsPropertySyntax) {
      if (dataProp instanceof codegen_1.Name) {
        const isNumber = dataPropType === Type.Num;
        return jsPropertySyntax ? isNumber ? (0, codegen_1._)`"[" + ${dataProp} + "]"` : (0, codegen_1._)`"['" + ${dataProp} + "']"` : isNumber ? (0, codegen_1._)`"/" + ${dataProp}` : (0, codegen_1._)`"/" + ${dataProp}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
      }
      return jsPropertySyntax ? (0, codegen_1.getProperty)(dataProp).toString() : "/" + escapeJsonPointer(dataProp);
    }
    __name(getErrorPath, "getErrorPath");
    exports.getErrorPath = getErrorPath;
    function checkStrictMode(it, msg, mode = it.opts.strictSchema) {
      if (!mode)
        return;
      msg = `strict mode: ${msg}`;
      if (mode === true)
        throw new Error(msg);
      it.self.logger.warn(msg);
    }
    __name(checkStrictMode, "checkStrictMode");
    exports.checkStrictMode = checkStrictMode;
  }
});

// node_modules/ajv/dist/compile/names.js
var require_names = __commonJS({
  "node_modules/ajv/dist/compile/names.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var names = {
      // validation function arguments
      data: new codegen_1.Name("data"),
      // data passed to validation function
      // args passed from referencing schema
      valCxt: new codegen_1.Name("valCxt"),
      // validation/data context - should not be used directly, it is destructured to the names below
      instancePath: new codegen_1.Name("instancePath"),
      parentData: new codegen_1.Name("parentData"),
      parentDataProperty: new codegen_1.Name("parentDataProperty"),
      rootData: new codegen_1.Name("rootData"),
      // root data - same as the data passed to the first/top validation function
      dynamicAnchors: new codegen_1.Name("dynamicAnchors"),
      // used to support recursiveRef and dynamicRef
      // function scoped variables
      vErrors: new codegen_1.Name("vErrors"),
      // null or array of validation errors
      errors: new codegen_1.Name("errors"),
      // counter of validation errors
      this: new codegen_1.Name("this"),
      // "globals"
      self: new codegen_1.Name("self"),
      scope: new codegen_1.Name("scope"),
      // JTD serialize/parse name for JSON string and position
      json: new codegen_1.Name("json"),
      jsonPos: new codegen_1.Name("jsonPos"),
      jsonLen: new codegen_1.Name("jsonLen"),
      jsonPart: new codegen_1.Name("jsonPart")
    };
    exports.default = names;
  }
});

// node_modules/ajv/dist/compile/errors.js
var require_errors = __commonJS({
  "node_modules/ajv/dist/compile/errors.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extendErrors = exports.resetErrorsCount = exports.reportExtraError = exports.reportError = exports.keyword$DataError = exports.keywordError = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var names_1 = require_names();
    exports.keywordError = {
      message: /* @__PURE__ */ __name(({ keyword }) => (0, codegen_1.str)`must pass "${keyword}" keyword validation`, "message")
    };
    exports.keyword$DataError = {
      message: /* @__PURE__ */ __name(({ keyword, schemaType }) => schemaType ? (0, codegen_1.str)`"${keyword}" keyword must be ${schemaType} ($data)` : (0, codegen_1.str)`"${keyword}" keyword is invalid ($data)`, "message")
    };
    function reportError(cxt, error2 = exports.keywordError, errorPaths, overrideAllErrors) {
      const { it } = cxt;
      const { gen, compositeRule, allErrors } = it;
      const errObj = errorObjectCode(cxt, error2, errorPaths);
      if (overrideAllErrors !== null && overrideAllErrors !== void 0 ? overrideAllErrors : compositeRule || allErrors) {
        addError(gen, errObj);
      } else {
        returnErrors(it, (0, codegen_1._)`[${errObj}]`);
      }
    }
    __name(reportError, "reportError");
    exports.reportError = reportError;
    function reportExtraError(cxt, error2 = exports.keywordError, errorPaths) {
      const { it } = cxt;
      const { gen, compositeRule, allErrors } = it;
      const errObj = errorObjectCode(cxt, error2, errorPaths);
      addError(gen, errObj);
      if (!(compositeRule || allErrors)) {
        returnErrors(it, names_1.default.vErrors);
      }
    }
    __name(reportExtraError, "reportExtraError");
    exports.reportExtraError = reportExtraError;
    function resetErrorsCount(gen, errsCount) {
      gen.assign(names_1.default.errors, errsCount);
      gen.if((0, codegen_1._)`${names_1.default.vErrors} !== null`, () => gen.if(errsCount, () => gen.assign((0, codegen_1._)`${names_1.default.vErrors}.length`, errsCount), () => gen.assign(names_1.default.vErrors, null)));
    }
    __name(resetErrorsCount, "resetErrorsCount");
    exports.resetErrorsCount = resetErrorsCount;
    function extendErrors({ gen, keyword, schemaValue, data, errsCount, it }) {
      if (errsCount === void 0)
        throw new Error("ajv implementation error");
      const err = gen.name("err");
      gen.forRange("i", errsCount, names_1.default.errors, (i) => {
        gen.const(err, (0, codegen_1._)`${names_1.default.vErrors}[${i}]`);
        gen.if((0, codegen_1._)`${err}.instancePath === undefined`, () => gen.assign((0, codegen_1._)`${err}.instancePath`, (0, codegen_1.strConcat)(names_1.default.instancePath, it.errorPath)));
        gen.assign((0, codegen_1._)`${err}.schemaPath`, (0, codegen_1.str)`${it.errSchemaPath}/${keyword}`);
        if (it.opts.verbose) {
          gen.assign((0, codegen_1._)`${err}.schema`, schemaValue);
          gen.assign((0, codegen_1._)`${err}.data`, data);
        }
      });
    }
    __name(extendErrors, "extendErrors");
    exports.extendErrors = extendErrors;
    function addError(gen, errObj) {
      const err = gen.const("err", errObj);
      gen.if((0, codegen_1._)`${names_1.default.vErrors} === null`, () => gen.assign(names_1.default.vErrors, (0, codegen_1._)`[${err}]`), (0, codegen_1._)`${names_1.default.vErrors}.push(${err})`);
      gen.code((0, codegen_1._)`${names_1.default.errors}++`);
    }
    __name(addError, "addError");
    function returnErrors(it, errs) {
      const { gen, validateName, schemaEnv } = it;
      if (schemaEnv.$async) {
        gen.throw((0, codegen_1._)`new ${it.ValidationError}(${errs})`);
      } else {
        gen.assign((0, codegen_1._)`${validateName}.errors`, errs);
        gen.return(false);
      }
    }
    __name(returnErrors, "returnErrors");
    var E = {
      keyword: new codegen_1.Name("keyword"),
      schemaPath: new codegen_1.Name("schemaPath"),
      // also used in JTD errors
      params: new codegen_1.Name("params"),
      propertyName: new codegen_1.Name("propertyName"),
      message: new codegen_1.Name("message"),
      schema: new codegen_1.Name("schema"),
      parentSchema: new codegen_1.Name("parentSchema")
    };
    function errorObjectCode(cxt, error2, errorPaths) {
      const { createErrors } = cxt.it;
      if (createErrors === false)
        return (0, codegen_1._)`{}`;
      return errorObject(cxt, error2, errorPaths);
    }
    __name(errorObjectCode, "errorObjectCode");
    function errorObject(cxt, error2, errorPaths = {}) {
      const { gen, it } = cxt;
      const keyValues = [
        errorInstancePath(it, errorPaths),
        errorSchemaPath(cxt, errorPaths)
      ];
      extraErrorProps(cxt, error2, keyValues);
      return gen.object(...keyValues);
    }
    __name(errorObject, "errorObject");
    function errorInstancePath({ errorPath }, { instancePath }) {
      const instPath = instancePath ? (0, codegen_1.str)`${errorPath}${(0, util_1.getErrorPath)(instancePath, util_1.Type.Str)}` : errorPath;
      return [names_1.default.instancePath, (0, codegen_1.strConcat)(names_1.default.instancePath, instPath)];
    }
    __name(errorInstancePath, "errorInstancePath");
    function errorSchemaPath({ keyword, it: { errSchemaPath } }, { schemaPath, parentSchema }) {
      let schPath = parentSchema ? errSchemaPath : (0, codegen_1.str)`${errSchemaPath}/${keyword}`;
      if (schemaPath) {
        schPath = (0, codegen_1.str)`${schPath}${(0, util_1.getErrorPath)(schemaPath, util_1.Type.Str)}`;
      }
      return [E.schemaPath, schPath];
    }
    __name(errorSchemaPath, "errorSchemaPath");
    function extraErrorProps(cxt, { params, message: message2 }, keyValues) {
      const { keyword, data, schemaValue, it } = cxt;
      const { opts, propertyName, topSchemaRef, schemaPath } = it;
      keyValues.push([E.keyword, keyword], [E.params, typeof params == "function" ? params(cxt) : params || (0, codegen_1._)`{}`]);
      if (opts.messages) {
        keyValues.push([E.message, typeof message2 == "function" ? message2(cxt) : message2]);
      }
      if (opts.verbose) {
        keyValues.push([E.schema, schemaValue], [E.parentSchema, (0, codegen_1._)`${topSchemaRef}${schemaPath}`], [names_1.default.data, data]);
      }
      if (propertyName)
        keyValues.push([E.propertyName, propertyName]);
    }
    __name(extraErrorProps, "extraErrorProps");
  }
});

// node_modules/ajv/dist/compile/validate/boolSchema.js
var require_boolSchema = __commonJS({
  "node_modules/ajv/dist/compile/validate/boolSchema.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.boolOrEmptySchema = exports.topBoolOrEmptySchema = void 0;
    var errors_1 = require_errors();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var boolError = {
      message: "boolean schema is false"
    };
    function topBoolOrEmptySchema(it) {
      const { gen, schema, validateName } = it;
      if (schema === false) {
        falseSchemaError(it, false);
      } else if (typeof schema == "object" && schema.$async === true) {
        gen.return(names_1.default.data);
      } else {
        gen.assign((0, codegen_1._)`${validateName}.errors`, null);
        gen.return(true);
      }
    }
    __name(topBoolOrEmptySchema, "topBoolOrEmptySchema");
    exports.topBoolOrEmptySchema = topBoolOrEmptySchema;
    function boolOrEmptySchema(it, valid) {
      const { gen, schema } = it;
      if (schema === false) {
        gen.var(valid, false);
        falseSchemaError(it);
      } else {
        gen.var(valid, true);
      }
    }
    __name(boolOrEmptySchema, "boolOrEmptySchema");
    exports.boolOrEmptySchema = boolOrEmptySchema;
    function falseSchemaError(it, overrideAllErrors) {
      const { gen, data } = it;
      const cxt = {
        gen,
        keyword: "false schema",
        data,
        schema: false,
        schemaCode: false,
        schemaValue: false,
        params: {},
        it
      };
      (0, errors_1.reportError)(cxt, boolError, void 0, overrideAllErrors);
    }
    __name(falseSchemaError, "falseSchemaError");
  }
});

// node_modules/ajv/dist/compile/rules.js
var require_rules = __commonJS({
  "node_modules/ajv/dist/compile/rules.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getRules = exports.isJSONType = void 0;
    var _jsonTypes = ["string", "number", "integer", "boolean", "null", "object", "array"];
    var jsonTypes = new Set(_jsonTypes);
    function isJSONType(x) {
      return typeof x == "string" && jsonTypes.has(x);
    }
    __name(isJSONType, "isJSONType");
    exports.isJSONType = isJSONType;
    function getRules() {
      const groups = {
        number: { type: "number", rules: [] },
        string: { type: "string", rules: [] },
        array: { type: "array", rules: [] },
        object: { type: "object", rules: [] }
      };
      return {
        types: { ...groups, integer: true, boolean: true, null: true },
        rules: [{ rules: [] }, groups.number, groups.string, groups.array, groups.object],
        post: { rules: [] },
        all: {},
        keywords: {}
      };
    }
    __name(getRules, "getRules");
    exports.getRules = getRules;
  }
});

// node_modules/ajv/dist/compile/validate/applicability.js
var require_applicability = __commonJS({
  "node_modules/ajv/dist/compile/validate/applicability.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.shouldUseRule = exports.shouldUseGroup = exports.schemaHasRulesForType = void 0;
    function schemaHasRulesForType({ schema, self }, type) {
      const group = self.RULES.types[type];
      return group && group !== true && shouldUseGroup(schema, group);
    }
    __name(schemaHasRulesForType, "schemaHasRulesForType");
    exports.schemaHasRulesForType = schemaHasRulesForType;
    function shouldUseGroup(schema, group) {
      return group.rules.some((rule) => shouldUseRule(schema, rule));
    }
    __name(shouldUseGroup, "shouldUseGroup");
    exports.shouldUseGroup = shouldUseGroup;
    function shouldUseRule(schema, rule) {
      var _a;
      return schema[rule.keyword] !== void 0 || ((_a = rule.definition.implements) === null || _a === void 0 ? void 0 : _a.some((kwd) => schema[kwd] !== void 0));
    }
    __name(shouldUseRule, "shouldUseRule");
    exports.shouldUseRule = shouldUseRule;
  }
});

// node_modules/ajv/dist/compile/validate/dataType.js
var require_dataType = __commonJS({
  "node_modules/ajv/dist/compile/validate/dataType.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reportTypeError = exports.checkDataTypes = exports.checkDataType = exports.coerceAndCheckDataType = exports.getJSONTypes = exports.getSchemaTypes = exports.DataType = void 0;
    var rules_1 = require_rules();
    var applicability_1 = require_applicability();
    var errors_1 = require_errors();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var DataType;
    (function(DataType2) {
      DataType2[DataType2["Correct"] = 0] = "Correct";
      DataType2[DataType2["Wrong"] = 1] = "Wrong";
    })(DataType || (exports.DataType = DataType = {}));
    function getSchemaTypes(schema) {
      const types = getJSONTypes(schema.type);
      const hasNull = types.includes("null");
      if (hasNull) {
        if (schema.nullable === false)
          throw new Error("type: null contradicts nullable: false");
      } else {
        if (!types.length && schema.nullable !== void 0) {
          throw new Error('"nullable" cannot be used without "type"');
        }
        if (schema.nullable === true)
          types.push("null");
      }
      return types;
    }
    __name(getSchemaTypes, "getSchemaTypes");
    exports.getSchemaTypes = getSchemaTypes;
    function getJSONTypes(ts) {
      const types = Array.isArray(ts) ? ts : ts ? [ts] : [];
      if (types.every(rules_1.isJSONType))
        return types;
      throw new Error("type must be JSONType or JSONType[]: " + types.join(","));
    }
    __name(getJSONTypes, "getJSONTypes");
    exports.getJSONTypes = getJSONTypes;
    function coerceAndCheckDataType(it, types) {
      const { gen, data, opts } = it;
      const coerceTo = coerceToTypes(types, opts.coerceTypes);
      const checkTypes = types.length > 0 && !(coerceTo.length === 0 && types.length === 1 && (0, applicability_1.schemaHasRulesForType)(it, types[0]));
      if (checkTypes) {
        const wrongType = checkDataTypes(types, data, opts.strictNumbers, DataType.Wrong);
        gen.if(wrongType, () => {
          if (coerceTo.length)
            coerceData(it, types, coerceTo);
          else
            reportTypeError(it);
        });
      }
      return checkTypes;
    }
    __name(coerceAndCheckDataType, "coerceAndCheckDataType");
    exports.coerceAndCheckDataType = coerceAndCheckDataType;
    var COERCIBLE = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
    function coerceToTypes(types, coerceTypes) {
      return coerceTypes ? types.filter((t) => COERCIBLE.has(t) || coerceTypes === "array" && t === "array") : [];
    }
    __name(coerceToTypes, "coerceToTypes");
    function coerceData(it, types, coerceTo) {
      const { gen, data, opts } = it;
      const dataType = gen.let("dataType", (0, codegen_1._)`typeof ${data}`);
      const coerced = gen.let("coerced", (0, codegen_1._)`undefined`);
      if (opts.coerceTypes === "array") {
        gen.if((0, codegen_1._)`${dataType} == 'object' && Array.isArray(${data}) && ${data}.length == 1`, () => gen.assign(data, (0, codegen_1._)`${data}[0]`).assign(dataType, (0, codegen_1._)`typeof ${data}`).if(checkDataTypes(types, data, opts.strictNumbers), () => gen.assign(coerced, data)));
      }
      gen.if((0, codegen_1._)`${coerced} !== undefined`);
      for (const t of coerceTo) {
        if (COERCIBLE.has(t) || t === "array" && opts.coerceTypes === "array") {
          coerceSpecificType(t);
        }
      }
      gen.else();
      reportTypeError(it);
      gen.endIf();
      gen.if((0, codegen_1._)`${coerced} !== undefined`, () => {
        gen.assign(data, coerced);
        assignParentData(it, coerced);
      });
      function coerceSpecificType(t) {
        switch (t) {
          case "string":
            gen.elseIf((0, codegen_1._)`${dataType} == "number" || ${dataType} == "boolean"`).assign(coerced, (0, codegen_1._)`"" + ${data}`).elseIf((0, codegen_1._)`${data} === null`).assign(coerced, (0, codegen_1._)`""`);
            return;
          case "number":
            gen.elseIf((0, codegen_1._)`${dataType} == "boolean" || ${data} === null
              || (${dataType} == "string" && ${data} && ${data} == +${data})`).assign(coerced, (0, codegen_1._)`+${data}`);
            return;
          case "integer":
            gen.elseIf((0, codegen_1._)`${dataType} === "boolean" || ${data} === null
              || (${dataType} === "string" && ${data} && ${data} == +${data} && !(${data} % 1))`).assign(coerced, (0, codegen_1._)`+${data}`);
            return;
          case "boolean":
            gen.elseIf((0, codegen_1._)`${data} === "false" || ${data} === 0 || ${data} === null`).assign(coerced, false).elseIf((0, codegen_1._)`${data} === "true" || ${data} === 1`).assign(coerced, true);
            return;
          case "null":
            gen.elseIf((0, codegen_1._)`${data} === "" || ${data} === 0 || ${data} === false`);
            gen.assign(coerced, null);
            return;
          case "array":
            gen.elseIf((0, codegen_1._)`${dataType} === "string" || ${dataType} === "number"
              || ${dataType} === "boolean" || ${data} === null`).assign(coerced, (0, codegen_1._)`[${data}]`);
        }
      }
      __name(coerceSpecificType, "coerceSpecificType");
    }
    __name(coerceData, "coerceData");
    function assignParentData({ gen, parentData, parentDataProperty }, expr) {
      gen.if((0, codegen_1._)`${parentData} !== undefined`, () => gen.assign((0, codegen_1._)`${parentData}[${parentDataProperty}]`, expr));
    }
    __name(assignParentData, "assignParentData");
    function checkDataType(dataType, data, strictNums, correct = DataType.Correct) {
      const EQ = correct === DataType.Correct ? codegen_1.operators.EQ : codegen_1.operators.NEQ;
      let cond;
      switch (dataType) {
        case "null":
          return (0, codegen_1._)`${data} ${EQ} null`;
        case "array":
          cond = (0, codegen_1._)`Array.isArray(${data})`;
          break;
        case "object":
          cond = (0, codegen_1._)`${data} && typeof ${data} == "object" && !Array.isArray(${data})`;
          break;
        case "integer":
          cond = numCond((0, codegen_1._)`!(${data} % 1) && !isNaN(${data})`);
          break;
        case "number":
          cond = numCond();
          break;
        default:
          return (0, codegen_1._)`typeof ${data} ${EQ} ${dataType}`;
      }
      return correct === DataType.Correct ? cond : (0, codegen_1.not)(cond);
      function numCond(_cond = codegen_1.nil) {
        return (0, codegen_1.and)((0, codegen_1._)`typeof ${data} == "number"`, _cond, strictNums ? (0, codegen_1._)`isFinite(${data})` : codegen_1.nil);
      }
      __name(numCond, "numCond");
    }
    __name(checkDataType, "checkDataType");
    exports.checkDataType = checkDataType;
    function checkDataTypes(dataTypes, data, strictNums, correct) {
      if (dataTypes.length === 1) {
        return checkDataType(dataTypes[0], data, strictNums, correct);
      }
      let cond;
      const types = (0, util_1.toHash)(dataTypes);
      if (types.array && types.object) {
        const notObj = (0, codegen_1._)`typeof ${data} != "object"`;
        cond = types.null ? notObj : (0, codegen_1._)`!${data} || ${notObj}`;
        delete types.null;
        delete types.array;
        delete types.object;
      } else {
        cond = codegen_1.nil;
      }
      if (types.number)
        delete types.integer;
      for (const t in types)
        cond = (0, codegen_1.and)(cond, checkDataType(t, data, strictNums, correct));
      return cond;
    }
    __name(checkDataTypes, "checkDataTypes");
    exports.checkDataTypes = checkDataTypes;
    var typeError = {
      message: /* @__PURE__ */ __name(({ schema }) => `must be ${schema}`, "message"),
      params: /* @__PURE__ */ __name(({ schema, schemaValue }) => typeof schema == "string" ? (0, codegen_1._)`{type: ${schema}}` : (0, codegen_1._)`{type: ${schemaValue}}`, "params")
    };
    function reportTypeError(it) {
      const cxt = getTypeErrorContext(it);
      (0, errors_1.reportError)(cxt, typeError);
    }
    __name(reportTypeError, "reportTypeError");
    exports.reportTypeError = reportTypeError;
    function getTypeErrorContext(it) {
      const { gen, data, schema } = it;
      const schemaCode = (0, util_1.schemaRefOrVal)(it, schema, "type");
      return {
        gen,
        keyword: "type",
        data,
        schema: schema.type,
        schemaCode,
        schemaValue: schemaCode,
        parentSchema: schema,
        params: {},
        it
      };
    }
    __name(getTypeErrorContext, "getTypeErrorContext");
  }
});

// node_modules/ajv/dist/compile/validate/defaults.js
var require_defaults = __commonJS({
  "node_modules/ajv/dist/compile/validate/defaults.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assignDefaults = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    function assignDefaults(it, ty) {
      const { properties, items } = it.schema;
      if (ty === "object" && properties) {
        for (const key in properties) {
          assignDefault(it, key, properties[key].default);
        }
      } else if (ty === "array" && Array.isArray(items)) {
        items.forEach((sch, i) => assignDefault(it, i, sch.default));
      }
    }
    __name(assignDefaults, "assignDefaults");
    exports.assignDefaults = assignDefaults;
    function assignDefault(it, prop, defaultValue) {
      const { gen, compositeRule, data, opts } = it;
      if (defaultValue === void 0)
        return;
      const childData = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(prop)}`;
      if (compositeRule) {
        (0, util_1.checkStrictMode)(it, `default is ignored for: ${childData}`);
        return;
      }
      let condition = (0, codegen_1._)`${childData} === undefined`;
      if (opts.useDefaults === "empty") {
        condition = (0, codegen_1._)`${condition} || ${childData} === null || ${childData} === ""`;
      }
      gen.if(condition, (0, codegen_1._)`${childData} = ${(0, codegen_1.stringify)(defaultValue)}`);
    }
    __name(assignDefault, "assignDefault");
  }
});

// node_modules/ajv/dist/vocabularies/code.js
var require_code2 = __commonJS({
  "node_modules/ajv/dist/vocabularies/code.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateUnion = exports.validateArray = exports.usePattern = exports.callValidateCode = exports.schemaProperties = exports.allSchemaProperties = exports.noPropertyInData = exports.propertyInData = exports.isOwnProperty = exports.hasPropFunc = exports.reportMissingProp = exports.checkMissingProp = exports.checkReportMissingProp = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var names_1 = require_names();
    var util_2 = require_util();
    function checkReportMissingProp(cxt, prop) {
      const { gen, data, it } = cxt;
      gen.if(noPropertyInData(gen, data, prop, it.opts.ownProperties), () => {
        cxt.setParams({ missingProperty: (0, codegen_1._)`${prop}` }, true);
        cxt.error();
      });
    }
    __name(checkReportMissingProp, "checkReportMissingProp");
    exports.checkReportMissingProp = checkReportMissingProp;
    function checkMissingProp({ gen, data, it: { opts } }, properties, missing) {
      return (0, codegen_1.or)(...properties.map((prop) => (0, codegen_1.and)(noPropertyInData(gen, data, prop, opts.ownProperties), (0, codegen_1._)`${missing} = ${prop}`)));
    }
    __name(checkMissingProp, "checkMissingProp");
    exports.checkMissingProp = checkMissingProp;
    function reportMissingProp(cxt, missing) {
      cxt.setParams({ missingProperty: missing }, true);
      cxt.error();
    }
    __name(reportMissingProp, "reportMissingProp");
    exports.reportMissingProp = reportMissingProp;
    function hasPropFunc(gen) {
      return gen.scopeValue("func", {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        ref: Object.prototype.hasOwnProperty,
        code: (0, codegen_1._)`Object.prototype.hasOwnProperty`
      });
    }
    __name(hasPropFunc, "hasPropFunc");
    exports.hasPropFunc = hasPropFunc;
    function isOwnProperty(gen, data, property) {
      return (0, codegen_1._)`${hasPropFunc(gen)}.call(${data}, ${property})`;
    }
    __name(isOwnProperty, "isOwnProperty");
    exports.isOwnProperty = isOwnProperty;
    function propertyInData(gen, data, property, ownProperties) {
      const cond = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(property)} !== undefined`;
      return ownProperties ? (0, codegen_1._)`${cond} && ${isOwnProperty(gen, data, property)}` : cond;
    }
    __name(propertyInData, "propertyInData");
    exports.propertyInData = propertyInData;
    function noPropertyInData(gen, data, property, ownProperties) {
      const cond = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(property)} === undefined`;
      return ownProperties ? (0, codegen_1.or)(cond, (0, codegen_1.not)(isOwnProperty(gen, data, property))) : cond;
    }
    __name(noPropertyInData, "noPropertyInData");
    exports.noPropertyInData = noPropertyInData;
    function allSchemaProperties(schemaMap) {
      return schemaMap ? Object.keys(schemaMap).filter((p) => p !== "__proto__") : [];
    }
    __name(allSchemaProperties, "allSchemaProperties");
    exports.allSchemaProperties = allSchemaProperties;
    function schemaProperties(it, schemaMap) {
      return allSchemaProperties(schemaMap).filter((p) => !(0, util_1.alwaysValidSchema)(it, schemaMap[p]));
    }
    __name(schemaProperties, "schemaProperties");
    exports.schemaProperties = schemaProperties;
    function callValidateCode({ schemaCode, data, it: { gen, topSchemaRef, schemaPath, errorPath }, it }, func, context, passSchema) {
      const dataAndSchema = passSchema ? (0, codegen_1._)`${schemaCode}, ${data}, ${topSchemaRef}${schemaPath}` : data;
      const valCxt = [
        [names_1.default.instancePath, (0, codegen_1.strConcat)(names_1.default.instancePath, errorPath)],
        [names_1.default.parentData, it.parentData],
        [names_1.default.parentDataProperty, it.parentDataProperty],
        [names_1.default.rootData, names_1.default.rootData]
      ];
      if (it.opts.dynamicRef)
        valCxt.push([names_1.default.dynamicAnchors, names_1.default.dynamicAnchors]);
      const args = (0, codegen_1._)`${dataAndSchema}, ${gen.object(...valCxt)}`;
      return context !== codegen_1.nil ? (0, codegen_1._)`${func}.call(${context}, ${args})` : (0, codegen_1._)`${func}(${args})`;
    }
    __name(callValidateCode, "callValidateCode");
    exports.callValidateCode = callValidateCode;
    var newRegExp = (0, codegen_1._)`new RegExp`;
    function usePattern({ gen, it: { opts } }, pattern) {
      const u = opts.unicodeRegExp ? "u" : "";
      const { regExp } = opts.code;
      const rx = regExp(pattern, u);
      return gen.scopeValue("pattern", {
        key: rx.toString(),
        ref: rx,
        code: (0, codegen_1._)`${regExp.code === "new RegExp" ? newRegExp : (0, util_2.useFunc)(gen, regExp)}(${pattern}, ${u})`
      });
    }
    __name(usePattern, "usePattern");
    exports.usePattern = usePattern;
    function validateArray(cxt) {
      const { gen, data, keyword, it } = cxt;
      const valid = gen.name("valid");
      if (it.allErrors) {
        const validArr = gen.let("valid", true);
        validateItems(() => gen.assign(validArr, false));
        return validArr;
      }
      gen.var(valid, true);
      validateItems(() => gen.break());
      return valid;
      function validateItems(notValid) {
        const len = gen.const("len", (0, codegen_1._)`${data}.length`);
        gen.forRange("i", 0, len, (i) => {
          cxt.subschema({
            keyword,
            dataProp: i,
            dataPropType: util_1.Type.Num
          }, valid);
          gen.if((0, codegen_1.not)(valid), notValid);
        });
      }
      __name(validateItems, "validateItems");
    }
    __name(validateArray, "validateArray");
    exports.validateArray = validateArray;
    function validateUnion(cxt) {
      const { gen, schema, keyword, it } = cxt;
      if (!Array.isArray(schema))
        throw new Error("ajv implementation error");
      const alwaysValid = schema.some((sch) => (0, util_1.alwaysValidSchema)(it, sch));
      if (alwaysValid && !it.opts.unevaluated)
        return;
      const valid = gen.let("valid", false);
      const schValid = gen.name("_valid");
      gen.block(() => schema.forEach((_sch, i) => {
        const schCxt = cxt.subschema({
          keyword,
          schemaProp: i,
          compositeRule: true
        }, schValid);
        gen.assign(valid, (0, codegen_1._)`${valid} || ${schValid}`);
        const merged = cxt.mergeValidEvaluated(schCxt, schValid);
        if (!merged)
          gen.if((0, codegen_1.not)(valid));
      }));
      cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
    }
    __name(validateUnion, "validateUnion");
    exports.validateUnion = validateUnion;
  }
});

// node_modules/ajv/dist/compile/validate/keyword.js
var require_keyword = __commonJS({
  "node_modules/ajv/dist/compile/validate/keyword.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateKeywordUsage = exports.validSchemaType = exports.funcKeywordCode = exports.macroKeywordCode = void 0;
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var code_1 = require_code2();
    var errors_1 = require_errors();
    function macroKeywordCode(cxt, def) {
      const { gen, keyword, schema, parentSchema, it } = cxt;
      const macroSchema = def.macro.call(it.self, schema, parentSchema, it);
      const schemaRef = useKeyword(gen, keyword, macroSchema);
      if (it.opts.validateSchema !== false)
        it.self.validateSchema(macroSchema, true);
      const valid = gen.name("valid");
      cxt.subschema({
        schema: macroSchema,
        schemaPath: codegen_1.nil,
        errSchemaPath: `${it.errSchemaPath}/${keyword}`,
        topSchemaRef: schemaRef,
        compositeRule: true
      }, valid);
      cxt.pass(valid, () => cxt.error(true));
    }
    __name(macroKeywordCode, "macroKeywordCode");
    exports.macroKeywordCode = macroKeywordCode;
    function funcKeywordCode(cxt, def) {
      var _a;
      const { gen, keyword, schema, parentSchema, $data, it } = cxt;
      checkAsyncKeyword(it, def);
      const validate3 = !$data && def.compile ? def.compile.call(it.self, schema, parentSchema, it) : def.validate;
      const validateRef = useKeyword(gen, keyword, validate3);
      const valid = gen.let("valid");
      cxt.block$data(valid, validateKeyword);
      cxt.ok((_a = def.valid) !== null && _a !== void 0 ? _a : valid);
      function validateKeyword() {
        if (def.errors === false) {
          assignValid();
          if (def.modifying)
            modifyData(cxt);
          reportErrs(() => cxt.error());
        } else {
          const ruleErrs = def.async ? validateAsync() : validateSync();
          if (def.modifying)
            modifyData(cxt);
          reportErrs(() => addErrs(cxt, ruleErrs));
        }
      }
      __name(validateKeyword, "validateKeyword");
      function validateAsync() {
        const ruleErrs = gen.let("ruleErrs", null);
        gen.try(() => assignValid((0, codegen_1._)`await `), (e) => gen.assign(valid, false).if((0, codegen_1._)`${e} instanceof ${it.ValidationError}`, () => gen.assign(ruleErrs, (0, codegen_1._)`${e}.errors`), () => gen.throw(e)));
        return ruleErrs;
      }
      __name(validateAsync, "validateAsync");
      function validateSync() {
        const validateErrs = (0, codegen_1._)`${validateRef}.errors`;
        gen.assign(validateErrs, null);
        assignValid(codegen_1.nil);
        return validateErrs;
      }
      __name(validateSync, "validateSync");
      function assignValid(_await = def.async ? (0, codegen_1._)`await ` : codegen_1.nil) {
        const passCxt = it.opts.passContext ? names_1.default.this : names_1.default.self;
        const passSchema = !("compile" in def && !$data || def.schema === false);
        gen.assign(valid, (0, codegen_1._)`${_await}${(0, code_1.callValidateCode)(cxt, validateRef, passCxt, passSchema)}`, def.modifying);
      }
      __name(assignValid, "assignValid");
      function reportErrs(errors) {
        var _a2;
        gen.if((0, codegen_1.not)((_a2 = def.valid) !== null && _a2 !== void 0 ? _a2 : valid), errors);
      }
      __name(reportErrs, "reportErrs");
    }
    __name(funcKeywordCode, "funcKeywordCode");
    exports.funcKeywordCode = funcKeywordCode;
    function modifyData(cxt) {
      const { gen, data, it } = cxt;
      gen.if(it.parentData, () => gen.assign(data, (0, codegen_1._)`${it.parentData}[${it.parentDataProperty}]`));
    }
    __name(modifyData, "modifyData");
    function addErrs(cxt, errs) {
      const { gen } = cxt;
      gen.if((0, codegen_1._)`Array.isArray(${errs})`, () => {
        gen.assign(names_1.default.vErrors, (0, codegen_1._)`${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`).assign(names_1.default.errors, (0, codegen_1._)`${names_1.default.vErrors}.length`);
        (0, errors_1.extendErrors)(cxt);
      }, () => cxt.error());
    }
    __name(addErrs, "addErrs");
    function checkAsyncKeyword({ schemaEnv }, def) {
      if (def.async && !schemaEnv.$async)
        throw new Error("async keyword in sync schema");
    }
    __name(checkAsyncKeyword, "checkAsyncKeyword");
    function useKeyword(gen, keyword, result) {
      if (result === void 0)
        throw new Error(`keyword "${keyword}" failed to compile`);
      return gen.scopeValue("keyword", typeof result == "function" ? { ref: result } : { ref: result, code: (0, codegen_1.stringify)(result) });
    }
    __name(useKeyword, "useKeyword");
    function validSchemaType(schema, schemaType, allowUndefined = false) {
      return !schemaType.length || schemaType.some((st) => st === "array" ? Array.isArray(schema) : st === "object" ? schema && typeof schema == "object" && !Array.isArray(schema) : typeof schema == st || allowUndefined && typeof schema == "undefined");
    }
    __name(validSchemaType, "validSchemaType");
    exports.validSchemaType = validSchemaType;
    function validateKeywordUsage({ schema, opts, self, errSchemaPath }, def, keyword) {
      if (Array.isArray(def.keyword) ? !def.keyword.includes(keyword) : def.keyword !== keyword) {
        throw new Error("ajv implementation error");
      }
      const deps = def.dependencies;
      if (deps === null || deps === void 0 ? void 0 : deps.some((kwd) => !Object.prototype.hasOwnProperty.call(schema, kwd))) {
        throw new Error(`parent schema must have dependencies of ${keyword}: ${deps.join(",")}`);
      }
      if (def.validateSchema) {
        const valid = def.validateSchema(schema[keyword]);
        if (!valid) {
          const msg = `keyword "${keyword}" value is invalid at path "${errSchemaPath}": ` + self.errorsText(def.validateSchema.errors);
          if (opts.validateSchema === "log")
            self.logger.error(msg);
          else
            throw new Error(msg);
        }
      }
    }
    __name(validateKeywordUsage, "validateKeywordUsage");
    exports.validateKeywordUsage = validateKeywordUsage;
  }
});

// node_modules/ajv/dist/compile/validate/subschema.js
var require_subschema = __commonJS({
  "node_modules/ajv/dist/compile/validate/subschema.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extendSubschemaMode = exports.extendSubschemaData = exports.getSubschema = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    function getSubschema(it, { keyword, schemaProp, schema, schemaPath, errSchemaPath, topSchemaRef }) {
      if (keyword !== void 0 && schema !== void 0) {
        throw new Error('both "keyword" and "schema" passed, only one allowed');
      }
      if (keyword !== void 0) {
        const sch = it.schema[keyword];
        return schemaProp === void 0 ? {
          schema: sch,
          schemaPath: (0, codegen_1._)`${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}`,
          errSchemaPath: `${it.errSchemaPath}/${keyword}`
        } : {
          schema: sch[schemaProp],
          schemaPath: (0, codegen_1._)`${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}${(0, codegen_1.getProperty)(schemaProp)}`,
          errSchemaPath: `${it.errSchemaPath}/${keyword}/${(0, util_1.escapeFragment)(schemaProp)}`
        };
      }
      if (schema !== void 0) {
        if (schemaPath === void 0 || errSchemaPath === void 0 || topSchemaRef === void 0) {
          throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
        }
        return {
          schema,
          schemaPath,
          topSchemaRef,
          errSchemaPath
        };
      }
      throw new Error('either "keyword" or "schema" must be passed');
    }
    __name(getSubschema, "getSubschema");
    exports.getSubschema = getSubschema;
    function extendSubschemaData(subschema, it, { dataProp, dataPropType: dpType, data, dataTypes, propertyName }) {
      if (data !== void 0 && dataProp !== void 0) {
        throw new Error('both "data" and "dataProp" passed, only one allowed');
      }
      const { gen } = it;
      if (dataProp !== void 0) {
        const { errorPath, dataPathArr, opts } = it;
        const nextData = gen.let("data", (0, codegen_1._)`${it.data}${(0, codegen_1.getProperty)(dataProp)}`, true);
        dataContextProps(nextData);
        subschema.errorPath = (0, codegen_1.str)`${errorPath}${(0, util_1.getErrorPath)(dataProp, dpType, opts.jsPropertySyntax)}`;
        subschema.parentDataProperty = (0, codegen_1._)`${dataProp}`;
        subschema.dataPathArr = [...dataPathArr, subschema.parentDataProperty];
      }
      if (data !== void 0) {
        const nextData = data instanceof codegen_1.Name ? data : gen.let("data", data, true);
        dataContextProps(nextData);
        if (propertyName !== void 0)
          subschema.propertyName = propertyName;
      }
      if (dataTypes)
        subschema.dataTypes = dataTypes;
      function dataContextProps(_nextData) {
        subschema.data = _nextData;
        subschema.dataLevel = it.dataLevel + 1;
        subschema.dataTypes = [];
        it.definedProperties = /* @__PURE__ */ new Set();
        subschema.parentData = it.data;
        subschema.dataNames = [...it.dataNames, _nextData];
      }
      __name(dataContextProps, "dataContextProps");
    }
    __name(extendSubschemaData, "extendSubschemaData");
    exports.extendSubschemaData = extendSubschemaData;
    function extendSubschemaMode(subschema, { jtdDiscriminator, jtdMetadata, compositeRule, createErrors, allErrors }) {
      if (compositeRule !== void 0)
        subschema.compositeRule = compositeRule;
      if (createErrors !== void 0)
        subschema.createErrors = createErrors;
      if (allErrors !== void 0)
        subschema.allErrors = allErrors;
      subschema.jtdDiscriminator = jtdDiscriminator;
      subschema.jtdMetadata = jtdMetadata;
    }
    __name(extendSubschemaMode, "extendSubschemaMode");
    exports.extendSubschemaMode = extendSubschemaMode;
  }
});

// node_modules/fast-deep-equal/index.js
var require_fast_deep_equal = __commonJS({
  "node_modules/fast-deep-equal/index.js"(exports, module) {
    "use strict";
    module.exports = /* @__PURE__ */ __name(function equal(a, b) {
      if (a === b) return true;
      if (a && b && typeof a == "object" && typeof b == "object") {
        if (a.constructor !== b.constructor) return false;
        var length, i, keys;
        if (Array.isArray(a)) {
          length = a.length;
          if (length != b.length) return false;
          for (i = length; i-- !== 0; )
            if (!equal(a[i], b[i])) return false;
          return true;
        }
        if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
        if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
        if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
        keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length) return false;
        for (i = length; i-- !== 0; )
          if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
        for (i = length; i-- !== 0; ) {
          var key = keys[i];
          if (!equal(a[key], b[key])) return false;
        }
        return true;
      }
      return a !== a && b !== b;
    }, "equal");
  }
});

// node_modules/json-schema-traverse/index.js
var require_json_schema_traverse = __commonJS({
  "node_modules/json-schema-traverse/index.js"(exports, module) {
    "use strict";
    var traverse = module.exports = function(schema, opts, cb) {
      if (typeof opts == "function") {
        cb = opts;
        opts = {};
      }
      cb = opts.cb || cb;
      var pre = typeof cb == "function" ? cb : cb.pre || function() {
      };
      var post = cb.post || function() {
      };
      _traverse(opts, pre, post, schema, "", schema);
    };
    traverse.keywords = {
      additionalItems: true,
      items: true,
      contains: true,
      additionalProperties: true,
      propertyNames: true,
      not: true,
      if: true,
      then: true,
      else: true
    };
    traverse.arrayKeywords = {
      items: true,
      allOf: true,
      anyOf: true,
      oneOf: true
    };
    traverse.propsKeywords = {
      $defs: true,
      definitions: true,
      properties: true,
      patternProperties: true,
      dependencies: true
    };
    traverse.skipKeywords = {
      default: true,
      enum: true,
      const: true,
      required: true,
      maximum: true,
      minimum: true,
      exclusiveMaximum: true,
      exclusiveMinimum: true,
      multipleOf: true,
      maxLength: true,
      minLength: true,
      pattern: true,
      format: true,
      maxItems: true,
      minItems: true,
      uniqueItems: true,
      maxProperties: true,
      minProperties: true
    };
    function _traverse(opts, pre, post, schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
      if (schema && typeof schema == "object" && !Array.isArray(schema)) {
        pre(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
        for (var key in schema) {
          var sch = schema[key];
          if (Array.isArray(sch)) {
            if (key in traverse.arrayKeywords) {
              for (var i = 0; i < sch.length; i++)
                _traverse(opts, pre, post, sch[i], jsonPtr + "/" + key + "/" + i, rootSchema, jsonPtr, key, schema, i);
            }
          } else if (key in traverse.propsKeywords) {
            if (sch && typeof sch == "object") {
              for (var prop in sch)
                _traverse(opts, pre, post, sch[prop], jsonPtr + "/" + key + "/" + escapeJsonPtr(prop), rootSchema, jsonPtr, key, schema, prop);
            }
          } else if (key in traverse.keywords || opts.allKeys && !(key in traverse.skipKeywords)) {
            _traverse(opts, pre, post, sch, jsonPtr + "/" + key, rootSchema, jsonPtr, key, schema);
          }
        }
        post(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
      }
    }
    __name(_traverse, "_traverse");
    function escapeJsonPtr(str) {
      return str.replace(/~/g, "~0").replace(/\//g, "~1");
    }
    __name(escapeJsonPtr, "escapeJsonPtr");
  }
});

// node_modules/ajv/dist/compile/resolve.js
var require_resolve = __commonJS({
  "node_modules/ajv/dist/compile/resolve.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSchemaRefs = exports.resolveUrl = exports.normalizeId = exports._getFullPath = exports.getFullPath = exports.inlineRef = void 0;
    var util_1 = require_util();
    var equal = require_fast_deep_equal();
    var traverse = require_json_schema_traverse();
    var SIMPLE_INLINED = /* @__PURE__ */ new Set([
      "type",
      "format",
      "pattern",
      "maxLength",
      "minLength",
      "maxProperties",
      "minProperties",
      "maxItems",
      "minItems",
      "maximum",
      "minimum",
      "uniqueItems",
      "multipleOf",
      "required",
      "enum",
      "const"
    ]);
    function inlineRef(schema, limit = true) {
      if (typeof schema == "boolean")
        return true;
      if (limit === true)
        return !hasRef(schema);
      if (!limit)
        return false;
      return countKeys(schema) <= limit;
    }
    __name(inlineRef, "inlineRef");
    exports.inlineRef = inlineRef;
    var REF_KEYWORDS = /* @__PURE__ */ new Set([
      "$ref",
      "$recursiveRef",
      "$recursiveAnchor",
      "$dynamicRef",
      "$dynamicAnchor"
    ]);
    function hasRef(schema) {
      for (const key in schema) {
        if (REF_KEYWORDS.has(key))
          return true;
        const sch = schema[key];
        if (Array.isArray(sch) && sch.some(hasRef))
          return true;
        if (typeof sch == "object" && hasRef(sch))
          return true;
      }
      return false;
    }
    __name(hasRef, "hasRef");
    function countKeys(schema) {
      let count = 0;
      for (const key in schema) {
        if (key === "$ref")
          return Infinity;
        count++;
        if (SIMPLE_INLINED.has(key))
          continue;
        if (typeof schema[key] == "object") {
          (0, util_1.eachItem)(schema[key], (sch) => count += countKeys(sch));
        }
        if (count === Infinity)
          return Infinity;
      }
      return count;
    }
    __name(countKeys, "countKeys");
    function getFullPath(resolver, id = "", normalize) {
      if (normalize !== false)
        id = normalizeId(id);
      const p = resolver.parse(id);
      return _getFullPath(resolver, p);
    }
    __name(getFullPath, "getFullPath");
    exports.getFullPath = getFullPath;
    function _getFullPath(resolver, p) {
      const serialized = resolver.serialize(p);
      return serialized.split("#")[0] + "#";
    }
    __name(_getFullPath, "_getFullPath");
    exports._getFullPath = _getFullPath;
    var TRAILING_SLASH_HASH = /#\/?$/;
    function normalizeId(id) {
      return id ? id.replace(TRAILING_SLASH_HASH, "") : "";
    }
    __name(normalizeId, "normalizeId");
    exports.normalizeId = normalizeId;
    function resolveUrl(resolver, baseId, id) {
      id = normalizeId(id);
      return resolver.resolve(baseId, id);
    }
    __name(resolveUrl, "resolveUrl");
    exports.resolveUrl = resolveUrl;
    var ANCHOR = /^[a-z_][-a-z0-9._]*$/i;
    function getSchemaRefs(schema, baseId) {
      if (typeof schema == "boolean")
        return {};
      const { schemaId, uriResolver } = this.opts;
      const schId = normalizeId(schema[schemaId] || baseId);
      const baseIds = { "": schId };
      const pathPrefix = getFullPath(uriResolver, schId, false);
      const localRefs = {};
      const schemaRefs = /* @__PURE__ */ new Set();
      traverse(schema, { allKeys: true }, (sch, jsonPtr, _, parentJsonPtr) => {
        if (parentJsonPtr === void 0)
          return;
        const fullPath = pathPrefix + jsonPtr;
        let innerBaseId = baseIds[parentJsonPtr];
        if (typeof sch[schemaId] == "string")
          innerBaseId = addRef.call(this, sch[schemaId]);
        addAnchor.call(this, sch.$anchor);
        addAnchor.call(this, sch.$dynamicAnchor);
        baseIds[jsonPtr] = innerBaseId;
        function addRef(ref) {
          const _resolve = this.opts.uriResolver.resolve;
          ref = normalizeId(innerBaseId ? _resolve(innerBaseId, ref) : ref);
          if (schemaRefs.has(ref))
            throw ambiguos(ref);
          schemaRefs.add(ref);
          let schOrRef = this.refs[ref];
          if (typeof schOrRef == "string")
            schOrRef = this.refs[schOrRef];
          if (typeof schOrRef == "object") {
            checkAmbiguosRef(sch, schOrRef.schema, ref);
          } else if (ref !== normalizeId(fullPath)) {
            if (ref[0] === "#") {
              checkAmbiguosRef(sch, localRefs[ref], ref);
              localRefs[ref] = sch;
            } else {
              this.refs[ref] = fullPath;
            }
          }
          return ref;
        }
        __name(addRef, "addRef");
        function addAnchor(anchor) {
          if (typeof anchor == "string") {
            if (!ANCHOR.test(anchor))
              throw new Error(`invalid anchor "${anchor}"`);
            addRef.call(this, `#${anchor}`);
          }
        }
        __name(addAnchor, "addAnchor");
      });
      return localRefs;
      function checkAmbiguosRef(sch1, sch2, ref) {
        if (sch2 !== void 0 && !equal(sch1, sch2))
          throw ambiguos(ref);
      }
      __name(checkAmbiguosRef, "checkAmbiguosRef");
      function ambiguos(ref) {
        return new Error(`reference "${ref}" resolves to more than one schema`);
      }
      __name(ambiguos, "ambiguos");
    }
    __name(getSchemaRefs, "getSchemaRefs");
    exports.getSchemaRefs = getSchemaRefs;
  }
});

// node_modules/ajv/dist/compile/validate/index.js
var require_validate = __commonJS({
  "node_modules/ajv/dist/compile/validate/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getData = exports.KeywordCxt = exports.validateFunctionCode = void 0;
    var boolSchema_1 = require_boolSchema();
    var dataType_1 = require_dataType();
    var applicability_1 = require_applicability();
    var dataType_2 = require_dataType();
    var defaults_1 = require_defaults();
    var keyword_1 = require_keyword();
    var subschema_1 = require_subschema();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var resolve_1 = require_resolve();
    var util_1 = require_util();
    var errors_1 = require_errors();
    function validateFunctionCode(it) {
      if (isSchemaObj(it)) {
        checkKeywords(it);
        if (schemaCxtHasRules(it)) {
          topSchemaObjCode(it);
          return;
        }
      }
      validateFunction(it, () => (0, boolSchema_1.topBoolOrEmptySchema)(it));
    }
    __name(validateFunctionCode, "validateFunctionCode");
    exports.validateFunctionCode = validateFunctionCode;
    function validateFunction({ gen, validateName, schema, schemaEnv, opts }, body) {
      if (opts.code.es5) {
        gen.func(validateName, (0, codegen_1._)`${names_1.default.data}, ${names_1.default.valCxt}`, schemaEnv.$async, () => {
          gen.code((0, codegen_1._)`"use strict"; ${funcSourceUrl(schema, opts)}`);
          destructureValCxtES5(gen, opts);
          gen.code(body);
        });
      } else {
        gen.func(validateName, (0, codegen_1._)`${names_1.default.data}, ${destructureValCxt(opts)}`, schemaEnv.$async, () => gen.code(funcSourceUrl(schema, opts)).code(body));
      }
    }
    __name(validateFunction, "validateFunction");
    function destructureValCxt(opts) {
      return (0, codegen_1._)`{${names_1.default.instancePath}="", ${names_1.default.parentData}, ${names_1.default.parentDataProperty}, ${names_1.default.rootData}=${names_1.default.data}${opts.dynamicRef ? (0, codegen_1._)`, ${names_1.default.dynamicAnchors}={}` : codegen_1.nil}}={}`;
    }
    __name(destructureValCxt, "destructureValCxt");
    function destructureValCxtES5(gen, opts) {
      gen.if(names_1.default.valCxt, () => {
        gen.var(names_1.default.instancePath, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.instancePath}`);
        gen.var(names_1.default.parentData, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.parentData}`);
        gen.var(names_1.default.parentDataProperty, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.parentDataProperty}`);
        gen.var(names_1.default.rootData, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.rootData}`);
        if (opts.dynamicRef)
          gen.var(names_1.default.dynamicAnchors, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.dynamicAnchors}`);
      }, () => {
        gen.var(names_1.default.instancePath, (0, codegen_1._)`""`);
        gen.var(names_1.default.parentData, (0, codegen_1._)`undefined`);
        gen.var(names_1.default.parentDataProperty, (0, codegen_1._)`undefined`);
        gen.var(names_1.default.rootData, names_1.default.data);
        if (opts.dynamicRef)
          gen.var(names_1.default.dynamicAnchors, (0, codegen_1._)`{}`);
      });
    }
    __name(destructureValCxtES5, "destructureValCxtES5");
    function topSchemaObjCode(it) {
      const { schema, opts, gen } = it;
      validateFunction(it, () => {
        if (opts.$comment && schema.$comment)
          commentKeyword(it);
        checkNoDefault(it);
        gen.let(names_1.default.vErrors, null);
        gen.let(names_1.default.errors, 0);
        if (opts.unevaluated)
          resetEvaluated(it);
        typeAndKeywords(it);
        returnResults(it);
      });
      return;
    }
    __name(topSchemaObjCode, "topSchemaObjCode");
    function resetEvaluated(it) {
      const { gen, validateName } = it;
      it.evaluated = gen.const("evaluated", (0, codegen_1._)`${validateName}.evaluated`);
      gen.if((0, codegen_1._)`${it.evaluated}.dynamicProps`, () => gen.assign((0, codegen_1._)`${it.evaluated}.props`, (0, codegen_1._)`undefined`));
      gen.if((0, codegen_1._)`${it.evaluated}.dynamicItems`, () => gen.assign((0, codegen_1._)`${it.evaluated}.items`, (0, codegen_1._)`undefined`));
    }
    __name(resetEvaluated, "resetEvaluated");
    function funcSourceUrl(schema, opts) {
      const schId = typeof schema == "object" && schema[opts.schemaId];
      return schId && (opts.code.source || opts.code.process) ? (0, codegen_1._)`/*# sourceURL=${schId} */` : codegen_1.nil;
    }
    __name(funcSourceUrl, "funcSourceUrl");
    function subschemaCode(it, valid) {
      if (isSchemaObj(it)) {
        checkKeywords(it);
        if (schemaCxtHasRules(it)) {
          subSchemaObjCode(it, valid);
          return;
        }
      }
      (0, boolSchema_1.boolOrEmptySchema)(it, valid);
    }
    __name(subschemaCode, "subschemaCode");
    function schemaCxtHasRules({ schema, self }) {
      if (typeof schema == "boolean")
        return !schema;
      for (const key in schema)
        if (self.RULES.all[key])
          return true;
      return false;
    }
    __name(schemaCxtHasRules, "schemaCxtHasRules");
    function isSchemaObj(it) {
      return typeof it.schema != "boolean";
    }
    __name(isSchemaObj, "isSchemaObj");
    function subSchemaObjCode(it, valid) {
      const { schema, gen, opts } = it;
      if (opts.$comment && schema.$comment)
        commentKeyword(it);
      updateContext(it);
      checkAsyncSchema(it);
      const errsCount = gen.const("_errs", names_1.default.errors);
      typeAndKeywords(it, errsCount);
      gen.var(valid, (0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
    }
    __name(subSchemaObjCode, "subSchemaObjCode");
    function checkKeywords(it) {
      (0, util_1.checkUnknownRules)(it);
      checkRefsAndKeywords(it);
    }
    __name(checkKeywords, "checkKeywords");
    function typeAndKeywords(it, errsCount) {
      if (it.opts.jtd)
        return schemaKeywords(it, [], false, errsCount);
      const types = (0, dataType_1.getSchemaTypes)(it.schema);
      const checkedTypes = (0, dataType_1.coerceAndCheckDataType)(it, types);
      schemaKeywords(it, types, !checkedTypes, errsCount);
    }
    __name(typeAndKeywords, "typeAndKeywords");
    function checkRefsAndKeywords(it) {
      const { schema, errSchemaPath, opts, self } = it;
      if (schema.$ref && opts.ignoreKeywordsWithRef && (0, util_1.schemaHasRulesButRef)(schema, self.RULES)) {
        self.logger.warn(`$ref: keywords ignored in schema at path "${errSchemaPath}"`);
      }
    }
    __name(checkRefsAndKeywords, "checkRefsAndKeywords");
    function checkNoDefault(it) {
      const { schema, opts } = it;
      if (schema.default !== void 0 && opts.useDefaults && opts.strictSchema) {
        (0, util_1.checkStrictMode)(it, "default is ignored in the schema root");
      }
    }
    __name(checkNoDefault, "checkNoDefault");
    function updateContext(it) {
      const schId = it.schema[it.opts.schemaId];
      if (schId)
        it.baseId = (0, resolve_1.resolveUrl)(it.opts.uriResolver, it.baseId, schId);
    }
    __name(updateContext, "updateContext");
    function checkAsyncSchema(it) {
      if (it.schema.$async && !it.schemaEnv.$async)
        throw new Error("async schema in sync schema");
    }
    __name(checkAsyncSchema, "checkAsyncSchema");
    function commentKeyword({ gen, schemaEnv, schema, errSchemaPath, opts }) {
      const msg = schema.$comment;
      if (opts.$comment === true) {
        gen.code((0, codegen_1._)`${names_1.default.self}.logger.log(${msg})`);
      } else if (typeof opts.$comment == "function") {
        const schemaPath = (0, codegen_1.str)`${errSchemaPath}/$comment`;
        const rootName = gen.scopeValue("root", { ref: schemaEnv.root });
        gen.code((0, codegen_1._)`${names_1.default.self}.opts.$comment(${msg}, ${schemaPath}, ${rootName}.schema)`);
      }
    }
    __name(commentKeyword, "commentKeyword");
    function returnResults(it) {
      const { gen, schemaEnv, validateName, ValidationError, opts } = it;
      if (schemaEnv.$async) {
        gen.if((0, codegen_1._)`${names_1.default.errors} === 0`, () => gen.return(names_1.default.data), () => gen.throw((0, codegen_1._)`new ${ValidationError}(${names_1.default.vErrors})`));
      } else {
        gen.assign((0, codegen_1._)`${validateName}.errors`, names_1.default.vErrors);
        if (opts.unevaluated)
          assignEvaluated(it);
        gen.return((0, codegen_1._)`${names_1.default.errors} === 0`);
      }
    }
    __name(returnResults, "returnResults");
    function assignEvaluated({ gen, evaluated, props, items }) {
      if (props instanceof codegen_1.Name)
        gen.assign((0, codegen_1._)`${evaluated}.props`, props);
      if (items instanceof codegen_1.Name)
        gen.assign((0, codegen_1._)`${evaluated}.items`, items);
    }
    __name(assignEvaluated, "assignEvaluated");
    function schemaKeywords(it, types, typeErrors, errsCount) {
      const { gen, schema, data, allErrors, opts, self } = it;
      const { RULES } = self;
      if (schema.$ref && (opts.ignoreKeywordsWithRef || !(0, util_1.schemaHasRulesButRef)(schema, RULES))) {
        gen.block(() => keywordCode(it, "$ref", RULES.all.$ref.definition));
        return;
      }
      if (!opts.jtd)
        checkStrictTypes(it, types);
      gen.block(() => {
        for (const group of RULES.rules)
          groupKeywords(group);
        groupKeywords(RULES.post);
      });
      function groupKeywords(group) {
        if (!(0, applicability_1.shouldUseGroup)(schema, group))
          return;
        if (group.type) {
          gen.if((0, dataType_2.checkDataType)(group.type, data, opts.strictNumbers));
          iterateKeywords(it, group);
          if (types.length === 1 && types[0] === group.type && typeErrors) {
            gen.else();
            (0, dataType_2.reportTypeError)(it);
          }
          gen.endIf();
        } else {
          iterateKeywords(it, group);
        }
        if (!allErrors)
          gen.if((0, codegen_1._)`${names_1.default.errors} === ${errsCount || 0}`);
      }
      __name(groupKeywords, "groupKeywords");
    }
    __name(schemaKeywords, "schemaKeywords");
    function iterateKeywords(it, group) {
      const { gen, schema, opts: { useDefaults } } = it;
      if (useDefaults)
        (0, defaults_1.assignDefaults)(it, group.type);
      gen.block(() => {
        for (const rule of group.rules) {
          if ((0, applicability_1.shouldUseRule)(schema, rule)) {
            keywordCode(it, rule.keyword, rule.definition, group.type);
          }
        }
      });
    }
    __name(iterateKeywords, "iterateKeywords");
    function checkStrictTypes(it, types) {
      if (it.schemaEnv.meta || !it.opts.strictTypes)
        return;
      checkContextTypes(it, types);
      if (!it.opts.allowUnionTypes)
        checkMultipleTypes(it, types);
      checkKeywordTypes(it, it.dataTypes);
    }
    __name(checkStrictTypes, "checkStrictTypes");
    function checkContextTypes(it, types) {
      if (!types.length)
        return;
      if (!it.dataTypes.length) {
        it.dataTypes = types;
        return;
      }
      types.forEach((t) => {
        if (!includesType(it.dataTypes, t)) {
          strictTypesError(it, `type "${t}" not allowed by context "${it.dataTypes.join(",")}"`);
        }
      });
      narrowSchemaTypes(it, types);
    }
    __name(checkContextTypes, "checkContextTypes");
    function checkMultipleTypes(it, ts) {
      if (ts.length > 1 && !(ts.length === 2 && ts.includes("null"))) {
        strictTypesError(it, "use allowUnionTypes to allow union type keyword");
      }
    }
    __name(checkMultipleTypes, "checkMultipleTypes");
    function checkKeywordTypes(it, ts) {
      const rules = it.self.RULES.all;
      for (const keyword in rules) {
        const rule = rules[keyword];
        if (typeof rule == "object" && (0, applicability_1.shouldUseRule)(it.schema, rule)) {
          const { type } = rule.definition;
          if (type.length && !type.some((t) => hasApplicableType(ts, t))) {
            strictTypesError(it, `missing type "${type.join(",")}" for keyword "${keyword}"`);
          }
        }
      }
    }
    __name(checkKeywordTypes, "checkKeywordTypes");
    function hasApplicableType(schTs, kwdT) {
      return schTs.includes(kwdT) || kwdT === "number" && schTs.includes("integer");
    }
    __name(hasApplicableType, "hasApplicableType");
    function includesType(ts, t) {
      return ts.includes(t) || t === "integer" && ts.includes("number");
    }
    __name(includesType, "includesType");
    function narrowSchemaTypes(it, withTypes) {
      const ts = [];
      for (const t of it.dataTypes) {
        if (includesType(withTypes, t))
          ts.push(t);
        else if (withTypes.includes("integer") && t === "number")
          ts.push("integer");
      }
      it.dataTypes = ts;
    }
    __name(narrowSchemaTypes, "narrowSchemaTypes");
    function strictTypesError(it, msg) {
      const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
      msg += ` at "${schemaPath}" (strictTypes)`;
      (0, util_1.checkStrictMode)(it, msg, it.opts.strictTypes);
    }
    __name(strictTypesError, "strictTypesError");
    var KeywordCxt = class {
      static {
        __name(this, "KeywordCxt");
      }
      constructor(it, def, keyword) {
        (0, keyword_1.validateKeywordUsage)(it, def, keyword);
        this.gen = it.gen;
        this.allErrors = it.allErrors;
        this.keyword = keyword;
        this.data = it.data;
        this.schema = it.schema[keyword];
        this.$data = def.$data && it.opts.$data && this.schema && this.schema.$data;
        this.schemaValue = (0, util_1.schemaRefOrVal)(it, this.schema, keyword, this.$data);
        this.schemaType = def.schemaType;
        this.parentSchema = it.schema;
        this.params = {};
        this.it = it;
        this.def = def;
        if (this.$data) {
          this.schemaCode = it.gen.const("vSchema", getData(this.$data, it));
        } else {
          this.schemaCode = this.schemaValue;
          if (!(0, keyword_1.validSchemaType)(this.schema, def.schemaType, def.allowUndefined)) {
            throw new Error(`${keyword} value must be ${JSON.stringify(def.schemaType)}`);
          }
        }
        if ("code" in def ? def.trackErrors : def.errors !== false) {
          this.errsCount = it.gen.const("_errs", names_1.default.errors);
        }
      }
      result(condition, successAction, failAction) {
        this.failResult((0, codegen_1.not)(condition), successAction, failAction);
      }
      failResult(condition, successAction, failAction) {
        this.gen.if(condition);
        if (failAction)
          failAction();
        else
          this.error();
        if (successAction) {
          this.gen.else();
          successAction();
          if (this.allErrors)
            this.gen.endIf();
        } else {
          if (this.allErrors)
            this.gen.endIf();
          else
            this.gen.else();
        }
      }
      pass(condition, failAction) {
        this.failResult((0, codegen_1.not)(condition), void 0, failAction);
      }
      fail(condition) {
        if (condition === void 0) {
          this.error();
          if (!this.allErrors)
            this.gen.if(false);
          return;
        }
        this.gen.if(condition);
        this.error();
        if (this.allErrors)
          this.gen.endIf();
        else
          this.gen.else();
      }
      fail$data(condition) {
        if (!this.$data)
          return this.fail(condition);
        const { schemaCode } = this;
        this.fail((0, codegen_1._)`${schemaCode} !== undefined && (${(0, codegen_1.or)(this.invalid$data(), condition)})`);
      }
      error(append, errorParams, errorPaths) {
        if (errorParams) {
          this.setParams(errorParams);
          this._error(append, errorPaths);
          this.setParams({});
          return;
        }
        this._error(append, errorPaths);
      }
      _error(append, errorPaths) {
        ;
        (append ? errors_1.reportExtraError : errors_1.reportError)(this, this.def.error, errorPaths);
      }
      $dataError() {
        (0, errors_1.reportError)(this, this.def.$dataError || errors_1.keyword$DataError);
      }
      reset() {
        if (this.errsCount === void 0)
          throw new Error('add "trackErrors" to keyword definition');
        (0, errors_1.resetErrorsCount)(this.gen, this.errsCount);
      }
      ok(cond) {
        if (!this.allErrors)
          this.gen.if(cond);
      }
      setParams(obj, assign) {
        if (assign)
          Object.assign(this.params, obj);
        else
          this.params = obj;
      }
      block$data(valid, codeBlock, $dataValid = codegen_1.nil) {
        this.gen.block(() => {
          this.check$data(valid, $dataValid);
          codeBlock();
        });
      }
      check$data(valid = codegen_1.nil, $dataValid = codegen_1.nil) {
        if (!this.$data)
          return;
        const { gen, schemaCode, schemaType, def } = this;
        gen.if((0, codegen_1.or)((0, codegen_1._)`${schemaCode} === undefined`, $dataValid));
        if (valid !== codegen_1.nil)
          gen.assign(valid, true);
        if (schemaType.length || def.validateSchema) {
          gen.elseIf(this.invalid$data());
          this.$dataError();
          if (valid !== codegen_1.nil)
            gen.assign(valid, false);
        }
        gen.else();
      }
      invalid$data() {
        const { gen, schemaCode, schemaType, def, it } = this;
        return (0, codegen_1.or)(wrong$DataType(), invalid$DataSchema());
        function wrong$DataType() {
          if (schemaType.length) {
            if (!(schemaCode instanceof codegen_1.Name))
              throw new Error("ajv implementation error");
            const st = Array.isArray(schemaType) ? schemaType : [schemaType];
            return (0, codegen_1._)`${(0, dataType_2.checkDataTypes)(st, schemaCode, it.opts.strictNumbers, dataType_2.DataType.Wrong)}`;
          }
          return codegen_1.nil;
        }
        __name(wrong$DataType, "wrong$DataType");
        function invalid$DataSchema() {
          if (def.validateSchema) {
            const validateSchemaRef = gen.scopeValue("validate$data", { ref: def.validateSchema });
            return (0, codegen_1._)`!${validateSchemaRef}(${schemaCode})`;
          }
          return codegen_1.nil;
        }
        __name(invalid$DataSchema, "invalid$DataSchema");
      }
      subschema(appl, valid) {
        const subschema = (0, subschema_1.getSubschema)(this.it, appl);
        (0, subschema_1.extendSubschemaData)(subschema, this.it, appl);
        (0, subschema_1.extendSubschemaMode)(subschema, appl);
        const nextContext = { ...this.it, ...subschema, items: void 0, props: void 0 };
        subschemaCode(nextContext, valid);
        return nextContext;
      }
      mergeEvaluated(schemaCxt, toName) {
        const { it, gen } = this;
        if (!it.opts.unevaluated)
          return;
        if (it.props !== true && schemaCxt.props !== void 0) {
          it.props = util_1.mergeEvaluated.props(gen, schemaCxt.props, it.props, toName);
        }
        if (it.items !== true && schemaCxt.items !== void 0) {
          it.items = util_1.mergeEvaluated.items(gen, schemaCxt.items, it.items, toName);
        }
      }
      mergeValidEvaluated(schemaCxt, valid) {
        const { it, gen } = this;
        if (it.opts.unevaluated && (it.props !== true || it.items !== true)) {
          gen.if(valid, () => this.mergeEvaluated(schemaCxt, codegen_1.Name));
          return true;
        }
      }
    };
    exports.KeywordCxt = KeywordCxt;
    function keywordCode(it, keyword, def, ruleType) {
      const cxt = new KeywordCxt(it, def, keyword);
      if ("code" in def) {
        def.code(cxt, ruleType);
      } else if (cxt.$data && def.validate) {
        (0, keyword_1.funcKeywordCode)(cxt, def);
      } else if ("macro" in def) {
        (0, keyword_1.macroKeywordCode)(cxt, def);
      } else if (def.compile || def.validate) {
        (0, keyword_1.funcKeywordCode)(cxt, def);
      }
    }
    __name(keywordCode, "keywordCode");
    var JSON_POINTER = /^\/(?:[^~]|~0|~1)*$/;
    var RELATIVE_JSON_POINTER = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
    function getData($data, { dataLevel, dataNames, dataPathArr }) {
      let jsonPointer;
      let data;
      if ($data === "")
        return names_1.default.rootData;
      if ($data[0] === "/") {
        if (!JSON_POINTER.test($data))
          throw new Error(`Invalid JSON-pointer: ${$data}`);
        jsonPointer = $data;
        data = names_1.default.rootData;
      } else {
        const matches = RELATIVE_JSON_POINTER.exec($data);
        if (!matches)
          throw new Error(`Invalid JSON-pointer: ${$data}`);
        const up = +matches[1];
        jsonPointer = matches[2];
        if (jsonPointer === "#") {
          if (up >= dataLevel)
            throw new Error(errorMsg("property/index", up));
          return dataPathArr[dataLevel - up];
        }
        if (up > dataLevel)
          throw new Error(errorMsg("data", up));
        data = dataNames[dataLevel - up];
        if (!jsonPointer)
          return data;
      }
      let expr = data;
      const segments = jsonPointer.split("/");
      for (const segment of segments) {
        if (segment) {
          data = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)((0, util_1.unescapeJsonPointer)(segment))}`;
          expr = (0, codegen_1._)`${expr} && ${data}`;
        }
      }
      return expr;
      function errorMsg(pointerType, up) {
        return `Cannot access ${pointerType} ${up} levels up, current level is ${dataLevel}`;
      }
      __name(errorMsg, "errorMsg");
    }
    __name(getData, "getData");
    exports.getData = getData;
  }
});

// node_modules/ajv/dist/runtime/validation_error.js
var require_validation_error = __commonJS({
  "node_modules/ajv/dist/runtime/validation_error.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ValidationError = class extends Error {
      static {
        __name(this, "ValidationError");
      }
      constructor(errors) {
        super("validation failed");
        this.errors = errors;
        this.ajv = this.validation = true;
      }
    };
    exports.default = ValidationError;
  }
});

// node_modules/ajv/dist/compile/ref_error.js
var require_ref_error = __commonJS({
  "node_modules/ajv/dist/compile/ref_error.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var resolve_1 = require_resolve();
    var MissingRefError = class extends Error {
      static {
        __name(this, "MissingRefError");
      }
      constructor(resolver, baseId, ref, msg) {
        super(msg || `can't resolve reference ${ref} from id ${baseId}`);
        this.missingRef = (0, resolve_1.resolveUrl)(resolver, baseId, ref);
        this.missingSchema = (0, resolve_1.normalizeId)((0, resolve_1.getFullPath)(resolver, this.missingRef));
      }
    };
    exports.default = MissingRefError;
  }
});

// node_modules/ajv/dist/compile/index.js
var require_compile = __commonJS({
  "node_modules/ajv/dist/compile/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolveSchema = exports.getCompilingSchema = exports.resolveRef = exports.compileSchema = exports.SchemaEnv = void 0;
    var codegen_1 = require_codegen();
    var validation_error_1 = require_validation_error();
    var names_1 = require_names();
    var resolve_1 = require_resolve();
    var util_1 = require_util();
    var validate_1 = require_validate();
    var SchemaEnv = class {
      static {
        __name(this, "SchemaEnv");
      }
      constructor(env) {
        var _a;
        this.refs = {};
        this.dynamicAnchors = {};
        let schema;
        if (typeof env.schema == "object")
          schema = env.schema;
        this.schema = env.schema;
        this.schemaId = env.schemaId;
        this.root = env.root || this;
        this.baseId = (_a = env.baseId) !== null && _a !== void 0 ? _a : (0, resolve_1.normalizeId)(schema === null || schema === void 0 ? void 0 : schema[env.schemaId || "$id"]);
        this.schemaPath = env.schemaPath;
        this.localRefs = env.localRefs;
        this.meta = env.meta;
        this.$async = schema === null || schema === void 0 ? void 0 : schema.$async;
        this.refs = {};
      }
    };
    exports.SchemaEnv = SchemaEnv;
    function compileSchema(sch) {
      const _sch = getCompilingSchema.call(this, sch);
      if (_sch)
        return _sch;
      const rootId = (0, resolve_1.getFullPath)(this.opts.uriResolver, sch.root.baseId);
      const { es5, lines } = this.opts.code;
      const { ownProperties } = this.opts;
      const gen = new codegen_1.CodeGen(this.scope, { es5, lines, ownProperties });
      let _ValidationError;
      if (sch.$async) {
        _ValidationError = gen.scopeValue("Error", {
          ref: validation_error_1.default,
          code: (0, codegen_1._)`require("ajv/dist/runtime/validation_error").default`
        });
      }
      const validateName = gen.scopeName("validate");
      sch.validateName = validateName;
      const schemaCxt = {
        gen,
        allErrors: this.opts.allErrors,
        data: names_1.default.data,
        parentData: names_1.default.parentData,
        parentDataProperty: names_1.default.parentDataProperty,
        dataNames: [names_1.default.data],
        dataPathArr: [codegen_1.nil],
        // TODO can its length be used as dataLevel if nil is removed?
        dataLevel: 0,
        dataTypes: [],
        definedProperties: /* @__PURE__ */ new Set(),
        topSchemaRef: gen.scopeValue("schema", this.opts.code.source === true ? { ref: sch.schema, code: (0, codegen_1.stringify)(sch.schema) } : { ref: sch.schema }),
        validateName,
        ValidationError: _ValidationError,
        schema: sch.schema,
        schemaEnv: sch,
        rootId,
        baseId: sch.baseId || rootId,
        schemaPath: codegen_1.nil,
        errSchemaPath: sch.schemaPath || (this.opts.jtd ? "" : "#"),
        errorPath: (0, codegen_1._)`""`,
        opts: this.opts,
        self: this
      };
      let sourceCode;
      try {
        this._compilations.add(sch);
        (0, validate_1.validateFunctionCode)(schemaCxt);
        gen.optimize(this.opts.code.optimize);
        const validateCode = gen.toString();
        sourceCode = `${gen.scopeRefs(names_1.default.scope)}return ${validateCode}`;
        if (this.opts.code.process)
          sourceCode = this.opts.code.process(sourceCode, sch);
        const makeValidate = new Function(`${names_1.default.self}`, `${names_1.default.scope}`, sourceCode);
        const validate3 = makeValidate(this, this.scope.get());
        this.scope.value(validateName, { ref: validate3 });
        validate3.errors = null;
        validate3.schema = sch.schema;
        validate3.schemaEnv = sch;
        if (sch.$async)
          validate3.$async = true;
        if (this.opts.code.source === true) {
          validate3.source = { validateName, validateCode, scopeValues: gen._values };
        }
        if (this.opts.unevaluated) {
          const { props, items } = schemaCxt;
          validate3.evaluated = {
            props: props instanceof codegen_1.Name ? void 0 : props,
            items: items instanceof codegen_1.Name ? void 0 : items,
            dynamicProps: props instanceof codegen_1.Name,
            dynamicItems: items instanceof codegen_1.Name
          };
          if (validate3.source)
            validate3.source.evaluated = (0, codegen_1.stringify)(validate3.evaluated);
        }
        sch.validate = validate3;
        return sch;
      } catch (e) {
        delete sch.validate;
        delete sch.validateName;
        if (sourceCode)
          this.logger.error("Error compiling schema, function code:", sourceCode);
        throw e;
      } finally {
        this._compilations.delete(sch);
      }
    }
    __name(compileSchema, "compileSchema");
    exports.compileSchema = compileSchema;
    function resolveRef(root, baseId, ref) {
      var _a;
      ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, ref);
      const schOrFunc = root.refs[ref];
      if (schOrFunc)
        return schOrFunc;
      let _sch = resolve.call(this, root, ref);
      if (_sch === void 0) {
        const schema = (_a = root.localRefs) === null || _a === void 0 ? void 0 : _a[ref];
        const { schemaId } = this.opts;
        if (schema)
          _sch = new SchemaEnv({ schema, schemaId, root, baseId });
      }
      if (_sch === void 0)
        return;
      return root.refs[ref] = inlineOrCompile.call(this, _sch);
    }
    __name(resolveRef, "resolveRef");
    exports.resolveRef = resolveRef;
    function inlineOrCompile(sch) {
      if ((0, resolve_1.inlineRef)(sch.schema, this.opts.inlineRefs))
        return sch.schema;
      return sch.validate ? sch : compileSchema.call(this, sch);
    }
    __name(inlineOrCompile, "inlineOrCompile");
    function getCompilingSchema(schEnv) {
      for (const sch of this._compilations) {
        if (sameSchemaEnv(sch, schEnv))
          return sch;
      }
    }
    __name(getCompilingSchema, "getCompilingSchema");
    exports.getCompilingSchema = getCompilingSchema;
    function sameSchemaEnv(s1, s2) {
      return s1.schema === s2.schema && s1.root === s2.root && s1.baseId === s2.baseId;
    }
    __name(sameSchemaEnv, "sameSchemaEnv");
    function resolve(root, ref) {
      let sch;
      while (typeof (sch = this.refs[ref]) == "string")
        ref = sch;
      return sch || this.schemas[ref] || resolveSchema.call(this, root, ref);
    }
    __name(resolve, "resolve");
    function resolveSchema(root, ref) {
      const p = this.opts.uriResolver.parse(ref);
      const refPath = (0, resolve_1._getFullPath)(this.opts.uriResolver, p);
      let baseId = (0, resolve_1.getFullPath)(this.opts.uriResolver, root.baseId, void 0);
      if (Object.keys(root.schema).length > 0 && refPath === baseId) {
        return getJsonPointer.call(this, p, root);
      }
      const id = (0, resolve_1.normalizeId)(refPath);
      const schOrRef = this.refs[id] || this.schemas[id];
      if (typeof schOrRef == "string") {
        const sch = resolveSchema.call(this, root, schOrRef);
        if (typeof (sch === null || sch === void 0 ? void 0 : sch.schema) !== "object")
          return;
        return getJsonPointer.call(this, p, sch);
      }
      if (typeof (schOrRef === null || schOrRef === void 0 ? void 0 : schOrRef.schema) !== "object")
        return;
      if (!schOrRef.validate)
        compileSchema.call(this, schOrRef);
      if (id === (0, resolve_1.normalizeId)(ref)) {
        const { schema } = schOrRef;
        const { schemaId } = this.opts;
        const schId = schema[schemaId];
        if (schId)
          baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
        return new SchemaEnv({ schema, schemaId, root, baseId });
      }
      return getJsonPointer.call(this, p, schOrRef);
    }
    __name(resolveSchema, "resolveSchema");
    exports.resolveSchema = resolveSchema;
    var PREVENT_SCOPE_CHANGE = /* @__PURE__ */ new Set([
      "properties",
      "patternProperties",
      "enum",
      "dependencies",
      "definitions"
    ]);
    function getJsonPointer(parsedRef, { baseId, schema, root }) {
      var _a;
      if (((_a = parsedRef.fragment) === null || _a === void 0 ? void 0 : _a[0]) !== "/")
        return;
      for (const part of parsedRef.fragment.slice(1).split("/")) {
        if (typeof schema === "boolean")
          return;
        const partSchema = schema[(0, util_1.unescapeFragment)(part)];
        if (partSchema === void 0)
          return;
        schema = partSchema;
        const schId = typeof schema === "object" && schema[this.opts.schemaId];
        if (!PREVENT_SCOPE_CHANGE.has(part) && schId) {
          baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
        }
      }
      let env;
      if (typeof schema != "boolean" && schema.$ref && !(0, util_1.schemaHasRulesButRef)(schema, this.RULES)) {
        const $ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schema.$ref);
        env = resolveSchema.call(this, root, $ref);
      }
      const { schemaId } = this.opts;
      env = env || new SchemaEnv({ schema, schemaId, root, baseId });
      if (env.schema !== env.root.schema)
        return env;
      return void 0;
    }
    __name(getJsonPointer, "getJsonPointer");
  }
});

// node_modules/ajv/dist/refs/data.json
var require_data = __commonJS({
  "node_modules/ajv/dist/refs/data.json"(exports, module) {
    module.exports = {
      $id: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#",
      description: "Meta-schema for $data reference (JSON AnySchema extension proposal)",
      type: "object",
      required: ["$data"],
      properties: {
        $data: {
          type: "string",
          anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }]
        }
      },
      additionalProperties: false
    };
  }
});

// node_modules/fast-uri/lib/utils.js
var require_utils = __commonJS({
  "node_modules/fast-uri/lib/utils.js"(exports, module) {
    "use strict";
    var isUUID = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu);
    var isIPv4 = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
    var isHexPair = RegExp.prototype.test.bind(/^[\da-f]{2}$/iu);
    var isUnreserved = RegExp.prototype.test.bind(/^[\da-z\-._~]$/iu);
    var isPathCharacter = RegExp.prototype.test.bind(/^[\da-z\-._~!$&'()*+,;=:@/]$/iu);
    function stringArrayToHexStripped(input) {
      let acc = "";
      let code = 0;
      let i = 0;
      for (i = 0; i < input.length; i++) {
        code = input[i].charCodeAt(0);
        if (code === 48) {
          continue;
        }
        if (!(code >= 48 && code <= 57 || code >= 65 && code <= 70 || code >= 97 && code <= 102)) {
          return "";
        }
        acc += input[i];
        break;
      }
      for (i += 1; i < input.length; i++) {
        code = input[i].charCodeAt(0);
        if (!(code >= 48 && code <= 57 || code >= 65 && code <= 70 || code >= 97 && code <= 102)) {
          return "";
        }
        acc += input[i];
      }
      return acc;
    }
    __name(stringArrayToHexStripped, "stringArrayToHexStripped");
    var nonSimpleDomain = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
    function consumeIsZone(buffer) {
      buffer.length = 0;
      return true;
    }
    __name(consumeIsZone, "consumeIsZone");
    function consumeHextets(buffer, address, output) {
      if (buffer.length) {
        const hex = stringArrayToHexStripped(buffer);
        if (hex !== "") {
          address.push(hex);
        } else {
          output.error = true;
          return false;
        }
        buffer.length = 0;
      }
      return true;
    }
    __name(consumeHextets, "consumeHextets");
    function getIPV6(input) {
      let tokenCount = 0;
      const output = { error: false, address: "", zone: "" };
      const address = [];
      const buffer = [];
      let endipv6Encountered = false;
      let endIpv6 = false;
      let consume = consumeHextets;
      for (let i = 0; i < input.length; i++) {
        const cursor = input[i];
        if (cursor === "[" || cursor === "]") {
          continue;
        }
        if (cursor === ":") {
          if (endipv6Encountered === true) {
            endIpv6 = true;
          }
          if (!consume(buffer, address, output)) {
            break;
          }
          if (++tokenCount > 7) {
            output.error = true;
            break;
          }
          if (i > 0 && input[i - 1] === ":") {
            endipv6Encountered = true;
          }
          address.push(":");
          continue;
        } else if (cursor === "%") {
          if (!consume(buffer, address, output)) {
            break;
          }
          consume = consumeIsZone;
        } else {
          buffer.push(cursor);
          continue;
        }
      }
      if (buffer.length) {
        if (consume === consumeIsZone) {
          output.zone = buffer.join("");
        } else if (endIpv6) {
          address.push(buffer.join(""));
        } else {
          address.push(stringArrayToHexStripped(buffer));
        }
      }
      output.address = address.join("");
      return output;
    }
    __name(getIPV6, "getIPV6");
    function normalizeIPv6(host) {
      if (findToken(host, ":") < 2) {
        return { host, isIPV6: false };
      }
      const ipv6 = getIPV6(host);
      if (!ipv6.error) {
        let newHost = ipv6.address;
        let escapedHost = ipv6.address;
        if (ipv6.zone) {
          newHost += "%" + ipv6.zone;
          escapedHost += "%25" + ipv6.zone;
        }
        return { host: newHost, isIPV6: true, escapedHost };
      } else {
        return { host, isIPV6: false };
      }
    }
    __name(normalizeIPv6, "normalizeIPv6");
    function findToken(str, token) {
      let ind = 0;
      for (let i = 0; i < str.length; i++) {
        if (str[i] === token) ind++;
      }
      return ind;
    }
    __name(findToken, "findToken");
    function removeDotSegments(path) {
      let input = path;
      const output = [];
      let nextSlash = -1;
      let len = 0;
      while (len = input.length) {
        if (len === 1) {
          if (input === ".") {
            break;
          } else if (input === "/") {
            output.push("/");
            break;
          } else {
            output.push(input);
            break;
          }
        } else if (len === 2) {
          if (input[0] === ".") {
            if (input[1] === ".") {
              break;
            } else if (input[1] === "/") {
              input = input.slice(2);
              continue;
            }
          } else if (input[0] === "/") {
            if (input[1] === "." || input[1] === "/") {
              output.push("/");
              break;
            }
          }
        } else if (len === 3) {
          if (input === "/..") {
            if (output.length !== 0) {
              output.pop();
            }
            output.push("/");
            break;
          }
        }
        if (input[0] === ".") {
          if (input[1] === ".") {
            if (input[2] === "/") {
              input = input.slice(3);
              continue;
            }
          } else if (input[1] === "/") {
            input = input.slice(2);
            continue;
          }
        } else if (input[0] === "/") {
          if (input[1] === ".") {
            if (input[2] === "/") {
              input = input.slice(2);
              continue;
            } else if (input[2] === ".") {
              if (input[3] === "/") {
                input = input.slice(3);
                if (output.length !== 0) {
                  output.pop();
                }
                continue;
              }
            }
          }
        }
        if ((nextSlash = input.indexOf("/", 1)) === -1) {
          output.push(input);
          break;
        } else {
          output.push(input.slice(0, nextSlash));
          input = input.slice(nextSlash);
        }
      }
      return output.join("");
    }
    __name(removeDotSegments, "removeDotSegments");
    var HOST_DELIMS = { "@": "%40", "/": "%2F", "?": "%3F", "#": "%23", ":": "%3A" };
    var HOST_DELIM_RE = /[@/?#:]/g;
    var HOST_DELIM_NO_COLON_RE = /[@/?#]/g;
    function reescapeHostDelimiters(host, isIP) {
      const re = isIP ? HOST_DELIM_NO_COLON_RE : HOST_DELIM_RE;
      re.lastIndex = 0;
      return host.replace(re, (ch) => HOST_DELIMS[ch]);
    }
    __name(reescapeHostDelimiters, "reescapeHostDelimiters");
    function normalizePercentEncoding(input, decodeUnreserved = false) {
      if (input.indexOf("%") === -1) {
        return input;
      }
      let output = "";
      for (let i = 0; i < input.length; i++) {
        if (input[i] === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            const normalizedHex = hex.toUpperCase();
            const decoded = String.fromCharCode(parseInt(normalizedHex, 16));
            if (decodeUnreserved && isUnreserved(decoded)) {
              output += decoded;
            } else {
              output += "%" + normalizedHex;
            }
            i += 2;
            continue;
          }
        }
        output += input[i];
      }
      return output;
    }
    __name(normalizePercentEncoding, "normalizePercentEncoding");
    function normalizePathEncoding(input) {
      let output = "";
      for (let i = 0; i < input.length; i++) {
        if (input[i] === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            const normalizedHex = hex.toUpperCase();
            const decoded = String.fromCharCode(parseInt(normalizedHex, 16));
            if (decoded !== "." && isUnreserved(decoded)) {
              output += decoded;
            } else {
              output += "%" + normalizedHex;
            }
            i += 2;
            continue;
          }
        }
        if (isPathCharacter(input[i])) {
          output += input[i];
        } else {
          output += escape(input[i]);
        }
      }
      return output;
    }
    __name(normalizePathEncoding, "normalizePathEncoding");
    function escapePreservingEscapes(input) {
      let output = "";
      for (let i = 0; i < input.length; i++) {
        if (input[i] === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            output += "%" + hex.toUpperCase();
            i += 2;
            continue;
          }
        }
        output += escape(input[i]);
      }
      return output;
    }
    __name(escapePreservingEscapes, "escapePreservingEscapes");
    function recomposeAuthority(component) {
      const uriTokens = [];
      if (component.userinfo !== void 0) {
        uriTokens.push(component.userinfo);
        uriTokens.push("@");
      }
      if (component.host !== void 0) {
        let host = unescape(component.host);
        if (!isIPv4(host)) {
          const ipV6res = normalizeIPv6(host);
          if (ipV6res.isIPV6 === true) {
            host = `[${ipV6res.escapedHost}]`;
          } else {
            host = reescapeHostDelimiters(host, false);
          }
        }
        uriTokens.push(host);
      }
      if (typeof component.port === "number" || typeof component.port === "string") {
        uriTokens.push(":");
        uriTokens.push(String(component.port));
      }
      return uriTokens.length ? uriTokens.join("") : void 0;
    }
    __name(recomposeAuthority, "recomposeAuthority");
    module.exports = {
      nonSimpleDomain,
      recomposeAuthority,
      reescapeHostDelimiters,
      normalizePercentEncoding,
      normalizePathEncoding,
      escapePreservingEscapes,
      removeDotSegments,
      isIPv4,
      isUUID,
      normalizeIPv6,
      stringArrayToHexStripped
    };
  }
});

// node_modules/fast-uri/lib/schemes.js
var require_schemes = __commonJS({
  "node_modules/fast-uri/lib/schemes.js"(exports, module) {
    "use strict";
    var { isUUID } = require_utils();
    var URN_REG = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
    var supportedSchemeNames = (
      /** @type {const} */
      [
        "http",
        "https",
        "ws",
        "wss",
        "urn",
        "urn:uuid"
      ]
    );
    function isValidSchemeName(name) {
      return supportedSchemeNames.indexOf(
        /** @type {*} */
        name
      ) !== -1;
    }
    __name(isValidSchemeName, "isValidSchemeName");
    function wsIsSecure(wsComponent) {
      if (wsComponent.secure === true) {
        return true;
      } else if (wsComponent.secure === false) {
        return false;
      } else if (wsComponent.scheme) {
        return wsComponent.scheme.length === 3 && (wsComponent.scheme[0] === "w" || wsComponent.scheme[0] === "W") && (wsComponent.scheme[1] === "s" || wsComponent.scheme[1] === "S") && (wsComponent.scheme[2] === "s" || wsComponent.scheme[2] === "S");
      } else {
        return false;
      }
    }
    __name(wsIsSecure, "wsIsSecure");
    function httpParse(component) {
      if (!component.host) {
        component.error = component.error || "HTTP URIs must have a host.";
      }
      return component;
    }
    __name(httpParse, "httpParse");
    function httpSerialize(component) {
      const secure = String(component.scheme).toLowerCase() === "https";
      if (component.port === (secure ? 443 : 80) || component.port === "") {
        component.port = void 0;
      }
      if (!component.path) {
        component.path = "/";
      }
      return component;
    }
    __name(httpSerialize, "httpSerialize");
    function wsParse(wsComponent) {
      wsComponent.secure = wsIsSecure(wsComponent);
      wsComponent.resourceName = (wsComponent.path || "/") + (wsComponent.query ? "?" + wsComponent.query : "");
      wsComponent.path = void 0;
      wsComponent.query = void 0;
      return wsComponent;
    }
    __name(wsParse, "wsParse");
    function wsSerialize(wsComponent) {
      if (wsComponent.port === (wsIsSecure(wsComponent) ? 443 : 80) || wsComponent.port === "") {
        wsComponent.port = void 0;
      }
      if (typeof wsComponent.secure === "boolean") {
        wsComponent.scheme = wsComponent.secure ? "wss" : "ws";
        wsComponent.secure = void 0;
      }
      if (wsComponent.resourceName) {
        const [path, query] = wsComponent.resourceName.split("?");
        wsComponent.path = path && path !== "/" ? path : void 0;
        wsComponent.query = query;
        wsComponent.resourceName = void 0;
      }
      wsComponent.fragment = void 0;
      return wsComponent;
    }
    __name(wsSerialize, "wsSerialize");
    function urnParse(urnComponent, options) {
      if (!urnComponent.path) {
        urnComponent.error = "URN can not be parsed";
        return urnComponent;
      }
      const matches = urnComponent.path.match(URN_REG);
      if (matches) {
        const scheme = options.scheme || urnComponent.scheme || "urn";
        urnComponent.nid = matches[1].toLowerCase();
        urnComponent.nss = matches[2];
        const urnScheme = `${scheme}:${options.nid || urnComponent.nid}`;
        const schemeHandler = getSchemeHandler(urnScheme);
        urnComponent.path = void 0;
        if (schemeHandler) {
          urnComponent = schemeHandler.parse(urnComponent, options);
        }
      } else {
        urnComponent.error = urnComponent.error || "URN can not be parsed.";
      }
      return urnComponent;
    }
    __name(urnParse, "urnParse");
    function urnSerialize(urnComponent, options) {
      if (urnComponent.nid === void 0) {
        throw new Error("URN without nid cannot be serialized");
      }
      const scheme = options.scheme || urnComponent.scheme || "urn";
      const nid = urnComponent.nid.toLowerCase();
      const urnScheme = `${scheme}:${options.nid || nid}`;
      const schemeHandler = getSchemeHandler(urnScheme);
      if (schemeHandler) {
        urnComponent = schemeHandler.serialize(urnComponent, options);
      }
      const uriComponent = urnComponent;
      const nss = urnComponent.nss;
      uriComponent.path = `${nid || options.nid}:${nss}`;
      options.skipEscape = true;
      return uriComponent;
    }
    __name(urnSerialize, "urnSerialize");
    function urnuuidParse(urnComponent, options) {
      const uuidComponent = urnComponent;
      uuidComponent.uuid = uuidComponent.nss;
      uuidComponent.nss = void 0;
      if (!options.tolerant && (!uuidComponent.uuid || !isUUID(uuidComponent.uuid))) {
        uuidComponent.error = uuidComponent.error || "UUID is not valid.";
      }
      return uuidComponent;
    }
    __name(urnuuidParse, "urnuuidParse");
    function urnuuidSerialize(uuidComponent) {
      const urnComponent = uuidComponent;
      urnComponent.nss = (uuidComponent.uuid || "").toLowerCase();
      return urnComponent;
    }
    __name(urnuuidSerialize, "urnuuidSerialize");
    var http = (
      /** @type {SchemeHandler} */
      {
        scheme: "http",
        domainHost: true,
        parse: httpParse,
        serialize: httpSerialize
      }
    );
    var https = (
      /** @type {SchemeHandler} */
      {
        scheme: "https",
        domainHost: http.domainHost,
        parse: httpParse,
        serialize: httpSerialize
      }
    );
    var ws = (
      /** @type {SchemeHandler} */
      {
        scheme: "ws",
        domainHost: true,
        parse: wsParse,
        serialize: wsSerialize
      }
    );
    var wss = (
      /** @type {SchemeHandler} */
      {
        scheme: "wss",
        domainHost: ws.domainHost,
        parse: ws.parse,
        serialize: ws.serialize
      }
    );
    var urn = (
      /** @type {SchemeHandler} */
      {
        scheme: "urn",
        parse: urnParse,
        serialize: urnSerialize,
        skipNormalize: true
      }
    );
    var urnuuid = (
      /** @type {SchemeHandler} */
      {
        scheme: "urn:uuid",
        parse: urnuuidParse,
        serialize: urnuuidSerialize,
        skipNormalize: true
      }
    );
    var SCHEMES = (
      /** @type {Record<SchemeName, SchemeHandler>} */
      {
        http,
        https,
        ws,
        wss,
        urn,
        "urn:uuid": urnuuid
      }
    );
    Object.setPrototypeOf(SCHEMES, null);
    function getSchemeHandler(scheme) {
      return scheme && (SCHEMES[
        /** @type {SchemeName} */
        scheme
      ] || SCHEMES[
        /** @type {SchemeName} */
        scheme.toLowerCase()
      ]) || void 0;
    }
    __name(getSchemeHandler, "getSchemeHandler");
    module.exports = {
      wsIsSecure,
      SCHEMES,
      isValidSchemeName,
      getSchemeHandler
    };
  }
});

// node_modules/fast-uri/index.js
var require_fast_uri = __commonJS({
  "node_modules/fast-uri/index.js"(exports, module) {
    "use strict";
    var { normalizeIPv6, removeDotSegments, recomposeAuthority, normalizePercentEncoding, normalizePathEncoding, escapePreservingEscapes, reescapeHostDelimiters, isIPv4, nonSimpleDomain } = require_utils();
    var { SCHEMES, getSchemeHandler } = require_schemes();
    function normalize(uri, options) {
      if (typeof uri === "string") {
        uri = /** @type {T} */
        normalizeString(uri, options);
      } else if (typeof uri === "object") {
        uri = /** @type {T} */
        parse(serialize(uri, options), options);
      }
      return uri;
    }
    __name(normalize, "normalize");
    function resolve(baseURI, relativeURI, options) {
      const schemelessOptions = options ? Object.assign({ scheme: "null" }, options) : { scheme: "null" };
      const resolved = resolveComponent(parse(baseURI, schemelessOptions), parse(relativeURI, schemelessOptions), schemelessOptions, true);
      schemelessOptions.skipEscape = true;
      return serialize(resolved, schemelessOptions);
    }
    __name(resolve, "resolve");
    function resolveComponent(base, relative, options, skipNormalization) {
      const target2 = {};
      if (!skipNormalization) {
        base = parse(serialize(base, options), options);
        relative = parse(serialize(relative, options), options);
      }
      options = options || {};
      if (!options.tolerant && relative.scheme) {
        target2.scheme = relative.scheme;
        target2.userinfo = relative.userinfo;
        target2.host = relative.host;
        target2.port = relative.port;
        target2.path = removeDotSegments(relative.path || "");
        target2.query = relative.query;
      } else {
        if (relative.userinfo !== void 0 || relative.host !== void 0 || relative.port !== void 0) {
          target2.userinfo = relative.userinfo;
          target2.host = relative.host;
          target2.port = relative.port;
          target2.path = removeDotSegments(relative.path || "");
          target2.query = relative.query;
        } else {
          if (!relative.path) {
            target2.path = base.path;
            if (relative.query !== void 0) {
              target2.query = relative.query;
            } else {
              target2.query = base.query;
            }
          } else {
            if (relative.path[0] === "/") {
              target2.path = removeDotSegments(relative.path);
            } else {
              if ((base.userinfo !== void 0 || base.host !== void 0 || base.port !== void 0) && !base.path) {
                target2.path = "/" + relative.path;
              } else if (!base.path) {
                target2.path = relative.path;
              } else {
                target2.path = base.path.slice(0, base.path.lastIndexOf("/") + 1) + relative.path;
              }
              target2.path = removeDotSegments(target2.path);
            }
            target2.query = relative.query;
          }
          target2.userinfo = base.userinfo;
          target2.host = base.host;
          target2.port = base.port;
        }
        target2.scheme = base.scheme;
      }
      target2.fragment = relative.fragment;
      return target2;
    }
    __name(resolveComponent, "resolveComponent");
    function equal(uriA, uriB, options) {
      const normalizedA = normalizeComparableURI(uriA, options);
      const normalizedB = normalizeComparableURI(uriB, options);
      return normalizedA !== void 0 && normalizedB !== void 0 && normalizedA.toLowerCase() === normalizedB.toLowerCase();
    }
    __name(equal, "equal");
    function serialize(cmpts, opts) {
      const component = {
        host: cmpts.host,
        scheme: cmpts.scheme,
        userinfo: cmpts.userinfo,
        port: cmpts.port,
        path: cmpts.path,
        query: cmpts.query,
        nid: cmpts.nid,
        nss: cmpts.nss,
        uuid: cmpts.uuid,
        fragment: cmpts.fragment,
        reference: cmpts.reference,
        resourceName: cmpts.resourceName,
        secure: cmpts.secure,
        error: ""
      };
      const options = Object.assign({}, opts);
      const uriTokens = [];
      const schemeHandler = getSchemeHandler(options.scheme || component.scheme);
      if (schemeHandler && schemeHandler.serialize) schemeHandler.serialize(component, options);
      if (component.path !== void 0) {
        if (!options.skipEscape) {
          component.path = escapePreservingEscapes(component.path);
          if (component.scheme !== void 0) {
            component.path = component.path.split("%3A").join(":");
          }
        } else {
          component.path = normalizePercentEncoding(component.path);
        }
      }
      if (options.reference !== "suffix" && component.scheme) {
        uriTokens.push(component.scheme, ":");
      }
      const authority = recomposeAuthority(component);
      if (authority !== void 0) {
        if (options.reference !== "suffix") {
          uriTokens.push("//");
        }
        uriTokens.push(authority);
        if (component.path && component.path[0] !== "/") {
          uriTokens.push("/");
        }
      }
      if (component.path !== void 0) {
        let s = component.path;
        if (!options.absolutePath && (!schemeHandler || !schemeHandler.absolutePath)) {
          s = removeDotSegments(s);
        }
        if (authority === void 0 && s[0] === "/" && s[1] === "/") {
          s = "/%2F" + s.slice(2);
        }
        uriTokens.push(s);
      }
      if (component.query !== void 0) {
        uriTokens.push("?", component.query);
      }
      if (component.fragment !== void 0) {
        uriTokens.push("#", component.fragment);
      }
      return uriTokens.join("");
    }
    __name(serialize, "serialize");
    var URI_PARSE = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
    var AUTHORITY_PREFIX = /^(?:[^#/:?]+:)?\/\/([^/?#]*)/;
    function getParseError(parsed, matches) {
      if (matches[2] !== void 0 && parsed.path && parsed.path[0] !== "/") {
        return 'URI path must start with "/" when authority is present.';
      }
      if (typeof parsed.port === "number" && (parsed.port < 0 || parsed.port > 65535)) {
        return "URI port is malformed.";
      }
      return void 0;
    }
    __name(getParseError, "getParseError");
    function parseWithStatus(uri, opts) {
      const options = Object.assign({}, opts);
      const parsed = {
        scheme: void 0,
        userinfo: void 0,
        host: "",
        port: void 0,
        path: "",
        query: void 0,
        fragment: void 0
      };
      let malformedAuthorityOrPort = false;
      let isIP = false;
      if (options.reference === "suffix") {
        if (options.scheme) {
          uri = options.scheme + ":" + uri;
        } else {
          uri = "//" + uri;
        }
      }
      const authorityMatch = uri.match(AUTHORITY_PREFIX);
      if (authorityMatch !== null && authorityMatch[1].indexOf("\\") !== -1) {
        parsed.error = "URI authority must not contain a literal backslash.";
        malformedAuthorityOrPort = true;
      }
      const matches = uri.match(URI_PARSE);
      if (matches) {
        parsed.scheme = matches[1];
        parsed.userinfo = matches[3];
        parsed.host = matches[4];
        parsed.port = parseInt(matches[5], 10);
        parsed.path = matches[6] || "";
        parsed.query = matches[7];
        parsed.fragment = matches[8];
        if (isNaN(parsed.port)) {
          parsed.port = matches[5];
        }
        const parseError = getParseError(parsed, matches);
        if (parseError !== void 0) {
          parsed.error = parsed.error || parseError;
          malformedAuthorityOrPort = true;
        }
        if (parsed.host) {
          const ipv4result = isIPv4(parsed.host);
          if (ipv4result === false) {
            const ipv6result = normalizeIPv6(parsed.host);
            parsed.host = ipv6result.host.toLowerCase();
            isIP = ipv6result.isIPV6;
          } else {
            isIP = true;
          }
        }
        if (parsed.scheme === void 0 && parsed.userinfo === void 0 && parsed.host === void 0 && parsed.port === void 0 && parsed.query === void 0 && !parsed.path) {
          parsed.reference = "same-document";
        } else if (parsed.scheme === void 0) {
          parsed.reference = "relative";
        } else if (parsed.fragment === void 0) {
          parsed.reference = "absolute";
        } else {
          parsed.reference = "uri";
        }
        if (options.reference && options.reference !== "suffix" && options.reference !== parsed.reference) {
          parsed.error = parsed.error || "URI is not a " + options.reference + " reference.";
        }
        const schemeHandler = getSchemeHandler(options.scheme || parsed.scheme);
        if (!options.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport)) {
          if (parsed.host && (options.domainHost || schemeHandler && schemeHandler.domainHost) && isIP === false && nonSimpleDomain(parsed.host)) {
            try {
              parsed.host = new URL("http://" + parsed.host).hostname;
            } catch (e) {
              parsed.error = parsed.error || "Host's domain name can not be converted to ASCII: " + e;
            }
          }
        }
        if (!schemeHandler || schemeHandler && !schemeHandler.skipNormalize) {
          if (uri.indexOf("%") !== -1) {
            if (parsed.scheme !== void 0) {
              parsed.scheme = unescape(parsed.scheme);
            }
            if (parsed.host !== void 0) {
              parsed.host = reescapeHostDelimiters(unescape(parsed.host), isIP);
            }
          }
          if (parsed.path) {
            parsed.path = normalizePathEncoding(parsed.path);
          }
          if (parsed.fragment) {
            try {
              parsed.fragment = encodeURI(decodeURIComponent(parsed.fragment));
            } catch {
              parsed.error = parsed.error || "URI malformed";
            }
          }
        }
        if (schemeHandler && schemeHandler.parse) {
          schemeHandler.parse(parsed, options);
        }
      } else {
        parsed.error = parsed.error || "URI can not be parsed.";
      }
      return { parsed, malformedAuthorityOrPort };
    }
    __name(parseWithStatus, "parseWithStatus");
    function parse(uri, opts) {
      return parseWithStatus(uri, opts).parsed;
    }
    __name(parse, "parse");
    function normalizeString(uri, opts) {
      return normalizeStringWithStatus(uri, opts).normalized;
    }
    __name(normalizeString, "normalizeString");
    function normalizeStringWithStatus(uri, opts) {
      const { parsed, malformedAuthorityOrPort } = parseWithStatus(uri, opts);
      return {
        normalized: malformedAuthorityOrPort ? uri : serialize(parsed, opts),
        malformedAuthorityOrPort
      };
    }
    __name(normalizeStringWithStatus, "normalizeStringWithStatus");
    function normalizeComparableURI(uri, opts) {
      if (typeof uri === "string") {
        const { normalized, malformedAuthorityOrPort } = normalizeStringWithStatus(uri, opts);
        return malformedAuthorityOrPort ? void 0 : normalized;
      }
      if (typeof uri === "object") {
        return serialize(uri, opts);
      }
    }
    __name(normalizeComparableURI, "normalizeComparableURI");
    var fastUri = {
      SCHEMES,
      normalize,
      resolve,
      resolveComponent,
      equal,
      serialize,
      parse
    };
    module.exports = fastUri;
    module.exports.default = fastUri;
    module.exports.fastUri = fastUri;
  }
});

// node_modules/ajv/dist/runtime/uri.js
var require_uri = __commonJS({
  "node_modules/ajv/dist/runtime/uri.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var uri = require_fast_uri();
    uri.code = 'require("ajv/dist/runtime/uri").default';
    exports.default = uri;
  }
});

// node_modules/ajv/dist/core.js
var require_core = __commonJS({
  "node_modules/ajv/dist/core.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = void 0;
    var validate_1 = require_validate();
    Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return validate_1.KeywordCxt;
    }, "get") });
    var codegen_1 = require_codegen();
    Object.defineProperty(exports, "_", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return codegen_1._;
    }, "get") });
    Object.defineProperty(exports, "str", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return codegen_1.str;
    }, "get") });
    Object.defineProperty(exports, "stringify", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return codegen_1.stringify;
    }, "get") });
    Object.defineProperty(exports, "nil", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return codegen_1.nil;
    }, "get") });
    Object.defineProperty(exports, "Name", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return codegen_1.Name;
    }, "get") });
    Object.defineProperty(exports, "CodeGen", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return codegen_1.CodeGen;
    }, "get") });
    var validation_error_1 = require_validation_error();
    var ref_error_1 = require_ref_error();
    var rules_1 = require_rules();
    var compile_1 = require_compile();
    var codegen_2 = require_codegen();
    var resolve_1 = require_resolve();
    var dataType_1 = require_dataType();
    var util_1 = require_util();
    var $dataRefSchema = require_data();
    var uri_1 = require_uri();
    var defaultRegExp = /* @__PURE__ */ __name((str, flags) => new RegExp(str, flags), "defaultRegExp");
    defaultRegExp.code = "new RegExp";
    var META_IGNORE_OPTIONS = ["removeAdditional", "useDefaults", "coerceTypes"];
    var EXT_SCOPE_NAMES = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]);
    var removedOptions = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    };
    var deprecatedOptions = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    };
    var MAX_EXPRESSION = 200;
    function requiredOptions(o) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
      const s = o.strict;
      const _optz = (_a = o.code) === null || _a === void 0 ? void 0 : _a.optimize;
      const optimize = _optz === true || _optz === void 0 ? 1 : _optz || 0;
      const regExp = (_c = (_b = o.code) === null || _b === void 0 ? void 0 : _b.regExp) !== null && _c !== void 0 ? _c : defaultRegExp;
      const uriResolver = (_d = o.uriResolver) !== null && _d !== void 0 ? _d : uri_1.default;
      return {
        strictSchema: (_f = (_e = o.strictSchema) !== null && _e !== void 0 ? _e : s) !== null && _f !== void 0 ? _f : true,
        strictNumbers: (_h = (_g = o.strictNumbers) !== null && _g !== void 0 ? _g : s) !== null && _h !== void 0 ? _h : true,
        strictTypes: (_k = (_j = o.strictTypes) !== null && _j !== void 0 ? _j : s) !== null && _k !== void 0 ? _k : "log",
        strictTuples: (_m = (_l = o.strictTuples) !== null && _l !== void 0 ? _l : s) !== null && _m !== void 0 ? _m : "log",
        strictRequired: (_p = (_o = o.strictRequired) !== null && _o !== void 0 ? _o : s) !== null && _p !== void 0 ? _p : false,
        code: o.code ? { ...o.code, optimize, regExp } : { optimize, regExp },
        loopRequired: (_q = o.loopRequired) !== null && _q !== void 0 ? _q : MAX_EXPRESSION,
        loopEnum: (_r = o.loopEnum) !== null && _r !== void 0 ? _r : MAX_EXPRESSION,
        meta: (_s = o.meta) !== null && _s !== void 0 ? _s : true,
        messages: (_t = o.messages) !== null && _t !== void 0 ? _t : true,
        inlineRefs: (_u = o.inlineRefs) !== null && _u !== void 0 ? _u : true,
        schemaId: (_v = o.schemaId) !== null && _v !== void 0 ? _v : "$id",
        addUsedSchema: (_w = o.addUsedSchema) !== null && _w !== void 0 ? _w : true,
        validateSchema: (_x = o.validateSchema) !== null && _x !== void 0 ? _x : true,
        validateFormats: (_y = o.validateFormats) !== null && _y !== void 0 ? _y : true,
        unicodeRegExp: (_z = o.unicodeRegExp) !== null && _z !== void 0 ? _z : true,
        int32range: (_0 = o.int32range) !== null && _0 !== void 0 ? _0 : true,
        uriResolver
      };
    }
    __name(requiredOptions, "requiredOptions");
    var Ajv = class {
      static {
        __name(this, "Ajv");
      }
      constructor(opts = {}) {
        this.schemas = {};
        this.refs = {};
        this.formats = {};
        this._compilations = /* @__PURE__ */ new Set();
        this._loading = {};
        this._cache = /* @__PURE__ */ new Map();
        opts = this.opts = { ...opts, ...requiredOptions(opts) };
        const { es5, lines } = this.opts.code;
        this.scope = new codegen_2.ValueScope({ scope: {}, prefixes: EXT_SCOPE_NAMES, es5, lines });
        this.logger = getLogger(opts.logger);
        const formatOpt = opts.validateFormats;
        opts.validateFormats = false;
        this.RULES = (0, rules_1.getRules)();
        checkOptions.call(this, removedOptions, opts, "NOT SUPPORTED");
        checkOptions.call(this, deprecatedOptions, opts, "DEPRECATED", "warn");
        this._metaOpts = getMetaSchemaOptions.call(this);
        if (opts.formats)
          addInitialFormats.call(this);
        this._addVocabularies();
        this._addDefaultMetaSchema();
        if (opts.keywords)
          addInitialKeywords.call(this, opts.keywords);
        if (typeof opts.meta == "object")
          this.addMetaSchema(opts.meta);
        addInitialSchemas.call(this);
        opts.validateFormats = formatOpt;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data, meta, schemaId } = this.opts;
        let _dataRefSchema = $dataRefSchema;
        if (schemaId === "id") {
          _dataRefSchema = { ...$dataRefSchema };
          _dataRefSchema.id = _dataRefSchema.$id;
          delete _dataRefSchema.$id;
        }
        if (meta && $data)
          this.addMetaSchema(_dataRefSchema, _dataRefSchema[schemaId], false);
      }
      defaultMeta() {
        const { meta, schemaId } = this.opts;
        return this.opts.defaultMeta = typeof meta == "object" ? meta[schemaId] || meta : void 0;
      }
      validate(schemaKeyRef, data) {
        let v;
        if (typeof schemaKeyRef == "string") {
          v = this.getSchema(schemaKeyRef);
          if (!v)
            throw new Error(`no schema with key or ref "${schemaKeyRef}"`);
        } else {
          v = this.compile(schemaKeyRef);
        }
        const valid = v(data);
        if (!("$async" in v))
          this.errors = v.errors;
        return valid;
      }
      compile(schema, _meta) {
        const sch = this._addSchema(schema, _meta);
        return sch.validate || this._compileSchemaEnv(sch);
      }
      compileAsync(schema, meta) {
        if (typeof this.opts.loadSchema != "function") {
          throw new Error("options.loadSchema should be a function");
        }
        const { loadSchema } = this.opts;
        return runCompileAsync.call(this, schema, meta);
        async function runCompileAsync(_schema, _meta) {
          await loadMetaSchema.call(this, _schema.$schema);
          const sch = this._addSchema(_schema, _meta);
          return sch.validate || _compileAsync.call(this, sch);
        }
        __name(runCompileAsync, "runCompileAsync");
        async function loadMetaSchema($ref) {
          if ($ref && !this.getSchema($ref)) {
            await runCompileAsync.call(this, { $ref }, true);
          }
        }
        __name(loadMetaSchema, "loadMetaSchema");
        async function _compileAsync(sch) {
          try {
            return this._compileSchemaEnv(sch);
          } catch (e) {
            if (!(e instanceof ref_error_1.default))
              throw e;
            checkLoaded.call(this, e);
            await loadMissingSchema.call(this, e.missingSchema);
            return _compileAsync.call(this, sch);
          }
        }
        __name(_compileAsync, "_compileAsync");
        function checkLoaded({ missingSchema: ref, missingRef }) {
          if (this.refs[ref]) {
            throw new Error(`AnySchema ${ref} is loaded but ${missingRef} cannot be resolved`);
          }
        }
        __name(checkLoaded, "checkLoaded");
        async function loadMissingSchema(ref) {
          const _schema = await _loadSchema.call(this, ref);
          if (!this.refs[ref])
            await loadMetaSchema.call(this, _schema.$schema);
          if (!this.refs[ref])
            this.addSchema(_schema, ref, meta);
        }
        __name(loadMissingSchema, "loadMissingSchema");
        async function _loadSchema(ref) {
          const p = this._loading[ref];
          if (p)
            return p;
          try {
            return await (this._loading[ref] = loadSchema(ref));
          } finally {
            delete this._loading[ref];
          }
        }
        __name(_loadSchema, "_loadSchema");
      }
      // Adds schema to the instance
      addSchema(schema, key, _meta, _validateSchema = this.opts.validateSchema) {
        if (Array.isArray(schema)) {
          for (const sch of schema)
            this.addSchema(sch, void 0, _meta, _validateSchema);
          return this;
        }
        let id;
        if (typeof schema === "object") {
          const { schemaId } = this.opts;
          id = schema[schemaId];
          if (id !== void 0 && typeof id != "string") {
            throw new Error(`schema ${schemaId} must be string`);
          }
        }
        key = (0, resolve_1.normalizeId)(key || id);
        this._checkUnique(key);
        this.schemas[key] = this._addSchema(schema, _meta, key, _validateSchema, true);
        return this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(schema, key, _validateSchema = this.opts.validateSchema) {
        this.addSchema(schema, key, true, _validateSchema);
        return this;
      }
      //  Validate schema against its meta-schema
      validateSchema(schema, throwOrLogError) {
        if (typeof schema == "boolean")
          return true;
        let $schema;
        $schema = schema.$schema;
        if ($schema !== void 0 && typeof $schema != "string") {
          throw new Error("$schema must be a string");
        }
        $schema = $schema || this.opts.defaultMeta || this.defaultMeta();
        if (!$schema) {
          this.logger.warn("meta-schema not available");
          this.errors = null;
          return true;
        }
        const valid = this.validate($schema, schema);
        if (!valid && throwOrLogError) {
          const message2 = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(message2);
          else
            throw new Error(message2);
        }
        return valid;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(keyRef) {
        let sch;
        while (typeof (sch = getSchEnv.call(this, keyRef)) == "string")
          keyRef = sch;
        if (sch === void 0) {
          const { schemaId } = this.opts;
          const root = new compile_1.SchemaEnv({ schema: {}, schemaId });
          sch = compile_1.resolveSchema.call(this, root, keyRef);
          if (!sch)
            return;
          this.refs[keyRef] = sch;
        }
        return sch.validate || this._compileSchemaEnv(sch);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(schemaKeyRef) {
        if (schemaKeyRef instanceof RegExp) {
          this._removeAllSchemas(this.schemas, schemaKeyRef);
          this._removeAllSchemas(this.refs, schemaKeyRef);
          return this;
        }
        switch (typeof schemaKeyRef) {
          case "undefined":
            this._removeAllSchemas(this.schemas);
            this._removeAllSchemas(this.refs);
            this._cache.clear();
            return this;
          case "string": {
            const sch = getSchEnv.call(this, schemaKeyRef);
            if (typeof sch == "object")
              this._cache.delete(sch.schema);
            delete this.schemas[schemaKeyRef];
            delete this.refs[schemaKeyRef];
            return this;
          }
          case "object": {
            const cacheKey2 = schemaKeyRef;
            this._cache.delete(cacheKey2);
            let id = schemaKeyRef[this.opts.schemaId];
            if (id) {
              id = (0, resolve_1.normalizeId)(id);
              delete this.schemas[id];
              delete this.refs[id];
            }
            return this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(definitions) {
        for (const def of definitions)
          this.addKeyword(def);
        return this;
      }
      addKeyword(kwdOrDef, def) {
        let keyword;
        if (typeof kwdOrDef == "string") {
          keyword = kwdOrDef;
          if (typeof def == "object") {
            this.logger.warn("these parameters are deprecated, see docs for addKeyword");
            def.keyword = keyword;
          }
        } else if (typeof kwdOrDef == "object" && def === void 0) {
          def = kwdOrDef;
          keyword = def.keyword;
          if (Array.isArray(keyword) && !keyword.length) {
            throw new Error("addKeywords: keyword must be string or non-empty array");
          }
        } else {
          throw new Error("invalid addKeywords parameters");
        }
        checkKeyword.call(this, keyword, def);
        if (!def) {
          (0, util_1.eachItem)(keyword, (kwd) => addRule.call(this, kwd));
          return this;
        }
        keywordMetaschema.call(this, def);
        const definition = {
          ...def,
          type: (0, dataType_1.getJSONTypes)(def.type),
          schemaType: (0, dataType_1.getJSONTypes)(def.schemaType)
        };
        (0, util_1.eachItem)(keyword, definition.type.length === 0 ? (k) => addRule.call(this, k, definition) : (k) => definition.type.forEach((t) => addRule.call(this, k, definition, t)));
        return this;
      }
      getKeyword(keyword) {
        const rule = this.RULES.all[keyword];
        return typeof rule == "object" ? rule.definition : !!rule;
      }
      // Remove keyword
      removeKeyword(keyword) {
        const { RULES } = this;
        delete RULES.keywords[keyword];
        delete RULES.all[keyword];
        for (const group of RULES.rules) {
          const i = group.rules.findIndex((rule) => rule.keyword === keyword);
          if (i >= 0)
            group.rules.splice(i, 1);
        }
        return this;
      }
      // Add format
      addFormat(name, format) {
        if (typeof format == "string")
          format = new RegExp(format);
        this.formats[name] = format;
        return this;
      }
      errorsText(errors = this.errors, { separator = ", ", dataVar = "data" } = {}) {
        if (!errors || errors.length === 0)
          return "No errors";
        return errors.map((e) => `${dataVar}${e.instancePath} ${e.message}`).reduce((text, msg) => text + separator + msg);
      }
      $dataMetaSchema(metaSchema, keywordsJsonPointers) {
        const rules = this.RULES.all;
        metaSchema = JSON.parse(JSON.stringify(metaSchema));
        for (const jsonPointer of keywordsJsonPointers) {
          const segments = jsonPointer.split("/").slice(1);
          let keywords = metaSchema;
          for (const seg of segments)
            keywords = keywords[seg];
          for (const key in rules) {
            const rule = rules[key];
            if (typeof rule != "object")
              continue;
            const { $data } = rule.definition;
            const schema = keywords[key];
            if ($data && schema)
              keywords[key] = schemaOrData(schema);
          }
        }
        return metaSchema;
      }
      _removeAllSchemas(schemas, regex) {
        for (const keyRef in schemas) {
          const sch = schemas[keyRef];
          if (!regex || regex.test(keyRef)) {
            if (typeof sch == "string") {
              delete schemas[keyRef];
            } else if (sch && !sch.meta) {
              this._cache.delete(sch.schema);
              delete schemas[keyRef];
            }
          }
        }
      }
      _addSchema(schema, meta, baseId, validateSchema = this.opts.validateSchema, addSchema = this.opts.addUsedSchema) {
        let id;
        const { schemaId } = this.opts;
        if (typeof schema == "object") {
          id = schema[schemaId];
        } else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          else if (typeof schema != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let sch = this._cache.get(schema);
        if (sch !== void 0)
          return sch;
        baseId = (0, resolve_1.normalizeId)(id || baseId);
        const localRefs = resolve_1.getSchemaRefs.call(this, schema, baseId);
        sch = new compile_1.SchemaEnv({ schema, schemaId, meta, baseId, localRefs });
        this._cache.set(sch.schema, sch);
        if (addSchema && !baseId.startsWith("#")) {
          if (baseId)
            this._checkUnique(baseId);
          this.refs[baseId] = sch;
        }
        if (validateSchema)
          this.validateSchema(schema, true);
        return sch;
      }
      _checkUnique(id) {
        if (this.schemas[id] || this.refs[id]) {
          throw new Error(`schema with key or id "${id}" already exists`);
        }
      }
      _compileSchemaEnv(sch) {
        if (sch.meta)
          this._compileMetaSchema(sch);
        else
          compile_1.compileSchema.call(this, sch);
        if (!sch.validate)
          throw new Error("ajv implementation error");
        return sch.validate;
      }
      _compileMetaSchema(sch) {
        const currentOpts = this.opts;
        this.opts = this._metaOpts;
        try {
          compile_1.compileSchema.call(this, sch);
        } finally {
          this.opts = currentOpts;
        }
      }
    };
    Ajv.ValidationError = validation_error_1.default;
    Ajv.MissingRefError = ref_error_1.default;
    exports.default = Ajv;
    function checkOptions(checkOpts, options, msg, log = "error") {
      for (const key in checkOpts) {
        const opt = key;
        if (opt in options)
          this.logger[log](`${msg}: option ${key}. ${checkOpts[opt]}`);
      }
    }
    __name(checkOptions, "checkOptions");
    function getSchEnv(keyRef) {
      keyRef = (0, resolve_1.normalizeId)(keyRef);
      return this.schemas[keyRef] || this.refs[keyRef];
    }
    __name(getSchEnv, "getSchEnv");
    function addInitialSchemas() {
      const optsSchemas = this.opts.schemas;
      if (!optsSchemas)
        return;
      if (Array.isArray(optsSchemas))
        this.addSchema(optsSchemas);
      else
        for (const key in optsSchemas)
          this.addSchema(optsSchemas[key], key);
    }
    __name(addInitialSchemas, "addInitialSchemas");
    function addInitialFormats() {
      for (const name in this.opts.formats) {
        const format = this.opts.formats[name];
        if (format)
          this.addFormat(name, format);
      }
    }
    __name(addInitialFormats, "addInitialFormats");
    function addInitialKeywords(defs) {
      if (Array.isArray(defs)) {
        this.addVocabulary(defs);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const keyword in defs) {
        const def = defs[keyword];
        if (!def.keyword)
          def.keyword = keyword;
        this.addKeyword(def);
      }
    }
    __name(addInitialKeywords, "addInitialKeywords");
    function getMetaSchemaOptions() {
      const metaOpts = { ...this.opts };
      for (const opt of META_IGNORE_OPTIONS)
        delete metaOpts[opt];
      return metaOpts;
    }
    __name(getMetaSchemaOptions, "getMetaSchemaOptions");
    var noLogs = { log() {
    }, warn() {
    }, error() {
    } };
    function getLogger(logger) {
      if (logger === false)
        return noLogs;
      if (logger === void 0)
        return console;
      if (logger.log && logger.warn && logger.error)
        return logger;
      throw new Error("logger must implement log, warn and error methods");
    }
    __name(getLogger, "getLogger");
    var KEYWORD_NAME = /^[a-z_$][a-z0-9_$:-]*$/i;
    function checkKeyword(keyword, def) {
      const { RULES } = this;
      (0, util_1.eachItem)(keyword, (kwd) => {
        if (RULES.keywords[kwd])
          throw new Error(`Keyword ${kwd} is already defined`);
        if (!KEYWORD_NAME.test(kwd))
          throw new Error(`Keyword ${kwd} has invalid name`);
      });
      if (!def)
        return;
      if (def.$data && !("code" in def || "validate" in def)) {
        throw new Error('$data keyword must have "code" or "validate" function');
      }
    }
    __name(checkKeyword, "checkKeyword");
    function addRule(keyword, definition, dataType) {
      var _a;
      const post = definition === null || definition === void 0 ? void 0 : definition.post;
      if (dataType && post)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES } = this;
      let ruleGroup = post ? RULES.post : RULES.rules.find(({ type: t }) => t === dataType);
      if (!ruleGroup) {
        ruleGroup = { type: dataType, rules: [] };
        RULES.rules.push(ruleGroup);
      }
      RULES.keywords[keyword] = true;
      if (!definition)
        return;
      const rule = {
        keyword,
        definition: {
          ...definition,
          type: (0, dataType_1.getJSONTypes)(definition.type),
          schemaType: (0, dataType_1.getJSONTypes)(definition.schemaType)
        }
      };
      if (definition.before)
        addBeforeRule.call(this, ruleGroup, rule, definition.before);
      else
        ruleGroup.rules.push(rule);
      RULES.all[keyword] = rule;
      (_a = definition.implements) === null || _a === void 0 ? void 0 : _a.forEach((kwd) => this.addKeyword(kwd));
    }
    __name(addRule, "addRule");
    function addBeforeRule(ruleGroup, rule, before) {
      const i = ruleGroup.rules.findIndex((_rule) => _rule.keyword === before);
      if (i >= 0) {
        ruleGroup.rules.splice(i, 0, rule);
      } else {
        ruleGroup.rules.push(rule);
        this.logger.warn(`rule ${before} is not defined`);
      }
    }
    __name(addBeforeRule, "addBeforeRule");
    function keywordMetaschema(def) {
      let { metaSchema } = def;
      if (metaSchema === void 0)
        return;
      if (def.$data && this.opts.$data)
        metaSchema = schemaOrData(metaSchema);
      def.validateSchema = this.compile(metaSchema, true);
    }
    __name(keywordMetaschema, "keywordMetaschema");
    var $dataRef = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function schemaOrData(schema) {
      return { anyOf: [schema, $dataRef] };
    }
    __name(schemaOrData, "schemaOrData");
  }
});

// node_modules/ajv/dist/vocabularies/core/id.js
var require_id = __commonJS({
  "node_modules/ajv/dist/vocabularies/core/id.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var def = {
      keyword: "id",
      code() {
        throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/core/ref.js
var require_ref = __commonJS({
  "node_modules/ajv/dist/vocabularies/core/ref.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.callRef = exports.getValidate = void 0;
    var ref_error_1 = require_ref_error();
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var compile_1 = require_compile();
    var util_1 = require_util();
    var def = {
      keyword: "$ref",
      schemaType: "string",
      code(cxt) {
        const { gen, schema: $ref, it } = cxt;
        const { baseId, schemaEnv: env, validateName, opts, self } = it;
        const { root } = env;
        if (($ref === "#" || $ref === "#/") && baseId === root.baseId)
          return callRootRef();
        const schOrEnv = compile_1.resolveRef.call(self, root, baseId, $ref);
        if (schOrEnv === void 0)
          throw new ref_error_1.default(it.opts.uriResolver, baseId, $ref);
        if (schOrEnv instanceof compile_1.SchemaEnv)
          return callValidate(schOrEnv);
        return inlineRefSchema(schOrEnv);
        function callRootRef() {
          if (env === root)
            return callRef(cxt, validateName, env, env.$async);
          const rootName = gen.scopeValue("root", { ref: root });
          return callRef(cxt, (0, codegen_1._)`${rootName}.validate`, root, root.$async);
        }
        __name(callRootRef, "callRootRef");
        function callValidate(sch) {
          const v = getValidate(cxt, sch);
          callRef(cxt, v, sch, sch.$async);
        }
        __name(callValidate, "callValidate");
        function inlineRefSchema(sch) {
          const schName = gen.scopeValue("schema", opts.code.source === true ? { ref: sch, code: (0, codegen_1.stringify)(sch) } : { ref: sch });
          const valid = gen.name("valid");
          const schCxt = cxt.subschema({
            schema: sch,
            dataTypes: [],
            schemaPath: codegen_1.nil,
            topSchemaRef: schName,
            errSchemaPath: $ref
          }, valid);
          cxt.mergeEvaluated(schCxt);
          cxt.ok(valid);
        }
        __name(inlineRefSchema, "inlineRefSchema");
      }
    };
    function getValidate(cxt, sch) {
      const { gen } = cxt;
      return sch.validate ? gen.scopeValue("validate", { ref: sch.validate }) : (0, codegen_1._)`${gen.scopeValue("wrapper", { ref: sch })}.validate`;
    }
    __name(getValidate, "getValidate");
    exports.getValidate = getValidate;
    function callRef(cxt, v, sch, $async) {
      const { gen, it } = cxt;
      const { allErrors, schemaEnv: env, opts } = it;
      const passCxt = opts.passContext ? names_1.default.this : codegen_1.nil;
      if ($async)
        callAsyncRef();
      else
        callSyncRef();
      function callAsyncRef() {
        if (!env.$async)
          throw new Error("async schema referenced by sync schema");
        const valid = gen.let("valid");
        gen.try(() => {
          gen.code((0, codegen_1._)`await ${(0, code_1.callValidateCode)(cxt, v, passCxt)}`);
          addEvaluatedFrom(v);
          if (!allErrors)
            gen.assign(valid, true);
        }, (e) => {
          gen.if((0, codegen_1._)`!(${e} instanceof ${it.ValidationError})`, () => gen.throw(e));
          addErrorsFrom(e);
          if (!allErrors)
            gen.assign(valid, false);
        });
        cxt.ok(valid);
      }
      __name(callAsyncRef, "callAsyncRef");
      function callSyncRef() {
        cxt.result((0, code_1.callValidateCode)(cxt, v, passCxt), () => addEvaluatedFrom(v), () => addErrorsFrom(v));
      }
      __name(callSyncRef, "callSyncRef");
      function addErrorsFrom(source) {
        const errs = (0, codegen_1._)`${source}.errors`;
        gen.assign(names_1.default.vErrors, (0, codegen_1._)`${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`);
        gen.assign(names_1.default.errors, (0, codegen_1._)`${names_1.default.vErrors}.length`);
      }
      __name(addErrorsFrom, "addErrorsFrom");
      function addEvaluatedFrom(source) {
        var _a;
        if (!it.opts.unevaluated)
          return;
        const schEvaluated = (_a = sch === null || sch === void 0 ? void 0 : sch.validate) === null || _a === void 0 ? void 0 : _a.evaluated;
        if (it.props !== true) {
          if (schEvaluated && !schEvaluated.dynamicProps) {
            if (schEvaluated.props !== void 0) {
              it.props = util_1.mergeEvaluated.props(gen, schEvaluated.props, it.props);
            }
          } else {
            const props = gen.var("props", (0, codegen_1._)`${source}.evaluated.props`);
            it.props = util_1.mergeEvaluated.props(gen, props, it.props, codegen_1.Name);
          }
        }
        if (it.items !== true) {
          if (schEvaluated && !schEvaluated.dynamicItems) {
            if (schEvaluated.items !== void 0) {
              it.items = util_1.mergeEvaluated.items(gen, schEvaluated.items, it.items);
            }
          } else {
            const items = gen.var("items", (0, codegen_1._)`${source}.evaluated.items`);
            it.items = util_1.mergeEvaluated.items(gen, items, it.items, codegen_1.Name);
          }
        }
      }
      __name(addEvaluatedFrom, "addEvaluatedFrom");
    }
    __name(callRef, "callRef");
    exports.callRef = callRef;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/core/index.js
var require_core2 = __commonJS({
  "node_modules/ajv/dist/vocabularies/core/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var id_1 = require_id();
    var ref_1 = require_ref();
    var core = [
      "$schema",
      "$id",
      "$defs",
      "$vocabulary",
      { keyword: "$comment" },
      "definitions",
      id_1.default,
      ref_1.default
    ];
    exports.default = core;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitNumber.js
var require_limitNumber = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitNumber.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var ops = codegen_1.operators;
    var KWDs = {
      maximum: { okStr: "<=", ok: ops.LTE, fail: ops.GT },
      minimum: { okStr: ">=", ok: ops.GTE, fail: ops.LT },
      exclusiveMaximum: { okStr: "<", ok: ops.LT, fail: ops.GTE },
      exclusiveMinimum: { okStr: ">", ok: ops.GT, fail: ops.LTE }
    };
    var error2 = {
      message: /* @__PURE__ */ __name(({ keyword, schemaCode }) => (0, codegen_1.str)`must be ${KWDs[keyword].okStr} ${schemaCode}`, "message"),
      params: /* @__PURE__ */ __name(({ keyword, schemaCode }) => (0, codegen_1._)`{comparison: ${KWDs[keyword].okStr}, limit: ${schemaCode}}`, "params")
    };
    var def = {
      keyword: Object.keys(KWDs),
      type: "number",
      schemaType: "number",
      $data: true,
      error: error2,
      code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        cxt.fail$data((0, codegen_1._)`${data} ${KWDs[keyword].fail} ${schemaCode} || isNaN(${data})`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/multipleOf.js
var require_multipleOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/multipleOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error2 = {
      message: /* @__PURE__ */ __name(({ schemaCode }) => (0, codegen_1.str)`must be multiple of ${schemaCode}`, "message"),
      params: /* @__PURE__ */ __name(({ schemaCode }) => (0, codegen_1._)`{multipleOf: ${schemaCode}}`, "params")
    };
    var def = {
      keyword: "multipleOf",
      type: "number",
      schemaType: "number",
      $data: true,
      error: error2,
      code(cxt) {
        const { gen, data, schemaCode, it } = cxt;
        const prec = it.opts.multipleOfPrecision;
        const res = gen.let("res");
        const invalid = prec ? (0, codegen_1._)`Math.abs(Math.round(${res}) - ${res}) > 1e-${prec}` : (0, codegen_1._)`${res} !== parseInt(${res})`;
        cxt.fail$data((0, codegen_1._)`(${schemaCode} === 0 || (${res} = ${data}/${schemaCode}, ${invalid}))`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/runtime/ucs2length.js
var require_ucs2length = __commonJS({
  "node_modules/ajv/dist/runtime/ucs2length.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function ucs2length(str) {
      const len = str.length;
      let length = 0;
      let pos = 0;
      let value;
      while (pos < len) {
        length++;
        value = str.charCodeAt(pos++);
        if (value >= 55296 && value <= 56319 && pos < len) {
          value = str.charCodeAt(pos);
          if ((value & 64512) === 56320)
            pos++;
        }
      }
      return length;
    }
    __name(ucs2length, "ucs2length");
    exports.default = ucs2length;
    ucs2length.code = 'require("ajv/dist/runtime/ucs2length").default';
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitLength.js
var require_limitLength = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitLength.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var ucs2length_1 = require_ucs2length();
    var error2 = {
      message({ keyword, schemaCode }) {
        const comp = keyword === "maxLength" ? "more" : "fewer";
        return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} characters`;
      },
      params: /* @__PURE__ */ __name(({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`, "params")
    };
    var def = {
      keyword: ["maxLength", "minLength"],
      type: "string",
      schemaType: "number",
      $data: true,
      error: error2,
      code(cxt) {
        const { keyword, data, schemaCode, it } = cxt;
        const op = keyword === "maxLength" ? codegen_1.operators.GT : codegen_1.operators.LT;
        const len = it.opts.unicode === false ? (0, codegen_1._)`${data}.length` : (0, codegen_1._)`${(0, util_1.useFunc)(cxt.gen, ucs2length_1.default)}(${data})`;
        cxt.fail$data((0, codegen_1._)`${len} ${op} ${schemaCode}`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/pattern.js
var require_pattern = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/pattern.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var error2 = {
      message: /* @__PURE__ */ __name(({ schemaCode }) => (0, codegen_1.str)`must match pattern "${schemaCode}"`, "message"),
      params: /* @__PURE__ */ __name(({ schemaCode }) => (0, codegen_1._)`{pattern: ${schemaCode}}`, "params")
    };
    var def = {
      keyword: "pattern",
      type: "string",
      schemaType: "string",
      $data: true,
      error: error2,
      code(cxt) {
        const { data, $data, schema, schemaCode, it } = cxt;
        const u = it.opts.unicodeRegExp ? "u" : "";
        const regExp = $data ? (0, codegen_1._)`(new RegExp(${schemaCode}, ${u}))` : (0, code_1.usePattern)(cxt, schema);
        cxt.fail$data((0, codegen_1._)`!${regExp}.test(${data})`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitProperties.js
var require_limitProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitProperties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error2 = {
      message({ keyword, schemaCode }) {
        const comp = keyword === "maxProperties" ? "more" : "fewer";
        return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} properties`;
      },
      params: /* @__PURE__ */ __name(({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`, "params")
    };
    var def = {
      keyword: ["maxProperties", "minProperties"],
      type: "object",
      schemaType: "number",
      $data: true,
      error: error2,
      code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        const op = keyword === "maxProperties" ? codegen_1.operators.GT : codegen_1.operators.LT;
        cxt.fail$data((0, codegen_1._)`Object.keys(${data}).length ${op} ${schemaCode}`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/required.js
var require_required = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/required.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error2 = {
      message: /* @__PURE__ */ __name(({ params: { missingProperty } }) => (0, codegen_1.str)`must have required property '${missingProperty}'`, "message"),
      params: /* @__PURE__ */ __name(({ params: { missingProperty } }) => (0, codegen_1._)`{missingProperty: ${missingProperty}}`, "params")
    };
    var def = {
      keyword: "required",
      type: "object",
      schemaType: "array",
      $data: true,
      error: error2,
      code(cxt) {
        const { gen, schema, schemaCode, data, $data, it } = cxt;
        const { opts } = it;
        if (!$data && schema.length === 0)
          return;
        const useLoop = schema.length >= opts.loopRequired;
        if (it.allErrors)
          allErrorsMode();
        else
          exitOnErrorMode();
        if (opts.strictRequired) {
          const props = cxt.parentSchema.properties;
          const { definedProperties } = cxt.it;
          for (const requiredKey of schema) {
            if ((props === null || props === void 0 ? void 0 : props[requiredKey]) === void 0 && !definedProperties.has(requiredKey)) {
              const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
              const msg = `required property "${requiredKey}" is not defined at "${schemaPath}" (strictRequired)`;
              (0, util_1.checkStrictMode)(it, msg, it.opts.strictRequired);
            }
          }
        }
        function allErrorsMode() {
          if (useLoop || $data) {
            cxt.block$data(codegen_1.nil, loopAllRequired);
          } else {
            for (const prop of schema) {
              (0, code_1.checkReportMissingProp)(cxt, prop);
            }
          }
        }
        __name(allErrorsMode, "allErrorsMode");
        function exitOnErrorMode() {
          const missing = gen.let("missing");
          if (useLoop || $data) {
            const valid = gen.let("valid", true);
            cxt.block$data(valid, () => loopUntilMissing(missing, valid));
            cxt.ok(valid);
          } else {
            gen.if((0, code_1.checkMissingProp)(cxt, schema, missing));
            (0, code_1.reportMissingProp)(cxt, missing);
            gen.else();
          }
        }
        __name(exitOnErrorMode, "exitOnErrorMode");
        function loopAllRequired() {
          gen.forOf("prop", schemaCode, (prop) => {
            cxt.setParams({ missingProperty: prop });
            gen.if((0, code_1.noPropertyInData)(gen, data, prop, opts.ownProperties), () => cxt.error());
          });
        }
        __name(loopAllRequired, "loopAllRequired");
        function loopUntilMissing(missing, valid) {
          cxt.setParams({ missingProperty: missing });
          gen.forOf(missing, schemaCode, () => {
            gen.assign(valid, (0, code_1.propertyInData)(gen, data, missing, opts.ownProperties));
            gen.if((0, codegen_1.not)(valid), () => {
              cxt.error();
              gen.break();
            });
          }, codegen_1.nil);
        }
        __name(loopUntilMissing, "loopUntilMissing");
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitItems.js
var require_limitItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error2 = {
      message({ keyword, schemaCode }) {
        const comp = keyword === "maxItems" ? "more" : "fewer";
        return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} items`;
      },
      params: /* @__PURE__ */ __name(({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`, "params")
    };
    var def = {
      keyword: ["maxItems", "minItems"],
      type: "array",
      schemaType: "number",
      $data: true,
      error: error2,
      code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        const op = keyword === "maxItems" ? codegen_1.operators.GT : codegen_1.operators.LT;
        cxt.fail$data((0, codegen_1._)`${data}.length ${op} ${schemaCode}`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/runtime/equal.js
var require_equal = __commonJS({
  "node_modules/ajv/dist/runtime/equal.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var equal = require_fast_deep_equal();
    equal.code = 'require("ajv/dist/runtime/equal").default';
    exports.default = equal;
  }
});

// node_modules/ajv/dist/vocabularies/validation/uniqueItems.js
var require_uniqueItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/uniqueItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dataType_1 = require_dataType();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var equal_1 = require_equal();
    var error2 = {
      message: /* @__PURE__ */ __name(({ params: { i, j } }) => (0, codegen_1.str)`must NOT have duplicate items (items ## ${j} and ${i} are identical)`, "message"),
      params: /* @__PURE__ */ __name(({ params: { i, j } }) => (0, codegen_1._)`{i: ${i}, j: ${j}}`, "params")
    };
    var def = {
      keyword: "uniqueItems",
      type: "array",
      schemaType: "boolean",
      $data: true,
      error: error2,
      code(cxt) {
        const { gen, data, $data, schema, parentSchema, schemaCode, it } = cxt;
        if (!$data && !schema)
          return;
        const valid = gen.let("valid");
        const itemTypes = parentSchema.items ? (0, dataType_1.getSchemaTypes)(parentSchema.items) : [];
        cxt.block$data(valid, validateUniqueItems, (0, codegen_1._)`${schemaCode} === false`);
        cxt.ok(valid);
        function validateUniqueItems() {
          const i = gen.let("i", (0, codegen_1._)`${data}.length`);
          const j = gen.let("j");
          cxt.setParams({ i, j });
          gen.assign(valid, true);
          gen.if((0, codegen_1._)`${i} > 1`, () => (canOptimize() ? loopN : loopN2)(i, j));
        }
        __name(validateUniqueItems, "validateUniqueItems");
        function canOptimize() {
          return itemTypes.length > 0 && !itemTypes.some((t) => t === "object" || t === "array");
        }
        __name(canOptimize, "canOptimize");
        function loopN(i, j) {
          const item = gen.name("item");
          const wrongType = (0, dataType_1.checkDataTypes)(itemTypes, item, it.opts.strictNumbers, dataType_1.DataType.Wrong);
          const indices = gen.const("indices", (0, codegen_1._)`{}`);
          gen.for((0, codegen_1._)`;${i}--;`, () => {
            gen.let(item, (0, codegen_1._)`${data}[${i}]`);
            gen.if(wrongType, (0, codegen_1._)`continue`);
            if (itemTypes.length > 1)
              gen.if((0, codegen_1._)`typeof ${item} == "string"`, (0, codegen_1._)`${item} += "_"`);
            gen.if((0, codegen_1._)`typeof ${indices}[${item}] == "number"`, () => {
              gen.assign(j, (0, codegen_1._)`${indices}[${item}]`);
              cxt.error();
              gen.assign(valid, false).break();
            }).code((0, codegen_1._)`${indices}[${item}] = ${i}`);
          });
        }
        __name(loopN, "loopN");
        function loopN2(i, j) {
          const eql = (0, util_1.useFunc)(gen, equal_1.default);
          const outer = gen.name("outer");
          gen.label(outer).for((0, codegen_1._)`;${i}--;`, () => gen.for((0, codegen_1._)`${j} = ${i}; ${j}--;`, () => gen.if((0, codegen_1._)`${eql}(${data}[${i}], ${data}[${j}])`, () => {
            cxt.error();
            gen.assign(valid, false).break(outer);
          })));
        }
        __name(loopN2, "loopN2");
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/const.js
var require_const = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/const.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var equal_1 = require_equal();
    var error2 = {
      message: "must be equal to constant",
      params: /* @__PURE__ */ __name(({ schemaCode }) => (0, codegen_1._)`{allowedValue: ${schemaCode}}`, "params")
    };
    var def = {
      keyword: "const",
      $data: true,
      error: error2,
      code(cxt) {
        const { gen, data, $data, schemaCode, schema } = cxt;
        if ($data || schema && typeof schema == "object") {
          cxt.fail$data((0, codegen_1._)`!${(0, util_1.useFunc)(gen, equal_1.default)}(${data}, ${schemaCode})`);
        } else {
          cxt.fail((0, codegen_1._)`${schema} !== ${data}`);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/enum.js
var require_enum = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/enum.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var equal_1 = require_equal();
    var error2 = {
      message: "must be equal to one of the allowed values",
      params: /* @__PURE__ */ __name(({ schemaCode }) => (0, codegen_1._)`{allowedValues: ${schemaCode}}`, "params")
    };
    var def = {
      keyword: "enum",
      schemaType: "array",
      $data: true,
      error: error2,
      code(cxt) {
        const { gen, data, $data, schema, schemaCode, it } = cxt;
        if (!$data && schema.length === 0)
          throw new Error("enum must have non-empty array");
        const useLoop = schema.length >= it.opts.loopEnum;
        let eql;
        const getEql = /* @__PURE__ */ __name(() => eql !== null && eql !== void 0 ? eql : eql = (0, util_1.useFunc)(gen, equal_1.default), "getEql");
        let valid;
        if (useLoop || $data) {
          valid = gen.let("valid");
          cxt.block$data(valid, loopEnum);
        } else {
          if (!Array.isArray(schema))
            throw new Error("ajv implementation error");
          const vSchema = gen.const("vSchema", schemaCode);
          valid = (0, codegen_1.or)(...schema.map((_x, i) => equalCode(vSchema, i)));
        }
        cxt.pass(valid);
        function loopEnum() {
          gen.assign(valid, false);
          gen.forOf("v", schemaCode, (v) => gen.if((0, codegen_1._)`${getEql()}(${data}, ${v})`, () => gen.assign(valid, true).break()));
        }
        __name(loopEnum, "loopEnum");
        function equalCode(vSchema, i) {
          const sch = schema[i];
          return typeof sch === "object" && sch !== null ? (0, codegen_1._)`${getEql()}(${data}, ${vSchema}[${i}])` : (0, codegen_1._)`${data} === ${sch}`;
        }
        __name(equalCode, "equalCode");
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/index.js
var require_validation = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var limitNumber_1 = require_limitNumber();
    var multipleOf_1 = require_multipleOf();
    var limitLength_1 = require_limitLength();
    var pattern_1 = require_pattern();
    var limitProperties_1 = require_limitProperties();
    var required_1 = require_required();
    var limitItems_1 = require_limitItems();
    var uniqueItems_1 = require_uniqueItems();
    var const_1 = require_const();
    var enum_1 = require_enum();
    var validation = [
      // number
      limitNumber_1.default,
      multipleOf_1.default,
      // string
      limitLength_1.default,
      pattern_1.default,
      // object
      limitProperties_1.default,
      required_1.default,
      // array
      limitItems_1.default,
      uniqueItems_1.default,
      // any
      { keyword: "type", schemaType: ["string", "array"] },
      { keyword: "nullable", schemaType: "boolean" },
      const_1.default,
      enum_1.default
    ];
    exports.default = validation;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/additionalItems.js
var require_additionalItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/additionalItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateAdditionalItems = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error2 = {
      message: /* @__PURE__ */ __name(({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`, "message"),
      params: /* @__PURE__ */ __name(({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`, "params")
    };
    var def = {
      keyword: "additionalItems",
      type: "array",
      schemaType: ["boolean", "object"],
      before: "uniqueItems",
      error: error2,
      code(cxt) {
        const { parentSchema, it } = cxt;
        const { items } = parentSchema;
        if (!Array.isArray(items)) {
          (0, util_1.checkStrictMode)(it, '"additionalItems" is ignored when "items" is not an array of schemas');
          return;
        }
        validateAdditionalItems(cxt, items);
      }
    };
    function validateAdditionalItems(cxt, items) {
      const { gen, schema, data, keyword, it } = cxt;
      it.items = true;
      const len = gen.const("len", (0, codegen_1._)`${data}.length`);
      if (schema === false) {
        cxt.setParams({ len: items.length });
        cxt.pass((0, codegen_1._)`${len} <= ${items.length}`);
      } else if (typeof schema == "object" && !(0, util_1.alwaysValidSchema)(it, schema)) {
        const valid = gen.var("valid", (0, codegen_1._)`${len} <= ${items.length}`);
        gen.if((0, codegen_1.not)(valid), () => validateItems(valid));
        cxt.ok(valid);
      }
      function validateItems(valid) {
        gen.forRange("i", items.length, len, (i) => {
          cxt.subschema({ keyword, dataProp: i, dataPropType: util_1.Type.Num }, valid);
          if (!it.allErrors)
            gen.if((0, codegen_1.not)(valid), () => gen.break());
        });
      }
      __name(validateItems, "validateItems");
    }
    __name(validateAdditionalItems, "validateAdditionalItems");
    exports.validateAdditionalItems = validateAdditionalItems;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/items.js
var require_items = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/items.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateTuple = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var code_1 = require_code2();
    var def = {
      keyword: "items",
      type: "array",
      schemaType: ["object", "array", "boolean"],
      before: "uniqueItems",
      code(cxt) {
        const { schema, it } = cxt;
        if (Array.isArray(schema))
          return validateTuple(cxt, "additionalItems", schema);
        it.items = true;
        if ((0, util_1.alwaysValidSchema)(it, schema))
          return;
        cxt.ok((0, code_1.validateArray)(cxt));
      }
    };
    function validateTuple(cxt, extraItems, schArr = cxt.schema) {
      const { gen, parentSchema, data, keyword, it } = cxt;
      checkStrictTuple(parentSchema);
      if (it.opts.unevaluated && schArr.length && it.items !== true) {
        it.items = util_1.mergeEvaluated.items(gen, schArr.length, it.items);
      }
      const valid = gen.name("valid");
      const len = gen.const("len", (0, codegen_1._)`${data}.length`);
      schArr.forEach((sch, i) => {
        if ((0, util_1.alwaysValidSchema)(it, sch))
          return;
        gen.if((0, codegen_1._)`${len} > ${i}`, () => cxt.subschema({
          keyword,
          schemaProp: i,
          dataProp: i
        }, valid));
        cxt.ok(valid);
      });
      function checkStrictTuple(sch) {
        const { opts, errSchemaPath } = it;
        const l = schArr.length;
        const fullTuple = l === sch.minItems && (l === sch.maxItems || sch[extraItems] === false);
        if (opts.strictTuples && !fullTuple) {
          const msg = `"${keyword}" is ${l}-tuple, but minItems or maxItems/${extraItems} are not specified or different at path "${errSchemaPath}"`;
          (0, util_1.checkStrictMode)(it, msg, opts.strictTuples);
        }
      }
      __name(checkStrictTuple, "checkStrictTuple");
    }
    __name(validateTuple, "validateTuple");
    exports.validateTuple = validateTuple;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/prefixItems.js
var require_prefixItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/prefixItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var items_1 = require_items();
    var def = {
      keyword: "prefixItems",
      type: "array",
      schemaType: ["array"],
      before: "uniqueItems",
      code: /* @__PURE__ */ __name((cxt) => (0, items_1.validateTuple)(cxt, "items"), "code")
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/items2020.js
var require_items2020 = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/items2020.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var code_1 = require_code2();
    var additionalItems_1 = require_additionalItems();
    var error2 = {
      message: /* @__PURE__ */ __name(({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`, "message"),
      params: /* @__PURE__ */ __name(({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`, "params")
    };
    var def = {
      keyword: "items",
      type: "array",
      schemaType: ["object", "boolean"],
      before: "uniqueItems",
      error: error2,
      code(cxt) {
        const { schema, parentSchema, it } = cxt;
        const { prefixItems } = parentSchema;
        it.items = true;
        if ((0, util_1.alwaysValidSchema)(it, schema))
          return;
        if (prefixItems)
          (0, additionalItems_1.validateAdditionalItems)(cxt, prefixItems);
        else
          cxt.ok((0, code_1.validateArray)(cxt));
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/contains.js
var require_contains = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/contains.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error2 = {
      message: /* @__PURE__ */ __name(({ params: { min, max } }) => max === void 0 ? (0, codegen_1.str)`must contain at least ${min} valid item(s)` : (0, codegen_1.str)`must contain at least ${min} and no more than ${max} valid item(s)`, "message"),
      params: /* @__PURE__ */ __name(({ params: { min, max } }) => max === void 0 ? (0, codegen_1._)`{minContains: ${min}}` : (0, codegen_1._)`{minContains: ${min}, maxContains: ${max}}`, "params")
    };
    var def = {
      keyword: "contains",
      type: "array",
      schemaType: ["object", "boolean"],
      before: "uniqueItems",
      trackErrors: true,
      error: error2,
      code(cxt) {
        const { gen, schema, parentSchema, data, it } = cxt;
        let min;
        let max;
        const { minContains, maxContains } = parentSchema;
        if (it.opts.next) {
          min = minContains === void 0 ? 1 : minContains;
          max = maxContains;
        } else {
          min = 1;
        }
        const len = gen.const("len", (0, codegen_1._)`${data}.length`);
        cxt.setParams({ min, max });
        if (max === void 0 && min === 0) {
          (0, util_1.checkStrictMode)(it, `"minContains" == 0 without "maxContains": "contains" keyword ignored`);
          return;
        }
        if (max !== void 0 && min > max) {
          (0, util_1.checkStrictMode)(it, `"minContains" > "maxContains" is always invalid`);
          cxt.fail();
          return;
        }
        if ((0, util_1.alwaysValidSchema)(it, schema)) {
          let cond = (0, codegen_1._)`${len} >= ${min}`;
          if (max !== void 0)
            cond = (0, codegen_1._)`${cond} && ${len} <= ${max}`;
          cxt.pass(cond);
          return;
        }
        it.items = true;
        const valid = gen.name("valid");
        if (max === void 0 && min === 1) {
          validateItems(valid, () => gen.if(valid, () => gen.break()));
        } else if (min === 0) {
          gen.let(valid, true);
          if (max !== void 0)
            gen.if((0, codegen_1._)`${data}.length > 0`, validateItemsWithCount);
        } else {
          gen.let(valid, false);
          validateItemsWithCount();
        }
        cxt.result(valid, () => cxt.reset());
        function validateItemsWithCount() {
          const schValid = gen.name("_valid");
          const count = gen.let("count", 0);
          validateItems(schValid, () => gen.if(schValid, () => checkLimits(count)));
        }
        __name(validateItemsWithCount, "validateItemsWithCount");
        function validateItems(_valid, block) {
          gen.forRange("i", 0, len, (i) => {
            cxt.subschema({
              keyword: "contains",
              dataProp: i,
              dataPropType: util_1.Type.Num,
              compositeRule: true
            }, _valid);
            block();
          });
        }
        __name(validateItems, "validateItems");
        function checkLimits(count) {
          gen.code((0, codegen_1._)`${count}++`);
          if (max === void 0) {
            gen.if((0, codegen_1._)`${count} >= ${min}`, () => gen.assign(valid, true).break());
          } else {
            gen.if((0, codegen_1._)`${count} > ${max}`, () => gen.assign(valid, false).break());
            if (min === 1)
              gen.assign(valid, true);
            else
              gen.if((0, codegen_1._)`${count} >= ${min}`, () => gen.assign(valid, true));
          }
        }
        __name(checkLimits, "checkLimits");
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/dependencies.js
var require_dependencies = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/dependencies.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateSchemaDeps = exports.validatePropertyDeps = exports.error = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var code_1 = require_code2();
    exports.error = {
      message: /* @__PURE__ */ __name(({ params: { property, depsCount, deps } }) => {
        const property_ies = depsCount === 1 ? "property" : "properties";
        return (0, codegen_1.str)`must have ${property_ies} ${deps} when property ${property} is present`;
      }, "message"),
      params: /* @__PURE__ */ __name(({ params: { property, depsCount, deps, missingProperty } }) => (0, codegen_1._)`{property: ${property},
    missingProperty: ${missingProperty},
    depsCount: ${depsCount},
    deps: ${deps}}`, "params")
      // TODO change to reference
    };
    var def = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: exports.error,
      code(cxt) {
        const [propDeps, schDeps] = splitDependencies(cxt);
        validatePropertyDeps(cxt, propDeps);
        validateSchemaDeps(cxt, schDeps);
      }
    };
    function splitDependencies({ schema }) {
      const propertyDeps = {};
      const schemaDeps = {};
      for (const key in schema) {
        if (key === "__proto__")
          continue;
        const deps = Array.isArray(schema[key]) ? propertyDeps : schemaDeps;
        deps[key] = schema[key];
      }
      return [propertyDeps, schemaDeps];
    }
    __name(splitDependencies, "splitDependencies");
    function validatePropertyDeps(cxt, propertyDeps = cxt.schema) {
      const { gen, data, it } = cxt;
      if (Object.keys(propertyDeps).length === 0)
        return;
      const missing = gen.let("missing");
      for (const prop in propertyDeps) {
        const deps = propertyDeps[prop];
        if (deps.length === 0)
          continue;
        const hasProperty = (0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties);
        cxt.setParams({
          property: prop,
          depsCount: deps.length,
          deps: deps.join(", ")
        });
        if (it.allErrors) {
          gen.if(hasProperty, () => {
            for (const depProp of deps) {
              (0, code_1.checkReportMissingProp)(cxt, depProp);
            }
          });
        } else {
          gen.if((0, codegen_1._)`${hasProperty} && (${(0, code_1.checkMissingProp)(cxt, deps, missing)})`);
          (0, code_1.reportMissingProp)(cxt, missing);
          gen.else();
        }
      }
    }
    __name(validatePropertyDeps, "validatePropertyDeps");
    exports.validatePropertyDeps = validatePropertyDeps;
    function validateSchemaDeps(cxt, schemaDeps = cxt.schema) {
      const { gen, data, keyword, it } = cxt;
      const valid = gen.name("valid");
      for (const prop in schemaDeps) {
        if ((0, util_1.alwaysValidSchema)(it, schemaDeps[prop]))
          continue;
        gen.if(
          (0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties),
          () => {
            const schCxt = cxt.subschema({ keyword, schemaProp: prop }, valid);
            cxt.mergeValidEvaluated(schCxt, valid);
          },
          () => gen.var(valid, true)
          // TODO var
        );
        cxt.ok(valid);
      }
    }
    __name(validateSchemaDeps, "validateSchemaDeps");
    exports.validateSchemaDeps = validateSchemaDeps;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/propertyNames.js
var require_propertyNames = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/propertyNames.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error2 = {
      message: "property name must be valid",
      params: /* @__PURE__ */ __name(({ params }) => (0, codegen_1._)`{propertyName: ${params.propertyName}}`, "params")
    };
    var def = {
      keyword: "propertyNames",
      type: "object",
      schemaType: ["object", "boolean"],
      error: error2,
      code(cxt) {
        const { gen, schema, data, it } = cxt;
        if ((0, util_1.alwaysValidSchema)(it, schema))
          return;
        const valid = gen.name("valid");
        gen.forIn("key", data, (key) => {
          cxt.setParams({ propertyName: key });
          cxt.subschema({
            keyword: "propertyNames",
            data: key,
            dataTypes: ["string"],
            propertyName: key,
            compositeRule: true
          }, valid);
          gen.if((0, codegen_1.not)(valid), () => {
            cxt.error(true);
            if (!it.allErrors)
              gen.break();
          });
        });
        cxt.ok(valid);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js
var require_additionalProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var util_1 = require_util();
    var error2 = {
      message: "must NOT have additional properties",
      params: /* @__PURE__ */ __name(({ params }) => (0, codegen_1._)`{additionalProperty: ${params.additionalProperty}}`, "params")
    };
    var def = {
      keyword: "additionalProperties",
      type: ["object"],
      schemaType: ["boolean", "object"],
      allowUndefined: true,
      trackErrors: true,
      error: error2,
      code(cxt) {
        const { gen, schema, parentSchema, data, errsCount, it } = cxt;
        if (!errsCount)
          throw new Error("ajv implementation error");
        const { allErrors, opts } = it;
        it.props = true;
        if (opts.removeAdditional !== "all" && (0, util_1.alwaysValidSchema)(it, schema))
          return;
        const props = (0, code_1.allSchemaProperties)(parentSchema.properties);
        const patProps = (0, code_1.allSchemaProperties)(parentSchema.patternProperties);
        checkAdditionalProperties();
        cxt.ok((0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
        function checkAdditionalProperties() {
          gen.forIn("key", data, (key) => {
            if (!props.length && !patProps.length)
              additionalPropertyCode(key);
            else
              gen.if(isAdditional(key), () => additionalPropertyCode(key));
          });
        }
        __name(checkAdditionalProperties, "checkAdditionalProperties");
        function isAdditional(key) {
          let definedProp;
          if (props.length > 8) {
            const propsSchema = (0, util_1.schemaRefOrVal)(it, parentSchema.properties, "properties");
            definedProp = (0, code_1.isOwnProperty)(gen, propsSchema, key);
          } else if (props.length) {
            definedProp = (0, codegen_1.or)(...props.map((p) => (0, codegen_1._)`${key} === ${p}`));
          } else {
            definedProp = codegen_1.nil;
          }
          if (patProps.length) {
            definedProp = (0, codegen_1.or)(definedProp, ...patProps.map((p) => (0, codegen_1._)`${(0, code_1.usePattern)(cxt, p)}.test(${key})`));
          }
          return (0, codegen_1.not)(definedProp);
        }
        __name(isAdditional, "isAdditional");
        function deleteAdditional(key) {
          gen.code((0, codegen_1._)`delete ${data}[${key}]`);
        }
        __name(deleteAdditional, "deleteAdditional");
        function additionalPropertyCode(key) {
          if (opts.removeAdditional === "all" || opts.removeAdditional && schema === false) {
            deleteAdditional(key);
            return;
          }
          if (schema === false) {
            cxt.setParams({ additionalProperty: key });
            cxt.error();
            if (!allErrors)
              gen.break();
            return;
          }
          if (typeof schema == "object" && !(0, util_1.alwaysValidSchema)(it, schema)) {
            const valid = gen.name("valid");
            if (opts.removeAdditional === "failing") {
              applyAdditionalSchema(key, valid, false);
              gen.if((0, codegen_1.not)(valid), () => {
                cxt.reset();
                deleteAdditional(key);
              });
            } else {
              applyAdditionalSchema(key, valid);
              if (!allErrors)
                gen.if((0, codegen_1.not)(valid), () => gen.break());
            }
          }
        }
        __name(additionalPropertyCode, "additionalPropertyCode");
        function applyAdditionalSchema(key, valid, errors) {
          const subschema = {
            keyword: "additionalProperties",
            dataProp: key,
            dataPropType: util_1.Type.Str
          };
          if (errors === false) {
            Object.assign(subschema, {
              compositeRule: true,
              createErrors: false,
              allErrors: false
            });
          }
          cxt.subschema(subschema, valid);
        }
        __name(applyAdditionalSchema, "applyAdditionalSchema");
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/properties.js
var require_properties = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/properties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var validate_1 = require_validate();
    var code_1 = require_code2();
    var util_1 = require_util();
    var additionalProperties_1 = require_additionalProperties();
    var def = {
      keyword: "properties",
      type: "object",
      schemaType: "object",
      code(cxt) {
        const { gen, schema, parentSchema, data, it } = cxt;
        if (it.opts.removeAdditional === "all" && parentSchema.additionalProperties === void 0) {
          additionalProperties_1.default.code(new validate_1.KeywordCxt(it, additionalProperties_1.default, "additionalProperties"));
        }
        const allProps = (0, code_1.allSchemaProperties)(schema);
        for (const prop of allProps) {
          it.definedProperties.add(prop);
        }
        if (it.opts.unevaluated && allProps.length && it.props !== true) {
          it.props = util_1.mergeEvaluated.props(gen, (0, util_1.toHash)(allProps), it.props);
        }
        const properties = allProps.filter((p) => !(0, util_1.alwaysValidSchema)(it, schema[p]));
        if (properties.length === 0)
          return;
        const valid = gen.name("valid");
        for (const prop of properties) {
          if (hasDefault(prop)) {
            applyPropertySchema(prop);
          } else {
            gen.if((0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties));
            applyPropertySchema(prop);
            if (!it.allErrors)
              gen.else().var(valid, true);
            gen.endIf();
          }
          cxt.it.definedProperties.add(prop);
          cxt.ok(valid);
        }
        function hasDefault(prop) {
          return it.opts.useDefaults && !it.compositeRule && schema[prop].default !== void 0;
        }
        __name(hasDefault, "hasDefault");
        function applyPropertySchema(prop) {
          cxt.subschema({
            keyword: "properties",
            schemaProp: prop,
            dataProp: prop
          }, valid);
        }
        __name(applyPropertySchema, "applyPropertySchema");
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/patternProperties.js
var require_patternProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/patternProperties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var util_2 = require_util();
    var def = {
      keyword: "patternProperties",
      type: "object",
      schemaType: "object",
      code(cxt) {
        const { gen, schema, data, parentSchema, it } = cxt;
        const { opts } = it;
        const patterns = (0, code_1.allSchemaProperties)(schema);
        const alwaysValidPatterns = patterns.filter((p) => (0, util_1.alwaysValidSchema)(it, schema[p]));
        if (patterns.length === 0 || alwaysValidPatterns.length === patterns.length && (!it.opts.unevaluated || it.props === true)) {
          return;
        }
        const checkProperties = opts.strictSchema && !opts.allowMatchingProperties && parentSchema.properties;
        const valid = gen.name("valid");
        if (it.props !== true && !(it.props instanceof codegen_1.Name)) {
          it.props = (0, util_2.evaluatedPropsToName)(gen, it.props);
        }
        const { props } = it;
        validatePatternProperties();
        function validatePatternProperties() {
          for (const pat of patterns) {
            if (checkProperties)
              checkMatchingProperties(pat);
            if (it.allErrors) {
              validateProperties(pat);
            } else {
              gen.var(valid, true);
              validateProperties(pat);
              gen.if(valid);
            }
          }
        }
        __name(validatePatternProperties, "validatePatternProperties");
        function checkMatchingProperties(pat) {
          for (const prop in checkProperties) {
            if (new RegExp(pat).test(prop)) {
              (0, util_1.checkStrictMode)(it, `property ${prop} matches pattern ${pat} (use allowMatchingProperties)`);
            }
          }
        }
        __name(checkMatchingProperties, "checkMatchingProperties");
        function validateProperties(pat) {
          gen.forIn("key", data, (key) => {
            gen.if((0, codegen_1._)`${(0, code_1.usePattern)(cxt, pat)}.test(${key})`, () => {
              const alwaysValid = alwaysValidPatterns.includes(pat);
              if (!alwaysValid) {
                cxt.subschema({
                  keyword: "patternProperties",
                  schemaProp: pat,
                  dataProp: key,
                  dataPropType: util_2.Type.Str
                }, valid);
              }
              if (it.opts.unevaluated && props !== true) {
                gen.assign((0, codegen_1._)`${props}[${key}]`, true);
              } else if (!alwaysValid && !it.allErrors) {
                gen.if((0, codegen_1.not)(valid), () => gen.break());
              }
            });
          });
        }
        __name(validateProperties, "validateProperties");
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/not.js
var require_not = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/not.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: "not",
      schemaType: ["object", "boolean"],
      trackErrors: true,
      code(cxt) {
        const { gen, schema, it } = cxt;
        if ((0, util_1.alwaysValidSchema)(it, schema)) {
          cxt.fail();
          return;
        }
        const valid = gen.name("valid");
        cxt.subschema({
          keyword: "not",
          compositeRule: true,
          createErrors: false,
          allErrors: false
        }, valid);
        cxt.failResult(valid, () => cxt.reset(), () => cxt.error());
      },
      error: { message: "must NOT be valid" }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/anyOf.js
var require_anyOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/anyOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var def = {
      keyword: "anyOf",
      schemaType: "array",
      trackErrors: true,
      code: code_1.validateUnion,
      error: { message: "must match a schema in anyOf" }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/oneOf.js
var require_oneOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/oneOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error2 = {
      message: "must match exactly one schema in oneOf",
      params: /* @__PURE__ */ __name(({ params }) => (0, codegen_1._)`{passingSchemas: ${params.passing}}`, "params")
    };
    var def = {
      keyword: "oneOf",
      schemaType: "array",
      trackErrors: true,
      error: error2,
      code(cxt) {
        const { gen, schema, parentSchema, it } = cxt;
        if (!Array.isArray(schema))
          throw new Error("ajv implementation error");
        if (it.opts.discriminator && parentSchema.discriminator)
          return;
        const schArr = schema;
        const valid = gen.let("valid", false);
        const passing = gen.let("passing", null);
        const schValid = gen.name("_valid");
        cxt.setParams({ passing });
        gen.block(validateOneOf);
        cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
        function validateOneOf() {
          schArr.forEach((sch, i) => {
            let schCxt;
            if ((0, util_1.alwaysValidSchema)(it, sch)) {
              gen.var(schValid, true);
            } else {
              schCxt = cxt.subschema({
                keyword: "oneOf",
                schemaProp: i,
                compositeRule: true
              }, schValid);
            }
            if (i > 0) {
              gen.if((0, codegen_1._)`${schValid} && ${valid}`).assign(valid, false).assign(passing, (0, codegen_1._)`[${passing}, ${i}]`).else();
            }
            gen.if(schValid, () => {
              gen.assign(valid, true);
              gen.assign(passing, i);
              if (schCxt)
                cxt.mergeEvaluated(schCxt, codegen_1.Name);
            });
          });
        }
        __name(validateOneOf, "validateOneOf");
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/allOf.js
var require_allOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/allOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: "allOf",
      schemaType: "array",
      code(cxt) {
        const { gen, schema, it } = cxt;
        if (!Array.isArray(schema))
          throw new Error("ajv implementation error");
        const valid = gen.name("valid");
        schema.forEach((sch, i) => {
          if ((0, util_1.alwaysValidSchema)(it, sch))
            return;
          const schCxt = cxt.subschema({ keyword: "allOf", schemaProp: i }, valid);
          cxt.ok(valid);
          cxt.mergeEvaluated(schCxt);
        });
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/if.js
var require_if = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/if.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error2 = {
      message: /* @__PURE__ */ __name(({ params }) => (0, codegen_1.str)`must match "${params.ifClause}" schema`, "message"),
      params: /* @__PURE__ */ __name(({ params }) => (0, codegen_1._)`{failingKeyword: ${params.ifClause}}`, "params")
    };
    var def = {
      keyword: "if",
      schemaType: ["object", "boolean"],
      trackErrors: true,
      error: error2,
      code(cxt) {
        const { gen, parentSchema, it } = cxt;
        if (parentSchema.then === void 0 && parentSchema.else === void 0) {
          (0, util_1.checkStrictMode)(it, '"if" without "then" and "else" is ignored');
        }
        const hasThen = hasSchema(it, "then");
        const hasElse = hasSchema(it, "else");
        if (!hasThen && !hasElse)
          return;
        const valid = gen.let("valid", true);
        const schValid = gen.name("_valid");
        validateIf();
        cxt.reset();
        if (hasThen && hasElse) {
          const ifClause = gen.let("ifClause");
          cxt.setParams({ ifClause });
          gen.if(schValid, validateClause("then", ifClause), validateClause("else", ifClause));
        } else if (hasThen) {
          gen.if(schValid, validateClause("then"));
        } else {
          gen.if((0, codegen_1.not)(schValid), validateClause("else"));
        }
        cxt.pass(valid, () => cxt.error(true));
        function validateIf() {
          const schCxt = cxt.subschema({
            keyword: "if",
            compositeRule: true,
            createErrors: false,
            allErrors: false
          }, schValid);
          cxt.mergeEvaluated(schCxt);
        }
        __name(validateIf, "validateIf");
        function validateClause(keyword, ifClause) {
          return () => {
            const schCxt = cxt.subschema({ keyword }, schValid);
            gen.assign(valid, schValid);
            cxt.mergeValidEvaluated(schCxt, valid);
            if (ifClause)
              gen.assign(ifClause, (0, codegen_1._)`${keyword}`);
            else
              cxt.setParams({ ifClause: keyword });
          };
        }
        __name(validateClause, "validateClause");
      }
    };
    function hasSchema(it, keyword) {
      const schema = it.schema[keyword];
      return schema !== void 0 && !(0, util_1.alwaysValidSchema)(it, schema);
    }
    __name(hasSchema, "hasSchema");
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/thenElse.js
var require_thenElse = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/thenElse.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: ["then", "else"],
      schemaType: ["object", "boolean"],
      code({ keyword, parentSchema, it }) {
        if (parentSchema.if === void 0)
          (0, util_1.checkStrictMode)(it, `"${keyword}" without "if" is ignored`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/index.js
var require_applicator = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var additionalItems_1 = require_additionalItems();
    var prefixItems_1 = require_prefixItems();
    var items_1 = require_items();
    var items2020_1 = require_items2020();
    var contains_1 = require_contains();
    var dependencies_1 = require_dependencies();
    var propertyNames_1 = require_propertyNames();
    var additionalProperties_1 = require_additionalProperties();
    var properties_1 = require_properties();
    var patternProperties_1 = require_patternProperties();
    var not_1 = require_not();
    var anyOf_1 = require_anyOf();
    var oneOf_1 = require_oneOf();
    var allOf_1 = require_allOf();
    var if_1 = require_if();
    var thenElse_1 = require_thenElse();
    function getApplicator(draft2020 = false) {
      const applicator = [
        // any
        not_1.default,
        anyOf_1.default,
        oneOf_1.default,
        allOf_1.default,
        if_1.default,
        thenElse_1.default,
        // object
        propertyNames_1.default,
        additionalProperties_1.default,
        dependencies_1.default,
        properties_1.default,
        patternProperties_1.default
      ];
      if (draft2020)
        applicator.push(prefixItems_1.default, items2020_1.default);
      else
        applicator.push(additionalItems_1.default, items_1.default);
      applicator.push(contains_1.default);
      return applicator;
    }
    __name(getApplicator, "getApplicator");
    exports.default = getApplicator;
  }
});

// node_modules/ajv/dist/vocabularies/dynamic/dynamicAnchor.js
var require_dynamicAnchor = __commonJS({
  "node_modules/ajv/dist/vocabularies/dynamic/dynamicAnchor.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.dynamicAnchor = void 0;
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var compile_1 = require_compile();
    var ref_1 = require_ref();
    var def = {
      keyword: "$dynamicAnchor",
      schemaType: "string",
      code: /* @__PURE__ */ __name((cxt) => dynamicAnchor(cxt, cxt.schema), "code")
    };
    function dynamicAnchor(cxt, anchor) {
      const { gen, it } = cxt;
      it.schemaEnv.root.dynamicAnchors[anchor] = true;
      const v = (0, codegen_1._)`${names_1.default.dynamicAnchors}${(0, codegen_1.getProperty)(anchor)}`;
      const validate3 = it.errSchemaPath === "#" ? it.validateName : _getValidate(cxt);
      gen.if((0, codegen_1._)`!${v}`, () => gen.assign(v, validate3));
    }
    __name(dynamicAnchor, "dynamicAnchor");
    exports.dynamicAnchor = dynamicAnchor;
    function _getValidate(cxt) {
      const { schemaEnv, schema, self } = cxt.it;
      const { root, baseId, localRefs, meta } = schemaEnv.root;
      const { schemaId } = self.opts;
      const sch = new compile_1.SchemaEnv({ schema, schemaId, root, baseId, localRefs, meta });
      compile_1.compileSchema.call(self, sch);
      return (0, ref_1.getValidate)(cxt, sch);
    }
    __name(_getValidate, "_getValidate");
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/dynamic/dynamicRef.js
var require_dynamicRef = __commonJS({
  "node_modules/ajv/dist/vocabularies/dynamic/dynamicRef.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.dynamicRef = void 0;
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var ref_1 = require_ref();
    var def = {
      keyword: "$dynamicRef",
      schemaType: "string",
      code: /* @__PURE__ */ __name((cxt) => dynamicRef(cxt, cxt.schema), "code")
    };
    function dynamicRef(cxt, ref) {
      const { gen, keyword, it } = cxt;
      if (ref[0] !== "#")
        throw new Error(`"${keyword}" only supports hash fragment reference`);
      const anchor = ref.slice(1);
      if (it.allErrors) {
        _dynamicRef();
      } else {
        const valid = gen.let("valid", false);
        _dynamicRef(valid);
        cxt.ok(valid);
      }
      function _dynamicRef(valid) {
        if (it.schemaEnv.root.dynamicAnchors[anchor]) {
          const v = gen.let("_v", (0, codegen_1._)`${names_1.default.dynamicAnchors}${(0, codegen_1.getProperty)(anchor)}`);
          gen.if(v, _callRef(v, valid), _callRef(it.validateName, valid));
        } else {
          _callRef(it.validateName, valid)();
        }
      }
      __name(_dynamicRef, "_dynamicRef");
      function _callRef(validate3, valid) {
        return valid ? () => gen.block(() => {
          (0, ref_1.callRef)(cxt, validate3);
          gen.let(valid, true);
        }) : () => (0, ref_1.callRef)(cxt, validate3);
      }
      __name(_callRef, "_callRef");
    }
    __name(dynamicRef, "dynamicRef");
    exports.dynamicRef = dynamicRef;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/dynamic/recursiveAnchor.js
var require_recursiveAnchor = __commonJS({
  "node_modules/ajv/dist/vocabularies/dynamic/recursiveAnchor.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dynamicAnchor_1 = require_dynamicAnchor();
    var util_1 = require_util();
    var def = {
      keyword: "$recursiveAnchor",
      schemaType: "boolean",
      code(cxt) {
        if (cxt.schema)
          (0, dynamicAnchor_1.dynamicAnchor)(cxt, "");
        else
          (0, util_1.checkStrictMode)(cxt.it, "$recursiveAnchor: false is ignored");
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/dynamic/recursiveRef.js
var require_recursiveRef = __commonJS({
  "node_modules/ajv/dist/vocabularies/dynamic/recursiveRef.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dynamicRef_1 = require_dynamicRef();
    var def = {
      keyword: "$recursiveRef",
      schemaType: "string",
      code: /* @__PURE__ */ __name((cxt) => (0, dynamicRef_1.dynamicRef)(cxt, cxt.schema), "code")
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/dynamic/index.js
var require_dynamic = __commonJS({
  "node_modules/ajv/dist/vocabularies/dynamic/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dynamicAnchor_1 = require_dynamicAnchor();
    var dynamicRef_1 = require_dynamicRef();
    var recursiveAnchor_1 = require_recursiveAnchor();
    var recursiveRef_1 = require_recursiveRef();
    var dynamic = [dynamicAnchor_1.default, dynamicRef_1.default, recursiveAnchor_1.default, recursiveRef_1.default];
    exports.default = dynamic;
  }
});

// node_modules/ajv/dist/vocabularies/validation/dependentRequired.js
var require_dependentRequired = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/dependentRequired.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dependencies_1 = require_dependencies();
    var def = {
      keyword: "dependentRequired",
      type: "object",
      schemaType: "object",
      error: dependencies_1.error,
      code: /* @__PURE__ */ __name((cxt) => (0, dependencies_1.validatePropertyDeps)(cxt), "code")
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/dependentSchemas.js
var require_dependentSchemas = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/dependentSchemas.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dependencies_1 = require_dependencies();
    var def = {
      keyword: "dependentSchemas",
      type: "object",
      schemaType: "object",
      code: /* @__PURE__ */ __name((cxt) => (0, dependencies_1.validateSchemaDeps)(cxt), "code")
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitContains.js
var require_limitContains = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitContains.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: ["maxContains", "minContains"],
      type: "array",
      schemaType: "number",
      code({ keyword, parentSchema, it }) {
        if (parentSchema.contains === void 0) {
          (0, util_1.checkStrictMode)(it, `"${keyword}" without "contains" is ignored`);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/next.js
var require_next = __commonJS({
  "node_modules/ajv/dist/vocabularies/next.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dependentRequired_1 = require_dependentRequired();
    var dependentSchemas_1 = require_dependentSchemas();
    var limitContains_1 = require_limitContains();
    var next = [dependentRequired_1.default, dependentSchemas_1.default, limitContains_1.default];
    exports.default = next;
  }
});

// node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedProperties.js
var require_unevaluatedProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedProperties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var names_1 = require_names();
    var error2 = {
      message: "must NOT have unevaluated properties",
      params: /* @__PURE__ */ __name(({ params }) => (0, codegen_1._)`{unevaluatedProperty: ${params.unevaluatedProperty}}`, "params")
    };
    var def = {
      keyword: "unevaluatedProperties",
      type: "object",
      schemaType: ["boolean", "object"],
      trackErrors: true,
      error: error2,
      code(cxt) {
        const { gen, schema, data, errsCount, it } = cxt;
        if (!errsCount)
          throw new Error("ajv implementation error");
        const { allErrors, props } = it;
        if (props instanceof codegen_1.Name) {
          gen.if((0, codegen_1._)`${props} !== true`, () => gen.forIn("key", data, (key) => gen.if(unevaluatedDynamic(props, key), () => unevaluatedPropCode(key))));
        } else if (props !== true) {
          gen.forIn("key", data, (key) => props === void 0 ? unevaluatedPropCode(key) : gen.if(unevaluatedStatic(props, key), () => unevaluatedPropCode(key)));
        }
        it.props = true;
        cxt.ok((0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
        function unevaluatedPropCode(key) {
          if (schema === false) {
            cxt.setParams({ unevaluatedProperty: key });
            cxt.error();
            if (!allErrors)
              gen.break();
            return;
          }
          if (!(0, util_1.alwaysValidSchema)(it, schema)) {
            const valid = gen.name("valid");
            cxt.subschema({
              keyword: "unevaluatedProperties",
              dataProp: key,
              dataPropType: util_1.Type.Str
            }, valid);
            if (!allErrors)
              gen.if((0, codegen_1.not)(valid), () => gen.break());
          }
        }
        __name(unevaluatedPropCode, "unevaluatedPropCode");
        function unevaluatedDynamic(evaluatedProps, key) {
          return (0, codegen_1._)`!${evaluatedProps} || !${evaluatedProps}[${key}]`;
        }
        __name(unevaluatedDynamic, "unevaluatedDynamic");
        function unevaluatedStatic(evaluatedProps, key) {
          const ps = [];
          for (const p in evaluatedProps) {
            if (evaluatedProps[p] === true)
              ps.push((0, codegen_1._)`${key} !== ${p}`);
          }
          return (0, codegen_1.and)(...ps);
        }
        __name(unevaluatedStatic, "unevaluatedStatic");
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedItems.js
var require_unevaluatedItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error2 = {
      message: /* @__PURE__ */ __name(({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`, "message"),
      params: /* @__PURE__ */ __name(({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`, "params")
    };
    var def = {
      keyword: "unevaluatedItems",
      type: "array",
      schemaType: ["boolean", "object"],
      error: error2,
      code(cxt) {
        const { gen, schema, data, it } = cxt;
        const items = it.items || 0;
        if (items === true)
          return;
        const len = gen.const("len", (0, codegen_1._)`${data}.length`);
        if (schema === false) {
          cxt.setParams({ len: items });
          cxt.fail((0, codegen_1._)`${len} > ${items}`);
        } else if (typeof schema == "object" && !(0, util_1.alwaysValidSchema)(it, schema)) {
          const valid = gen.var("valid", (0, codegen_1._)`${len} <= ${items}`);
          gen.if((0, codegen_1.not)(valid), () => validateItems(valid, items));
          cxt.ok(valid);
        }
        it.items = true;
        function validateItems(valid, from) {
          gen.forRange("i", from, len, (i) => {
            cxt.subschema({ keyword: "unevaluatedItems", dataProp: i, dataPropType: util_1.Type.Num }, valid);
            if (!it.allErrors)
              gen.if((0, codegen_1.not)(valid), () => gen.break());
          });
        }
        __name(validateItems, "validateItems");
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/unevaluated/index.js
var require_unevaluated = __commonJS({
  "node_modules/ajv/dist/vocabularies/unevaluated/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var unevaluatedProperties_1 = require_unevaluatedProperties();
    var unevaluatedItems_1 = require_unevaluatedItems();
    var unevaluated = [unevaluatedProperties_1.default, unevaluatedItems_1.default];
    exports.default = unevaluated;
  }
});

// node_modules/ajv/dist/vocabularies/format/format.js
var require_format = __commonJS({
  "node_modules/ajv/dist/vocabularies/format/format.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error2 = {
      message: /* @__PURE__ */ __name(({ schemaCode }) => (0, codegen_1.str)`must match format "${schemaCode}"`, "message"),
      params: /* @__PURE__ */ __name(({ schemaCode }) => (0, codegen_1._)`{format: ${schemaCode}}`, "params")
    };
    var def = {
      keyword: "format",
      type: ["number", "string"],
      schemaType: "string",
      $data: true,
      error: error2,
      code(cxt, ruleType) {
        const { gen, data, $data, schema, schemaCode, it } = cxt;
        const { opts, errSchemaPath, schemaEnv, self } = it;
        if (!opts.validateFormats)
          return;
        if ($data)
          validate$DataFormat();
        else
          validateFormat();
        function validate$DataFormat() {
          const fmts = gen.scopeValue("formats", {
            ref: self.formats,
            code: opts.code.formats
          });
          const fDef = gen.const("fDef", (0, codegen_1._)`${fmts}[${schemaCode}]`);
          const fType = gen.let("fType");
          const format = gen.let("format");
          gen.if((0, codegen_1._)`typeof ${fDef} == "object" && !(${fDef} instanceof RegExp)`, () => gen.assign(fType, (0, codegen_1._)`${fDef}.type || "string"`).assign(format, (0, codegen_1._)`${fDef}.validate`), () => gen.assign(fType, (0, codegen_1._)`"string"`).assign(format, fDef));
          cxt.fail$data((0, codegen_1.or)(unknownFmt(), invalidFmt()));
          function unknownFmt() {
            if (opts.strictSchema === false)
              return codegen_1.nil;
            return (0, codegen_1._)`${schemaCode} && !${format}`;
          }
          __name(unknownFmt, "unknownFmt");
          function invalidFmt() {
            const callFormat = schemaEnv.$async ? (0, codegen_1._)`(${fDef}.async ? await ${format}(${data}) : ${format}(${data}))` : (0, codegen_1._)`${format}(${data})`;
            const validData = (0, codegen_1._)`(typeof ${format} == "function" ? ${callFormat} : ${format}.test(${data}))`;
            return (0, codegen_1._)`${format} && ${format} !== true && ${fType} === ${ruleType} && !${validData}`;
          }
          __name(invalidFmt, "invalidFmt");
        }
        __name(validate$DataFormat, "validate$DataFormat");
        function validateFormat() {
          const formatDef = self.formats[schema];
          if (!formatDef) {
            unknownFormat();
            return;
          }
          if (formatDef === true)
            return;
          const [fmtType, format, fmtRef] = getFormat(formatDef);
          if (fmtType === ruleType)
            cxt.pass(validCondition());
          function unknownFormat() {
            if (opts.strictSchema === false) {
              self.logger.warn(unknownMsg());
              return;
            }
            throw new Error(unknownMsg());
            function unknownMsg() {
              return `unknown format "${schema}" ignored in schema at path "${errSchemaPath}"`;
            }
            __name(unknownMsg, "unknownMsg");
          }
          __name(unknownFormat, "unknownFormat");
          function getFormat(fmtDef) {
            const code = fmtDef instanceof RegExp ? (0, codegen_1.regexpCode)(fmtDef) : opts.code.formats ? (0, codegen_1._)`${opts.code.formats}${(0, codegen_1.getProperty)(schema)}` : void 0;
            const fmt = gen.scopeValue("formats", { key: schema, ref: fmtDef, code });
            if (typeof fmtDef == "object" && !(fmtDef instanceof RegExp)) {
              return [fmtDef.type || "string", fmtDef.validate, (0, codegen_1._)`${fmt}.validate`];
            }
            return ["string", fmtDef, fmt];
          }
          __name(getFormat, "getFormat");
          function validCondition() {
            if (typeof formatDef == "object" && !(formatDef instanceof RegExp) && formatDef.async) {
              if (!schemaEnv.$async)
                throw new Error("async format in sync schema");
              return (0, codegen_1._)`await ${fmtRef}(${data})`;
            }
            return typeof format == "function" ? (0, codegen_1._)`${fmtRef}(${data})` : (0, codegen_1._)`${fmtRef}.test(${data})`;
          }
          __name(validCondition, "validCondition");
        }
        __name(validateFormat, "validateFormat");
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/format/index.js
var require_format2 = __commonJS({
  "node_modules/ajv/dist/vocabularies/format/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var format_1 = require_format();
    var format = [format_1.default];
    exports.default = format;
  }
});

// node_modules/ajv/dist/vocabularies/metadata.js
var require_metadata = __commonJS({
  "node_modules/ajv/dist/vocabularies/metadata.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.contentVocabulary = exports.metadataVocabulary = void 0;
    exports.metadataVocabulary = [
      "title",
      "description",
      "default",
      "deprecated",
      "readOnly",
      "writeOnly",
      "examples"
    ];
    exports.contentVocabulary = [
      "contentMediaType",
      "contentEncoding",
      "contentSchema"
    ];
  }
});

// node_modules/ajv/dist/vocabularies/draft2020.js
var require_draft2020 = __commonJS({
  "node_modules/ajv/dist/vocabularies/draft2020.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var core_1 = require_core2();
    var validation_1 = require_validation();
    var applicator_1 = require_applicator();
    var dynamic_1 = require_dynamic();
    var next_1 = require_next();
    var unevaluated_1 = require_unevaluated();
    var format_1 = require_format2();
    var metadata_1 = require_metadata();
    var draft2020Vocabularies = [
      dynamic_1.default,
      core_1.default,
      validation_1.default,
      (0, applicator_1.default)(true),
      format_1.default,
      metadata_1.metadataVocabulary,
      metadata_1.contentVocabulary,
      next_1.default,
      unevaluated_1.default
    ];
    exports.default = draft2020Vocabularies;
  }
});

// node_modules/ajv/dist/vocabularies/discriminator/types.js
var require_types = __commonJS({
  "node_modules/ajv/dist/vocabularies/discriminator/types.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiscrError = void 0;
    var DiscrError;
    (function(DiscrError2) {
      DiscrError2["Tag"] = "tag";
      DiscrError2["Mapping"] = "mapping";
    })(DiscrError || (exports.DiscrError = DiscrError = {}));
  }
});

// node_modules/ajv/dist/vocabularies/discriminator/index.js
var require_discriminator = __commonJS({
  "node_modules/ajv/dist/vocabularies/discriminator/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var types_1 = require_types();
    var compile_1 = require_compile();
    var ref_error_1 = require_ref_error();
    var util_1 = require_util();
    var error2 = {
      message: /* @__PURE__ */ __name(({ params: { discrError, tagName } }) => discrError === types_1.DiscrError.Tag ? `tag "${tagName}" must be string` : `value of tag "${tagName}" must be in oneOf`, "message"),
      params: /* @__PURE__ */ __name(({ params: { discrError, tag: tag2, tagName } }) => (0, codegen_1._)`{error: ${discrError}, tag: ${tagName}, tagValue: ${tag2}}`, "params")
    };
    var def = {
      keyword: "discriminator",
      type: "object",
      schemaType: "object",
      error: error2,
      code(cxt) {
        const { gen, data, schema, parentSchema, it } = cxt;
        const { oneOf } = parentSchema;
        if (!it.opts.discriminator) {
          throw new Error("discriminator: requires discriminator option");
        }
        const tagName = schema.propertyName;
        if (typeof tagName != "string")
          throw new Error("discriminator: requires propertyName");
        if (schema.mapping)
          throw new Error("discriminator: mapping is not supported");
        if (!oneOf)
          throw new Error("discriminator: requires oneOf keyword");
        const valid = gen.let("valid", false);
        const tag2 = gen.const("tag", (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(tagName)}`);
        gen.if((0, codegen_1._)`typeof ${tag2} == "string"`, () => validateMapping(), () => cxt.error(false, { discrError: types_1.DiscrError.Tag, tag: tag2, tagName }));
        cxt.ok(valid);
        function validateMapping() {
          const mapping = getMapping();
          gen.if(false);
          for (const tagValue in mapping) {
            gen.elseIf((0, codegen_1._)`${tag2} === ${tagValue}`);
            gen.assign(valid, applyTagSchema(mapping[tagValue]));
          }
          gen.else();
          cxt.error(false, { discrError: types_1.DiscrError.Mapping, tag: tag2, tagName });
          gen.endIf();
        }
        __name(validateMapping, "validateMapping");
        function applyTagSchema(schemaProp) {
          const _valid = gen.name("valid");
          const schCxt = cxt.subschema({ keyword: "oneOf", schemaProp }, _valid);
          cxt.mergeEvaluated(schCxt, codegen_1.Name);
          return _valid;
        }
        __name(applyTagSchema, "applyTagSchema");
        function getMapping() {
          var _a;
          const oneOfMapping = {};
          const topRequired = hasRequired(parentSchema);
          let tagRequired = true;
          for (let i = 0; i < oneOf.length; i++) {
            let sch = oneOf[i];
            if ((sch === null || sch === void 0 ? void 0 : sch.$ref) && !(0, util_1.schemaHasRulesButRef)(sch, it.self.RULES)) {
              const ref = sch.$ref;
              sch = compile_1.resolveRef.call(it.self, it.schemaEnv.root, it.baseId, ref);
              if (sch instanceof compile_1.SchemaEnv)
                sch = sch.schema;
              if (sch === void 0)
                throw new ref_error_1.default(it.opts.uriResolver, it.baseId, ref);
            }
            const propSch = (_a = sch === null || sch === void 0 ? void 0 : sch.properties) === null || _a === void 0 ? void 0 : _a[tagName];
            if (typeof propSch != "object") {
              throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${tagName}"`);
            }
            tagRequired = tagRequired && (topRequired || hasRequired(sch));
            addMappings(propSch, i);
          }
          if (!tagRequired)
            throw new Error(`discriminator: "${tagName}" must be required`);
          return oneOfMapping;
          function hasRequired({ required: required2 }) {
            return Array.isArray(required2) && required2.includes(tagName);
          }
          __name(hasRequired, "hasRequired");
          function addMappings(sch, i) {
            if (sch.const) {
              addMapping(sch.const, i);
            } else if (sch.enum) {
              for (const tagValue of sch.enum) {
                addMapping(tagValue, i);
              }
            } else {
              throw new Error(`discriminator: "properties/${tagName}" must have "const" or "enum"`);
            }
          }
          __name(addMappings, "addMappings");
          function addMapping(tagValue, i) {
            if (typeof tagValue != "string" || tagValue in oneOfMapping) {
              throw new Error(`discriminator: "${tagName}" values must be unique strings`);
            }
            oneOfMapping[tagValue] = i;
          }
          __name(addMapping, "addMapping");
        }
        __name(getMapping, "getMapping");
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/schema.json
var require_schema = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/schema.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/schema",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/core": true,
        "https://json-schema.org/draft/2020-12/vocab/applicator": true,
        "https://json-schema.org/draft/2020-12/vocab/unevaluated": true,
        "https://json-schema.org/draft/2020-12/vocab/validation": true,
        "https://json-schema.org/draft/2020-12/vocab/meta-data": true,
        "https://json-schema.org/draft/2020-12/vocab/format-annotation": true,
        "https://json-schema.org/draft/2020-12/vocab/content": true
      },
      $dynamicAnchor: "meta",
      title: "Core and Validation specifications meta-schema",
      allOf: [
        { $ref: "meta/core" },
        { $ref: "meta/applicator" },
        { $ref: "meta/unevaluated" },
        { $ref: "meta/validation" },
        { $ref: "meta/meta-data" },
        { $ref: "meta/format-annotation" },
        { $ref: "meta/content" }
      ],
      type: ["object", "boolean"],
      $comment: "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.",
      properties: {
        definitions: {
          $comment: '"definitions" has been replaced by "$defs".',
          type: "object",
          additionalProperties: { $dynamicRef: "#meta" },
          deprecated: true,
          default: {}
        },
        dependencies: {
          $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.',
          type: "object",
          additionalProperties: {
            anyOf: [{ $dynamicRef: "#meta" }, { $ref: "meta/validation#/$defs/stringArray" }]
          },
          deprecated: true,
          default: {}
        },
        $recursiveAnchor: {
          $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".',
          $ref: "meta/core#/$defs/anchorString",
          deprecated: true
        },
        $recursiveRef: {
          $comment: '"$recursiveRef" has been replaced by "$dynamicRef".',
          $ref: "meta/core#/$defs/uriReferenceString",
          deprecated: true
        }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/applicator.json
var require_applicator2 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/applicator.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/applicator",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/applicator": true
      },
      $dynamicAnchor: "meta",
      title: "Applicator vocabulary meta-schema",
      type: ["object", "boolean"],
      properties: {
        prefixItems: { $ref: "#/$defs/schemaArray" },
        items: { $dynamicRef: "#meta" },
        contains: { $dynamicRef: "#meta" },
        additionalProperties: { $dynamicRef: "#meta" },
        properties: {
          type: "object",
          additionalProperties: { $dynamicRef: "#meta" },
          default: {}
        },
        patternProperties: {
          type: "object",
          additionalProperties: { $dynamicRef: "#meta" },
          propertyNames: { format: "regex" },
          default: {}
        },
        dependentSchemas: {
          type: "object",
          additionalProperties: { $dynamicRef: "#meta" },
          default: {}
        },
        propertyNames: { $dynamicRef: "#meta" },
        if: { $dynamicRef: "#meta" },
        then: { $dynamicRef: "#meta" },
        else: { $dynamicRef: "#meta" },
        allOf: { $ref: "#/$defs/schemaArray" },
        anyOf: { $ref: "#/$defs/schemaArray" },
        oneOf: { $ref: "#/$defs/schemaArray" },
        not: { $dynamicRef: "#meta" }
      },
      $defs: {
        schemaArray: {
          type: "array",
          minItems: 1,
          items: { $dynamicRef: "#meta" }
        }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/unevaluated.json
var require_unevaluated2 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/unevaluated.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/unevaluated",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/unevaluated": true
      },
      $dynamicAnchor: "meta",
      title: "Unevaluated applicator vocabulary meta-schema",
      type: ["object", "boolean"],
      properties: {
        unevaluatedItems: { $dynamicRef: "#meta" },
        unevaluatedProperties: { $dynamicRef: "#meta" }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/content.json
var require_content = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/content.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/content",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/content": true
      },
      $dynamicAnchor: "meta",
      title: "Content vocabulary meta-schema",
      type: ["object", "boolean"],
      properties: {
        contentEncoding: { type: "string" },
        contentMediaType: { type: "string" },
        contentSchema: { $dynamicRef: "#meta" }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/core.json
var require_core3 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/core.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/core",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/core": true
      },
      $dynamicAnchor: "meta",
      title: "Core vocabulary meta-schema",
      type: ["object", "boolean"],
      properties: {
        $id: {
          $ref: "#/$defs/uriReferenceString",
          $comment: "Non-empty fragments not allowed.",
          pattern: "^[^#]*#?$"
        },
        $schema: { $ref: "#/$defs/uriString" },
        $ref: { $ref: "#/$defs/uriReferenceString" },
        $anchor: { $ref: "#/$defs/anchorString" },
        $dynamicRef: { $ref: "#/$defs/uriReferenceString" },
        $dynamicAnchor: { $ref: "#/$defs/anchorString" },
        $vocabulary: {
          type: "object",
          propertyNames: { $ref: "#/$defs/uriString" },
          additionalProperties: {
            type: "boolean"
          }
        },
        $comment: {
          type: "string"
        },
        $defs: {
          type: "object",
          additionalProperties: { $dynamicRef: "#meta" }
        }
      },
      $defs: {
        anchorString: {
          type: "string",
          pattern: "^[A-Za-z_][-A-Za-z0-9._]*$"
        },
        uriString: {
          type: "string",
          format: "uri"
        },
        uriReferenceString: {
          type: "string",
          format: "uri-reference"
        }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/format-annotation.json
var require_format_annotation = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/format-annotation.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/format-annotation",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/format-annotation": true
      },
      $dynamicAnchor: "meta",
      title: "Format vocabulary meta-schema for annotation results",
      type: ["object", "boolean"],
      properties: {
        format: { type: "string" }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/meta-data.json
var require_meta_data = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/meta-data.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/meta-data",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/meta-data": true
      },
      $dynamicAnchor: "meta",
      title: "Meta-data vocabulary meta-schema",
      type: ["object", "boolean"],
      properties: {
        title: {
          type: "string"
        },
        description: {
          type: "string"
        },
        default: true,
        deprecated: {
          type: "boolean",
          default: false
        },
        readOnly: {
          type: "boolean",
          default: false
        },
        writeOnly: {
          type: "boolean",
          default: false
        },
        examples: {
          type: "array",
          items: true
        }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/validation.json
var require_validation2 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/validation.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/validation",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/validation": true
      },
      $dynamicAnchor: "meta",
      title: "Validation vocabulary meta-schema",
      type: ["object", "boolean"],
      properties: {
        type: {
          anyOf: [
            { $ref: "#/$defs/simpleTypes" },
            {
              type: "array",
              items: { $ref: "#/$defs/simpleTypes" },
              minItems: 1,
              uniqueItems: true
            }
          ]
        },
        const: true,
        enum: {
          type: "array",
          items: true
        },
        multipleOf: {
          type: "number",
          exclusiveMinimum: 0
        },
        maximum: {
          type: "number"
        },
        exclusiveMaximum: {
          type: "number"
        },
        minimum: {
          type: "number"
        },
        exclusiveMinimum: {
          type: "number"
        },
        maxLength: { $ref: "#/$defs/nonNegativeInteger" },
        minLength: { $ref: "#/$defs/nonNegativeIntegerDefault0" },
        pattern: {
          type: "string",
          format: "regex"
        },
        maxItems: { $ref: "#/$defs/nonNegativeInteger" },
        minItems: { $ref: "#/$defs/nonNegativeIntegerDefault0" },
        uniqueItems: {
          type: "boolean",
          default: false
        },
        maxContains: { $ref: "#/$defs/nonNegativeInteger" },
        minContains: {
          $ref: "#/$defs/nonNegativeInteger",
          default: 1
        },
        maxProperties: { $ref: "#/$defs/nonNegativeInteger" },
        minProperties: { $ref: "#/$defs/nonNegativeIntegerDefault0" },
        required: { $ref: "#/$defs/stringArray" },
        dependentRequired: {
          type: "object",
          additionalProperties: {
            $ref: "#/$defs/stringArray"
          }
        }
      },
      $defs: {
        nonNegativeInteger: {
          type: "integer",
          minimum: 0
        },
        nonNegativeIntegerDefault0: {
          $ref: "#/$defs/nonNegativeInteger",
          default: 0
        },
        simpleTypes: {
          enum: ["array", "boolean", "integer", "null", "number", "object", "string"]
        },
        stringArray: {
          type: "array",
          items: { type: "string" },
          uniqueItems: true,
          default: []
        }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/index.js
var require_json_schema_2020_12 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var metaSchema = require_schema();
    var applicator = require_applicator2();
    var unevaluated = require_unevaluated2();
    var content = require_content();
    var core = require_core3();
    var format = require_format_annotation();
    var metadata = require_meta_data();
    var validation = require_validation2();
    var META_SUPPORT_DATA = ["/properties"];
    function addMetaSchema2020($data) {
      ;
      [
        metaSchema,
        applicator,
        unevaluated,
        content,
        core,
        with$data(this, format),
        metadata,
        with$data(this, validation)
      ].forEach((sch) => this.addMetaSchema(sch, void 0, false));
      return this;
      function with$data(ajv4, sch) {
        return $data ? ajv4.$dataMetaSchema(sch, META_SUPPORT_DATA) : sch;
      }
      __name(with$data, "with$data");
    }
    __name(addMetaSchema2020, "addMetaSchema2020");
    exports.default = addMetaSchema2020;
  }
});

// node_modules/ajv/dist/2020.js
var require__ = __commonJS({
  "node_modules/ajv/dist/2020.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MissingRefError = exports.ValidationError = exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = exports.Ajv2020 = void 0;
    var core_1 = require_core();
    var draft2020_1 = require_draft2020();
    var discriminator_1 = require_discriminator();
    var json_schema_2020_12_1 = require_json_schema_2020_12();
    var META_SCHEMA_ID = "https://json-schema.org/draft/2020-12/schema";
    var Ajv20204 = class extends core_1.default {
      static {
        __name(this, "Ajv2020");
      }
      constructor(opts = {}) {
        super({
          ...opts,
          dynamicRef: true,
          next: true,
          unevaluated: true
        });
      }
      _addVocabularies() {
        super._addVocabularies();
        draft2020_1.default.forEach((v) => this.addVocabulary(v));
        if (this.opts.discriminator)
          this.addKeyword(discriminator_1.default);
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        const { $data, meta } = this.opts;
        if (!meta)
          return;
        json_schema_2020_12_1.default.call(this, $data);
        this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : void 0);
      }
    };
    exports.Ajv2020 = Ajv20204;
    module.exports = exports = Ajv20204;
    module.exports.Ajv2020 = Ajv20204;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Ajv20204;
    var validate_1 = require_validate();
    Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return validate_1.KeywordCxt;
    }, "get") });
    var codegen_1 = require_codegen();
    Object.defineProperty(exports, "_", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return codegen_1._;
    }, "get") });
    Object.defineProperty(exports, "str", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return codegen_1.str;
    }, "get") });
    Object.defineProperty(exports, "stringify", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return codegen_1.stringify;
    }, "get") });
    Object.defineProperty(exports, "nil", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return codegen_1.nil;
    }, "get") });
    Object.defineProperty(exports, "Name", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return codegen_1.Name;
    }, "get") });
    Object.defineProperty(exports, "CodeGen", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return codegen_1.CodeGen;
    }, "get") });
    var validation_error_1 = require_validation_error();
    Object.defineProperty(exports, "ValidationError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return validation_error_1.default;
    }, "get") });
    var ref_error_1 = require_ref_error();
    Object.defineProperty(exports, "MissingRefError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return ref_error_1.default;
    }, "get") });
  }
});

// node_modules/ajv-formats/dist/formats.js
var require_formats = __commonJS({
  "node_modules/ajv-formats/dist/formats.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.formatNames = exports.fastFormats = exports.fullFormats = void 0;
    function fmtDef(validate3, compare) {
      return { validate: validate3, compare };
    }
    __name(fmtDef, "fmtDef");
    exports.fullFormats = {
      // date: http://tools.ietf.org/html/rfc3339#section-5.6
      date: fmtDef(date, compareDate),
      // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
      time: fmtDef(getTime(true), compareTime),
      "date-time": fmtDef(getDateTime(true), compareDateTime),
      "iso-time": fmtDef(getTime(), compareIsoTime),
      "iso-date-time": fmtDef(getDateTime(), compareIsoDateTime),
      // duration: https://tools.ietf.org/html/rfc3339#appendix-A
      duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri,
      "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
      // uri-template: https://tools.ietf.org/html/rfc6570
      "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
      // For the source: https://gist.github.com/dperini/729294
      // For test cases: https://mathiasbynens.be/demo/url-regex
      url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
      email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
      // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
      ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
      ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
      regex,
      // uuid: http://tools.ietf.org/html/rfc4122
      uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
      // JSON-pointer: https://tools.ietf.org/html/rfc6901
      // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
      "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
      "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
      // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
      "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
      // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
      // byte: https://github.com/miguelmota/is-base64
      byte,
      // signed 32 bit integer
      int32: { type: "number", validate: validateInt32 },
      // signed 64 bit integer
      int64: { type: "number", validate: validateInt64 },
      // C-type float
      float: { type: "number", validate: validateNumber },
      // C-type double
      double: { type: "number", validate: validateNumber },
      // hint to the UI to hide input strings
      password: true,
      // unchecked string payload
      binary: true
    };
    exports.fastFormats = {
      ...exports.fullFormats,
      date: fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, compareDate),
      time: fmtDef(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, compareTime),
      "date-time": fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, compareDateTime),
      "iso-time": fmtDef(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, compareIsoTime),
      "iso-date-time": fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, compareIsoDateTime),
      // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
      uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
      "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
      // email (sources from jsen validator):
      // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
      // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
      email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
    };
    exports.formatNames = Object.keys(exports.fullFormats);
    function isLeapYear(year2) {
      return year2 % 4 === 0 && (year2 % 100 !== 0 || year2 % 400 === 0);
    }
    __name(isLeapYear, "isLeapYear");
    var DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
    var DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function date(str) {
      const matches = DATE.exec(str);
      if (!matches)
        return false;
      const year2 = +matches[1];
      const month = +matches[2];
      const day2 = +matches[3];
      return month >= 1 && month <= 12 && day2 >= 1 && day2 <= (month === 2 && isLeapYear(year2) ? 29 : DAYS[month]);
    }
    __name(date, "date");
    function compareDate(d1, d2) {
      if (!(d1 && d2))
        return void 0;
      if (d1 > d2)
        return 1;
      if (d1 < d2)
        return -1;
      return 0;
    }
    __name(compareDate, "compareDate");
    var TIME = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
    function getTime(strictTimeZone) {
      return /* @__PURE__ */ __name(function time(str) {
        const matches = TIME.exec(str);
        if (!matches)
          return false;
        const hr = +matches[1];
        const min = +matches[2];
        const sec = +matches[3];
        const tz = matches[4];
        const tzSign = matches[5] === "-" ? -1 : 1;
        const tzH = +(matches[6] || 0);
        const tzM = +(matches[7] || 0);
        if (tzH > 23 || tzM > 59 || strictTimeZone && !tz)
          return false;
        if (hr <= 23 && min <= 59 && sec < 60)
          return true;
        const utcMin = min - tzM * tzSign;
        const utcHr = hr - tzH * tzSign - (utcMin < 0 ? 1 : 0);
        return (utcHr === 23 || utcHr === -1) && (utcMin === 59 || utcMin === -1) && sec < 61;
      }, "time");
    }
    __name(getTime, "getTime");
    function compareTime(s1, s2) {
      if (!(s1 && s2))
        return void 0;
      const t1 = (/* @__PURE__ */ new Date("2020-01-01T" + s1)).valueOf();
      const t2 = (/* @__PURE__ */ new Date("2020-01-01T" + s2)).valueOf();
      if (!(t1 && t2))
        return void 0;
      return t1 - t2;
    }
    __name(compareTime, "compareTime");
    function compareIsoTime(t1, t2) {
      if (!(t1 && t2))
        return void 0;
      const a1 = TIME.exec(t1);
      const a2 = TIME.exec(t2);
      if (!(a1 && a2))
        return void 0;
      t1 = a1[1] + a1[2] + a1[3];
      t2 = a2[1] + a2[2] + a2[3];
      if (t1 > t2)
        return 1;
      if (t1 < t2)
        return -1;
      return 0;
    }
    __name(compareIsoTime, "compareIsoTime");
    var DATE_TIME_SEPARATOR = /t|\s/i;
    function getDateTime(strictTimeZone) {
      const time = getTime(strictTimeZone);
      return /* @__PURE__ */ __name(function date_time(str) {
        const dateTime = str.split(DATE_TIME_SEPARATOR);
        return dateTime.length === 2 && date(dateTime[0]) && time(dateTime[1]);
      }, "date_time");
    }
    __name(getDateTime, "getDateTime");
    function compareDateTime(dt1, dt2) {
      if (!(dt1 && dt2))
        return void 0;
      const d1 = new Date(dt1).valueOf();
      const d2 = new Date(dt2).valueOf();
      if (!(d1 && d2))
        return void 0;
      return d1 - d2;
    }
    __name(compareDateTime, "compareDateTime");
    function compareIsoDateTime(dt1, dt2) {
      if (!(dt1 && dt2))
        return void 0;
      const [d1, t1] = dt1.split(DATE_TIME_SEPARATOR);
      const [d2, t2] = dt2.split(DATE_TIME_SEPARATOR);
      const res = compareDate(d1, d2);
      if (res === void 0)
        return void 0;
      return res || compareTime(t1, t2);
    }
    __name(compareIsoDateTime, "compareIsoDateTime");
    var NOT_URI_FRAGMENT = /\/|:/;
    var URI = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function uri(str) {
      return NOT_URI_FRAGMENT.test(str) && URI.test(str);
    }
    __name(uri, "uri");
    var BYTE = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function byte(str) {
      BYTE.lastIndex = 0;
      return BYTE.test(str);
    }
    __name(byte, "byte");
    var MIN_INT32 = -(2 ** 31);
    var MAX_INT322 = 2 ** 31 - 1;
    function validateInt32(value) {
      return Number.isInteger(value) && value <= MAX_INT322 && value >= MIN_INT32;
    }
    __name(validateInt32, "validateInt32");
    function validateInt64(value) {
      return Number.isInteger(value);
    }
    __name(validateInt64, "validateInt64");
    function validateNumber() {
      return true;
    }
    __name(validateNumber, "validateNumber");
    var Z_ANCHOR = /[^\\]\\Z/;
    function regex(str) {
      if (Z_ANCHOR.test(str))
        return false;
      try {
        new RegExp(str);
        return true;
      } catch (e) {
        return false;
      }
    }
    __name(regex, "regex");
  }
});

// node_modules/ajv/dist/vocabularies/draft7.js
var require_draft7 = __commonJS({
  "node_modules/ajv/dist/vocabularies/draft7.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var core_1 = require_core2();
    var validation_1 = require_validation();
    var applicator_1 = require_applicator();
    var format_1 = require_format2();
    var metadata_1 = require_metadata();
    var draft7Vocabularies = [
      core_1.default,
      validation_1.default,
      (0, applicator_1.default)(),
      format_1.default,
      metadata_1.metadataVocabulary,
      metadata_1.contentVocabulary
    ];
    exports.default = draft7Vocabularies;
  }
});

// node_modules/ajv/dist/refs/json-schema-draft-07.json
var require_json_schema_draft_07 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-draft-07.json"(exports, module) {
    module.exports = {
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "http://json-schema.org/draft-07/schema#",
      title: "Core schema meta-schema",
      definitions: {
        schemaArray: {
          type: "array",
          minItems: 1,
          items: { $ref: "#" }
        },
        nonNegativeInteger: {
          type: "integer",
          minimum: 0
        },
        nonNegativeIntegerDefault0: {
          allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }]
        },
        simpleTypes: {
          enum: ["array", "boolean", "integer", "null", "number", "object", "string"]
        },
        stringArray: {
          type: "array",
          items: { type: "string" },
          uniqueItems: true,
          default: []
        }
      },
      type: ["object", "boolean"],
      properties: {
        $id: {
          type: "string",
          format: "uri-reference"
        },
        $schema: {
          type: "string",
          format: "uri"
        },
        $ref: {
          type: "string",
          format: "uri-reference"
        },
        $comment: {
          type: "string"
        },
        title: {
          type: "string"
        },
        description: {
          type: "string"
        },
        default: true,
        readOnly: {
          type: "boolean",
          default: false
        },
        examples: {
          type: "array",
          items: true
        },
        multipleOf: {
          type: "number",
          exclusiveMinimum: 0
        },
        maximum: {
          type: "number"
        },
        exclusiveMaximum: {
          type: "number"
        },
        minimum: {
          type: "number"
        },
        exclusiveMinimum: {
          type: "number"
        },
        maxLength: { $ref: "#/definitions/nonNegativeInteger" },
        minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
        pattern: {
          type: "string",
          format: "regex"
        },
        additionalItems: { $ref: "#" },
        items: {
          anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }],
          default: true
        },
        maxItems: { $ref: "#/definitions/nonNegativeInteger" },
        minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
        uniqueItems: {
          type: "boolean",
          default: false
        },
        contains: { $ref: "#" },
        maxProperties: { $ref: "#/definitions/nonNegativeInteger" },
        minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
        required: { $ref: "#/definitions/stringArray" },
        additionalProperties: { $ref: "#" },
        definitions: {
          type: "object",
          additionalProperties: { $ref: "#" },
          default: {}
        },
        properties: {
          type: "object",
          additionalProperties: { $ref: "#" },
          default: {}
        },
        patternProperties: {
          type: "object",
          additionalProperties: { $ref: "#" },
          propertyNames: { format: "regex" },
          default: {}
        },
        dependencies: {
          type: "object",
          additionalProperties: {
            anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }]
          }
        },
        propertyNames: { $ref: "#" },
        const: true,
        enum: {
          type: "array",
          items: true,
          minItems: 1,
          uniqueItems: true
        },
        type: {
          anyOf: [
            { $ref: "#/definitions/simpleTypes" },
            {
              type: "array",
              items: { $ref: "#/definitions/simpleTypes" },
              minItems: 1,
              uniqueItems: true
            }
          ]
        },
        format: { type: "string" },
        contentMediaType: { type: "string" },
        contentEncoding: { type: "string" },
        if: { $ref: "#" },
        then: { $ref: "#" },
        else: { $ref: "#" },
        allOf: { $ref: "#/definitions/schemaArray" },
        anyOf: { $ref: "#/definitions/schemaArray" },
        oneOf: { $ref: "#/definitions/schemaArray" },
        not: { $ref: "#" }
      },
      default: true
    };
  }
});

// node_modules/ajv/dist/ajv.js
var require_ajv = __commonJS({
  "node_modules/ajv/dist/ajv.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MissingRefError = exports.ValidationError = exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = exports.Ajv = void 0;
    var core_1 = require_core();
    var draft7_1 = require_draft7();
    var discriminator_1 = require_discriminator();
    var draft7MetaSchema = require_json_schema_draft_07();
    var META_SUPPORT_DATA = ["/properties"];
    var META_SCHEMA_ID = "http://json-schema.org/draft-07/schema";
    var Ajv = class extends core_1.default {
      static {
        __name(this, "Ajv");
      }
      _addVocabularies() {
        super._addVocabularies();
        draft7_1.default.forEach((v) => this.addVocabulary(v));
        if (this.opts.discriminator)
          this.addKeyword(discriminator_1.default);
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        if (!this.opts.meta)
          return;
        const metaSchema = this.opts.$data ? this.$dataMetaSchema(draft7MetaSchema, META_SUPPORT_DATA) : draft7MetaSchema;
        this.addMetaSchema(metaSchema, META_SCHEMA_ID, false);
        this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : void 0);
      }
    };
    exports.Ajv = Ajv;
    module.exports = exports = Ajv;
    module.exports.Ajv = Ajv;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Ajv;
    var validate_1 = require_validate();
    Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return validate_1.KeywordCxt;
    }, "get") });
    var codegen_1 = require_codegen();
    Object.defineProperty(exports, "_", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return codegen_1._;
    }, "get") });
    Object.defineProperty(exports, "str", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return codegen_1.str;
    }, "get") });
    Object.defineProperty(exports, "stringify", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return codegen_1.stringify;
    }, "get") });
    Object.defineProperty(exports, "nil", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return codegen_1.nil;
    }, "get") });
    Object.defineProperty(exports, "Name", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return codegen_1.Name;
    }, "get") });
    Object.defineProperty(exports, "CodeGen", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return codegen_1.CodeGen;
    }, "get") });
    var validation_error_1 = require_validation_error();
    Object.defineProperty(exports, "ValidationError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return validation_error_1.default;
    }, "get") });
    var ref_error_1 = require_ref_error();
    Object.defineProperty(exports, "MissingRefError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return ref_error_1.default;
    }, "get") });
  }
});

// node_modules/ajv-formats/dist/limit.js
var require_limit = __commonJS({
  "node_modules/ajv-formats/dist/limit.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.formatLimitDefinition = void 0;
    var ajv_1 = require_ajv();
    var codegen_1 = require_codegen();
    var ops = codegen_1.operators;
    var KWDs = {
      formatMaximum: { okStr: "<=", ok: ops.LTE, fail: ops.GT },
      formatMinimum: { okStr: ">=", ok: ops.GTE, fail: ops.LT },
      formatExclusiveMaximum: { okStr: "<", ok: ops.LT, fail: ops.GTE },
      formatExclusiveMinimum: { okStr: ">", ok: ops.GT, fail: ops.LTE }
    };
    var error2 = {
      message: /* @__PURE__ */ __name(({ keyword, schemaCode }) => (0, codegen_1.str)`should be ${KWDs[keyword].okStr} ${schemaCode}`, "message"),
      params: /* @__PURE__ */ __name(({ keyword, schemaCode }) => (0, codegen_1._)`{comparison: ${KWDs[keyword].okStr}, limit: ${schemaCode}}`, "params")
    };
    exports.formatLimitDefinition = {
      keyword: Object.keys(KWDs),
      type: "string",
      schemaType: "string",
      $data: true,
      error: error2,
      code(cxt) {
        const { gen, data, schemaCode, keyword, it } = cxt;
        const { opts, self } = it;
        if (!opts.validateFormats)
          return;
        const fCxt = new ajv_1.KeywordCxt(it, self.RULES.all.format.definition, "format");
        if (fCxt.$data)
          validate$DataFormat();
        else
          validateFormat();
        function validate$DataFormat() {
          const fmts = gen.scopeValue("formats", {
            ref: self.formats,
            code: opts.code.formats
          });
          const fmt = gen.const("fmt", (0, codegen_1._)`${fmts}[${fCxt.schemaCode}]`);
          cxt.fail$data((0, codegen_1.or)((0, codegen_1._)`typeof ${fmt} != "object"`, (0, codegen_1._)`${fmt} instanceof RegExp`, (0, codegen_1._)`typeof ${fmt}.compare != "function"`, compareCode(fmt)));
        }
        __name(validate$DataFormat, "validate$DataFormat");
        function validateFormat() {
          const format = fCxt.schema;
          const fmtDef = self.formats[format];
          if (!fmtDef || fmtDef === true)
            return;
          if (typeof fmtDef != "object" || fmtDef instanceof RegExp || typeof fmtDef.compare != "function") {
            throw new Error(`"${keyword}": format "${format}" does not define "compare" function`);
          }
          const fmt = gen.scopeValue("formats", {
            key: format,
            ref: fmtDef,
            code: opts.code.formats ? (0, codegen_1._)`${opts.code.formats}${(0, codegen_1.getProperty)(format)}` : void 0
          });
          cxt.fail$data(compareCode(fmt));
        }
        __name(validateFormat, "validateFormat");
        function compareCode(fmt) {
          return (0, codegen_1._)`${fmt}.compare(${data}, ${schemaCode}) ${KWDs[keyword].fail} 0`;
        }
        __name(compareCode, "compareCode");
      },
      dependencies: ["format"]
    };
    var formatLimitPlugin = /* @__PURE__ */ __name((ajv4) => {
      ajv4.addKeyword(exports.formatLimitDefinition);
      return ajv4;
    }, "formatLimitPlugin");
    exports.default = formatLimitPlugin;
  }
});

// node_modules/ajv-formats/dist/index.js
var require_dist = __commonJS({
  "node_modules/ajv-formats/dist/index.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var formats_1 = require_formats();
    var limit_1 = require_limit();
    var codegen_1 = require_codegen();
    var fullName = new codegen_1.Name("fullFormats");
    var fastName = new codegen_1.Name("fastFormats");
    var formatsPlugin = /* @__PURE__ */ __name((ajv4, opts = { keywords: true }) => {
      if (Array.isArray(opts)) {
        addFormats4(ajv4, opts, formats_1.fullFormats, fullName);
        return ajv4;
      }
      const [formats, exportName] = opts.mode === "fast" ? [formats_1.fastFormats, fastName] : [formats_1.fullFormats, fullName];
      const list2 = opts.formats || formats_1.formatNames;
      addFormats4(ajv4, list2, formats, exportName);
      if (opts.keywords)
        (0, limit_1.default)(ajv4);
      return ajv4;
    }, "formatsPlugin");
    formatsPlugin.get = (name, mode = "full") => {
      const formats = mode === "fast" ? formats_1.fastFormats : formats_1.fullFormats;
      const f = formats[name];
      if (!f)
        throw new Error(`Unknown format "${name}"`);
      return f;
    };
    function addFormats4(ajv4, list2, fs, exportName) {
      var _a;
      var _b;
      (_a = (_b = ajv4.opts.code).formats) !== null && _a !== void 0 ? _a : _b.formats = (0, codegen_1._)`require("ajv-formats/dist/formats").${exportName}`;
      for (const f of list2)
        ajv4.addFormat(f, fs[f]);
    }
    __name(addFormats4, "addFormats");
    module.exports = exports = formatsPlugin;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = formatsPlugin;
  }
});

// ../external-solutions-api/worker.mjs
var SLUG = /^[a-z0-9][a-z0-9-]{0,79}$/;
var VERSION = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/;
var MAX_PUZZLE_ID = 2147483647;
var MAX_BYTES = 256 * 1024;
var MAX_BATCH = 24;
var MAX_PATH = 1024;
var MAX_MOVES = 3e3;
var MOVE = /^-?[A-Za-z][A-Za-z0-9_]{0,23}$/;
var HASH = /^[0-9a-f]{64}$/;
var METHODS = /* @__PURE__ */ new Set(["exact_enumeration", "team_submission", "algebraic", "search", "bfs", "beam_search", "human", "other"]);
var encoder = new TextEncoder();
function json(value, status = 200, extra = {}) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...extra } });
}
__name(json, "json");
function fail(error2, status, index) {
  return json(index === void 0 ? { error: error2 } : { error: error2, index }, status, status === 401 ? { "WWW-Authenticate": 'Bearer realm="external-solutions"' } : {});
}
__name(fail, "fail");
function hasKeys(o, required2, extra = []) {
  return o && Object.getPrototypeOf(o) === Object.prototype && required2.every((k) => Object.hasOwn(o, k)) && Object.keys(o).every((k) => required2.includes(k) || extra.includes(k));
}
__name(hasKeys, "hasKeys");
function short(s, max) {
  return typeof s === "string" && s.length > 0 && s.length <= max && s === s.trim() && !/[\u0000-\u001f\u007f]/.test(s);
}
__name(short, "short");
async function sha(s) {
  const raw = await crypto.subtle.digest("SHA-256", encoder.encode(s));
  return Array.from(new Uint8Array(raw), (x) => x.toString(16).padStart(2, "0")).join("");
}
__name(sha, "sha");
async function authorized(req, token) {
  const h = req.headers.get("Authorization");
  if (typeof token !== "string" || token.length < 32 || !h?.startsWith("Bearer ") || h.length > 512) return false;
  const [a, b] = await Promise.all([sha(token), sha(h.slice(7))]);
  let delta = 0;
  for (let i = 0; i < a.length; i++) delta |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return delta === 0;
}
__name(authorized, "authorized");
async function readBody(req) {
  if (Number(req.headers.get("Content-Length")) > MAX_BYTES) throw new Error("BODY_TOO_LARGE");
  if (req.headers.get("Content-Encoding") && req.headers.get("Content-Encoding") !== "identity") throw new Error("CONTENT_ENCODING");
  const reader = req.body?.getReader();
  if (!reader) throw new Error("INVALID_JSON");
  let total = 0, out = "";
  const decoder2 = new TextDecoder("utf-8", { fatal: true });
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) {
      await reader.cancel();
      throw new Error("BODY_TOO_LARGE");
    }
    out += decoder2.decode(value, { stream: true });
  }
  return JSON.parse(out + decoder2.decode());
}
__name(readBody, "readBody");
function sourceRecord(s) {
  if (!hasKeys(s, ["method", "url", "version", "credit", "license"], ["label"]) || !METHODS.has(s.method) || !short(s.url, 600) || !short(s.version, 80) || !short(s.credit, 200) || !short(s.license, 80) || s.label !== void 0 && !short(s.label, 120)) return null;
  let url;
  try {
    url = new URL(s.url);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || url.port) return null;
  return { method: s.method, url: url.href, version: s.version, credit: s.credit, license: s.license, ...s.label ? { label: s.label } : {} };
}
__name(sourceRecord, "sourceRecord");
async function add(req, env) {
  if (!await authorized(req, env.UPLOAD_TOKEN)) return fail("UNAUTHORIZED", 401);
  if (req.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase() !== "application/json") return fail("CONTENT_TYPE", 415);
  let body;
  try {
    body = await readBody(req);
  } catch (e) {
    if (e.message === "BODY_TOO_LARGE") return fail("BODY_TOO_LARGE", 413);
    if (e.message === "CONTENT_ENCODING") return fail("CONTENT_ENCODING", 415);
    return fail("INVALID_JSON", 400);
  }
  if (!hasKeys(body, ["competition", "context_version", "solutions"]) || typeof body.competition !== "string" || !SLUG.test(body.competition) || typeof body.context_version !== "string" || !VERSION.test(body.context_version) || !Array.isArray(body.solutions) || !body.solutions.length || body.solutions.length > MAX_BATCH) return fail("INVALID_BATCH", 400);
  const { competition, context_version: version } = body;
  let total = 0;
  const items = [];
  for (const [i, x] of body.solutions.entries()) {
    if (!hasKeys(x, ["puzzle_id", "path", "source"]) || !Number.isInteger(x.puzzle_id) || x.puzzle_id < 0 || x.puzzle_id > MAX_PUZZLE_ID || !Array.isArray(x.path) || x.path.length > MAX_PATH || x.path.some((m) => typeof m !== "string" || !MOVE.test(m))) return fail("INVALID_SOLUTION", 400, i);
    const source = sourceRecord(x.source);
    if (!source) return fail("INVALID_SOURCE", 400, i);
    total += x.path.length;
    if (total > MAX_MOVES) return fail("TOO_MANY_MOVES", 400, i);
    items.push({ ...x, source });
  }
  const ids = [...new Set(items.map((x) => x.puzzle_id))];
  const { results: rows } = await env.DB.prepare(
    `SELECT c.puzzle_id,c.start_json,c.goal_json,c.kind,m.moves_json
      FROM contexts c JOIN move_sets m ON m.competition=c.competition AND m.version=c.version AND m.kind=c.kind
      WHERE c.competition=? AND c.version=? AND c.puzzle_id IN (${ids.map(() => "?").join(",")})`
  ).bind(competition, version, ...ids).all();
  const trusted = /* @__PURE__ */ new Map(), moveSets = /* @__PURE__ */ new Map();
  for (const r of rows) {
    if (!moveSets.has(r.kind)) moveSets.set(r.kind, JSON.parse(r.moves_json));
    trusted.set(r.puzzle_id, { start: JSON.parse(r.start_json), goal: JSON.parse(r.goal_json), moves: moveSets.get(r.kind) });
  }
  for (const [i, x] of items.entries()) {
    const c = trusted.get(x.puzzle_id);
    if (!c) return fail("UNKNOWN_PUZZLE", 422, i);
    let state = c.start, tmp = new Array(state.length), previous = state;
    for (const move of x.path) {
      if (!Object.hasOwn(c.moves, move)) return fail("UNKNOWN_MOVE", 422, i);
      const permutation = c.moves[move];
      for (let j = 0; j < state.length; j++) tmp[j] = state[permutation[j]];
      previous = state;
      state = tmp;
      tmp = previous === c.start ? new Array(state.length) : previous;
    }
    if (state.length !== c.goal.length || state.some((v, j) => v !== c.goal[j])) return fail("TARGET_MISMATCH", 422, i);
  }
  const prepared = await Promise.all(items.map(async (x) => {
    const path = JSON.stringify(x.path), source = JSON.stringify(x.source);
    const [id, sourceId] = await Promise.all([sha(JSON.stringify([competition, version, x.puzzle_id, x.path])), sha(source)]);
    return { id, sourceId, source, path, puzzle: x.puzzle_id, length: x.path.length };
  }));
  const statements = prepared.flatMap((x) => [
    env.DB.prepare("INSERT INTO solutions (id,competition,version,puzzle_id,path_json,length) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING").bind(x.id, competition, version, x.puzzle, x.path, x.length),
    env.DB.prepare("INSERT INTO provenances VALUES (?, ?, ?) ON CONFLICT(solution_id,source_id) DO NOTHING").bind(x.id, x.sourceId, x.source)
  ]);
  const writes = await env.DB.batch(statements);
  const results = prepared.map((x, i) => ({ id: x.id, status: writes[2 * i].meta.changes ? "created" : writes[2 * i + 1].meta.changes ? "source_added" : "existing" }));
  return json({ competition, context_version: version, results }, results.some((x) => x.status !== "existing") ? 201 : 200);
}
__name(add, "add");
function rowOutput(r) {
  return {
    id: r.id,
    competition: r.competition,
    context_version: r.version,
    puzzle_id: r.puzzle_id,
    path: JSON.parse(r.path_json),
    length: r.length,
    verification: "replay_passed"
  };
}
__name(rowOutput, "rowOutput");
async function list(url, env) {
  const params = url.searchParams;
  const puzzle = params.get("puzzle_id") ?? "", after = params.get("after") ?? "", n = params.get("limit") ?? "24";
  const competition = params.get("competition") ?? "", version = params.get("context_version") ?? "";
  if (!SLUG.test(competition) || !VERSION.test(version) || !/^(0|[1-9][0-9]{0,9})$/.test(puzzle) || Number(puzzle) > MAX_PUZZLE_ID || after && !HASH.test(after) || !/^[1-9][0-9]?$/.test(n) || Number(n) > 50 || [...params.keys()].some((k) => !["competition", "context_version", "puzzle_id", "after", "limit"].includes(k) || params.getAll(k).length !== 1)) return fail("INVALID_QUERY", 400);
  const { results } = await env.DB.prepare("SELECT * FROM solutions WHERE competition=? AND version=? AND puzzle_id=? AND id>? ORDER BY id LIMIT ?").bind(competition, version, Number(puzzle), after, Number(n) + 1).all();
  const page = results.slice(0, Number(n));
  return json({ solutions: page.map(rowOutput), next_cursor: results.length > page.length ? page.at(-1).id : null });
}
__name(list, "list");
async function read(id, url, env) {
  const after = url.searchParams.get("source_after") ?? "";
  if (after && !HASH.test(after) || [...url.searchParams.keys()].some((k) => k !== "source_after" || url.searchParams.getAll(k).length !== 1)) return fail("INVALID_QUERY", 400);
  const r = await env.DB.prepare("SELECT * FROM solutions WHERE id=?").bind(id).first();
  if (!r) return fail("NOT_FOUND", 404);
  const { results } = await env.DB.prepare("SELECT source_id,source_json FROM provenances WHERE solution_id=? AND source_id>? ORDER BY source_id LIMIT 51").bind(id, after).all();
  const page = results.slice(0, 50);
  return json({ ...rowOutput(r), sources: page.map((p) => JSON.parse(p.source_json)), next_source_cursor: results.length > page.length ? page.at(-1).source_id : null });
}
__name(read, "read");
var worker_default = { async fetch(req, env) {
  const url = new URL(req.url);
  try {
    if (url.pathname === "/healthz" && req.method === "GET") {
      const r = await env.DB.prepare("SELECT COUNT(*) AS contexts FROM competitions").first();
      return json({ status: r.contexts ? "ready" : "context_empty", contexts: r.contexts }, r.contexts ? 200 : 503);
    }
    if (url.pathname === "/v1/contexts" && req.method === "GET") {
      if (url.search) return fail("INVALID_QUERY", 400);
      const { results } = await env.DB.prepare("SELECT slug AS competition,version AS context_version,puzzle_count FROM competitions ORDER BY slug,version LIMIT 101").all();
      return json({ contexts: results.slice(0, 100), truncated: results.length > 100 });
    }
    if (url.pathname === "/v1/solutions") {
      if (req.method === "POST") return await add(req, env);
      if (req.method === "GET") return await list(url, env);
      return json({ error: "METHOD_NOT_ALLOWED" }, 405, { Allow: "GET, POST" });
    }
    const id = url.pathname.match(/^\/v1\/solutions\/([0-9a-f]{64})$/)?.[1];
    if (id && req.method === "GET") return await read(id, url, env);
    return fail("NOT_FOUND", 404);
  } catch {
    return fail("SERVICE_UNAVAILABLE", 503);
  }
} };

// src/ingest-transport.ts
async function forwardIngest(request, fetch2) {
  const reader = request.body?.getReader();
  let finished = reader === void 0;
  const cancel = /* @__PURE__ */ __name(() => {
    if (reader && !finished) {
      finished = true;
      void reader.cancel().catch(() => void 0);
    }
  }, "cancel");
  const body = reader ? new ReadableStream({
    async pull(controller) {
      try {
        const chunk = await reader.read();
        if (chunk.done) {
          finished = true;
          controller.close();
        } else controller.enqueue(chunk.value);
      } catch (error2) {
        controller.error(error2);
      }
    },
    cancel() {
      cancel();
    }
  }, { highWaterMark: 0 }) : null;
  try {
    return await fetch2(new Request(request.url, { method: request.method, headers: request.headers, body }));
  } finally {
    cancel();
    try {
      reader?.releaseLock();
    } catch {
    }
  }
}
__name(forwardIngest, "forwardIngest");

// src/db.ts
async function findByIdempotency(db, key) {
  return db.prepare("SELECT submission_id, idempotency_key, run_id, author_name, competition, puzzle_type, puzzle_id, state, raw_r2_key, safe_error, retry_count, updated_at, github_path, github_commit_sha FROM submissions WHERE idempotency_key = ?").bind(key).first();
}
__name(findByIdempotency, "findByIdempotency");
async function findBySubmissionId(db, id) {
  return db.prepare("SELECT submission_id, idempotency_key, run_id, author_name, competition, puzzle_type, puzzle_id, state, raw_r2_key, safe_error, retry_count, updated_at, github_path, github_commit_sha FROM submissions WHERE submission_id = ?").bind(id).first();
}
__name(findBySubmissionId, "findBySubmissionId");
async function findStaleRecoverable(db, staleBefore, limit) {
  const result = await db.prepare(
    "SELECT submission_id, idempotency_key, run_id, author_name, competition, puzzle_type, puzzle_id, state, raw_r2_key, safe_error, retry_count, updated_at, github_path, github_commit_sha FROM submissions WHERE state IN (?,?,?,?) AND updated_at <= ? ORDER BY updated_at, submission_id LIMIT ?"
  ).bind("received", "queued", "retryable", "validating", staleBefore, limit).all();
  return result.results;
}
__name(findStaleRecoverable, "findStaleRecoverable");
async function findValidatedSubmissions(db, limit) {
  const result = await db.prepare("SELECT submission_id, idempotency_key, run_id, author_name, competition, puzzle_type, puzzle_id, state, raw_r2_key, safe_error, retry_count, updated_at, github_path, github_commit_sha FROM submissions WHERE state = ? ORDER BY updated_at, submission_id LIMIT ?").bind("validated", limit).all();
  return result.results;
}
__name(findValidatedSubmissions, "findValidatedSubmissions");
async function findStagedSubmissions(db, limit) {
  const result = await db.prepare("SELECT submission_id, idempotency_key, run_id, author_name, competition, puzzle_type, puzzle_id, state, raw_r2_key, safe_error, retry_count, updated_at, github_path, github_commit_sha FROM submissions WHERE state IN (?,?) ORDER BY updated_at, submission_id LIMIT ?").bind("staged", "published", limit).all();
  return result.results;
}
__name(findStagedSubmissions, "findStagedSubmissions");
async function transition(db, id, from, to, patch = {}) {
  if (from.length === 0) return false;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const assignments = ["state = ?", "updated_at = ?"];
  const bindings = [to, now];
  if (patch.safeError !== void 0) {
    assignments.push("safe_error = ?");
    bindings.push(patch.safeError);
  }
  if (patch.githubPath !== void 0) {
    assignments.push("github_path = ?");
    bindings.push(patch.githubPath);
  }
  if (patch.githubCommitSha !== void 0) {
    assignments.push("github_commit_sha = ?");
    bindings.push(patch.githubCommitSha);
  }
  if (patch.incrementRetryCount) assignments.push("retry_count = retry_count + 1");
  bindings.push(id, ...from);
  const result = await db.prepare(
    `UPDATE submissions SET ${assignments.join(", ")} WHERE submission_id = ? AND state IN (${from.map(() => "?").join(",")})`
  ).bind(...bindings).run();
  return result.meta.changes === 1;
}
__name(transition, "transition");

// src/ids.ts
var encoder2 = new TextEncoder();
function canonicalJson(value) {
  const seen = /* @__PURE__ */ new Set();
  const encode2 = /* @__PURE__ */ __name((item) => {
    if (item === null) return "null";
    switch (typeof item) {
      case "string":
        return JSON.stringify(item);
      case "boolean":
        return item ? "true" : "false";
      case "number":
        if (!Number.isFinite(item)) throw new TypeError("canonical_json_invalid_number");
        return Object.is(item, -0) ? "0" : String(item);
      case "object": {
        if (seen.has(item)) throw new TypeError("canonical_json_cycle");
        seen.add(item);
        let output;
        if (Array.isArray(item)) {
          output = `[${item.map(encode2).join(",")}]`;
        } else {
          const record = item;
          output = `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${encode2(record[key])}`).join(",")}}`;
        }
        seen.delete(item);
        return output;
      }
      default:
        throw new TypeError("canonical_json_unsupported_value");
    }
  }, "encode");
  return encode2(value);
}
__name(canonicalJson, "canonicalJson");
function semanticEnvelope(envelope) {
  const { client_submission_id: _clientSubmissionId, run_id: _runId, idempotency_key: _idempotencyKey, submitted_at: _submittedAt, ...semantic } = envelope;
  return semantic;
}
__name(semanticEnvelope, "semanticEnvelope");
async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder2.encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex, "sha256Hex");
async function computeIdempotency(envelope) {
  return sha256Hex(canonicalJson(semanticEnvelope(envelope)));
}
__name(computeIdempotency, "computeIdempotency");
function newSubmissionId(now = /* @__PURE__ */ new Date(), random = crypto.getRandomValues(new Uint8Array(10))) {
  const bytes = new Uint8Array(16);
  let millis = now.getTime();
  for (let index = 5; index >= 0; index -= 1) {
    bytes[index] = millis & 255;
    millis = Math.floor(millis / 256);
  }
  bytes.set(random, 6);
  bytes[6] = bytes[6] & 15 | 112;
  bytes[8] = bytes[8] & 63 | 128;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
__name(newSubmissionId, "newSubmissionId");
function rawObjectKey(submissionId, now = /* @__PURE__ */ new Date(), schemaVersion = 1) {
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  return `raw/v${schemaVersion}/${yyyy}/${mm}/${dd}/${submissionId}.json`;
}
__name(rawObjectKey, "rawObjectKey");

// src/schema.ts
var import__ = __toESM(require__(), 1);
var import_ajv_formats = __toESM(require_dist(), 1);

// ../../configs/cayleypy_results_schema_v1.json
var cayleypy_results_schema_v1_default = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://trydotatwo.github.io/cayleypy-results/result-batch-v1.schema.json",
  title: "Canonical CayleyPy Result Batch v1",
  type: "object",
  additionalProperties: false,
  required: [
    "schema_version",
    "results"
  ],
  properties: {
    schema_version: {
      type: "integer",
      const: 1
    },
    results: {
      type: "array",
      minItems: 1,
      maxItems: 2e3,
      items: {
        $ref: "#/$defs/result"
      }
    }
  },
  $defs: {
    identifier: {
      type: "string",
      minLength: 1,
      maxLength: 128,
      pattern: "^[A-Za-z0-9._:-]+$"
    },
    puzzle_type: {
      type: "string",
      minLength: 1,
      maxLength: 128,
      pattern: "^[A-Za-z0-9._/-]+$"
    },
    sha256: {
      type: "string",
      pattern: "^[a-f0-9]{64}$"
    },
    positive_integer: {
      type: "integer",
      minimum: 1
    },
    nonnegative_integer: {
      type: "integer",
      minimum: 0
    },
    state: {
      type: "array",
      minItems: 1,
      maxItems: 150,
      items: {
        type: "integer",
        minimum: 0,
        maximum: 255
      }
    },
    move_token: {
      type: "string",
      minLength: 1,
      maxLength: 128,
      pattern: "^[\\u0021-\\u002d\\u002f-\\u007e]+$"
    },
    token_path: {
      type: "array",
      maxItems: 4096,
      items: {
        $ref: "#/$defs/move_token"
      }
    },
    manifest: {
      type: "object",
      additionalProperties: false,
      required: [
        "state_len",
        "num_classes",
        "output_dim",
        "dtype"
      ],
      properties: {
        state_len: {
          $ref: "#/$defs/positive_integer",
          maximum: 150
        },
        num_classes: {
          $ref: "#/$defs/positive_integer"
        },
        hd1: {
          $ref: "#/$defs/positive_integer"
        },
        hd2: {
          $ref: "#/$defs/positive_integer"
        },
        nrd: {
          $ref: "#/$defs/positive_integer"
        },
        output_dim: {
          $ref: "#/$defs/positive_integer"
        },
        dtype: {
          const: "fp16"
        },
        normalization: {
          enum: [
            "batchnorm_folded",
            "layernorm"
          ]
        },
        layout: {
          type: "string",
          minLength: 1,
          maxLength: 256
        },
        batchnorm: {
          type: "string",
          maxLength: 256
        },
        embeddingbag: {
          type: "string",
          maxLength: 256
        },
        embedding: {
          type: "string",
          maxLength: 256
        },
        backend: {
          const: "piece_transformer"
        },
        model_arch: {
          const: "piece_transformer"
        },
        move_count: {
          $ref: "#/$defs/positive_integer"
        },
        num_pieces: {
          $ref: "#/$defs/positive_integer"
        },
        max_piece_size: {
          $ref: "#/$defs/positive_integer"
        },
        num_piece_types: {
          $ref: "#/$defs/positive_integer"
        },
        seq_len: {
          $ref: "#/$defs/positive_integer"
        },
        d_model: {
          $ref: "#/$defs/positive_integer"
        },
        nhead: {
          $ref: "#/$defs/positive_integer"
        },
        head_dim: {
          $ref: "#/$defs/positive_integer"
        },
        num_layers: {
          $ref: "#/$defs/positive_integer"
        },
        ff_dim: {
          $ref: "#/$defs/positive_integer"
        },
        activation: {
          type: "string",
          minLength: 1,
          maxLength: 64
        },
        pooling: {
          type: "string",
          minLength: 1,
          maxLength: 64
        },
        piece_layout: {
          type: "string",
          minLength: 1,
          maxLength: 128
        },
        piece_embed_mode: {
          type: "string",
          minLength: 1,
          maxLength: 128
        },
        input_embedding: {
          type: "string",
          minLength: 1,
          maxLength: 128
        },
        move_names: {
          type: "array",
          minItems: 1,
          maxItems: 256,
          items: {
            $ref: "#/$defs/move_token"
          }
        },
        model_family: {
          const: "cube555_q_blend"
        },
        blend_weights: {
          type: "array",
          minItems: 2,
          maxItems: 2,
          items: {
            type: "number",
            minimum: 0,
            maximum: 1
          }
        },
        checkpoint_sha256: {
          type: "array",
          minItems: 2,
          maxItems: 2,
          items: {
            $ref: "#/$defs/sha256"
          }
        },
        script_sha256: {
          $ref: "#/$defs/sha256"
        },
        score_contract: {
          const: "parent_q_fp32_blend_then_clamp_round"
        }
      }
    },
    result: {
      type: "object",
      additionalProperties: false,
      required: [
        "schema_version",
        "client_submission_id",
        "run_id",
        "idempotency_key",
        "submitted_at",
        "author",
        "kaggle",
        "competition",
        "puzzle_type",
        "puzzle_id",
        "proof",
        "orientation",
        "solution",
        "profile",
        "runtime",
        "model",
        "hardware",
        "timings",
        "solver_commit"
      ],
      properties: {
        schema_version: {
          type: "integer",
          const: 1
        },
        client_submission_id: {
          type: "string",
          pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
        },
        run_id: {
          $ref: "#/$defs/identifier"
        },
        idempotency_key: {
          $ref: "#/$defs/sha256"
        },
        submitted_at: {
          type: "string",
          format: "date-time",
          pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{1,9})?Z$"
        },
        author: {
          type: "object",
          additionalProperties: false,
          required: [
            "name",
            "verification"
          ],
          properties: {
            name: {
              type: "string",
              minLength: 1,
              maxLength: 128
            },
            kaggle_username: {
              type: "string",
              minLength: 1,
              maxLength: 128,
              pattern: "^[A-Za-z0-9._-]+$"
            },
            verification: {
              const: "claimed"
            }
          }
        },
        kaggle: {
          type: "object",
          additionalProperties: false,
          required: [
            "owner",
            "slug",
            "version",
            "notebook_sha256"
          ],
          properties: {
            owner: {
              type: "string",
              minLength: 1,
              maxLength: 128,
              pattern: "^[A-Za-z0-9._-]+$"
            },
            slug: {
              type: "string",
              minLength: 1,
              maxLength: 128,
              pattern: "^[A-Za-z0-9._-]+$"
            },
            version: {
              $ref: "#/$defs/positive_integer"
            },
            run_url: {
              type: "string",
              maxLength: 2048,
              format: "uri"
            },
            notebook_sha256: {
              $ref: "#/$defs/sha256"
            }
          }
        },
        competition: {
          $ref: "#/$defs/identifier"
        },
        puzzle_type: {
          $ref: "#/$defs/puzzle_type"
        },
        puzzle_id: {
          $ref: "#/$defs/nonnegative_integer"
        },
        proof: {
          type: "object",
          additionalProperties: false,
          required: [
            "initial_state",
            "central_state",
            "generators",
            "initial_state_sha256",
            "central_state_sha256",
            "generators_sha256",
            "reached_state_sha256"
          ],
          properties: {
            initial_state: {
              $ref: "#/$defs/state"
            },
            central_state: {
              $ref: "#/$defs/state"
            },
            generators: {
              type: "object",
              minProperties: 1,
              maxProperties: 256,
              additionalProperties: {
                $ref: "#/$defs/state"
              },
              propertyNames: {
                $ref: "#/$defs/move_token"
              }
            },
            initial_state_sha256: {
              $ref: "#/$defs/sha256"
            },
            central_state_sha256: {
              $ref: "#/$defs/sha256"
            },
            generators_sha256: {
              $ref: "#/$defs/sha256"
            },
            reached_state_sha256: {
              $ref: "#/$defs/sha256"
            }
          }
        },
        orientation: {
          type: "object",
          additionalProperties: false,
          required: [
            "search_mode",
            "final_orientation"
          ],
          properties: {
            search_mode: {
              enum: [
                "off",
                "after_original",
                "only"
              ]
            },
            final_orientation: {
              enum: [
                "original",
                "reflected",
                "source"
              ]
            },
            searched_path: {
              $ref: "#/$defs/token_path"
            },
            reflected_source_path: {
              $ref: "#/$defs/token_path"
            },
            reflected_source_sha256: {
              $ref: "#/$defs/sha256"
            }
          },
          allOf: [
            {
              if: {
                properties: {
                  final_orientation: {
                    const: "reflected"
                  }
                },
                required: [
                  "final_orientation"
                ]
              },
              then: {
                required: [
                  "searched_path",
                  "reflected_source_path",
                  "reflected_source_sha256"
                ]
              },
              else: {
                not: {
                  anyOf: [
                    {
                      required: [
                        "searched_path"
                      ]
                    },
                    {
                      required: [
                        "reflected_source_path"
                      ]
                    },
                    {
                      required: [
                        "reflected_source_sha256"
                      ]
                    }
                  ]
                }
              }
            }
          ]
        },
        solution: {
          type: "object",
          additionalProperties: false,
          required: [
            "path",
            "length",
            "solved_depth",
            "validation",
            "collection_status"
          ],
          properties: {
            path: {
              $ref: "#/$defs/token_path"
            },
            length: {
              type: "integer",
              minimum: 0,
              maximum: 4096
            },
            solved_depth: {
              type: "integer",
              minimum: 0,
              maximum: 4096
            },
            touch_depth: {
              type: "integer",
              minimum: 0,
              maximum: 4096
            },
            validation: {
              const: "valid"
            },
            collection_index: {
              type: "integer",
              minimum: 0
            },
            collection_status: {
              enum: [
                "first_solution",
                "depth_reached",
                "capacity_reached",
                "not_collected"
              ]
            }
          }
        },
        profile: {
          type: "object",
          additionalProperties: false,
          required: [
            "requested_beam",
            "effective_beam",
            "alignment_delta",
            "selected_profile",
            "evidence",
            "profile_evidence_version",
            "profile_power",
            "model_class",
            "world_size"
          ],
          properties: {
            requested_beam: {
              $ref: "#/$defs/positive_integer"
            },
            effective_beam: {
              $ref: "#/$defs/positive_integer"
            },
            alignment_delta: {
              $ref: "#/$defs/nonnegative_integer"
            },
            selected_profile: {
              type: "string",
              minLength: 1,
              maxLength: 128
            },
            evidence: {
              type: "string",
              minLength: 1,
              maxLength: 128
            },
            profile_evidence_version: {
              $ref: "#/$defs/positive_integer"
            },
            profile_power: {
              $ref: "#/$defs/positive_integer"
            },
            model_class: {
              enum: [
                "output1",
                "output_move_count"
              ]
            },
            world_size: {
              type: "integer",
              const: 2
            }
          }
        },
        runtime: {
          type: "object",
          additionalProperties: false,
          required: [
            "touch_bfs_radius",
            "solution_mode",
            "max_depth",
            "max_collected_solutions",
            "b_micro",
            "stream1_concurrency",
            "stream3_ring_slots",
            "shard_count",
            "shard_capacity_scale_ppm",
            "stream4_batch_candidates",
            "stream4_trigger_candidates",
            "stream4_active_sort_slots"
          ],
          properties: {
            touch_bfs_radius: {
              type: "integer",
              minimum: 0,
              maximum: 16
            },
            solution_mode: {
              enum: [
                "first",
                "collect"
              ]
            },
            max_depth: {
              type: "integer",
              minimum: 1,
              maximum: 4096
            },
            max_collected_solutions: {
              type: "integer",
              minimum: 1,
              maximum: 1e6
            },
            b_micro: {
              $ref: "#/$defs/positive_integer"
            },
            stream1_concurrency: {
              $ref: "#/$defs/positive_integer"
            },
            stream3_ring_slots: {
              $ref: "#/$defs/positive_integer"
            },
            shard_count: {
              $ref: "#/$defs/positive_integer"
            },
            shard_capacity_scale_ppm: {
              $ref: "#/$defs/positive_integer"
            },
            stream4_batch_candidates: {
              $ref: "#/$defs/positive_integer"
            },
            stream4_trigger_candidates: {
              $ref: "#/$defs/positive_integer"
            },
            stream4_active_sort_slots: {
              $ref: "#/$defs/positive_integer"
            }
          }
        },
        model: {
          type: "object",
          additionalProperties: false,
          required: [
            "filename",
            "sha256",
            "format",
            "manifest"
          ],
          properties: {
            filename: {
              type: "string",
              minLength: 1,
              maxLength: 255,
              pattern: "^[^/\\\\]+$"
            },
            sha256: {
              $ref: "#/$defs/sha256"
            },
            format: {
              enum: [
                "batchnorm-folded",
                "resmlp-layernorm",
                "piece-transformer",
                "cube555-q-blend"
              ]
            },
            manifest: {
              $ref: "#/$defs/manifest"
            }
          }
        },
        hardware: {
          type: "object",
          additionalProperties: false,
          required: [
            "platform",
            "gpu_names",
            "accelerator_count",
            "world_size"
          ],
          properties: {
            platform: {
              type: "string",
              minLength: 1,
              maxLength: 128
            },
            gpu_names: {
              type: "array",
              minItems: 1,
              maxItems: 16,
              items: {
                type: "string",
                minLength: 1,
                maxLength: 128
              }
            },
            accelerator_count: {
              $ref: "#/$defs/positive_integer"
            },
            world_size: {
              type: "integer",
              const: 2
            }
          }
        },
        timings: {
          type: "object",
          additionalProperties: false,
          required: [
            "solve_us",
            "wall_us"
          ],
          properties: {
            solve_us: {
              $ref: "#/$defs/nonnegative_integer"
            },
            wall_us: {
              $ref: "#/$defs/nonnegative_integer"
            }
          }
        },
        solver_commit: {
          type: "string",
          pattern: "^[a-f0-9]{40}$"
        }
      }
    }
  }
};

// src/replay.ts
var MAX_LOGICAL_STATE_LENGTH = 150;
var MAX_PATH_LENGTH = 4096;
var MAX_MOVE_COUNT = 256;
var MAX_PROOF_INTEGER_CELLS = MAX_LOGICAL_STATE_LENGTH * (MAX_MOVE_COUNT + 2);
function validState(state, stateLength) {
  return stateLength >= 1 && (stateLength <= 120 || stateLength === 150) && state.length === stateLength && state.every((value) => Number.isInteger(value) && value >= 0 && value < stateLength);
}
__name(validState, "validState");
function validPermutation(permutation, stateLength) {
  if (!validState(permutation, stateLength)) return false;
  const seen = new Uint8Array(stateLength);
  for (const source of permutation) {
    if (!Number.isInteger(source) || source < 0 || source >= stateLength || seen[source] !== 0) return false;
    seen[source] = 1;
  }
  return true;
}
__name(validPermutation, "validPermutation");
function validProofBounds(path, generators, stateLength) {
  const entries = Object.entries(generators);
  if (path.length > MAX_PATH_LENGTH || entries.length > MAX_MOVE_COUNT) return false;
  if (stateLength * (entries.length + 2) > MAX_PROOF_INTEGER_CELLS) return false;
  return entries.every(([name, permutation]) => name.length > 0 && validPermutation(permutation, stateLength));
}
__name(validProofBounds, "validProofBounds");
function replayPath(initial, path, generators, stateLength) {
  if (!validState(initial, stateLength)) return { ok: false, code: "state_length" };
  if (!validProofBounds(path, generators, stateLength)) return { ok: false, code: "proof_bounds" };
  let state = [...initial];
  for (const token of path) {
    const permutation = generators[token];
    if (permutation === void 0) return { ok: false, code: "unknown_move" };
    state = permutation.map((source) => state[source]);
  }
  return { ok: true, state };
}
__name(replayPath, "replayPath");
function inversePermutation(permutation) {
  const inverse = new Array(permutation.length);
  for (let target2 = 0; target2 < permutation.length; target2 += 1) inverse[permutation[target2]] = target2;
  return inverse;
}
__name(inversePermutation, "inversePermutation");
function invertPath(path, generators, stateLength) {
  if (!validProofBounds(path, generators, stateLength)) return { ok: false, code: "proof_bounds" };
  const namesByPermutation = /* @__PURE__ */ new Map();
  for (const [name, permutation] of Object.entries(generators)) {
    const key = permutation.join(",");
    const names = namesByPermutation.get(key) ?? [];
    names.push(name);
    namesByPermutation.set(key, names);
  }
  const inverted = [];
  for (let index = path.length - 1; index >= 0; index -= 1) {
    const permutation = generators[path[index]];
    if (permutation === void 0) return { ok: false, code: "unknown_move" };
    const inverseNames = namesByPermutation.get(inversePermutation(permutation).join(","));
    if (inverseNames === void 0 || inverseNames.length !== 1) return { ok: false, code: "inverse_missing" };
    inverted.push(inverseNames[0]);
  }
  return { ok: true, path: inverted };
}
__name(invertPath, "invertPath");

// src/schema.ts
var MAX_SERIALIZED_BATCH_BYTES = 4 * 1024 * 1024;
var MAX_SERIALIZED_ENVELOPE_BYTES = 256 * 1024;
var ajv = new import__.default({ allErrors: true, strict: true, strictRequired: false, strictTypes: false, allowUnionTypes: true });
(0, import_ajv_formats.default)(ajv);
var validate = ajv.compile(cayleypy_results_schema_v1_default);
function isResultBatchV1(value) {
  return validate(value);
}
__name(isResultBatchV1, "isResultBatchV1");
function byteLength(value) {
  return new TextEncoder().encode(canonicalJson(value)).byteLength;
}
__name(byteLength, "byteLength");
function integrityError(path, keyword) {
  return { path, keyword };
}
__name(integrityError, "integrityError");
async function validateEnvelopeIntegrity(envelope) {
  const errors = [];
  const { proof, model, profile, orientation, solution } = envelope;
  const stateLength = model.manifest.state_len;
  if (stateLength < 1 || stateLength > 120 && stateLength !== 150) errors.push(integrityError("/model/manifest/state_len", "stateLength"));
  const numClasses = model.manifest.num_classes;
  for (const [name, state] of [["initial_state", proof.initial_state], ["central_state", proof.central_state]]) {
    if (state.length !== stateLength) errors.push(integrityError(`/proof/${name}`, "stateLength"));
    if (state.some((value) => !Number.isInteger(value) || value < 0 || value >= numClasses)) errors.push(integrityError(`/proof/${name}`, "stateClasses"));
  }
  const centralClasses = new Set(proof.central_state.filter((value) => Number.isInteger(value)));
  if (numClasses < 1 || centralClasses.size !== numClasses || [...centralClasses].some((value) => value < 0 || value >= numClasses)) {
    errors.push(integrityError("/model/manifest/num_classes", "stateClasses"));
  }
  for (const [name, permutation] of Object.entries(proof.generators)) {
    if (permutation.length !== stateLength || new Set(permutation).size !== stateLength || permutation.some((value) => value < 0 || value >= stateLength)) {
      errors.push(integrityError(`/proof/generators/${name}`, "permutation"));
    }
  }
  const expectedHashes = [
    ["/proof/initial_state_sha256", proof.initial_state, proof.initial_state_sha256],
    ["/proof/central_state_sha256", proof.central_state, proof.central_state_sha256],
    ["/proof/generators_sha256", proof.generators, proof.generators_sha256]
  ];
  for (const [path, value, claimed] of expectedHashes) {
    if (await sha256Hex(canonicalJson(value)) !== claimed) errors.push(integrityError(path, "proofHash"));
  }
  if (solution.length !== solution.path.length) errors.push(integrityError("/solution/length", "solutionLength"));
  if (solution.path.length > MAX_PATH_LENGTH) errors.push(integrityError("/solution/path", "proofBounds"));
  if (Object.keys(proof.generators).length > MAX_MOVE_COUNT) errors.push(integrityError("/proof/generators", "proofBounds"));
  const replay = replayPath(proof.initial_state, solution.path, proof.generators, stateLength);
  if (!replay.ok) errors.push(integrityError("/solution/path", replay.code === "unknown_move" ? "unknownMove" : replay.code === "proof_bounds" ? "proofBounds" : "permutation"));
  else {
    if (await sha256Hex(canonicalJson(replay.state)) !== proof.reached_state_sha256) errors.push(integrityError("/proof/reached_state_sha256", "proofHash"));
    if (canonicalJson(replay.state) !== canonicalJson(proof.central_state)) errors.push(integrityError("/solution/path", "replayTarget"));
  }
  const reflected = orientation.final_orientation === "reflected";
  if (reflected) {
    const source = orientation.reflected_source_path;
    if (!source || !orientation.searched_path || !orientation.reflected_source_sha256) errors.push(integrityError("/orientation", "reflectionProvenance"));
    else if (await sha256Hex(source.join(".")) !== orientation.reflected_source_sha256) errors.push(integrityError("/orientation/reflected_source_sha256", "reflectionHash"));
    else {
      const sourceReplay = replayPath(proof.initial_state, source, proof.generators, stateLength);
      if (!sourceReplay.ok || canonicalJson(sourceReplay.state) !== canonicalJson(proof.central_state)) errors.push(integrityError("/orientation/reflected_source_path", "reflectionReplay"));
      else {
        const reflectedState = replayPath(proof.central_state, source, proof.generators, stateLength);
        const searchedReplay = reflectedState.ok ? replayPath(reflectedState.state, orientation.searched_path, proof.generators, stateLength) : reflectedState;
        if (!searchedReplay.ok || canonicalJson(searchedReplay.state) !== canonicalJson(proof.central_state)) errors.push(integrityError("/orientation/searched_path", "reflectionReplay"));
        const inverse = invertPath(orientation.searched_path, proof.generators, stateLength);
        if (!inverse.ok || canonicalJson(inverse.path) !== canonicalJson(solution.path)) errors.push(integrityError("/solution/path", "reflectionInverse"));
      }
    }
  } else if (orientation.searched_path || orientation.reflected_source_path || orientation.reflected_source_sha256) {
    errors.push(integrityError("/orientation", "reflectionProvenance"));
  }
  const moveCount = Object.keys(proof.generators).length;
  if (profile.model_class === "output1" && model.manifest.output_dim !== 1 || profile.model_class === "output_move_count" && model.manifest.output_dim !== moveCount) {
    errors.push(integrityError("/model/manifest/output_dim", "modelHead"));
  }
  if (await computeIdempotency(envelope) !== envelope.idempotency_key) errors.push(integrityError("/idempotency_key", "idempotency"));
  if (byteLength(envelope) > MAX_SERIALIZED_ENVELOPE_BYTES) errors.push(integrityError("", "maxEnvelopeBytes"));
  return errors;
}
__name(validateEnvelopeIntegrity, "validateEnvelopeIntegrity");
function validateBatch(value, rawByteLength, maxBytes = MAX_SERIALIZED_BATCH_BYTES) {
  let length = rawByteLength;
  if (length === void 0) {
    try {
      length = byteLength(value);
    } catch {
      return { ok: false, errors: [integrityError("", "serialization")] };
    }
  }
  if (length === void 0 || length > maxBytes) return { ok: false, errors: [integrityError("", "maxBytes")] };
  if (!isResultBatchV1(value)) return { ok: false, errors: (validate.errors ?? []).map((error2) => ({ path: error2.instancePath, keyword: error2.keyword })) };
  return { ok: true, value };
}
__name(validateBatch, "validateBatch");

// src/schema-v2.ts
var import__2 = __toESM(require__(), 1);
var import_ajv_formats2 = __toESM(require_dist(), 1);

// ../../configs/cayleypy_results_schema_v2.json
var cayleypy_results_schema_v2_default = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://trydotatwo.github.io/cayleypy-results/result-batch-v2.schema.json",
  title: "Canonical CayleyPy SLURM Result Batch v2",
  type: "object",
  additionalProperties: false,
  required: [
    "schema_version",
    "results"
  ],
  properties: {
    schema_version: {
      type: "integer",
      const: 2
    },
    results: {
      type: "array",
      minItems: 1,
      maxItems: 2e3,
      items: {
        $ref: "#/$defs/result"
      }
    }
  },
  $defs: {
    identifier: {
      type: "string",
      minLength: 1,
      maxLength: 128,
      pattern: "^[A-Za-z0-9._:-]+$"
    },
    puzzle_type: {
      type: "string",
      minLength: 1,
      maxLength: 128,
      pattern: "^[A-Za-z0-9._/-]+$"
    },
    sha256: {
      type: "string",
      pattern: "^[a-f0-9]{64}$"
    },
    positive_integer: {
      type: "integer",
      minimum: 1
    },
    nonnegative_integer: {
      type: "integer",
      minimum: 0
    },
    state: {
      type: "array",
      minItems: 1,
      maxItems: 120,
      items: {
        type: "integer",
        minimum: 0,
        maximum: 255
      }
    },
    move_token: {
      type: "string",
      minLength: 1,
      maxLength: 128,
      pattern: "^[\\u0021-\\u002d\\u002f-\\u007e]+$"
    },
    token_path: {
      type: "array",
      maxItems: 4096,
      items: {
        $ref: "#/$defs/move_token"
      }
    },
    manifest: {
      type: "object",
      additionalProperties: false,
      required: [
        "state_len",
        "num_classes",
        "output_dim",
        "dtype"
      ],
      properties: {
        state_len: {
          $ref: "#/$defs/positive_integer",
          maximum: 120
        },
        num_classes: {
          $ref: "#/$defs/positive_integer"
        },
        hd1: {
          $ref: "#/$defs/positive_integer"
        },
        hd2: {
          $ref: "#/$defs/positive_integer"
        },
        nrd: {
          $ref: "#/$defs/positive_integer"
        },
        output_dim: {
          $ref: "#/$defs/positive_integer"
        },
        dtype: {
          const: "fp16"
        },
        normalization: {
          enum: [
            "batchnorm_folded",
            "layernorm"
          ]
        },
        layout: {
          type: "string",
          minLength: 1,
          maxLength: 256
        },
        batchnorm: {
          type: "string",
          maxLength: 256
        },
        embeddingbag: {
          type: "string",
          maxLength: 256
        },
        embedding: {
          type: "string",
          maxLength: 256
        },
        backend: {
          const: "piece_transformer"
        },
        model_arch: {
          const: "piece_transformer"
        },
        move_count: {
          $ref: "#/$defs/positive_integer"
        },
        num_pieces: {
          $ref: "#/$defs/positive_integer"
        },
        max_piece_size: {
          $ref: "#/$defs/positive_integer"
        },
        num_piece_types: {
          $ref: "#/$defs/positive_integer"
        },
        seq_len: {
          $ref: "#/$defs/positive_integer"
        },
        d_model: {
          $ref: "#/$defs/positive_integer"
        },
        nhead: {
          $ref: "#/$defs/positive_integer"
        },
        head_dim: {
          $ref: "#/$defs/positive_integer"
        },
        num_layers: {
          $ref: "#/$defs/positive_integer"
        },
        ff_dim: {
          $ref: "#/$defs/positive_integer"
        },
        activation: {
          type: "string",
          minLength: 1,
          maxLength: 64
        },
        pooling: {
          type: "string",
          minLength: 1,
          maxLength: 64
        },
        piece_layout: {
          type: "string",
          minLength: 1,
          maxLength: 128
        },
        piece_embed_mode: {
          type: "string",
          minLength: 1,
          maxLength: 128
        },
        input_embedding: {
          type: "string",
          minLength: 1,
          maxLength: 128
        },
        move_names: {
          type: "array",
          minItems: 1,
          maxItems: 256,
          items: {
            $ref: "#/$defs/move_token"
          }
        }
      }
    },
    result: {
      type: "object",
      additionalProperties: false,
      required: [
        "schema_version",
        "client_submission_id",
        "run_id",
        "idempotency_key",
        "submitted_at",
        "author",
        "competition",
        "puzzle_type",
        "puzzle_id",
        "proof",
        "orientation",
        "solution",
        "profile",
        "runtime",
        "model",
        "hardware",
        "timings",
        "provenance"
      ],
      properties: {
        schema_version: {
          type: "integer",
          const: 2
        },
        client_submission_id: {
          type: "string",
          pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
        },
        run_id: {
          $ref: "#/$defs/identifier"
        },
        idempotency_key: {
          $ref: "#/$defs/sha256"
        },
        submitted_at: {
          type: "string",
          format: "date-time",
          pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{1,9})?Z$"
        },
        author: {
          type: "object",
          additionalProperties: false,
          required: [
            "name",
            "verification"
          ],
          properties: {
            name: {
              type: "string",
              minLength: 1,
              maxLength: 128
            },
            verification: {
              const: "claimed"
            }
          }
        },
        competition: {
          $ref: "#/$defs/identifier"
        },
        puzzle_type: {
          $ref: "#/$defs/puzzle_type"
        },
        puzzle_id: {
          $ref: "#/$defs/nonnegative_integer"
        },
        proof: {
          type: "object",
          additionalProperties: false,
          required: [
            "initial_state",
            "central_state",
            "generators",
            "initial_state_sha256",
            "central_state_sha256",
            "generators_sha256",
            "reached_state_sha256"
          ],
          properties: {
            initial_state: {
              $ref: "#/$defs/state"
            },
            central_state: {
              $ref: "#/$defs/state"
            },
            generators: {
              type: "object",
              minProperties: 1,
              maxProperties: 256,
              additionalProperties: {
                $ref: "#/$defs/state"
              },
              propertyNames: {
                $ref: "#/$defs/move_token"
              }
            },
            initial_state_sha256: {
              $ref: "#/$defs/sha256"
            },
            central_state_sha256: {
              $ref: "#/$defs/sha256"
            },
            generators_sha256: {
              $ref: "#/$defs/sha256"
            },
            reached_state_sha256: {
              $ref: "#/$defs/sha256"
            }
          }
        },
        orientation: {
          type: "object",
          additionalProperties: false,
          required: [
            "search_mode",
            "final_orientation"
          ],
          properties: {
            search_mode: {
              enum: [
                "off",
                "after",
                "only"
              ]
            },
            final_orientation: {
              enum: [
                "original",
                "reflected",
                "source"
              ]
            },
            searched_path: {
              $ref: "#/$defs/token_path"
            },
            reflected_source_path: {
              $ref: "#/$defs/token_path"
            },
            reflected_source_sha256: {
              $ref: "#/$defs/sha256"
            }
          },
          allOf: [
            {
              if: {
                properties: {
                  final_orientation: {
                    const: "reflected"
                  }
                },
                required: [
                  "final_orientation"
                ]
              },
              then: {
                required: [
                  "searched_path",
                  "reflected_source_path",
                  "reflected_source_sha256"
                ]
              },
              else: {
                not: {
                  anyOf: [
                    {
                      required: [
                        "searched_path"
                      ]
                    },
                    {
                      required: [
                        "reflected_source_path"
                      ]
                    },
                    {
                      required: [
                        "reflected_source_sha256"
                      ]
                    }
                  ]
                }
              }
            }
          ]
        },
        solution: {
          type: "object",
          additionalProperties: false,
          required: [
            "path",
            "length",
            "solved_depth",
            "validation",
            "collection_status"
          ],
          properties: {
            path: {
              $ref: "#/$defs/token_path"
            },
            length: {
              type: "integer",
              minimum: 0,
              maximum: 4096
            },
            solved_depth: {
              type: "integer",
              minimum: 0,
              maximum: 4096
            },
            touch_depth: {
              type: "integer",
              minimum: 0,
              maximum: 4096
            },
            validation: {
              const: "valid"
            },
            collection_index: {
              type: "integer",
              minimum: 0
            },
            collection_status: {
              enum: [
                "first_solution",
                "depth_reached",
                "capacity_reached",
                "not_collected"
              ]
            }
          }
        },
        profile: {
          type: "object",
          additionalProperties: false,
          required: [
            "requested_beam",
            "effective_beam",
            "alignment_delta",
            "profile_power",
            "profile_anchor_beam",
            "profile_status",
            "profile_evidence_id",
            "gpu_family",
            "vram_mib",
            "native_sm",
            "world_size",
            "backend",
            "model_class"
          ],
          properties: {
            requested_beam: {
              type: "integer",
              minimum: 1
            },
            effective_beam: {
              type: "integer",
              minimum: 1
            },
            alignment_delta: {
              type: "integer",
              minimum: 0
            },
            profile_power: {
              maximum: 52,
              type: "integer",
              minimum: 0
            },
            profile_anchor_beam: {
              type: "integer",
              minimum: 1
            },
            profile_status: {
              enum: [
                "measured",
                "bounded_from_measured"
              ]
            },
            profile_evidence_id: {
              maxLength: 128,
              pattern: "^[A-Za-z0-9._:+-]+$",
              minLength: 1,
              type: "string"
            },
            gpu_family: {
              maxLength: 64,
              pattern: "^[A-Za-z0-9._+-]+$",
              minLength: 1,
              type: "string"
            },
            vram_mib: {
              maximum: 1048576,
              type: "integer",
              minimum: 1
            },
            native_sm: {
              enum: [
                75,
                80,
                86,
                89,
                90,
                120
              ]
            },
            world_size: {
              maximum: 16,
              type: "integer",
              minimum: 1
            },
            backend: {
              enum: [
                "mlp",
                "piece_transformer"
              ]
            },
            model_class: {
              enum: [
                "output1",
                "output_move_count"
              ]
            }
          }
        },
        runtime: {
          type: "object",
          additionalProperties: false,
          required: [
            "touch_bfs_radius",
            "solution_mode",
            "max_depth",
            "max_collected_solutions",
            "b_micro",
            "stream1_concurrency",
            "stream3_ring_slots",
            "shard_count",
            "shard_capacity_scale_ppm",
            "stream4_batch_candidates",
            "stream4_trigger_candidates",
            "stream4_active_sort_slots"
          ],
          properties: {
            touch_bfs_radius: {
              type: "integer",
              minimum: 0,
              maximum: 16
            },
            solution_mode: {
              enum: [
                "first",
                "collect"
              ]
            },
            max_depth: {
              type: "integer",
              minimum: 1,
              maximum: 4096
            },
            max_collected_solutions: {
              type: "integer",
              minimum: 1,
              maximum: 1e6
            },
            b_micro: {
              $ref: "#/$defs/positive_integer"
            },
            stream1_concurrency: {
              $ref: "#/$defs/positive_integer"
            },
            stream3_ring_slots: {
              $ref: "#/$defs/positive_integer"
            },
            shard_count: {
              $ref: "#/$defs/positive_integer"
            },
            shard_capacity_scale_ppm: {
              $ref: "#/$defs/positive_integer"
            },
            stream4_batch_candidates: {
              $ref: "#/$defs/positive_integer"
            },
            stream4_trigger_candidates: {
              $ref: "#/$defs/positive_integer"
            },
            stream4_active_sort_slots: {
              $ref: "#/$defs/positive_integer"
            }
          }
        },
        model: {
          type: "object",
          additionalProperties: false,
          required: [
            "filename",
            "sha256",
            "format",
            "manifest"
          ],
          properties: {
            filename: {
              type: "string",
              minLength: 1,
              maxLength: 255,
              pattern: "^[^/\\\\]+$"
            },
            sha256: {
              $ref: "#/$defs/sha256"
            },
            format: {
              enum: [
                "batchnorm-folded",
                "resmlp-layernorm",
                "piece-transformer"
              ]
            },
            manifest: {
              $ref: "#/$defs/manifest"
            }
          }
        },
        hardware: {
          type: "object",
          additionalProperties: false,
          required: [
            "platform",
            "gpu_names",
            "accelerator_count",
            "world_size",
            "native_sm",
            "vram_mib_per_gpu",
            "driver_version"
          ],
          properties: {
            platform: {
              const: "slurm"
            },
            gpu_names: {
              minItems: 1,
              items: {
                maxLength: 128,
                minLength: 1,
                type: "string"
              },
              type: "array",
              maxItems: 16
            },
            accelerator_count: {
              maximum: 16,
              type: "integer",
              minimum: 1
            },
            world_size: {
              maximum: 16,
              type: "integer",
              minimum: 1
            },
            native_sm: {
              enum: [
                75,
                80,
                86,
                89,
                90,
                120
              ]
            },
            vram_mib_per_gpu: {
              maximum: 1048576,
              type: "integer",
              minimum: 1
            },
            driver_version: {
              maxLength: 64,
              pattern: "^[A-Za-z0-9._+-]+$",
              minLength: 1,
              type: "string"
            }
          }
        },
        timings: {
          type: "object",
          additionalProperties: false,
          required: [
            "solve_us",
            "wall_us"
          ],
          properties: {
            solve_us: {
              $ref: "#/$defs/nonnegative_integer"
            },
            wall_us: {
              $ref: "#/$defs/nonnegative_integer"
            }
          }
        },
        provenance: {
          type: "object",
          additionalProperties: false,
          required: [
            "platform",
            "cluster_name",
            "slurm_job_id",
            "slurm_array_task_id",
            "run_id",
            "release_tag",
            "release_asset",
            "release_manifest_sha256",
            "solver_commit"
          ],
          properties: {
            platform: {
              const: "slurm"
            },
            cluster_name: {
              maxLength: 128,
              pattern: "^[A-Za-z0-9._:-]+$",
              minLength: 1,
              type: "string"
            },
            slurm_job_id: {
              maxLength: 64,
              pattern: "^[A-Za-z0-9._:-]+$",
              minLength: 1,
              type: "string"
            },
            slurm_array_task_id: {
              maxLength: 64,
              pattern: "^[A-Za-z0-9._:-]+$",
              type: [
                "string",
                "null"
              ]
            },
            run_id: {
              $ref: "#/$defs/identifier"
            },
            release_tag: {
              maxLength: 128,
              pattern: "^[A-Za-z0-9._:+-]+$",
              minLength: 1,
              type: "string"
            },
            release_asset: {
              maxLength: 256,
              pattern: "^[A-Za-z0-9][A-Za-z0-9._+-]*$",
              minLength: 1,
              type: "string"
            },
            release_manifest_sha256: {
              $ref: "#/$defs/sha256"
            },
            solver_commit: {
              type: "string",
              pattern: "^[a-f0-9]{40}$"
            }
          }
        }
      }
    }
  }
};

// src/schema-v2.ts
var ajv2 = new import__2.default({ allErrors: true, strict: true, strictRequired: false, strictTypes: false, allowUnionTypes: true });
(0, import_ajv_formats2.default)(ajv2);
var validate2 = ajv2.compile(cayleypy_results_schema_v2_default);
var byteLength2 = /* @__PURE__ */ __name((value) => new TextEncoder().encode(canonicalJson(value)).byteLength, "byteLength");
var error = /* @__PURE__ */ __name((path, keyword) => ({ path, keyword }), "error");
function validateBatchV2(value, rawByteLength, maxBytes = 64 * 1024 * 1024) {
  let length = rawByteLength;
  if (length === void 0) {
    try {
      length = byteLength2(value);
    } catch {
      return { ok: false, errors: [error("", "serialization")] };
    }
  }
  if (length === void 0 || length > maxBytes) return { ok: false, errors: [error("", "maxBytes")] };
  if (!validate2(value)) return { ok: false, errors: (validate2.errors ?? []).map((item) => ({ path: item.instancePath, keyword: item.keyword })) };
  return { ok: true, value };
}
__name(validateBatchV2, "validateBatchV2");
function inferredHardware(name) {
  const upper = name.toUpperCase();
  if (upper.includes("T4")) return { sm: 75, family: "T4" };
  if (upper.includes("A100")) return { sm: 80, family: "A100" };
  if (upper.includes("RTX 30") || upper.includes("A10")) return { sm: 86, family: upper.includes("A10") ? "A10" : "Ampere" };
  if (upper.includes("L4")) return { sm: 89, family: "L4" };
  if (upper.includes("RTX 40") || upper.includes("L40")) return { sm: 89, family: "Ada" };
  if (upper.includes("H100")) return { sm: 90, family: "H100" };
  if (upper.includes("BLACKWELL") || upper.includes("RTX 50")) return { sm: 120, family: "Blackwell" };
  return null;
}
__name(inferredHardware, "inferredHardware");
function v1ReplayView(envelope) {
  const view = {
    ...envelope,
    schema_version: 1,
    kaggle: { owner: "slurm", slug: "v2-replay", version: 1, notebook_sha256: "0".repeat(64) },
    solver_commit: envelope.provenance.solver_commit,
    orientation: { ...envelope.orientation, search_mode: envelope.orientation.search_mode === "after" ? "after_original" : envelope.orientation.search_mode },
    profile: { requested_beam: envelope.profile.requested_beam, effective_beam: envelope.profile.effective_beam, alignment_delta: envelope.profile.alignment_delta, selected_profile: envelope.profile.profile_evidence_id, evidence: envelope.profile.profile_status, profile_evidence_version: 1, profile_power: envelope.profile.profile_power, model_class: envelope.profile.model_class, world_size: 2 },
    hardware: { platform: "slurm", gpu_names: envelope.hardware.gpu_names, accelerator_count: envelope.hardware.accelerator_count, world_size: 2 }
  };
  return view;
}
__name(v1ReplayView, "v1ReplayView");
async function validateEnvelopeIntegrityV2(envelope) {
  const errors = [];
  const replayView = v1ReplayView(envelope);
  replayView.idempotency_key = await computeIdempotency(replayView);
  errors.push(...(await validateEnvelopeIntegrity(replayView)).filter((item) => item.keyword !== "idempotency"));
  const { hardware, profile, provenance } = envelope;
  if (hardware.gpu_names.length !== hardware.accelerator_count || hardware.world_size !== hardware.accelerator_count) errors.push(error("/hardware/accelerator_count", "hardwareCardinality"));
  const uniqueNames = new Set(hardware.gpu_names);
  if (uniqueNames.size !== 1) errors.push(error("/hardware/gpu_names", "mixedHardware"));
  const inferred = uniqueNames.size === 1 ? inferredHardware(hardware.gpu_names[0] ?? "") : null;
  if (inferred === null || inferred.sm !== hardware.native_sm) errors.push(error("/hardware/native_sm", "nativeSm"));
  if (profile.effective_beam < profile.requested_beam || profile.alignment_delta !== profile.effective_beam - profile.requested_beam) errors.push(error("/profile/alignment_delta", "beamAlignment"));
  if (profile.profile_anchor_beam !== 2 ** profile.profile_power) errors.push(error("/profile/profile_anchor_beam", "profileAnchor"));
  if (profile.native_sm !== hardware.native_sm || profile.world_size !== hardware.world_size || profile.vram_mib !== hardware.vram_mib_per_gpu) errors.push(error("/profile/native_sm", "profileHardware"));
  if (inferred !== null && profile.gpu_family !== inferred.family) errors.push(error("/profile/gpu_family", "profileHardware"));
  const expectedBackend = ["piece-transformer", "cube555-q-blend"].includes(envelope.model.format) ? "piece_transformer" : "mlp";
  if (profile.backend !== expectedBackend) errors.push(error("/profile/backend", "profileBackend"));
  if (provenance.run_id !== envelope.run_id) errors.push(error("/provenance/run_id", "runProvenance"));
  if (await computeIdempotency(envelope) !== envelope.idempotency_key) errors.push(error("/idempotency_key", "idempotency"));
  if (byteLength2(envelope) > MAX_SERIALIZED_ENVELOPE_BYTES) errors.push(error("", "maxEnvelopeBytes"));
  return errors;
}
__name(validateEnvelopeIntegrityV2, "validateEnvelopeIntegrityV2");

// src/schema-dispatch.ts
function validateVersionedBatch(value, version, rawByteLength, maxBytes) {
  return version === 1 ? validateBatch(value, rawByteLength, maxBytes) : validateBatchV2(value, rawByteLength, maxBytes);
}
__name(validateVersionedBatch, "validateVersionedBatch");
function validateVersionedEnvelope(envelope) {
  return envelope.schema_version === 1 ? validateEnvelopeIntegrity(envelope) : validateEnvelopeIntegrityV2(envelope);
}
__name(validateVersionedEnvelope, "validateVersionedEnvelope");

// src/storage.ts
var SafeIngestError = class extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
  code;
  static {
    __name(this, "SafeIngestError");
  }
};
var QUEUED_OR_LATER = /* @__PURE__ */ new Set([
  "queued",
  "validating",
  "validated",
  "rejected",
  "staged",
  "published",
  "dead_letter"
]);
var DEFAULT_DUPLICATE_POLL_ATTEMPTS = 100;
var DEFAULT_DUPLICATE_POLL_DELAY_MS = 10;
var MAX_DUPLICATE_POLL_ATTEMPTS = 200;
var MAX_DUPLICATE_POLL_DELAY_MS = 100;
var DEFAULT_RECOVERY_LIMIT = 50;
var MAX_RECOVERY_LIMIT = 100;
async function putRaw(bucket, key, body, sha256) {
  const written = await bucket.put(key, body, {
    onlyIf: new Headers({ "If-None-Match": "*" }),
    httpMetadata: { contentType: "application/json; charset=utf-8" },
    customMetadata: { sha256 }
  });
  if (written === null) throw new SafeIngestError("raw_object_conflict");
}
__name(putRaw, "putRaw");
function boundedInteger(value, fallback, maximum) {
  if (value === void 0 || !Number.isInteger(value)) return fallback;
  return Math.max(0, Math.min(value, maximum));
}
__name(boundedInteger, "boundedInteger");
function settledReceipt(row, duplicate) {
  if (row.state === "retryable") {
    return {
      submission_id: row.submission_id,
      idempotency_key: row.idempotency_key,
      state: "retryable",
      duplicate
    };
  }
  if (QUEUED_OR_LATER.has(row.state)) {
    return {
      submission_id: row.submission_id,
      idempotency_key: row.idempotency_key,
      state: "queued",
      duplicate
    };
  }
  return null;
}
__name(settledReceipt, "settledReceipt");
async function delay(ms) {
  if (ms === 0) {
    await Promise.resolve();
    return;
  }
  await new Promise((resolve) => setTimeout(resolve, ms));
}
__name(delay, "delay");
async function safeReadSubmission(db, id) {
  try {
    const row = await findBySubmissionId(db, id);
    if (!row) throw new SafeIngestError("state_transition_conflict");
    return row;
  } catch (error2) {
    if (error2 instanceof SafeIngestError) throw error2;
    throw new SafeIngestError("state_transition_failed");
  }
}
__name(safeReadSubmission, "safeReadSubmission");
async function parkPausedSubmission(db, submissionId) {
  let changed;
  try {
    changed = await transition(
      db,
      submissionId,
      ["received", "queued", "retryable"],
      "retryable",
      { safeError: "ingest_paused" }
    );
  } catch {
    throw new SafeIngestError("state_transition_failed");
  }
  const current = await safeReadSubmission(db, submissionId);
  if (current.state === "retryable" && current.safe_error === "ingest_paused") {
    return current;
  }
  throw new SafeIngestError(changed ? "state_transition_failed" : "state_transition_conflict");
}
__name(parkPausedSubmission, "parkPausedSubmission");
async function confirmQueueSuccess(env, row, duplicate) {
  let changed;
  try {
    changed = await transition(
      env.RESULTS_DB,
      row.submission_id,
      ["received", "queued", "retryable"],
      "queued",
      { safeError: null }
    );
  } catch {
    throw new SafeIngestError("state_transition_failed");
  }
  if (changed) {
    return {
      submission_id: row.submission_id,
      idempotency_key: row.idempotency_key,
      state: "queued",
      duplicate
    };
  }
  const current = await safeReadSubmission(env.RESULTS_DB, row.submission_id);
  if (QUEUED_OR_LATER.has(current.state)) {
    return {
      submission_id: current.submission_id,
      idempotency_key: current.idempotency_key,
      state: "queued",
      duplicate
    };
  }
  throw new SafeIngestError("state_transition_conflict");
}
__name(confirmQueueSuccess, "confirmQueueSuccess");
async function confirmQueueFailure(env, row, duplicate) {
  let current = await safeReadSubmission(env.RESULTS_DB, row.submission_id);
  if (current.state !== "queued" && QUEUED_OR_LATER.has(current.state)) {
    return {
      submission_id: current.submission_id,
      idempotency_key: current.idempotency_key,
      state: "queued",
      duplicate
    };
  }
  if (current.state !== "received" && current.state !== "queued" && current.state !== "retryable") {
    throw new SafeIngestError("state_transition_conflict");
  }
  let changed;
  try {
    changed = await transition(
      env.RESULTS_DB,
      row.submission_id,
      ["received", "queued", "retryable"],
      "retryable",
      { safeError: "queue_unavailable", incrementRetryCount: true }
    );
  } catch {
    throw new SafeIngestError("state_transition_failed");
  }
  if (changed) {
    return {
      submission_id: row.submission_id,
      idempotency_key: row.idempotency_key,
      state: "retryable",
      duplicate
    };
  }
  current = await safeReadSubmission(env.RESULTS_DB, row.submission_id);
  if (current.state !== "queued" && QUEUED_OR_LATER.has(current.state)) {
    return {
      submission_id: current.submission_id,
      idempotency_key: current.idempotency_key,
      state: "queued",
      duplicate
    };
  }
  if (current.state === "retryable") {
    return {
      submission_id: current.submission_id,
      idempotency_key: current.idempotency_key,
      state: "retryable",
      duplicate
    };
  }
  throw new SafeIngestError("state_transition_conflict");
}
__name(confirmQueueFailure, "confirmQueueFailure");
async function resendExisting(env, row, duplicate) {
  try {
    await env.VALIDATE_QUEUE.send({ submission_id: row.submission_id });
  } catch {
    return confirmQueueFailure(env, row, duplicate);
  }
  return confirmQueueSuccess(env, row, duplicate);
}
__name(resendExisting, "resendExisting");
async function waitForDuplicate(env, key, first, meta) {
  const attempts = Math.max(
    1,
    boundedInteger(meta.duplicatePollAttempts, DEFAULT_DUPLICATE_POLL_ATTEMPTS, MAX_DUPLICATE_POLL_ATTEMPTS)
  );
  const delayMs = boundedInteger(
    meta.duplicatePollDelayMs,
    DEFAULT_DUPLICATE_POLL_DELAY_MS,
    MAX_DUPLICATE_POLL_DELAY_MS
  );
  let row = first;
  for (let attempt = 0; attempt <= attempts; attempt += 1) {
    const receipt = settledReceipt(row, true);
    if (receipt) return receipt;
    if (row.state !== "received") throw new SafeIngestError("state_transition_conflict");
    if (attempt === attempts) return resendExisting(env, row, true);
    await delay(delayMs);
    try {
      const reread = await findByIdempotency(env.RESULTS_DB, key);
      if (!reread) throw new SafeIngestError("duplicate_resolution_failed");
      row = reread;
    } catch (error2) {
      if (error2 instanceof SafeIngestError) throw error2;
      throw new SafeIngestError("submission_lookup_failed");
    }
  }
  throw new SafeIngestError("state_transition_conflict");
}
__name(waitForDuplicate, "waitForDuplicate");
async function cleanupDuplicateRaw(bucket, key) {
  try {
    await bucket.delete(key);
    if (await bucket.head(key) !== null) throw new Error("cleanup_unconfirmed");
  } catch {
    throw new SafeIngestError("duplicate_raw_cleanup_failed");
  }
}
__name(cleanupDuplicateRaw, "cleanupDuplicateRaw");
async function recoverStaleSubmissions(env, options) {
  const limit = Math.max(1, boundedInteger(options.limit, DEFAULT_RECOVERY_LIMIT, MAX_RECOVERY_LIMIT));
  let rows;
  try {
    rows = await findStaleRecoverable(env.RESULTS_DB, options.staleBefore.toISOString(), limit);
  } catch {
    throw new SafeIngestError("recovery_query_failed");
  }
  const summary = { scanned: rows.length, queued: 0, retryable: 0, failed: 0 };
  for (const row of rows) {
    try {
      let recoverable = row;
      if (row.state === "validating") {
        const released = await transition(
          env.RESULTS_DB,
          row.submission_id,
          ["validating"],
          "retryable",
          { safeError: "validation_lease_expired", incrementRetryCount: true }
        );
        if (!released) {
          const current = await safeReadSubmission(env.RESULTS_DB, row.submission_id);
          if (current.state === "validating" || !["received", "queued", "retryable"].includes(current.state)) {
            continue;
          }
          recoverable = current;
        } else {
          recoverable = await safeReadSubmission(env.RESULTS_DB, row.submission_id);
        }
      }
      const receipt = await resendExisting(env, recoverable, true);
      summary[receipt.state] += 1;
    } catch {
      summary.failed += 1;
    }
  }
  return summary;
}
__name(recoverStaleSubmissions, "recoverStaleSubmissions");
async function receiveEnvelope(env, envelope, meta = {}) {
  if ((await validateVersionedEnvelope(envelope)).length !== 0) throw new SafeIngestError("invalid_envelope");
  const idempotencyKey = await computeIdempotency(envelope);
  let prior;
  try {
    prior = await findByIdempotency(env.RESULTS_DB, idempotencyKey);
  } catch {
    throw new SafeIngestError("submission_lookup_failed");
  }
  if (prior) return waitForDuplicate(env, idempotencyKey, prior, meta);
  const now = meta.receivedAt ?? /* @__PURE__ */ new Date();
  const submissionId = newSubmissionId(now);
  const key = rawObjectKey(submissionId, now, envelope.schema_version);
  const rawBody = canonicalJson(envelope);
  await putRaw(env.RAW_RESULTS, key, rawBody, await sha256Hex(rawBody));
  const timestamp = now.toISOString();
  let inserted;
  try {
    const result = await env.RESULTS_DB.prepare(
      "INSERT INTO submissions (submission_id,idempotency_key,run_id,author_name,competition,puzzle_type,puzzle_id,state,raw_r2_key,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(idempotency_key) DO NOTHING"
    ).bind(
      submissionId,
      idempotencyKey,
      envelope.run_id,
      envelope.author.name,
      envelope.competition,
      envelope.puzzle_type,
      envelope.puzzle_id,
      "received",
      key,
      timestamp,
      timestamp
    ).run();
    inserted = result.meta.changes === 1;
  } catch {
    throw new SafeIngestError("submission_persist_failed");
  }
  if (!inserted) {
    let winner;
    try {
      winner = await findByIdempotency(env.RESULTS_DB, idempotencyKey);
    } catch {
      await cleanupDuplicateRaw(env.RAW_RESULTS, key);
      throw new SafeIngestError("submission_lookup_failed");
    }
    await cleanupDuplicateRaw(env.RAW_RESULTS, key);
    if (!winner) throw new SafeIngestError("duplicate_resolution_failed");
    return waitForDuplicate(env, idempotencyKey, winner, meta);
  }
  return resendExisting(
    env,
    {
      submission_id: submissionId,
      idempotency_key: idempotencyKey,
      run_id: envelope.run_id,
      author_name: envelope.author.name,
      competition: envelope.competition,
      puzzle_type: envelope.puzzle_type,
      puzzle_id: envelope.puzzle_id,
      state: "received",
      raw_r2_key: key,
      safe_error: null,
      retry_count: 0,
      updated_at: timestamp,
      github_path: null,
      github_commit_sha: null
    },
    false
  );
}
__name(receiveEnvelope, "receiveEnvelope");
function storedReceipt(row, duplicate) {
  if (row.state === "received" || row.state === "retryable") {
    return {
      submission_id: row.submission_id,
      idempotency_key: row.idempotency_key,
      state: row.state,
      duplicate
    };
  }
  if (QUEUED_OR_LATER.has(row.state)) {
    return {
      submission_id: row.submission_id,
      idempotency_key: row.idempotency_key,
      state: "queued",
      duplicate
    };
  }
  throw new SafeIngestError("state_transition_conflict");
}
__name(storedReceipt, "storedReceipt");
async function receiveEnvelopeStoreOnly(env, envelope, meta = {}) {
  if ((await validateVersionedEnvelope(envelope)).length !== 0) throw new SafeIngestError("invalid_envelope");
  const idempotencyKey = await computeIdempotency(envelope);
  let prior;
  try {
    prior = await findByIdempotency(env.RESULTS_DB, idempotencyKey);
  } catch {
    throw new SafeIngestError("submission_lookup_failed");
  }
  if (prior) return storedReceipt(prior, true);
  const now = meta.receivedAt ?? /* @__PURE__ */ new Date();
  const submissionId = newSubmissionId(now);
  const key = rawObjectKey(submissionId, now, envelope.schema_version);
  const rawBody = canonicalJson(envelope);
  await putRaw(env.RAW_RESULTS, key, rawBody, await sha256Hex(rawBody));
  const timestamp = now.toISOString();
  let inserted;
  try {
    const result = await env.RESULTS_DB.prepare(
      "INSERT INTO submissions (submission_id,idempotency_key,run_id,author_name,competition,puzzle_type,puzzle_id,state,raw_r2_key,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(idempotency_key) DO NOTHING"
    ).bind(
      submissionId,
      idempotencyKey,
      envelope.run_id,
      envelope.author.name,
      envelope.competition,
      envelope.puzzle_type,
      envelope.puzzle_id,
      "received",
      key,
      timestamp,
      timestamp
    ).run();
    inserted = result.meta.changes === 1;
  } catch {
    throw new SafeIngestError("submission_persist_failed");
  }
  if (!inserted) {
    let winner;
    try {
      winner = await findByIdempotency(env.RESULTS_DB, idempotencyKey);
    } catch {
      await cleanupDuplicateRaw(env.RAW_RESULTS, key);
      throw new SafeIngestError("submission_lookup_failed");
    }
    await cleanupDuplicateRaw(env.RAW_RESULTS, key);
    if (!winner) throw new SafeIngestError("duplicate_resolution_failed");
    return storedReceipt(winner, true);
  }
  return {
    submission_id: submissionId,
    idempotency_key: idempotencyKey,
    state: "received",
    duplicate: false
  };
}
__name(receiveEnvelopeStoreOnly, "receiveEnvelopeStoreOnly");

// src/consumer.ts
var MAX_QUEUE_ATTEMPTS = 9;
var MAX_RETRY_DELAY_SECONDS = 300;
function queueSubmissionId(body) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) return null;
  const id = body.submission_id;
  return typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id) ? id : null;
}
__name(queueSubmissionId, "queueSubmissionId");
function retryDelaySeconds(retryCount) {
  const exponent = Math.max(0, Math.min(8, Math.trunc(retryCount)));
  return Math.min(MAX_RETRY_DELAY_SECONDS, 2 ** exponent);
}
__name(retryDelaySeconds, "retryDelaySeconds");
function isFinalRepositoryState(state) {
  return state === "rejected" || state === "staged" || state === "published";
}
__name(isFinalRepositoryState, "isFinalRepositoryState");
function exhausted(message2) {
  return (message2.attempts ?? 1) >= MAX_QUEUE_ATTEMPTS;
}
__name(exhausted, "exhausted");
async function enqueueValidated(env, submissionId) {
  if (env.GITHUB_WRITER === void 0) throw new Error("github_writer_unavailable");
  await env.GITHUB_WRITER.getByName("cayleypy-results-v1").enqueueValidated(submissionId);
}
__name(enqueueValidated, "enqueueValidated");
async function markRetryable(env, id, code) {
  const changed = await transition(env.RESULTS_DB, id, ["received", "queued", "validating", "retryable"], "retryable", {
    safeError: code,
    incrementRetryCount: true
  });
  if (!changed) {
    const current2 = await findBySubmissionId(env.RESULTS_DB, id);
    if (!current2 || current2.state === "validated" || current2.state === "dead_letter" || isFinalRepositoryState(current2.state)) {
      return current2?.retry_count ?? 0;
    }
    throw new SafeIngestError("state_transition_conflict");
  }
  const current = await findBySubmissionId(env.RESULTS_DB, id);
  if (!current) throw new SafeIngestError("state_transition_conflict");
  return current.retry_count;
}
__name(markRetryable, "markRetryable");
async function deliverDeadLetter(message2, env, submissionId) {
  try {
    if (env.VALIDATE_DLQ === void 0) throw new Error("validate_dlq_unavailable");
    await env.VALIDATE_DLQ.send({ submission_id: submissionId });
    message2.ack();
  } catch {
    message2.retry();
  }
}
__name(deliverDeadLetter, "deliverDeadLetter");
async function retryOrDeadLetter(message2, env, submissionId, code) {
  if (exhausted(message2)) {
    try {
      const changed = await transition(env.RESULTS_DB, submissionId, ["received", "queued", "validating", "retryable", "validated"], "dead_letter", {
        safeError: code,
        incrementRetryCount: true
      });
      if (!changed) {
        const current = await findBySubmissionId(env.RESULTS_DB, submissionId);
        if (!current || current.state !== "dead_letter") throw new SafeIngestError("state_transition_conflict");
      }
      await deliverDeadLetter(message2, env, submissionId);
    } catch {
      message2.retry();
    }
    return;
  }
  try {
    const retryCount = await markRetryable(env, submissionId, code);
    message2.retry({ delaySeconds: retryDelaySeconds(retryCount) });
  } catch {
    message2.retry({ delaySeconds: retryDelaySeconds(0) });
  }
}
__name(retryOrDeadLetter, "retryOrDeadLetter");
async function reject(env, id, code) {
  const changed = await transition(env.RESULTS_DB, id, ["received", "queued", "validating", "retryable"], "rejected", { safeError: code });
  if (!changed) {
    const current = await findBySubmissionId(env.RESULTS_DB, id);
    if (!current || !isFinalRepositoryState(current.state)) throw new SafeIngestError("state_transition_conflict");
  }
}
__name(reject, "reject");
async function validateRawEnvelope(env, row) {
  const object = await env.RAW_RESULTS.get(row.raw_r2_key);
  if (object === null) throw new Error("raw_missing");
  let candidate;
  if (object.size > MAX_SERIALIZED_ENVELOPE_BYTES) return "invalid";
  const raw = await object.text();
  const storedHash = object.customMetadata?.sha256;
  if (new TextEncoder().encode(raw).byteLength > MAX_SERIALIZED_ENVELOPE_BYTES) return "invalid";
  if (typeof storedHash !== "string" || !/^[0-9a-f]{64}$/.test(storedHash) || await sha256Hex(raw) !== storedHash) return "invalid";
  try {
    candidate = JSON.parse(raw);
  } catch {
    return "invalid";
  }
  let encoded;
  try {
    encoded = new TextEncoder().encode(canonicalJson({ schema_version: 1, results: [candidate] })).byteLength;
  } catch {
    return "invalid";
  }
  const version = candidate !== null && typeof candidate === "object" && candidate.schema_version === 2 ? 2 : 1;
  const batch = validateVersionedBatch({ schema_version: version, results: [candidate] }, version, encoded);
  if (!batch.ok) return "invalid";
  const envelope = batch.value.results[0];
  if (envelope.idempotency_key !== row.idempotency_key) return "invalid";
  return (await validateVersionedEnvelope(envelope)).length === 0 ? "valid" : "invalid";
}
__name(validateRawEnvelope, "validateRawEnvelope");
async function enqueueValidatedOrRetry(message2, env, submissionId) {
  try {
    await enqueueValidated(env, submissionId);
    const refreshed = await transition(env.RESULTS_DB, submissionId, ["validated"], "validated", { safeError: null });
    if (!refreshed) {
      const current = await findBySubmissionId(env.RESULTS_DB, submissionId);
      if (!current || !isFinalRepositoryState(current.state)) throw new SafeIngestError("state_transition_conflict");
    }
    message2.ack();
  } catch {
    if (exhausted(message2)) {
      await retryOrDeadLetter(message2, env, submissionId, "publisher_unavailable");
      return;
    }
    try {
      const changed = await transition(env.RESULTS_DB, submissionId, ["validated"], "validated", {
        safeError: "publisher_unavailable",
        incrementRetryCount: true
      });
      if (!changed) throw new SafeIngestError("state_transition_conflict");
      const current = await findBySubmissionId(env.RESULTS_DB, submissionId);
      message2.retry({ delaySeconds: retryDelaySeconds(current?.retry_count ?? 0) });
    } catch {
      message2.retry({ delaySeconds: retryDelaySeconds(0) });
    }
  }
}
__name(enqueueValidatedOrRetry, "enqueueValidatedOrRetry");
async function consumeValidationMessage(message2, env, mode) {
  if (mode !== "normal") {
    const submissionId2 = queueSubmissionId(message2.body);
    if (submissionId2 === null) {
      message2.ack();
      return;
    }
    try {
      const current = await findBySubmissionId(env.RESULTS_DB, submissionId2);
      if (current === null || current.state === "validating" || current.state === "validated" || current.state === "dead_letter" || isFinalRepositoryState(current.state)) {
        message2.ack();
        return;
      }
      await parkPausedSubmission(env.RESULTS_DB, submissionId2);
      message2.ack();
    } catch {
      message2.retry({ delaySeconds: retryDelaySeconds(0) });
    }
    return;
  }
  const submissionId = queueSubmissionId(message2.body);
  if (submissionId === null) {
    message2.ack();
    return;
  }
  let row;
  try {
    row = await findBySubmissionId(env.RESULTS_DB, submissionId);
  } catch {
    message2.retry({ delaySeconds: retryDelaySeconds(0) });
    return;
  }
  if (row === null || isFinalRepositoryState(row.state)) {
    message2.ack();
    return;
  }
  if (row.state === "dead_letter") {
    await deliverDeadLetter(message2, env, submissionId);
    return;
  }
  if (row.state === "validated") {
    await enqueueValidatedOrRetry(message2, env, submissionId);
    return;
  }
  try {
    const changed = await transition(env.RESULTS_DB, submissionId, ["received", "queued", "retryable"], "validating", { safeError: null });
    if (!changed) {
      row = await findBySubmissionId(env.RESULTS_DB, submissionId);
      if (row === null || isFinalRepositoryState(row.state)) {
        message2.ack();
        return;
      }
      if (row.state === "dead_letter") {
        await deliverDeadLetter(message2, env, submissionId);
        return;
      }
      if (row.state === "validated") {
        await enqueueValidatedOrRetry(message2, env, submissionId);
        return;
      }
      if (row.state === "validating") {
        message2.ack();
        return;
      }
      throw new SafeIngestError("state_transition_conflict");
    }
    const current = row ?? await findBySubmissionId(env.RESULTS_DB, submissionId);
    if (current === null) throw new SafeIngestError("state_transition_conflict");
    if (await validateRawEnvelope(env, current) === "invalid") {
      await reject(env, submissionId, "invalid_envelope");
      message2.ack();
      return;
    }
    const validated = await transition(env.RESULTS_DB, submissionId, ["validating"], "validated", { safeError: null });
    if (!validated) throw new SafeIngestError("state_transition_conflict");
    await enqueueValidatedOrRetry(message2, env, submissionId);
  } catch {
    await retryOrDeadLetter(message2, env, submissionId, "validation_unavailable");
  }
}
__name(consumeValidationMessage, "consumeValidationMessage");

// src/mode.ts
function resolveIngestMode(value) {
  return value === "normal" || value === "store_only" || value === "reject" ? value : "reject";
}
__name(resolveIngestMode, "resolveIngestMode");

// src/ingress-schema.ts
var import__3 = __toESM(require__(), 1);
var import_ajv_formats3 = __toESM(require_dist(), 1);
var ajv3 = new import__3.default({ allErrors: false, strict: true, strictRequired: false, strictTypes: false, allowUnionTypes: true });
(0, import_ajv_formats3.default)(ajv3);
var validators = { 1: ajv3.compile(cayleypy_results_schema_v1_default), 2: ajv3.compile(cayleypy_results_schema_v2_default) };
function validateIngressBatch(value, version) {
  const validate3 = validators[version];
  if (!validate3(value)) return { ok: false, errors: (validate3.errors ?? []).slice(0, 1).map((error2) => ({ path: error2.instancePath.slice(0, 256), keyword: error2.keyword })) };
  return { ok: true, value };
}
__name(validateIngressBatch, "validateIngressBatch");

// src/ingest.ts
var MAX_REQUEST_BYTES = MAX_SERIALIZED_BATCH_BYTES;
var MAX_ARCHIVE_REQUEST_BYTES = 32 * 1024 * 1024;
var MAX_RESULTS_PER_REQUEST = 100;
var MAX_DECOMPRESSED_ARCHIVE_BYTES = 4 * 1024 * 1024;
var PER_IP_REQUESTS_PER_MINUTE = 30;
var PER_IP_STATUS_REQUESTS_PER_MINUTE = 30;
var STATUS_RATE_BUCKET_COUNT = 256;
var GLOBAL_ENVELOPES_PER_MINUTE = 2e3;
var RECOVERY_STALE_MS = 6e4;
var RECOVERY_LIMIT = 50;
var RATE_WINDOW_MS = 6e4;
var RETRY_AFTER_SECONDS = 60;
var ENVELOPE_CONCURRENCY = 2;
var BODY_READ_TIMEOUT_MS = 15e3;
var DUPLICATE_REREAD_BUDGET = 400;
var SafeHttpError = class extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
  status;
  code;
  static {
    __name(this, "SafeHttpError");
  }
};
function jsonResponse(value, status = 200, headers = {}) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("content-type", "application/json; charset=utf-8");
  responseHeaders.set("cache-control", "no-store");
  return new Response(JSON.stringify(value), { status, headers: responseHeaders });
}
__name(jsonResponse, "jsonResponse");
function errorResponse(status, code, headers = {}) {
  return jsonResponse({ error: code }, status, headers);
}
__name(errorResponse, "errorResponse");
function methodNotAllowed(allow) {
  return errorResponse(405, "method_not_allowed", { Allow: allow });
}
__name(methodNotAllowed, "methodNotAllowed");
function rateLimited() {
  return errorResponse(429, "rate_limited", { "Retry-After": String(RETRY_AFTER_SECONDS) });
}
__name(rateLimited, "rateLimited");
function mediaType(request) {
  return (request.headers.get("content-type") ?? "").split(";", 1)[0].trim().toLowerCase();
}
__name(mediaType, "mediaType");
function declaredBodyLength(request) {
  const raw = request.headers.get("content-length");
  if (raw === null) return null;
  if (!/^\d+$/.test(raw)) throw new SafeHttpError(400, "invalid_content_length");
  const length = Number(raw);
  if (!Number.isSafeInteger(length)) throw new SafeHttpError(413, "request_too_large");
  return length;
}
__name(declaredBodyLength, "declaredBodyLength");
async function readBoundedText(request, maxBytes = MAX_REQUEST_BYTES, stream = request.body, declared = declaredBodyLength(request)) {
  if (declared !== null && declared > maxBytes) {
    throw new SafeHttpError(413, "request_too_large");
  }
  if (stream === null) return { text: "", rawByteLength: 0 };
  const reader = stream.getReader();
  const decoder2 = new TextDecoder("utf-8", { fatal: true });
  let text = "";
  let total = 0;
  const deadline = Date.now() + BODY_READ_TIMEOUT_MS;
  try {
    while (true) {
      let chunk;
      try {
        if (Date.now() >= deadline) throw new SafeHttpError(408, "body_read_timeout");
        let timer;
        try {
          chunk = await Promise.race([
            reader.read(),
            new Promise((_resolve, reject2) => {
              timer = setTimeout(() => reject2(new SafeHttpError(408, "body_read_timeout")), Math.max(0, deadline - Date.now()));
            })
          ]);
        } finally {
          if (timer !== void 0) clearTimeout(timer);
        }
      } catch (error2) {
        if (error2 instanceof SafeHttpError) throw error2;
        throw new SafeHttpError(400, "invalid_body");
      }
      if (Date.now() >= deadline) throw new SafeHttpError(408, "body_read_timeout");
      if (chunk.done) break;
      total += chunk.value.byteLength;
      if (total > maxBytes) {
        void reader.cancel().catch(() => void 0);
        throw new SafeHttpError(413, "request_too_large");
      }
      try {
        text += decoder2.decode(chunk.value, { stream: true });
      } catch {
        void reader.cancel().catch(() => void 0);
        throw new SafeHttpError(400, "invalid_json");
      }
    }
    try {
      text += decoder2.decode();
    } catch {
      throw new SafeHttpError(400, "invalid_json");
    }
    return { text, rawByteLength: total };
  } catch (error2) {
    text = "";
    void reader.cancel().catch(() => void 0);
    throw error2;
  } finally {
    reader.releaseLock();
  }
}
__name(readBoundedText, "readBoundedText");
async function parseBatch(request, version) {
  const type = mediaType(request);
  if (type !== "application/json" && type !== "application/gzip") {
    return errorResponse(415, "unsupported_media_type");
  }
  let body;
  let compressedLimitExceeded = false;
  try {
    if (type === "application/json") {
      body = await readBoundedText(request);
    } else {
      const declared = declaredBodyLength(request);
      if (declared !== null && declared > MAX_ARCHIVE_REQUEST_BYTES) {
        throw new SafeHttpError(413, "request_too_large");
      }
      if (request.body === null) {
        body = { text: "", rawByteLength: 0 };
      } else {
        let compressedBytes = 0;
        const bounded = request.body.pipeThrough(new TransformStream({
          transform(chunk, controller) {
            compressedBytes += chunk.byteLength;
            if (compressedBytes > MAX_ARCHIVE_REQUEST_BYTES) {
              compressedLimitExceeded = true;
              throw new SafeHttpError(413, "request_too_large");
            }
            controller.enqueue(chunk);
          }
        }));
        const decompressed = bounded.pipeThrough(new DecompressionStream("gzip"));
        body = await readBoundedText(request, MAX_DECOMPRESSED_ARCHIVE_BYTES, decompressed, null);
      }
    }
  } catch (error2) {
    if (compressedLimitExceeded) return errorResponse(413, "request_too_large");
    if (error2 instanceof SafeHttpError) return errorResponse(error2.status, error2.code);
    return errorResponse(400, "invalid_body");
  }
  let parsed;
  try {
    parsed = JSON.parse(body.text);
  } catch {
    return errorResponse(400, "invalid_json");
  } finally {
    body.text = "";
  }
  if (parsed !== null && typeof parsed === "object" && Array.isArray(parsed.results) && parsed.results.length > MAX_RESULTS_PER_REQUEST) return errorResponse(413, "too_many_results");
  const validation = validateIngressBatch(parsed, version);
  if (!validation.ok) {
    return jsonResponse({ error: "invalid_schema", errors: validation.errors }, 400);
  }
  if (validation.value.results.length > MAX_RESULTS_PER_REQUEST) return errorResponse(413, "too_many_results");
  const integrityAll = [];
  for (const envelope of validation.value.results) integrityAll.push(await validateVersionedEnvelope(envelope));
  const integrityErrors = integrityAll.flatMap((items, index) => items.map((item) => ({ path: `/results/${index}${item.path}`, keyword: item.keyword })));
  if (integrityErrors.length !== 0) {
    return jsonResponse({ error: "invalid_schema", errors: integrityErrors }, 400);
  }
  return { value: validation.value.results, rawByteLength: body.rawByteLength };
}
__name(parseBatch, "parseBatch");
async function consumeD1Limit(db, scope2, amount, maximum) {
  const windowStart = Math.floor(Date.now() / RATE_WINDOW_MS) * RATE_WINDOW_MS;
  const result = await db.prepare(
    `INSERT INTO ingest_rate_limits (scope,window_start,count) VALUES (?,?,?)
     ON CONFLICT(scope) DO UPDATE SET
       window_start = excluded.window_start,
       count = CASE
         WHEN ingest_rate_limits.window_start = excluded.window_start
         THEN ingest_rate_limits.count + excluded.count
         ELSE excluded.count
       END
     WHERE
       (excluded.window_start > ingest_rate_limits.window_start AND excluded.count <= ?)
       OR
       (excluded.window_start = ingest_rate_limits.window_start
        AND ingest_rate_limits.count + excluded.count <= ?)`
  ).bind(scope2, windowStart, amount, maximum, maximum).run();
  return result.meta.changes === 1;
}
__name(consumeD1Limit, "consumeD1Limit");
async function allowIpRequest(request, env) {
  const ip = request.headers.get("CF-Connecting-IP")?.trim() || "unknown";
  if (env.INGEST_RATE_LIMIT !== void 0) {
    try {
      if (!(await env.INGEST_RATE_LIMIT.limit({ key: `ip:${ip}` })).success) return false;
    } catch {
    }
  }
  return consumeD1Limit(env.RESULTS_DB, `ip:${ip}`, 1, PER_IP_REQUESTS_PER_MINUTE);
}
__name(allowIpRequest, "allowIpRequest");
function receiptResponse(request, receipt) {
  return {
    submission_id: receipt.submission_id,
    idempotency_key: receipt.idempotency_key,
    status_url: new URL(`/v1/submissions/${receipt.submission_id}`, request.url).toString()
  };
}
__name(receiptResponse, "receiptResponse");
function safeIngestCode(error2) {
  return error2 instanceof SafeIngestError ? error2.code : "ingest_failed";
}
__name(safeIngestCode, "safeIngestCode");
async function mapBounded(values, concurrency, operation) {
  const output = new Array(values.length);
  let nextIndex = 0;
  const consume = /* @__PURE__ */ __name(async () => {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      output[index] = await operation(values[index], index);
    }
  }, "consume");
  await Promise.all(Array.from(
    { length: Math.min(concurrency, values.length) },
    () => consume()
  ));
  return output;
}
__name(mapBounded, "mapBounded");
async function handleIngestBody(request, env, version) {
  const mode = resolveIngestMode(env.INGEST_MODE);
  if (mode === "reject") return errorResponse(503, "ingest_disabled");
  const parsed = await parseBatch(request, version);
  if (parsed instanceof Response) return parsed;
  let globallyAllowed;
  try {
    globallyAllowed = await consumeD1Limit(
      env.RESULTS_DB,
      "global",
      parsed.value.length,
      GLOBAL_ENVELOPES_PER_MINUTE
    );
  } catch {
    return errorResponse(503, "rate_limit_unavailable");
  }
  if (!globallyAllowed) return rateLimited();
  const duplicatePollAttempts = Math.max(
    1,
    Math.floor(DUPLICATE_REREAD_BUDGET / parsed.value.length)
  );
  const outcomes = await mapBounded(parsed.value, ENVELOPE_CONCURRENCY, async (envelope, index) => {
    try {
      const receipt = mode === "normal" ? await receiveEnvelope(env, envelope, { duplicatePollAttempts }) : await receiveEnvelopeStoreOnly(env, envelope);
      return { ok: true, receipt: receiptResponse(request, receipt) };
    } catch (error2) {
      return { ok: false, error: { index, code: safeIngestCode(error2) } };
    }
  });
  const receipts = outcomes.filter((outcome) => outcome.ok).map((outcome) => outcome.receipt);
  const errors = outcomes.filter((outcome) => !outcome.ok).map((outcome) => outcome.error);
  return jsonResponse(errors.length === 0 ? { receipts } : { receipts, errors }, 202);
}
__name(handleIngestBody, "handleIngestBody");

// src/maintenance.ts
async function maintainSubmissions(env, scheduledTime, enqueue) {
  if (!Number.isSafeInteger(scheduledTime) || scheduledTime < 0 || scheduledTime > 864e13) throw new Error("maintenance_time_invalid");
  if (resolveIngestMode(env.INGEST_MODE) !== "normal") return;
  for (const row of await findStagedSubmissions(env.RESULTS_DB, 100)) {
    await env.RAW_RESULTS.delete(row.raw_r2_key);
  }
  for (const row of await findValidatedSubmissions(env.RESULTS_DB, 100)) {
    await enqueue(row.submission_id);
  }
  await recoverStaleSubmissions(env, {
    staleBefore: new Date(scheduledTime - RECOVERY_STALE_MS),
    limit: RECOVERY_LIMIT
  });
}
__name(maintainSubmissions, "maintainSubmissions");

// src/github-writer.ts
import { DurableObject } from "cloudflare:workers";

// node_modules/jose/dist/webapi/lib/buffer_utils.js
var encoder3 = new TextEncoder();
var decoder = new TextDecoder();
var MAX_INT32 = 2 ** 32;
function concat(...buffers) {
  const size = buffers.reduce((acc, { length }) => acc + length, 0);
  const buf = new Uint8Array(size);
  let i = 0;
  for (const buffer of buffers) {
    buf.set(buffer, i);
    i += buffer.length;
  }
  return buf;
}
__name(concat, "concat");

// node_modules/jose/dist/webapi/lib/base64.js
function encodeBase64(input) {
  if (Uint8Array.prototype.toBase64) {
    return input.toBase64();
  }
  const CHUNK_SIZE = 32768;
  const arr = [];
  for (let i = 0; i < input.length; i += CHUNK_SIZE) {
    arr.push(String.fromCharCode.apply(null, input.subarray(i, i + CHUNK_SIZE)));
  }
  return btoa(arr.join(""));
}
__name(encodeBase64, "encodeBase64");
function decodeBase64(encoded) {
  if (Uint8Array.fromBase64) {
    return Uint8Array.fromBase64(encoded);
  }
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
__name(decodeBase64, "decodeBase64");

// node_modules/jose/dist/webapi/util/base64url.js
function decode(input) {
  if (Uint8Array.fromBase64) {
    return Uint8Array.fromBase64(typeof input === "string" ? input : decoder.decode(input), {
      alphabet: "base64url"
    });
  }
  let encoded = input;
  if (encoded instanceof Uint8Array) {
    encoded = decoder.decode(encoded);
  }
  encoded = encoded.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
  try {
    return decodeBase64(encoded);
  } catch {
    throw new TypeError("The input to be decoded is not correctly encoded.");
  }
}
__name(decode, "decode");
function encode(input) {
  let unencoded = input;
  if (typeof unencoded === "string") {
    unencoded = encoder3.encode(unencoded);
  }
  if (Uint8Array.prototype.toBase64) {
    return unencoded.toBase64({ alphabet: "base64url", omitPadding: true });
  }
  return encodeBase64(unencoded).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
__name(encode, "encode");

// node_modules/jose/dist/webapi/util/errors.js
var JOSEError = class extends Error {
  static {
    __name(this, "JOSEError");
  }
  static code = "ERR_JOSE_GENERIC";
  code = "ERR_JOSE_GENERIC";
  constructor(message2, options) {
    super(message2, options);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
};
var JOSENotSupported = class extends JOSEError {
  static {
    __name(this, "JOSENotSupported");
  }
  static code = "ERR_JOSE_NOT_SUPPORTED";
  code = "ERR_JOSE_NOT_SUPPORTED";
};
var JWSInvalid = class extends JOSEError {
  static {
    __name(this, "JWSInvalid");
  }
  static code = "ERR_JWS_INVALID";
  code = "ERR_JWS_INVALID";
};
var JWTInvalid = class extends JOSEError {
  static {
    __name(this, "JWTInvalid");
  }
  static code = "ERR_JWT_INVALID";
  code = "ERR_JWT_INVALID";
};

// node_modules/jose/dist/webapi/lib/crypto_key.js
function unusable(name, prop = "algorithm.name") {
  return new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
}
__name(unusable, "unusable");
function isAlgorithm(algorithm, name) {
  return algorithm.name === name;
}
__name(isAlgorithm, "isAlgorithm");
function getHashLength(hash) {
  return parseInt(hash.name.slice(4), 10);
}
__name(getHashLength, "getHashLength");
function getNamedCurve(alg) {
  switch (alg) {
    case "ES256":
      return "P-256";
    case "ES384":
      return "P-384";
    case "ES512":
      return "P-521";
    default:
      throw new Error("unreachable");
  }
}
__name(getNamedCurve, "getNamedCurve");
function checkUsage(key, usage) {
  if (usage && !key.usages.includes(usage)) {
    throw new TypeError(`CryptoKey does not support this operation, its usages must include ${usage}.`);
  }
}
__name(checkUsage, "checkUsage");
function checkSigCryptoKey(key, alg, usage) {
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512": {
      if (!isAlgorithm(key.algorithm, "HMAC"))
        throw unusable("HMAC");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "RS256":
    case "RS384":
    case "RS512": {
      if (!isAlgorithm(key.algorithm, "RSASSA-PKCS1-v1_5"))
        throw unusable("RSASSA-PKCS1-v1_5");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "PS256":
    case "PS384":
    case "PS512": {
      if (!isAlgorithm(key.algorithm, "RSA-PSS"))
        throw unusable("RSA-PSS");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "Ed25519":
    case "EdDSA": {
      if (!isAlgorithm(key.algorithm, "Ed25519"))
        throw unusable("Ed25519");
      break;
    }
    case "ES256":
    case "ES384":
    case "ES512": {
      if (!isAlgorithm(key.algorithm, "ECDSA"))
        throw unusable("ECDSA");
      const expected = getNamedCurve(alg);
      const actual = key.algorithm.namedCurve;
      if (actual !== expected)
        throw unusable(expected, "algorithm.namedCurve");
      break;
    }
    default:
      throw new TypeError("CryptoKey does not support this operation");
  }
  checkUsage(key, usage);
}
__name(checkSigCryptoKey, "checkSigCryptoKey");

// node_modules/jose/dist/webapi/lib/invalid_key_input.js
function message(msg, actual, ...types) {
  types = types.filter(Boolean);
  if (types.length > 2) {
    const last = types.pop();
    msg += `one of type ${types.join(", ")}, or ${last}.`;
  } else if (types.length === 2) {
    msg += `one of type ${types[0]} or ${types[1]}.`;
  } else {
    msg += `of type ${types[0]}.`;
  }
  if (actual == null) {
    msg += ` Received ${actual}`;
  } else if (typeof actual === "function" && actual.name) {
    msg += ` Received function ${actual.name}`;
  } else if (typeof actual === "object" && actual != null) {
    if (actual.constructor?.name) {
      msg += ` Received an instance of ${actual.constructor.name}`;
    }
  }
  return msg;
}
__name(message, "message");
var invalid_key_input_default = /* @__PURE__ */ __name((actual, ...types) => {
  return message("Key must be ", actual, ...types);
}, "default");
function withAlg(alg, actual, ...types) {
  return message(`Key for the ${alg} algorithm must be `, actual, ...types);
}
__name(withAlg, "withAlg");

// node_modules/jose/dist/webapi/lib/is_key_like.js
function isCryptoKey(key) {
  return key?.[Symbol.toStringTag] === "CryptoKey";
}
__name(isCryptoKey, "isCryptoKey");
function isKeyObject(key) {
  return key?.[Symbol.toStringTag] === "KeyObject";
}
__name(isKeyObject, "isKeyObject");
var is_key_like_default = /* @__PURE__ */ __name((key) => {
  return isCryptoKey(key) || isKeyObject(key);
}, "default");

// node_modules/jose/dist/webapi/lib/is_disjoint.js
var is_disjoint_default = /* @__PURE__ */ __name((...headers) => {
  const sources = headers.filter(Boolean);
  if (sources.length === 0 || sources.length === 1) {
    return true;
  }
  let acc;
  for (const header of sources) {
    const parameters = Object.keys(header);
    if (!acc || acc.size === 0) {
      acc = new Set(parameters);
      continue;
    }
    for (const parameter of parameters) {
      if (acc.has(parameter)) {
        return false;
      }
      acc.add(parameter);
    }
  }
  return true;
}, "default");

// node_modules/jose/dist/webapi/lib/is_object.js
function isObjectLike(value) {
  return typeof value === "object" && value !== null;
}
__name(isObjectLike, "isObjectLike");
var is_object_default = /* @__PURE__ */ __name((input) => {
  if (!isObjectLike(input) || Object.prototype.toString.call(input) !== "[object Object]") {
    return false;
  }
  if (Object.getPrototypeOf(input) === null) {
    return true;
  }
  let proto = input;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(input) === proto;
}, "default");

// node_modules/jose/dist/webapi/lib/check_key_length.js
var check_key_length_default = /* @__PURE__ */ __name((alg, key) => {
  if (alg.startsWith("RS") || alg.startsWith("PS")) {
    const { modulusLength } = key.algorithm;
    if (typeof modulusLength !== "number" || modulusLength < 2048) {
      throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
    }
  }
}, "default");

// node_modules/jose/dist/webapi/lib/asn1.js
var findOid = /* @__PURE__ */ __name((keyData, oid, from = 0) => {
  if (from === 0) {
    oid.unshift(oid.length);
    oid.unshift(6);
  }
  const i = keyData.indexOf(oid[0], from);
  if (i === -1)
    return false;
  const sub = keyData.subarray(i, i + oid.length);
  if (sub.length !== oid.length)
    return false;
  return sub.every((value, index) => value === oid[index]) || findOid(keyData, oid, i + 1);
}, "findOid");
var getNamedCurve2 = /* @__PURE__ */ __name((keyData) => {
  switch (true) {
    case findOid(keyData, [42, 134, 72, 206, 61, 3, 1, 7]):
      return "P-256";
    case findOid(keyData, [43, 129, 4, 0, 34]):
      return "P-384";
    case findOid(keyData, [43, 129, 4, 0, 35]):
      return "P-521";
    default:
      return void 0;
  }
}, "getNamedCurve");
var genericImport = /* @__PURE__ */ __name(async (replace, keyFormat, pem, alg, options) => {
  let algorithm;
  let keyUsages;
  const keyData = new Uint8Array(atob(pem.replace(replace, "")).split("").map((c) => c.charCodeAt(0)));
  const isPublic = keyFormat === "spki";
  switch (alg) {
    case "PS256":
    case "PS384":
    case "PS512":
      algorithm = { name: "RSA-PSS", hash: `SHA-${alg.slice(-3)}` };
      keyUsages = isPublic ? ["verify"] : ["sign"];
      break;
    case "RS256":
    case "RS384":
    case "RS512":
      algorithm = { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${alg.slice(-3)}` };
      keyUsages = isPublic ? ["verify"] : ["sign"];
      break;
    case "RSA-OAEP":
    case "RSA-OAEP-256":
    case "RSA-OAEP-384":
    case "RSA-OAEP-512":
      algorithm = {
        name: "RSA-OAEP",
        hash: `SHA-${parseInt(alg.slice(-3), 10) || 1}`
      };
      keyUsages = isPublic ? ["encrypt", "wrapKey"] : ["decrypt", "unwrapKey"];
      break;
    case "ES256":
      algorithm = { name: "ECDSA", namedCurve: "P-256" };
      keyUsages = isPublic ? ["verify"] : ["sign"];
      break;
    case "ES384":
      algorithm = { name: "ECDSA", namedCurve: "P-384" };
      keyUsages = isPublic ? ["verify"] : ["sign"];
      break;
    case "ES512":
      algorithm = { name: "ECDSA", namedCurve: "P-521" };
      keyUsages = isPublic ? ["verify"] : ["sign"];
      break;
    case "ECDH-ES":
    case "ECDH-ES+A128KW":
    case "ECDH-ES+A192KW":
    case "ECDH-ES+A256KW": {
      const namedCurve = getNamedCurve2(keyData);
      algorithm = namedCurve?.startsWith("P-") ? { name: "ECDH", namedCurve } : { name: "X25519" };
      keyUsages = isPublic ? [] : ["deriveBits"];
      break;
    }
    case "Ed25519":
    case "EdDSA":
      algorithm = { name: "Ed25519" };
      keyUsages = isPublic ? ["verify"] : ["sign"];
      break;
    default:
      throw new JOSENotSupported('Invalid or unsupported "alg" (Algorithm) value');
  }
  return crypto.subtle.importKey(keyFormat, keyData, algorithm, options?.extractable ?? (isPublic ? true : false), keyUsages);
}, "genericImport");
var fromPKCS8 = /* @__PURE__ */ __name((pem, alg, options) => {
  return genericImport(/(?:-----(?:BEGIN|END) PRIVATE KEY-----|\s)/g, "pkcs8", pem, alg, options);
}, "fromPKCS8");

// node_modules/jose/dist/webapi/lib/jwk_to_key.js
function subtleMapping(jwk) {
  let algorithm;
  let keyUsages;
  switch (jwk.kty) {
    case "RSA": {
      switch (jwk.alg) {
        case "PS256":
        case "PS384":
        case "PS512":
          algorithm = { name: "RSA-PSS", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RS256":
        case "RS384":
        case "RS512":
          algorithm = { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RSA-OAEP":
        case "RSA-OAEP-256":
        case "RSA-OAEP-384":
        case "RSA-OAEP-512":
          algorithm = {
            name: "RSA-OAEP",
            hash: `SHA-${parseInt(jwk.alg.slice(-3), 10) || 1}`
          };
          keyUsages = jwk.d ? ["decrypt", "unwrapKey"] : ["encrypt", "wrapKey"];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    case "EC": {
      switch (jwk.alg) {
        case "ES256":
          algorithm = { name: "ECDSA", namedCurve: "P-256" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ES384":
          algorithm = { name: "ECDSA", namedCurve: "P-384" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ES512":
          algorithm = { name: "ECDSA", namedCurve: "P-521" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: "ECDH", namedCurve: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    case "OKP": {
      switch (jwk.alg) {
        case "Ed25519":
        case "EdDSA":
          algorithm = { name: "Ed25519" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    default:
      throw new JOSENotSupported('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
  }
  return { algorithm, keyUsages };
}
__name(subtleMapping, "subtleMapping");
var jwk_to_key_default = /* @__PURE__ */ __name(async (jwk) => {
  if (!jwk.alg) {
    throw new TypeError('"alg" argument is required when "jwk.alg" is not present');
  }
  const { algorithm, keyUsages } = subtleMapping(jwk);
  const keyData = { ...jwk };
  delete keyData.alg;
  delete keyData.use;
  return crypto.subtle.importKey("jwk", keyData, algorithm, jwk.ext ?? (jwk.d ? false : true), jwk.key_ops ?? keyUsages);
}, "default");

// node_modules/jose/dist/webapi/key/import.js
async function importPKCS8(pkcs8, alg, options) {
  if (typeof pkcs8 !== "string" || pkcs8.indexOf("-----BEGIN PRIVATE KEY-----") !== 0) {
    throw new TypeError('"pkcs8" must be PKCS#8 formatted string');
  }
  return fromPKCS8(pkcs8, alg, options);
}
__name(importPKCS8, "importPKCS8");

// node_modules/jose/dist/webapi/lib/validate_crit.js
var validate_crit_default = /* @__PURE__ */ __name((Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) => {
  if (joseHeader.crit !== void 0 && protectedHeader?.crit === void 0) {
    throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
  }
  if (!protectedHeader || protectedHeader.crit === void 0) {
    return /* @__PURE__ */ new Set();
  }
  if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input) => typeof input !== "string" || input.length === 0)) {
    throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
  }
  let recognized;
  if (recognizedOption !== void 0) {
    recognized = new Map([...Object.entries(recognizedOption), ...recognizedDefault.entries()]);
  } else {
    recognized = recognizedDefault;
  }
  for (const parameter of protectedHeader.crit) {
    if (!recognized.has(parameter)) {
      throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
    }
    if (joseHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" is missing`);
    }
    if (recognized.get(parameter) && protectedHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
    }
  }
  return new Set(protectedHeader.crit);
}, "default");

// node_modules/jose/dist/webapi/lib/is_jwk.js
function isJWK(key) {
  return is_object_default(key) && typeof key.kty === "string";
}
__name(isJWK, "isJWK");
function isPrivateJWK(key) {
  return key.kty !== "oct" && typeof key.d === "string";
}
__name(isPrivateJWK, "isPrivateJWK");
function isPublicJWK(key) {
  return key.kty !== "oct" && typeof key.d === "undefined";
}
__name(isPublicJWK, "isPublicJWK");
function isSecretJWK(key) {
  return key.kty === "oct" && typeof key.k === "string";
}
__name(isSecretJWK, "isSecretJWK");

// node_modules/jose/dist/webapi/lib/normalize_key.js
var cache;
var handleJWK = /* @__PURE__ */ __name(async (key, jwk, alg, freeze = false) => {
  cache ||= /* @__PURE__ */ new WeakMap();
  let cached = cache.get(key);
  if (cached?.[alg]) {
    return cached[alg];
  }
  const cryptoKey = await jwk_to_key_default({ ...jwk, alg });
  if (freeze)
    Object.freeze(key);
  if (!cached) {
    cache.set(key, { [alg]: cryptoKey });
  } else {
    cached[alg] = cryptoKey;
  }
  return cryptoKey;
}, "handleJWK");
var handleKeyObject = /* @__PURE__ */ __name((keyObject, alg) => {
  cache ||= /* @__PURE__ */ new WeakMap();
  let cached = cache.get(keyObject);
  if (cached?.[alg]) {
    return cached[alg];
  }
  const isPublic = keyObject.type === "public";
  const extractable = isPublic ? true : false;
  let cryptoKey;
  if (keyObject.asymmetricKeyType === "x25519") {
    switch (alg) {
      case "ECDH-ES":
      case "ECDH-ES+A128KW":
      case "ECDH-ES+A192KW":
      case "ECDH-ES+A256KW":
        break;
      default:
        throw new TypeError("given KeyObject instance cannot be used for this algorithm");
    }
    cryptoKey = keyObject.toCryptoKey(keyObject.asymmetricKeyType, extractable, isPublic ? [] : ["deriveBits"]);
  }
  if (keyObject.asymmetricKeyType === "ed25519") {
    if (alg !== "EdDSA" && alg !== "Ed25519") {
      throw new TypeError("given KeyObject instance cannot be used for this algorithm");
    }
    cryptoKey = keyObject.toCryptoKey(keyObject.asymmetricKeyType, extractable, [
      isPublic ? "verify" : "sign"
    ]);
  }
  if (keyObject.asymmetricKeyType === "rsa") {
    let hash;
    switch (alg) {
      case "RSA-OAEP":
        hash = "SHA-1";
        break;
      case "RS256":
      case "PS256":
      case "RSA-OAEP-256":
        hash = "SHA-256";
        break;
      case "RS384":
      case "PS384":
      case "RSA-OAEP-384":
        hash = "SHA-384";
        break;
      case "RS512":
      case "PS512":
      case "RSA-OAEP-512":
        hash = "SHA-512";
        break;
      default:
        throw new TypeError("given KeyObject instance cannot be used for this algorithm");
    }
    if (alg.startsWith("RSA-OAEP")) {
      return keyObject.toCryptoKey({
        name: "RSA-OAEP",
        hash
      }, extractable, isPublic ? ["encrypt"] : ["decrypt"]);
    }
    cryptoKey = keyObject.toCryptoKey({
      name: alg.startsWith("PS") ? "RSA-PSS" : "RSASSA-PKCS1-v1_5",
      hash
    }, extractable, [isPublic ? "verify" : "sign"]);
  }
  if (keyObject.asymmetricKeyType === "ec") {
    const nist = /* @__PURE__ */ new Map([
      ["prime256v1", "P-256"],
      ["secp384r1", "P-384"],
      ["secp521r1", "P-521"]
    ]);
    const namedCurve = nist.get(keyObject.asymmetricKeyDetails?.namedCurve);
    if (!namedCurve) {
      throw new TypeError("given KeyObject instance cannot be used for this algorithm");
    }
    if (alg === "ES256" && namedCurve === "P-256") {
      cryptoKey = keyObject.toCryptoKey({
        name: "ECDSA",
        namedCurve
      }, extractable, [isPublic ? "verify" : "sign"]);
    }
    if (alg === "ES384" && namedCurve === "P-384") {
      cryptoKey = keyObject.toCryptoKey({
        name: "ECDSA",
        namedCurve
      }, extractable, [isPublic ? "verify" : "sign"]);
    }
    if (alg === "ES512" && namedCurve === "P-521") {
      cryptoKey = keyObject.toCryptoKey({
        name: "ECDSA",
        namedCurve
      }, extractable, [isPublic ? "verify" : "sign"]);
    }
    if (alg.startsWith("ECDH-ES")) {
      cryptoKey = keyObject.toCryptoKey({
        name: "ECDH",
        namedCurve
      }, extractable, isPublic ? [] : ["deriveBits"]);
    }
  }
  if (!cryptoKey) {
    throw new TypeError("given KeyObject instance cannot be used for this algorithm");
  }
  if (!cached) {
    cache.set(keyObject, { [alg]: cryptoKey });
  } else {
    cached[alg] = cryptoKey;
  }
  return cryptoKey;
}, "handleKeyObject");
var normalize_key_default = /* @__PURE__ */ __name(async (key, alg) => {
  if (key instanceof Uint8Array) {
    return key;
  }
  if (isCryptoKey(key)) {
    return key;
  }
  if (isKeyObject(key)) {
    if (key.type === "secret") {
      return key.export();
    }
    if ("toCryptoKey" in key && typeof key.toCryptoKey === "function") {
      try {
        return handleKeyObject(key, alg);
      } catch (err) {
        if (err instanceof TypeError) {
          throw err;
        }
      }
    }
    let jwk = key.export({ format: "jwk" });
    return handleJWK(key, jwk, alg);
  }
  if (isJWK(key)) {
    if (key.k) {
      return decode(key.k);
    }
    return handleJWK(key, key, alg, true);
  }
  throw new Error("unreachable");
}, "default");

// node_modules/jose/dist/webapi/lib/check_key_type.js
var tag = /* @__PURE__ */ __name((key) => key?.[Symbol.toStringTag], "tag");
var jwkMatchesOp = /* @__PURE__ */ __name((alg, key, usage) => {
  if (key.use !== void 0) {
    let expected;
    switch (usage) {
      case "sign":
      case "verify":
        expected = "sig";
        break;
      case "encrypt":
      case "decrypt":
        expected = "enc";
        break;
    }
    if (key.use !== expected) {
      throw new TypeError(`Invalid key for this operation, its "use" must be "${expected}" when present`);
    }
  }
  if (key.alg !== void 0 && key.alg !== alg) {
    throw new TypeError(`Invalid key for this operation, its "alg" must be "${alg}" when present`);
  }
  if (Array.isArray(key.key_ops)) {
    let expectedKeyOp;
    switch (true) {
      case (usage === "sign" || usage === "verify"):
      case alg === "dir":
      case alg.includes("CBC-HS"):
        expectedKeyOp = usage;
        break;
      case alg.startsWith("PBES2"):
        expectedKeyOp = "deriveBits";
        break;
      case /^A\d{3}(?:GCM)?(?:KW)?$/.test(alg):
        if (!alg.includes("GCM") && alg.endsWith("KW")) {
          expectedKeyOp = usage === "encrypt" ? "wrapKey" : "unwrapKey";
        } else {
          expectedKeyOp = usage;
        }
        break;
      case (usage === "encrypt" && alg.startsWith("RSA")):
        expectedKeyOp = "wrapKey";
        break;
      case usage === "decrypt":
        expectedKeyOp = alg.startsWith("RSA") ? "unwrapKey" : "deriveBits";
        break;
    }
    if (expectedKeyOp && key.key_ops?.includes?.(expectedKeyOp) === false) {
      throw new TypeError(`Invalid key for this operation, its "key_ops" must include "${expectedKeyOp}" when present`);
    }
  }
  return true;
}, "jwkMatchesOp");
var symmetricTypeCheck = /* @__PURE__ */ __name((alg, key, usage) => {
  if (key instanceof Uint8Array)
    return;
  if (isJWK(key)) {
    if (isSecretJWK(key) && jwkMatchesOp(alg, key, usage))
      return;
    throw new TypeError(`JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present`);
  }
  if (!is_key_like_default(key)) {
    throw new TypeError(withAlg(alg, key, "CryptoKey", "KeyObject", "JSON Web Key", "Uint8Array"));
  }
  if (key.type !== "secret") {
    throw new TypeError(`${tag(key)} instances for symmetric algorithms must be of type "secret"`);
  }
}, "symmetricTypeCheck");
var asymmetricTypeCheck = /* @__PURE__ */ __name((alg, key, usage) => {
  if (isJWK(key)) {
    switch (usage) {
      case "decrypt":
      case "sign":
        if (isPrivateJWK(key) && jwkMatchesOp(alg, key, usage))
          return;
        throw new TypeError(`JSON Web Key for this operation be a private JWK`);
      case "encrypt":
      case "verify":
        if (isPublicJWK(key) && jwkMatchesOp(alg, key, usage))
          return;
        throw new TypeError(`JSON Web Key for this operation be a public JWK`);
    }
  }
  if (!is_key_like_default(key)) {
    throw new TypeError(withAlg(alg, key, "CryptoKey", "KeyObject", "JSON Web Key"));
  }
  if (key.type === "secret") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithms must not be of type "secret"`);
  }
  if (key.type === "public") {
    switch (usage) {
      case "sign":
        throw new TypeError(`${tag(key)} instances for asymmetric algorithm signing must be of type "private"`);
      case "decrypt":
        throw new TypeError(`${tag(key)} instances for asymmetric algorithm decryption must be of type "private"`);
      default:
        break;
    }
  }
  if (key.type === "private") {
    switch (usage) {
      case "verify":
        throw new TypeError(`${tag(key)} instances for asymmetric algorithm verifying must be of type "public"`);
      case "encrypt":
        throw new TypeError(`${tag(key)} instances for asymmetric algorithm encryption must be of type "public"`);
      default:
        break;
    }
  }
}, "asymmetricTypeCheck");
var check_key_type_default = /* @__PURE__ */ __name((alg, key, usage) => {
  const symmetric = alg.startsWith("HS") || alg === "dir" || alg.startsWith("PBES2") || /^A(?:128|192|256)(?:GCM)?(?:KW)?$/.test(alg) || /^A(?:128|192|256)CBC-HS(?:256|384|512)$/.test(alg);
  if (symmetric) {
    symmetricTypeCheck(alg, key, usage);
  } else {
    asymmetricTypeCheck(alg, key, usage);
  }
}, "default");

// node_modules/jose/dist/webapi/lib/subtle_dsa.js
var subtle_dsa_default = /* @__PURE__ */ __name((alg, algorithm) => {
  const hash = `SHA-${alg.slice(-3)}`;
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512":
      return { hash, name: "HMAC" };
    case "PS256":
    case "PS384":
    case "PS512":
      return { hash, name: "RSA-PSS", saltLength: parseInt(alg.slice(-3), 10) >> 3 };
    case "RS256":
    case "RS384":
    case "RS512":
      return { hash, name: "RSASSA-PKCS1-v1_5" };
    case "ES256":
    case "ES384":
    case "ES512":
      return { hash, name: "ECDSA", namedCurve: algorithm.namedCurve };
    case "Ed25519":
    case "EdDSA":
      return { name: "Ed25519" };
    default:
      throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
  }
}, "default");

// node_modules/jose/dist/webapi/lib/get_sign_verify_key.js
var get_sign_verify_key_default = /* @__PURE__ */ __name(async (alg, key, usage) => {
  if (key instanceof Uint8Array) {
    if (!alg.startsWith("HS")) {
      throw new TypeError(invalid_key_input_default(key, "CryptoKey", "KeyObject", "JSON Web Key"));
    }
    return crypto.subtle.importKey("raw", key, { hash: `SHA-${alg.slice(-3)}`, name: "HMAC" }, false, [usage]);
  }
  checkSigCryptoKey(key, alg, usage);
  return key;
}, "default");

// node_modules/jose/dist/webapi/lib/epoch.js
var epoch_default = /* @__PURE__ */ __name((date) => Math.floor(date.getTime() / 1e3), "default");

// node_modules/jose/dist/webapi/lib/secs.js
var minute = 60;
var hour = minute * 60;
var day = hour * 24;
var week = day * 7;
var year = day * 365.25;
var REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
var secs_default = /* @__PURE__ */ __name((str) => {
  const matched = REGEX.exec(str);
  if (!matched || matched[4] && matched[1]) {
    throw new TypeError("Invalid time period format");
  }
  const value = parseFloat(matched[2]);
  const unit = matched[3].toLowerCase();
  let numericDate;
  switch (unit) {
    case "sec":
    case "secs":
    case "second":
    case "seconds":
    case "s":
      numericDate = Math.round(value);
      break;
    case "minute":
    case "minutes":
    case "min":
    case "mins":
    case "m":
      numericDate = Math.round(value * minute);
      break;
    case "hour":
    case "hours":
    case "hr":
    case "hrs":
    case "h":
      numericDate = Math.round(value * hour);
      break;
    case "day":
    case "days":
    case "d":
      numericDate = Math.round(value * day);
      break;
    case "week":
    case "weeks":
    case "w":
      numericDate = Math.round(value * week);
      break;
    default:
      numericDate = Math.round(value * year);
      break;
  }
  if (matched[1] === "-" || matched[4] === "ago") {
    return -numericDate;
  }
  return numericDate;
}, "default");

// node_modules/jose/dist/webapi/lib/jwt_claims_set.js
function validateInput(label, input) {
  if (!Number.isFinite(input)) {
    throw new TypeError(`Invalid ${label} input`);
  }
  return input;
}
__name(validateInput, "validateInput");
var JWTClaimsBuilder = class {
  static {
    __name(this, "JWTClaimsBuilder");
  }
  #payload;
  constructor(payload) {
    if (!is_object_default(payload)) {
      throw new TypeError("JWT Claims Set MUST be an object");
    }
    this.#payload = structuredClone(payload);
  }
  data() {
    return encoder3.encode(JSON.stringify(this.#payload));
  }
  get iss() {
    return this.#payload.iss;
  }
  set iss(value) {
    this.#payload.iss = value;
  }
  get sub() {
    return this.#payload.sub;
  }
  set sub(value) {
    this.#payload.sub = value;
  }
  get aud() {
    return this.#payload.aud;
  }
  set aud(value) {
    this.#payload.aud = value;
  }
  set jti(value) {
    this.#payload.jti = value;
  }
  set nbf(value) {
    if (typeof value === "number") {
      this.#payload.nbf = validateInput("setNotBefore", value);
    } else if (value instanceof Date) {
      this.#payload.nbf = validateInput("setNotBefore", epoch_default(value));
    } else {
      this.#payload.nbf = epoch_default(/* @__PURE__ */ new Date()) + secs_default(value);
    }
  }
  set exp(value) {
    if (typeof value === "number") {
      this.#payload.exp = validateInput("setExpirationTime", value);
    } else if (value instanceof Date) {
      this.#payload.exp = validateInput("setExpirationTime", epoch_default(value));
    } else {
      this.#payload.exp = epoch_default(/* @__PURE__ */ new Date()) + secs_default(value);
    }
  }
  set iat(value) {
    if (typeof value === "undefined") {
      this.#payload.iat = epoch_default(/* @__PURE__ */ new Date());
    } else if (value instanceof Date) {
      this.#payload.iat = validateInput("setIssuedAt", epoch_default(value));
    } else if (typeof value === "string") {
      this.#payload.iat = validateInput("setIssuedAt", epoch_default(/* @__PURE__ */ new Date()) + secs_default(value));
    } else {
      this.#payload.iat = validateInput("setIssuedAt", value);
    }
  }
};

// node_modules/jose/dist/webapi/lib/sign.js
var sign_default = /* @__PURE__ */ __name(async (alg, key, data) => {
  const cryptoKey = await get_sign_verify_key_default(alg, key, "sign");
  check_key_length_default(alg, cryptoKey);
  const signature = await crypto.subtle.sign(subtle_dsa_default(alg, cryptoKey.algorithm), cryptoKey, data);
  return new Uint8Array(signature);
}, "default");

// node_modules/jose/dist/webapi/jws/flattened/sign.js
var FlattenedSign = class {
  static {
    __name(this, "FlattenedSign");
  }
  #payload;
  #protectedHeader;
  #unprotectedHeader;
  constructor(payload) {
    if (!(payload instanceof Uint8Array)) {
      throw new TypeError("payload must be an instance of Uint8Array");
    }
    this.#payload = payload;
  }
  setProtectedHeader(protectedHeader) {
    if (this.#protectedHeader) {
      throw new TypeError("setProtectedHeader can only be called once");
    }
    this.#protectedHeader = protectedHeader;
    return this;
  }
  setUnprotectedHeader(unprotectedHeader) {
    if (this.#unprotectedHeader) {
      throw new TypeError("setUnprotectedHeader can only be called once");
    }
    this.#unprotectedHeader = unprotectedHeader;
    return this;
  }
  async sign(key, options) {
    if (!this.#protectedHeader && !this.#unprotectedHeader) {
      throw new JWSInvalid("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");
    }
    if (!is_disjoint_default(this.#protectedHeader, this.#unprotectedHeader)) {
      throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
    }
    const joseHeader = {
      ...this.#protectedHeader,
      ...this.#unprotectedHeader
    };
    const extensions = validate_crit_default(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, this.#protectedHeader, joseHeader);
    let b64 = true;
    if (extensions.has("b64")) {
      b64 = this.#protectedHeader.b64;
      if (typeof b64 !== "boolean") {
        throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
      }
    }
    const { alg } = joseHeader;
    if (typeof alg !== "string" || !alg) {
      throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
    }
    check_key_type_default(alg, key, "sign");
    let payload = this.#payload;
    if (b64) {
      payload = encoder3.encode(encode(payload));
    }
    let protectedHeader;
    if (this.#protectedHeader) {
      protectedHeader = encoder3.encode(encode(JSON.stringify(this.#protectedHeader)));
    } else {
      protectedHeader = encoder3.encode("");
    }
    const data = concat(protectedHeader, encoder3.encode("."), payload);
    const k = await normalize_key_default(key, alg);
    const signature = await sign_default(alg, k, data);
    const jws = {
      signature: encode(signature),
      payload: ""
    };
    if (b64) {
      jws.payload = decoder.decode(payload);
    }
    if (this.#unprotectedHeader) {
      jws.header = this.#unprotectedHeader;
    }
    if (this.#protectedHeader) {
      jws.protected = decoder.decode(protectedHeader);
    }
    return jws;
  }
};

// node_modules/jose/dist/webapi/jws/compact/sign.js
var CompactSign = class {
  static {
    __name(this, "CompactSign");
  }
  #flattened;
  constructor(payload) {
    this.#flattened = new FlattenedSign(payload);
  }
  setProtectedHeader(protectedHeader) {
    this.#flattened.setProtectedHeader(protectedHeader);
    return this;
  }
  async sign(key, options) {
    const jws = await this.#flattened.sign(key, options);
    if (jws.payload === void 0) {
      throw new TypeError("use the flattened module for creating JWS with b64: false");
    }
    return `${jws.protected}.${jws.payload}.${jws.signature}`;
  }
};

// node_modules/jose/dist/webapi/jwt/sign.js
var SignJWT = class {
  static {
    __name(this, "SignJWT");
  }
  #protectedHeader;
  #jwt;
  constructor(payload = {}) {
    this.#jwt = new JWTClaimsBuilder(payload);
  }
  setIssuer(issuer) {
    this.#jwt.iss = issuer;
    return this;
  }
  setSubject(subject) {
    this.#jwt.sub = subject;
    return this;
  }
  setAudience(audience) {
    this.#jwt.aud = audience;
    return this;
  }
  setJti(jwtId) {
    this.#jwt.jti = jwtId;
    return this;
  }
  setNotBefore(input) {
    this.#jwt.nbf = input;
    return this;
  }
  setExpirationTime(input) {
    this.#jwt.exp = input;
    return this;
  }
  setIssuedAt(input) {
    this.#jwt.iat = input;
    return this;
  }
  setProtectedHeader(protectedHeader) {
    this.#protectedHeader = protectedHeader;
    return this;
  }
  async sign(key, options) {
    const sig = new CompactSign(this.#jwt.data());
    sig.setProtectedHeader(this.#protectedHeader);
    if (Array.isArray(this.#protectedHeader?.crit) && this.#protectedHeader.crit.includes("b64") && this.#protectedHeader.b64 === false) {
      throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
    }
    return sig.sign(key, options);
  }
};

// src/github-app.ts
var JWT_MAX_AGE_SECONDS = 600;
var JWT_BACKDATE_SECONDS = 30;
var TOKEN_REFRESH_SKEW_MS = 6e4;
var INSTALLATION_TOKEN_PERMISSIONS = { contents: "write", metadata: "read" };
var tokenCache = /* @__PURE__ */ new Map();
function logFailure(response, method, operation) {
  const headers = {};
  for (const name of ["retry-after", "x-ratelimit-remaining", "x-ratelimit-reset"]) {
    const raw = response.headers.get(name);
    if (raw !== null && /^\d{1,12}$/.test(raw)) headers[name] = Number(raw);
  }
  console.warn(JSON.stringify({
    event: "github_http_failure",
    operation,
    method: ["GET", "POST", "PATCH"].includes(method) ? method : "OTHER",
    status: response.status,
    ...headers
  }));
}
__name(logFailure, "logFailure");
function unavailable() {
  return new Error("github_app_auth_unavailable");
}
__name(unavailable, "unavailable");
function failed() {
  return new Error("github_app_auth_failed");
}
__name(failed, "failed");
function required(value) {
  if (!value || !value.trim()) throw unavailable();
  return value.trim();
}
__name(required, "required");
function numericId(value) {
  const id = required(value);
  if (!/^\d+$/.test(id) || BigInt(id) <= 0n) throw unavailable();
  return id;
}
__name(numericId, "numericId");
function apiUrl(config) {
  const candidate = (config.GITHUB_API_URL ?? "https://api.github.com").trim().replace(/\/+$/, "");
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.search || parsed.hash) throw new Error();
    return parsed.toString().replace(/\/+$/, "");
  } catch {
    throw unavailable();
  }
}
__name(apiUrl, "apiUrl");
function scope(env) {
  return { appId: numericId(env.GITHUB_APP_ID), installationId: numericId(env.GITHUB_APP_INSTALLATION_ID), owner: required(env.REPO_OWNER), repo: required(env.REPO_NAME), api: apiUrl(env) };
}
__name(scope, "scope");
function cacheKey(value) {
  return JSON.stringify([value.appId, value.installationId, value.owner, value.repo, value.api, INSTALLATION_TOKEN_PERMISSIONS]);
}
__name(cacheKey, "cacheKey");
function parseExpiry(value, now) {
  if (typeof value !== "string") throw failed();
  const expiry = Date.parse(value);
  if (!Number.isFinite(expiry) || expiry <= now) throw failed();
  return expiry;
}
__name(parseExpiry, "parseExpiry");
async function createAppJwt(env, now = Date.now()) {
  try {
    const issuedAt = Math.floor(now / 1e3) - JWT_BACKDATE_SECONDS;
    const key = await importPKCS8(required(env.GITHUB_APP_PRIVATE_KEY).replace(/\\n/g, "\n"), "RS256");
    return await new SignJWT({}).setProtectedHeader({ alg: "RS256", typ: "JWT" }).setIssuer(numericId(env.GITHUB_APP_ID)).setIssuedAt(issuedAt).setExpirationTime(issuedAt + JWT_MAX_AGE_SECONDS).sign(key);
  } catch (error2) {
    if (error2 instanceof Error && error2.message === "github_app_auth_unavailable") throw error2;
    throw unavailable();
  }
}
__name(createAppJwt, "createAppJwt");
async function getInstallationToken(env, now = Date.now(), fetcher = fetch, beforeRequest) {
  const target2 = scope(env);
  const key = cacheKey(target2);
  const cached = tokenCache.get(key);
  if (cached && now < cached.refreshAt) return cached.value;
  let jwt;
  try {
    jwt = await createAppJwt(env, now);
  } catch {
    throw unavailable();
  }
  try {
    await beforeRequest?.();
  } catch {
    throw failed();
  }
  let response;
  try {
    response = await fetcher(`${target2.api}/app/installations/${encodeURIComponent(target2.installationId)}/access_tokens`, { method: "POST", headers: { accept: "application/vnd.github+json", authorization: `Bearer ${jwt}`, "user-agent": "cayleypy-results-ingest", "x-github-api-version": "2026-03-10" }, body: JSON.stringify({ repositories: [target2.repo], permissions: INSTALLATION_TOKEN_PERMISSIONS }) });
  } catch {
    throw failed();
  }
  if (!response.ok) {
    logFailure(response, "POST", "auth");
    throw failed();
  }
  let body;
  try {
    body = await response.json();
  } catch {
    throw failed();
  }
  if (body === null || typeof body !== "object") throw failed();
  const result = body;
  if (typeof result.token !== "string" || result.token.length === 0) throw failed();
  const expiry = parseExpiry(result.expires_at, now);
  tokenCache.set(key, { value: result.token, refreshAt: Math.max(now, expiry - TOKEN_REFRESH_SKEW_MS) });
  return result.token;
}
__name(getInstallationToken, "getInstallationToken");
async function githubRequest(env, path, options, fetcher = fetch) {
  let api;
  try {
    api = apiUrl(env);
    if (!path.startsWith("/") || path.startsWith("//")) throw new Error();
  } catch {
    throw new Error("github_temporary_unavailable");
  }
  let response;
  try {
    response = await fetcher(`${api}${path}`, { method: options.method ?? "GET", headers: { accept: "application/vnd.github+json", authorization: `Bearer ${options.token}`, "content-type": "application/json", "user-agent": "cayleypy-results-ingest", "x-github-api-version": "2026-03-10" }, body: options.body === void 0 ? void 0 : JSON.stringify(options.body) });
  } catch {
    throw new Error("github_temporary_unavailable");
  }
  if (!response.ok) {
    if (response.status !== 404) logFailure(response, options.method ?? "GET", "request");
    return { status: response.status, body: void 0 };
  }
  try {
    return { status: response.status, body: await response.json() };
  } catch {
    return { status: response.status, body: void 0 };
  }
}
__name(githubRequest, "githubRequest");

// src/github-writer.ts
var PENDING_PREFIX = "pending/";
var MAX_RECORDS = 40;
var MAX_BYTES2 = 5 * 1024 * 1024;
var MAX_DELAY_MS = 3e4;
var RETAIN_DELAY_MS = 15e3;
var SHA_RE = /^[0-9a-f]{40,64}$/;
var REPOSITORY_SEGMENT_RE = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,99}$/;
var BRANCH_SEGMENT_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
var TerminalIntegrityError = class extends Error {
  constructor(submissionId, safeError) {
    super(safeError);
    this.submissionId = submissionId;
    this.safeError = safeError;
  }
  submissionId;
  safeError;
  static {
    __name(this, "TerminalIntegrityError");
  }
};
function pendingKey(id) {
  return `${PENDING_PREFIX}${id}`;
}
__name(pendingKey, "pendingKey");
function safeSegment(value) {
  const out = value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  if (!out || out.length > 128) throw new Error("github_path_invalid");
  return out;
}
__name(safeSegment, "safeSegment");
function repositorySegment(value) {
  const out = value?.trim();
  if (!out || !REPOSITORY_SEGMENT_RE.test(out)) throw new Error("github_repository_invalid");
  return out;
}
__name(repositorySegment, "repositorySegment");
function branchRoute(value) {
  const branch = value?.trim();
  if (!branch || branch.length > 255 || branch.startsWith("/") || branch.endsWith("/")) throw new Error("github_branch_invalid");
  const parts = branch.split("/");
  if (parts.some((p) => p === "." || p === ".." || !BRANCH_SEGMENT_RE.test(p))) throw new Error("github_branch_invalid");
  return parts.map(encodeURIComponent).join("/");
}
__name(branchRoute, "branchRoute");
function target(env) {
  const branch = env.STAGING_BRANCH?.trim();
  const branchRouteValue = branchRoute(branch);
  if (!branch) throw new Error("github_branch_invalid");
  return { owner: repositorySegment(env.REPO_OWNER), repo: repositorySegment(env.REPO_NAME), branchRoute: branchRouteValue, branchQuery: encodeURIComponent(branch) };
}
__name(target, "target");
function resultPath(id, record) {
  const day2 = record.submitted_at.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day2) || !/^[0-9a-f-]{36}$/.test(id)) throw new Error("github_path_invalid");
  return ["results", "v1", safeSegment(record.competition), safeSegment(record.puzzle_type), String(record.puzzle_id), day2, `${id}.json`].join("/");
}
__name(resultPath, "resultPath");
function resultPathV2(id, record) {
  const day2 = record.submitted_at.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day2) || !/^[0-9a-f-]{36}$/.test(id)) throw new Error("github_path_invalid");
  return ["data", "v2", "slurm", safeSegment(record.competition), safeSegment(record.puzzle_type), day2, `${id}.json`].join("/");
}
__name(resultPathV2, "resultPathV2");
function publicationPath(id, record) {
  return record.schema_version === 1 ? resultPath(id, record) : resultPathV2(id, record);
}
__name(publicationPath, "publicationPath");
function recordBody(id, envelope) {
  return canonicalJson({ submission_id: id, envelope });
}
__name(recordBody, "recordBody");
async function parseVerified(env, id) {
  const row = await findBySubmissionId(env.RESULTS_DB, id);
  if (!row || row.state !== "validated") return null;
  const invalid = /* @__PURE__ */ __name(() => new TerminalIntegrityError(id, "publication_raw_integrity_invalid"), "invalid");
  const object = await env.RAW_RESULTS.get(row.raw_r2_key);
  if (object === null || object.size > MAX_SERIALIZED_ENVELOPE_BYTES) throw invalid();
  const raw = await object.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_SERIALIZED_ENVELOPE_BYTES) throw invalid();
  const stored = object.customMetadata?.sha256;
  if (typeof stored !== "string" || !/^[0-9a-f]{64}$/.test(stored) || await sha256Hex(raw) !== stored) {
    throw invalid();
  }
  let candidate;
  try {
    candidate = JSON.parse(raw);
  } catch {
    throw invalid();
  }
  const version = candidate !== null && typeof candidate === "object" && candidate.schema_version === 2 ? 2 : 1;
  const batch = validateVersionedBatch({ schema_version: version, results: [candidate] }, version);
  if (!batch.ok) throw invalid();
  const envelope = batch.value.results[0];
  if (envelope.idempotency_key !== row.idempotency_key || envelope.run_id !== row.run_id || envelope.author.name !== row.author_name || envelope.competition !== row.competition || envelope.puzzle_type !== row.puzzle_type || envelope.puzzle_id !== row.puzzle_id || (await validateVersionedEnvelope(envelope)).length !== 0) {
    throw invalid();
  }
  return {
    id,
    row,
    envelope,
    body: recordBody(id, envelope),
    path: publicationPath(id, envelope)
  };
}
__name(parseVerified, "parseVerified");
function sha2(value) {
  const candidate = value !== null && typeof value === "object" ? value.sha : null;
  return typeof candidate === "string" && SHA_RE.test(candidate) ? candidate : null;
}
__name(sha2, "sha");
function referenceSha(value) {
  if (value === null || typeof value !== "object") return null;
  const record = value;
  return sha2(record.object) ?? sha2(record);
}
__name(referenceSha, "referenceSha");
var GitHubWriter = class extends DurableObject {
  static {
    __name(this, "GitHubWriter");
  }
  ingestActive = false;
  async fetch(request) {
    const path = new URL(request.url).pathname;
    if (request.method !== "POST" || path !== "/v1/results" && path !== "/v2/results") return errorResponse(404, "not_found");
    if (this.ingestActive) return errorResponse(503, "ingest_busy", { "Retry-After": "60" });
    this.ingestActive = true;
    try {
      return await handleIngestBody(request, this.env, path === "/v1/results" ? 1 : 2);
    } finally {
      this.ingestActive = false;
    }
  }
  alarmUpdate = Promise.resolve();
  constructor(ctx, env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      const entries = await ctx.storage.list({ prefix: PENDING_PREFIX, limit: 1 });
      if (entries.size && await ctx.storage.getAlarm() === null) await this.rearm();
    });
  }
  assertNormalMode() {
    if (resolveIngestMode(this.env.INGEST_MODE) !== "normal") throw new Error("writer_paused");
  }
  async guardedRequest(path, options) {
    this.assertNormalMode();
    return githubRequest(this.env, path, options);
  }
  async scheduleAlarmAt(deadline, force = false) {
    const update = this.alarmUpdate.then(async () => {
      const alarm = await this.ctx.storage.getAlarm();
      if (force || alarm === null || alarm > deadline) await this.ctx.storage.setAlarm(deadline);
    });
    this.alarmUpdate = update.catch(() => void 0);
    await update;
  }
  async rearm(delayMs = RETAIN_DELAY_MS, force = false) {
    await this.scheduleAlarmAt(Date.now() + Math.min(MAX_DELAY_MS, Math.max(1, delayMs)), force);
  }
  async enqueueValidated(submissionId) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(submissionId)) throw new Error("writer_submission_invalid");
    await this.ctx.storage.put(pendingKey(submissionId), { submissionId });
    await this.scheduleAlarmAt(Date.now() + RETAIN_DELAY_MS);
  }
  async maintain(scheduledTime) {
    await maintainSubmissions(this.env, scheduledTime, (id) => this.enqueueValidated(id));
  }
  async alarm() {
    await this.flush(true);
  }
  async pending() {
    const entries = await this.ctx.storage.list({ prefix: PENDING_PREFIX, limit: MAX_RECORDS + 1 });
    return [...entries.values()].slice(0, MAX_RECORDS);
  }
  async terminalize(error2) {
    const changed = await transition(this.env.RESULTS_DB, error2.submissionId, ["validated"], "dead_letter", { safeError: error2.safeError });
    if (!changed) {
      const current = await findBySubmissionId(this.env.RESULTS_DB, error2.submissionId);
      if (!current || current.state !== "dead_letter" || current.safe_error !== error2.safeError) throw new Error("writer_state_conflict");
    }
    await this.ctx.storage.delete(pendingKey(error2.submissionId));
  }
  async reconcile(value, commitSha) {
    const changed = await transition(this.env.RESULTS_DB, value.id, ["validated"], "staged", { safeError: null, githubPath: value.path, githubCommitSha: commitSha });
    if (changed) return;
    const current = await findBySubmissionId(this.env.RESULTS_DB, value.id);
    if (!current || current.state !== "staged" && current.state !== "published" || current.github_path !== value.path || !current.github_commit_sha || !SHA_RE.test(current.github_commit_sha)) throw new Error("writer_state_conflict");
  }
  async cleanupStaged(row) {
    if (row.state !== "staged" && row.state !== "published") throw new Error("writer_state_conflict");
    await this.env.RAW_RESULTS.delete(row.raw_r2_key);
    const retained = await findBySubmissionId(this.env.RESULTS_DB, row.submission_id);
    if (!retained || retained.state !== "staged" && retained.state !== "published") throw new Error("writer_state_conflict");
    await this.ctx.storage.delete(pendingKey(row.submission_id));
  }
  async flush(forceFutureAlarm = false) {
    const pending = await this.pending();
    if (!pending.length) return { staged: 0, retained: 0 };
    if (resolveIngestMode(this.env.INGEST_MODE) !== "normal") {
      await this.rearm(RETAIN_DELAY_MS, forceFutureAlarm);
      return { staged: 0, retained: pending.length };
    }
    const verified = [];
    let bytes = 0;
    try {
      for (const item of pending) {
        const current = await findBySubmissionId(this.env.RESULTS_DB, item.submissionId);
        if (current?.state === "staged" || current?.state === "published") {
          await this.cleanupStaged(current);
          continue;
        }
        let value;
        try {
          value = await parseVerified(this.env, item.submissionId);
        } catch (error2) {
          if (error2 instanceof TerminalIntegrityError) {
            await this.terminalize(error2);
            continue;
          }
          throw error2;
        }
        if (!value) {
          await this.ctx.storage.delete(pendingKey(item.submissionId));
          continue;
        }
        const size = new TextEncoder().encode(value.body).byteLength;
        if (size > MAX_BYTES2) {
          if (!await transition(this.env.RESULTS_DB, value.id, ["validated"], "rejected", { safeError: "publication_record_oversize" })) throw new Error("writer_state_conflict");
          await this.ctx.storage.delete(pendingKey(value.id));
          continue;
        }
        if (verified.length && bytes + size > MAX_BYTES2) break;
        verified.push(value);
        bytes += size;
      }
      if (!verified.length) {
        const retained2 = (await this.pending()).length;
        if (retained2) await this.rearm(RETAIN_DELAY_MS, forceFutureAlarm);
        return { staged: 0, retained: retained2 };
      }
      const repo = target(this.env);
      this.assertNormalMode();
      const token = await getInstallationToken(this.env, Date.now(), fetch, () => this.assertNormalMode());
      const committed = await this.commit(token, repo, verified);
      for (const error2 of committed.terminal) await this.terminalize(error2);
      for (const value of committed.staged) {
        await this.reconcile(value, committed.sha);
        const row = await findBySubmissionId(this.env.RESULTS_DB, value.id);
        if (!row) {
          await this.ctx.storage.delete(pendingKey(value.id));
          continue;
        }
        await this.cleanupStaged(row);
      }
      const retained = (await this.pending()).length;
      if (retained) await this.rearm(RETAIN_DELAY_MS, forceFutureAlarm);
      return { staged: committed.staged.length, retained };
    } catch {
      await this.rearm(RETAIN_DELAY_MS, forceFutureAlarm);
      throw new Error("github_writer_retryable");
    }
  }
  async preflight(token, repo, item) {
    const route = item.path.split("/").map(encodeURIComponent).join("/");
    const found = await this.guardedRequest(`/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repo)}/contents/${route}?ref=${repo.branchQuery}`, { token });
    if (found.status === 404) return "add";
    const content = found.body !== null && typeof found.body === "object" ? found.body.content : null;
    if (found.status !== 200 || typeof content !== "string") throw new Error("github_content_unavailable");
    let decoded;
    try {
      decoded = new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(atob(content.replace(/\s/g, "")), (c) => c.charCodeAt(0)));
    } catch {
      throw new Error("github_content_unavailable");
    }
    if (decoded !== item.body) throw new TerminalIntegrityError(item.id, "publication_path_conflict");
    return "same";
  }
  async commit(token, repo, items) {
    const terminal = [];
    for (let retry = 0; retry < 3; retry += 1) {
      const ref = await this.guardedRequest(`/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repo)}/git/ref/tags/${repo.branchRoute}`, { token });
      const head = referenceSha(ref.body);
      if (ref.status !== 200 || !head) throw new Error("github_ref_unavailable");
      const commit = await this.guardedRequest(`/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repo)}/git/commits/${head}`, { token });
      const baseTree = commit.body !== null && typeof commit.body === "object" ? sha2(commit.body.tree) : null;
      if (commit.status !== 200 || !baseTree) throw new Error("github_commit_unavailable");
      const additions = [], staged = [];
      for (const item of items) {
        if (terminal.some((entry) => entry.submissionId === item.id)) continue;
        try {
          if (await this.preflight(token, repo, item) === "add") additions.push(item);
          staged.push(item);
        } catch (error2) {
          if (error2 instanceof TerminalIntegrityError) terminal.push(error2);
          else throw error2;
        }
      }
      if (!staged.length || !additions.length) return { sha: head, staged, terminal };
      const tree = additions.map((item) => ({ path: item.path, mode: "100644", type: "blob", content: item.body }));
      const newTree = await this.guardedRequest(`/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repo)}/git/trees`, { method: "POST", token, body: { base_tree: baseTree, tree } });
      const treeSha = sha2(newTree.body);
      if (newTree.status < 200 || newTree.status >= 300 || !treeSha) {
        if (newTree.status === 409 || newTree.status === 422) continue;
        throw new Error("github_tree_failed");
      }
      const newCommit = await this.guardedRequest(`/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repo)}/git/commits`, { method: "POST", token, body: { message: `ingest: stage ${additions.length} CayleyPy results`, tree: treeSha, parents: [head] } });
      const commitSha = sha2(newCommit.body);
      if (newCommit.status < 200 || newCommit.status >= 300 || !commitSha) {
        if (newCommit.status === 409 || newCommit.status === 422) continue;
        throw new Error("github_commit_failed");
      }
      const update = await this.guardedRequest(`/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repo)}/git/refs/tags/${repo.branchRoute}`, { method: "PATCH", token, body: { sha: commitSha, force: false } });
      if (update.status >= 200 && update.status < 300) return { sha: commitSha, staged, terminal };
      if (update.status !== 409 && update.status !== 422) throw new Error("github_ref_failed");
    }
    throw new Error("github_ref_conflict");
  }
};

// src/worker.ts
var INGRESS_OBJECT_NAME = "ingest-validation-v1";
async function handlePostResults(request, env, _version) {
  if (resolveIngestMode(env.INGEST_MODE) === "reject") return errorResponse(503, "ingest_disabled");
  const type = mediaType(request);
  if (type !== "application/json" && type !== "application/gzip") return errorResponse(415, "unsupported_media_type");
  try {
    const length = declaredBodyLength(request);
    if (length !== null && length > (type === "application/gzip" ? MAX_ARCHIVE_REQUEST_BYTES : MAX_REQUEST_BYTES)) return errorResponse(413, "request_too_large");
  } catch (error2) {
    return error2 instanceof SafeHttpError ? errorResponse(error2.status, error2.code) : errorResponse(400, "invalid_content_length");
  }
  try {
    if (!await allowIpRequest(request, env)) return rateLimited();
  } catch {
    return errorResponse(503, "rate_limit_unavailable");
  }
  try {
    const stub = env.GITHUB_WRITER?.getByName(INGRESS_OBJECT_NAME);
    if (!stub?.fetch) return errorResponse(503, "ingest_unavailable");
    return await forwardIngest(request, (input) => stub.fetch(input));
  } catch {
    return errorResponse(503, "ingest_unavailable", { "Retry-After": "60" });
  }
}
__name(handlePostResults, "handlePostResults");
function statusRateScope(ip) {
  let hash = 2166136261;
  for (let index = 0; index < ip.length; index += 1) {
    hash ^= ip.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return "status-bucket:" + (hash >>> 0) % STATUS_RATE_BUCKET_COUNT;
}
__name(statusRateScope, "statusRateScope");
async function allowStatusRequest(request, env) {
  const ip = request.headers.get("CF-Connecting-IP")?.trim() || "unknown";
  return consumeD1Limit(env.RESULTS_DB, statusRateScope(ip), 1, PER_IP_STATUS_REQUESTS_PER_MINUTE);
}
__name(allowStatusRequest, "allowStatusRequest");
async function handleStatus(request, submissionId, env) {
  try {
    if (!await allowStatusRequest(request, env)) return rateLimited();
  } catch {
    return errorResponse(503, "rate_limit_unavailable");
  }
  let row;
  try {
    row = await findBySubmissionId(env.RESULTS_DB, submissionId);
  } catch {
    return errorResponse(503, "status_unavailable");
  }
  if (row === null) return errorResponse(404, "not_found");
  return jsonResponse({
    submission_id: row.submission_id,
    idempotency_key: row.idempotency_key,
    state: row.state,
    safe_error: row.safe_error,
    retry_count: row.retry_count,
    updated_at: row.updated_at
  });
}
__name(handleStatus, "handleStatus");
function health(env) {
  return jsonResponse({
    status: "ok",
    ingest_mode: resolveIngestMode(env.INGEST_MODE),
    limits: {
      max_request_bytes: MAX_REQUEST_BYTES,
      max_archive_request_bytes: MAX_ARCHIVE_REQUEST_BYTES,
      max_decompressed_archive_bytes: MAX_DECOMPRESSED_ARCHIVE_BYTES,
      max_results_per_request: MAX_RESULTS_PER_REQUEST,
      per_ip_requests_per_minute: PER_IP_REQUESTS_PER_MINUTE,
      global_envelopes_per_minute: GLOBAL_ENVELOPES_PER_MINUTE
    },
    recovery: { stale_ms: RECOVERY_STALE_MS, limit: RECOVERY_LIMIT }
  });
}
__name(health, "health");
async function fetchRequest(request, env, _ctx) {
  const pathname = new URL(request.url).pathname;
  if (pathname === "/v1/contexts" || pathname === "/v1/solutions" || /^\/v1\/solutions\/[0-9a-f]{64}$/.test(pathname)) {
    if (!env.EXTERNAL_SOLUTIONS_DB) return errorResponse(503, "external_solutions_unavailable");
    return worker_default.fetch(request, {
      DB: env.EXTERNAL_SOLUTIONS_DB,
      UPLOAD_TOKEN: env.EXTERNAL_SOLUTIONS_UPLOAD_TOKEN
    });
  }
  if (pathname === "/v1/results") {
    if (request.method !== "POST") return methodNotAllowed("POST");
    return handlePostResults(request, env, 1);
  }
  if (pathname === "/v2/results") {
    if (request.method !== "POST") return methodNotAllowed("POST");
    return handlePostResults(request, env, 2);
  }
  if (pathname === "/healthz") {
    if (request.method !== "GET") return methodNotAllowed("GET");
    return health(env);
  }
  const statusMatch = /^\/v1\/submissions\/([^/]+)$/.exec(pathname);
  if (statusMatch !== null) {
    if (request.method !== "GET") return methodNotAllowed("GET");
    let submissionId;
    try {
      submissionId = decodeURIComponent(statusMatch[1]);
    } catch {
      return errorResponse(400, "invalid_submission_id");
    }
    return handleStatus(request, submissionId, env);
  }
  return errorResponse(404, "not_found");
}
__name(fetchRequest, "fetchRequest");
async function scheduled(controller, env, _ctx) {
  if (resolveIngestMode(env.INGEST_MODE) !== "normal") return;
  const target2 = env.GITHUB_WRITER?.getByName("cayleypy-results-v1");
  if (!target2?.maintain) throw new Error("maintenance_unavailable");
  await target2.maintain(controller.scheduledTime);
}
__name(scheduled, "scheduled");
async function queue(batch, env, _ctx) {
  const mode = resolveIngestMode(env.INGEST_MODE);
  for (const message2 of batch.messages) {
    await consumeValidationMessage(message2, env, mode);
  }
}
__name(queue, "queue");
var worker_default2 = { fetch: fetchRequest, scheduled, queue };
export {
  BODY_READ_TIMEOUT_MS,
  GLOBAL_ENVELOPES_PER_MINUTE,
  GitHubWriter,
  INGRESS_OBJECT_NAME,
  MAX_ARCHIVE_REQUEST_BYTES,
  MAX_DECOMPRESSED_ARCHIVE_BYTES,
  MAX_REQUEST_BYTES,
  MAX_RESULTS_PER_REQUEST,
  PER_IP_REQUESTS_PER_MINUTE,
  PER_IP_STATUS_REQUESTS_PER_MINUTE,
  RECOVERY_LIMIT,
  RECOVERY_STALE_MS,
  STATUS_RATE_BUCKET_COUNT,
  SafeHttpError,
  allowIpRequest,
  consumeD1Limit,
  declaredBodyLength,
  worker_default2 as default,
  errorResponse,
  fetchRequest,
  handleIngestBody,
  jsonResponse,
  mediaType,
  methodNotAllowed,
  queue,
  rateLimited,
  resolveIngestMode,
  scheduled,
  statusRateScope
};
//# sourceMappingURL=worker.js.map
