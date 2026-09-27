(() => {
  var e = {
      5050: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "plugin", {
            enumerable: !0,
            get: function () {
              return i.plugin;
            },
          }));
        let i = n(4574);
      },
      2605: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "build", {
            enumerable: !0,
            get: function () {
              return g;
            },
          }));
        let i = n(7066),
          r = n(7517),
          a = n(8044);
        function o(e, t) {
          return null != t && "string" == typeof e && e.startsWith("var(")
            ? ((0, i.resolveToString)(e, t) ?? e)
            : e;
        }
        let l = new Set(["opacity", "autoAlpha"]),
          s = new Set([
            "scale",
            "scaleX",
            "scaleY",
            "z",
            "transformPerspective",
          ]),
          u = new Set(["xPercent", "yPercent"]),
          c = new Set(["width", "height"]);
        function d(e) {
          return (
            e.startsWith("+=") || e.startsWith("-=") || e.startsWith("random(")
          );
        }
        function f(e) {
          return (
            (0, a.isRandomValue)(e) ||
            (0, a.isAdditiveValue)(e) ||
            (0, a.isRandomArrayValue)(e)
          );
        }
        function p(e, t) {
          let n = l.has(e) ? 100 : 1,
            i = 1 !== n || u.has(e),
            r = (e) => ({
              type: "ix3-random",
              min: e.min / n,
              max: e.max / n,
              step: null != e.step ? e.step / n : void 0,
            });
          if ((0, a.isRandomArrayValue)(t)) {
            let e = i
              ? {
                  type: "ix3-random-array",
                  values: t.values.map((e) =>
                    "number" == typeof e ? e / n : e,
                  ),
                }
              : t;
            return (0, a.formatRandomArray)(e);
          }
          if ((0, a.isRandomValue)(t)) return (0, a.formatRandom)(i ? r(t) : t);
          if (i) {
            let e = (0, a.isRandomValue)(t.value) ? r(t.value) : t.value / n;
            return (0, a.applyAdditive)({ type: "ix3-additive", value: e });
          }
          return (0, a.applyAdditive)(t);
        }
        function g(e) {
          ((0, r.buildMouseFollowAction)(e),
            e
              .addAction("class", {
                createCustomTween: (e, t, n, i, r, a) => {
                  let o = n.class,
                    l = o?.selectors || [],
                    s = o?.operation,
                    u = l
                      ? r.map((e) => ({
                          element: e,
                          classList: [...e.classList],
                        }))
                      : [],
                    c = () => {
                      if (s && l)
                        for (let e of r)
                          "addClass" === s
                            ? l.forEach((t) => e.classList.add(t))
                            : "removeClass" === s
                              ? l.forEach((t) => e.classList.remove(t))
                              : "toggleClass" === s &&
                                l.forEach((t) => e.classList.toggle(t));
                    };
                  return (
                    e.to(
                      {},
                      { duration: 0.001, onComplete: c, onReverseComplete: c },
                      a && 0 !== a ? a : 0.001,
                    ),
                    () => {
                      if (l) {
                        for (let e of u)
                          if (
                            e.element &&
                            (e.element instanceof HTMLElement &&
                              (e.element.className = ""),
                            e.element.classList)
                          )
                            for (let t of e.classList)
                              e.element.classList.add(t);
                      }
                    }
                  );
                },
              })
              .addAction("style", {
                createTweenConfig: (e, t) => {
                  let n = { to: {}, from: {} },
                    i = t?.[0];
                  for (let t in e) {
                    let r = e[t],
                      l = Array.isArray(r) ? r[1] : r,
                      s = Array.isArray(r) ? r[0] : void 0,
                      u = f(l) ? p(t, l) : o(l, i),
                      d = f(s) ? p(t, s) : void 0 !== s ? o(s, i) : void 0;
                    (null != u && (n.to[t] = u),
                      null == d || (0, a.isAdditiveValue)(l) || (n.from[t] = d),
                      c.has(t) &&
                        (f(l) || f(s)) &&
                        (n.modifiers || (n.modifiers = {}),
                        (n.modifiers[t] = (0, a.makeClamp)(
                          0,
                          Number.MAX_VALUE,
                        ))));
                  }
                  return n;
                },
              })
              .addAction("transform", {
                createTweenConfig: (e, t) => {
                  let n = { to: {}, from: {} },
                    r = t?.[0];
                  for (let t in e) {
                    let o = e[t],
                      u = Array.isArray(o) ? o[1] : o,
                      f = Array.isArray(o) ? o[0] : void 0,
                      g = (0, a.isAdditiveValue)(u),
                      h =
                        (0, a.isRandomValue)(u) ||
                        (0, a.isRandomArrayValue)(u) ||
                        g,
                      m =
                        (0, a.isRandomValue)(f) ||
                        (0, a.isRandomArrayValue)(f) ||
                        (0, a.isAdditiveValue)(f);
                    if (h || m) {
                      let e = l.has(t)
                        ? (0, a.makeClamp)(0, 1)
                        : s.has(t) || c.has(t)
                          ? (0, a.makeClamp)(0, Number.MAX_VALUE)
                          : void 0;
                      (e &&
                        (n.modifiers || (n.modifiers = {}),
                        (n.modifiers[t] = e),
                        "autoAlpha" === t && (n.modifiers.opacity = e),
                        "scale" === t &&
                          ((n.modifiers.scaleX = e), (n.modifiers.scaleY = e))),
                        h && (u = p(t, u)),
                        m && (f = p(t, f)));
                    }
                    switch (t) {
                      case "autoAlpha":
                      case "opacity":
                        if (null != u && "string" == typeof u && !d(u)) {
                          let e = r
                            ? (0, i.resolveToNumber)(u, r)
                            : parseFloat(u);
                          u = void 0 !== e ? e / 100 : u;
                        }
                        if (null != f && "string" == typeof f && !d(f)) {
                          let e = r
                            ? (0, i.resolveToNumber)(f, r)
                            : parseFloat(f);
                          f = void 0 !== e ? e / 100 : f;
                        }
                        break;
                      case "transformOrigin":
                        "string" == typeof o
                          ? (f = u = u || o)
                          : "string" == typeof f
                            ? (u = f)
                            : "string" == typeof u && (f = u);
                        break;
                      case "xPercent":
                      case "yPercent":
                        if (null != u && "string" == typeof u && !d(u)) {
                          let e = r
                            ? (0, i.resolveToNumber)(u, r)
                            : parseFloat(u);
                          u = void 0 !== e ? e : u;
                        }
                        if (null != f && "string" == typeof f && !d(f)) {
                          let e = r
                            ? (0, i.resolveToNumber)(f, r)
                            : parseFloat(f);
                          f = void 0 !== e ? e : f;
                        }
                    }
                    (null != u && (n.to[t] = u),
                      null == f || g || (n.from[t] = f));
                  }
                  return n;
                },
              }));
        }
      },
      8281: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "buildLottieAction", {
            enumerable: !0,
            get: function () {
              return r;
            },
          }));
        let i = n(7066);
        function r(e) {
          e.addAction("lottie", {
            createCustomTween: (e, t, n, i, r, l) => {
              let s = n.lottie;
              if (!s || !r.length || !window.Webflow) return;
              let u = window.Webflow.require?.("lottie");
              if (!u) return;
              let c = [],
                d = !1;
              for (let t of r) {
                let n = o(s.from, t, a.FROM),
                  r = o(s.to, t, a.TO),
                  f = u.createInstance(t);
                if (!f) continue;
                c.push(f);
                let p = () => {
                  if (d) return;
                  let t = f.frames,
                    a = Math.round(n * t),
                    o = Math.round(r * t);
                  null === f.gsapFrame && (f.gsapFrame = a);
                  let s = i;
                  (s.ease || (s = { ...s, ease: "none" }),
                    e.fromTo(
                      f,
                      { gsapFrame: a },
                      { gsapFrame: o, ...s },
                      l || 0,
                    ));
                };
                f.isLoaded ? p() : f.onDataReady(p);
              }
              return () => {
                for (let e of ((d = !0), c))
                  (e.goToFrameAndStop(0), (e.gsapFrame = null));
              };
            },
          });
        }
        let a = { FROM: 0, TO: 1 };
        function o(e, t, n) {
          if ("number" == typeof e) return e;
          let r = (0, i.resolveToNumber)(e, t);
          return void 0 !== r ? r / 100 : n;
        }
      },
      7517: function (e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var i = {
          buildMouseFollowAction: function () {
            return p;
          },
          forTestSuite: function () {
            return f;
          },
        };
        for (var r in i)
          Object.defineProperty(t, r, { enumerable: !0, get: i[r] });
        let a = n(2908),
          o = n(6969);
        function l(e, t, n) {
          if (e <= 1) return [0];
          if ("number" == typeof t) {
            let n = Math.max(0, Math.min(e - 1, Math.floor(t))),
              i = [n];
            for (let t = 1; i.length < e; t++)
              (n + t < e && i.push(n + t), n - t >= 0 && i.push(n - t));
            return i;
          }
          switch (t) {
            case "start":
              return Array.from({ length: e }, (e, t) => t);
            case "center": {
              let t = [],
                n = Math.floor((e - 1) / 2);
              t.push(n);
              for (let i = 1; t.length < e; i++)
                (n + i < e && t.push(n + i), n - i >= 0 && t.push(n - i));
              return t;
            }
            case "random": {
              let t,
                i =
                  null != n && "" !== n
                    ? ((t =
                        (function (e) {
                          let t = 0x811c9dc5;
                          for (let n = 0; n < e.length; n++)
                            ((t ^= e.charCodeAt(n)),
                              (t = Math.imul(t, 0x1000193)));
                          return t >>> 0;
                        })(n) >>> 0),
                      () => {
                        let e = Math.imul(
                          (t = (t + 0x6d2b79f5) | 0) ^ (t >>> 15),
                          1 | t,
                        );
                        return (
                          (((e ^= e + Math.imul(e ^ (e >>> 7), 61 | e)) ^
                            (e >>> 14)) >>>
                            0) /
                          0x100000000
                        );
                      })
                    : Math.random,
                r = Array.from({ length: e }, (e, t) => t);
              for (let t = e - 1; t > 0; t--) {
                let e = Math.floor(i() * (t + 1));
                [r[t], r[e]] = [r[e], r[t]];
              }
              return r;
            }
            case "edges": {
              let t = [],
                n = 0,
                i = e - 1;
              for (; n <= i; ) (t.push(n), n !== i && t.push(i), n++, i--);
              return t;
            }
            default:
              return Array.from({ length: e }, (t, n) => e - 1 - n);
          }
        }
        function s(e) {
          if (null == e) return 50;
          let t = "number" == typeof e ? 1e3 * e : parseFloat(e);
          return Number.isFinite(t) && t >= 0 ? t : 50;
        }
        let u = (e) => {
            if ("string" != typeof e) return 0.5;
            let t = /^(-?\d+(?:\.\d+)?)%$/.exec(e.trim());
            if (t) return Math.max(0, Math.min(1, parseFloat(t[1]) / 100));
            let n = e.trim().toLowerCase();
            return "left" === n || "top" === n
              ? 0
              : "right" === n || "bottom" === n
                ? 1
                : 0.5;
          },
          c = (e, t) => {
            if (e?.amount != null) {
              let n = s(e.amount);
              return Math.max(1, t > 1 ? n / (t - 1) : 50);
            }
            return e?.each != null ? Math.max(1, s(e.each)) : 1;
          },
          d = (e) => {
            if (!e) return { x: 0.5, y: 0.5 };
            if ("string" == typeof e) {
              let [t, n] = e.trim().split(/\s+/);
              return { x: u(t ?? "50%"), y: u(n ?? "50%") };
            }
            return { x: u(e.x), y: u(e.y) };
          },
          f = {
            DEFAULT_STAGGER_MS: 50,
            computeMouseFollowSmoothingMs: c,
            getChainOrder: l,
            parseAnchor: d,
            parseAnchorAxis: u,
            staggerEachToMs: s,
          };
        function p(e) {
          e.addAction("mouse-follow", {
            requiresTriggerElementContext: !0,
            createCustomTween: (e, t, n, i, r, s, u) =>
              (function (e, t, n, i) {
                if (!n.length) return;
                let r = i?.animation;
                if (!r?.hasGsap()) return;
                let s =
                    "undefined" != typeof window &&
                    "function" == typeof window.matchMedia &&
                    window.matchMedia("(prefers-reduced-motion: reduce)")
                      .matches,
                  u = t?.leaveBehavior ?? "return",
                  f = t?.onEnter ?? "animate",
                  p = i?.timelineRole,
                  g =
                    "mouseX" === p
                      ? "x"
                      : "mouseY" === p
                        ? "y"
                        : (t?.axis ?? "x"),
                  h = t?.followMode;
                if (
                  null != h &&
                  "full" !== h &&
                  h !== (0, a.getSingleAxisMouseFollowMode)(g)
                )
                  return;
                let m = d(t?.anchor),
                  y = "x" === g ? m.x : m.y,
                  v = n.map((e) => r.getProperty(e, g)),
                  T = n.map((e) => r.quickSetter(e, g, "px"));
                if (T.some((e) => null == e)) return;
                let b = (0, o.initScrollCache)(),
                  E = n.map((e) => {
                    let t = e.getBoundingClientRect();
                    return "x" === g
                      ? t.left + t.width * y
                      : t.top + t.height * y + (0, o.getScrollY)();
                  }),
                  I = e.timing?.stagger,
                  S = n.length,
                  O = c(I, S),
                  w = I?.from,
                  A = l(
                    S,
                    "number" == typeof w ||
                      "start" === w ||
                      "center" === w ||
                      "edges" === w ||
                      "end" === w ||
                      "random" === w
                      ? w
                      : "end",
                    t?.groupId ?? t?.syncedActionId,
                  );
                if (0 === A.length) return;
                let R = new Float64Array(S),
                  C = A[0],
                  M = { value: E[C] ?? 0 },
                  _ = null,
                  N = !1,
                  P = 0,
                  x = null,
                  L = !1,
                  k = null,
                  F = performance.now(),
                  U = 0,
                  V = () => {
                    let e = performance.now(),
                      t = Math.min(e - F, 100);
                    F = e;
                    let n = 1 - Math.exp(-t / O),
                      i = !1;
                    for (let e = 0; e < A.length; e++) {
                      let t,
                        r = A[e];
                      if (0 === e) t = M.value;
                      else {
                        let n = A[e - 1];
                        t = E[n] + R[n];
                      }
                      let a = t - E[r],
                        o = a - R[r];
                      Math.abs(o) > 0.5
                        ? ((R[r] = R[r] + o * n), T[r](R[r]), (i = !0))
                        : 0 !== o && ((R[r] = a), T[r](R[r]));
                    }
                    (_?.isActive() && (i = !0), i || D());
                  },
                  D = () => {
                    L && (k?.(), (k = null), (L = !1));
                  },
                  G = (e) => {
                    (_?.kill(), (_ = null), (U = 0), (M.value = e));
                    for (let t = 0; t < A.length; t++) {
                      let n = A[t],
                        i = e - E[n];
                      ((R[n] = i), T[n](i));
                    }
                    D();
                  },
                  j = () => {
                    (_?.kill(), (_ = null), (U = 0), (M.value = E[C] ?? 0));
                    for (let e = 0; e < A.length; e++) {
                      let t = A[e];
                      ((R[t] = 0), T[t](0));
                    }
                    D();
                  },
                  B = () => {
                    L ||
                      ((F = performance.now()), (k = r.addTicker(V)), (L = !0));
                  },
                  X = (e, t) => {
                    ((x = e),
                      (P = t
                        ? "x" === g
                          ? window.innerWidth
                          : window.innerHeight
                        : "x" === g
                          ? e.offsetWidth
                          : e.offsetHeight));
                  },
                  z = i?.subscribeChannel?.(
                    a.MOUSE_MOVE_CHANNELS.POSITION,
                    (e) => {
                      x || X(e.triggerEl, e.isViewport);
                      let t = "x" === g ? e.x : e.y + (0, o.getScrollY)();
                      if (s) {
                        ((N = !0), G(t));
                        return;
                      }
                      if (N)
                        if (_) {
                          let e = Math.max(U - performance.now(), 50);
                          _.kill();
                          let n = r.to(M, {
                            value: t,
                            duration: e / 1e3,
                            ease: "power2.out",
                            onUpdate: B,
                            onComplete: () => {
                              _ === n && ((_ = null), (U = 0));
                            },
                          });
                          if (!n) {
                            ((M.value = t), B());
                            return;
                          }
                          _ = n;
                        } else M.value = t;
                      else {
                        if (((N = !0), "snap" === f)) return void G(t);
                        let e =
                          0.1 +
                          0.5 * Math.min(Math.abs(t - M.value) / (P || 1), 1);
                        ((U = performance.now() + 1e3 * e), _?.kill());
                        let n = r.to(M, {
                          value: t,
                          duration: e,
                          ease: "power2.out",
                          onUpdate: B,
                          onComplete: () => {
                            _ === n && ((_ = null), (U = 0));
                          },
                        });
                        if (!n) {
                          ((M.value = t), B());
                          return;
                        }
                        _ = n;
                      }
                      B();
                    },
                  ),
                  H = i?.subscribeChannel?.(a.MOUSE_MOVE_CHANNELS.LEAVE, () => {
                    if (((N = !1), "stay" === u)) return void B();
                    if (s) return void j();
                    let e = E[C] ?? 0,
                      t = Math.min(Math.abs(M.value - e) / (P || 1), 1);
                    _?.kill();
                    let n = r.to(M, {
                      value: e,
                      duration: 0.1 + 0.5 * t,
                      ease: "power2.out",
                      onUpdate: B,
                      onComplete: () => {
                        _ === n && (_ = null);
                      },
                    });
                    if (!n) {
                      ((M.value = e), B());
                      return;
                    }
                    _ = n;
                  }),
                  Y = new AbortController(),
                  { signal: $ } = Y,
                  W = 0;
                return (
                  window.addEventListener(
                    "resize",
                    () => {
                      (clearTimeout(W),
                        (W = window.setTimeout(() => {
                          x && (P = "x" === g ? x.offsetWidth : x.offsetHeight);
                          for (let e = 0; e < n.length; e++) {
                            let t = n[e],
                              i = r.getProperty(t, g),
                              a =
                                "number" == typeof i
                                  ? i
                                  : parseFloat(String(i)),
                              l = Number.isFinite(a) ? a : 0,
                              s = t.getBoundingClientRect(),
                              u =
                                "x" === g
                                  ? s.left + s.width * y
                                  : s.top + s.height * y;
                            ((E[e] =
                              "x" === g ? u - l : u - l + (0, o.getScrollY)()),
                              (R[e] = l));
                          }
                          if (!N) {
                            let e = E[C];
                            void 0 !== e &&
                              (_?.isActive() && (_.kill(), (_ = null)),
                              (M.value = e));
                          }
                        }, 250)));
                    },
                    { signal: $ },
                  ),
                  () => {
                    (_?.kill(),
                      D(),
                      clearTimeout(W),
                      Y.abort(),
                      z?.(),
                      H?.(),
                      b());
                    for (let e = 0; e < n.length; e++)
                      r.set(n[e], { [g]: v[e] });
                  }
                );
              })(t, n, r, u),
          });
        }
      },
      8044: function (e, t) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var n = {
          applyAdditive: function () {
            return u;
          },
          formatRandom: function () {
            return l;
          },
          formatRandomArray: function () {
            return s;
          },
          isAdditiveValue: function () {
            return a;
          },
          isRandomArrayValue: function () {
            return o;
          },
          isRandomValue: function () {
            return r;
          },
          makeClamp: function () {
            return c;
          },
        };
        for (var i in n)
          Object.defineProperty(t, i, { enumerable: !0, get: n[i] });
        function r(e) {
          return (
            "object" == typeof e &&
            null !== e &&
            "ix3-random" === e.type &&
            "number" == typeof e.min &&
            "number" == typeof e.max &&
            (void 0 === e.step || "number" == typeof e.step) &&
            (void 0 === e.unit || "string" == typeof e.unit)
          );
        }
        function a(e) {
          return (
            "object" == typeof e &&
            null !== e &&
            "ix3-additive" === e.type &&
            ("number" == typeof e.value || r(e.value)) &&
            (void 0 === e.unit || "string" == typeof e.unit)
          );
        }
        function o(e) {
          return (
            "object" == typeof e &&
            null !== e &&
            "ix3-random-array" === e.type &&
            Array.isArray(e.values) &&
            e.values.every(
              (e) => "number" == typeof e || "string" == typeof e,
            ) &&
            (void 0 === e.unit || "string" == typeof e.unit)
          );
        }
        function l(e, t) {
          let n = e.unit ?? t ?? "",
            i = null != e.step ? `, ${e.step}` : "";
          return `random(${e.min}, ${e.max}${i})${n}`;
        }
        function s(e, t) {
          let n = e.unit ?? t ?? "";
          return `random([${e.values.join(", ")}])${n}`;
        }
        function u(e, t) {
          let n = e.unit ?? t ?? "";
          return r(e.value) ? `+=${l(e.value, n)}` : `+=${e.value}${n}`;
        }
        function c(e, t) {
          let n = (n) => (n < e ? e : n > t ? t : n);
          return (e) => {
            if ("number" == typeof e) return n(e);
            let t = parseFloat(e);
            if (Number.isNaN(t)) return e;
            let i = n(t);
            return i === t
              ? e
              : `${i}${e.replace(/^\s*[+-]?[\d.]+(?:e[+-]?\d+)?/i, "")}`;
          };
        }
      },
      7066: function (e, t) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var n = {
          resolveToNumber: function () {
            return r;
          },
          resolveToString: function () {
            return a;
          },
        };
        for (var i in n)
          Object.defineProperty(t, i, { enumerable: !0, get: n[i] });
        function r(e, t) {
          if ("number" == typeof e) return e;
          if ("string" == typeof e) {
            let n = e;
            if (n.startsWith("var(")) {
              let e = n.slice(4, -1).split(",")[0]?.trim() ?? "";
              if (!e || !(n = getComputedStyle(t).getPropertyValue(e).trim()))
                return;
            }
            let i = parseFloat(n);
            return isNaN(i) ? void 0 : i;
          }
        }
        function a(e, t) {
          if ("string" == typeof e) {
            if (e.startsWith("var(")) {
              let n = e.slice(4, -1).split(",")[0]?.trim() ?? "";
              if (!n) return;
              return getComputedStyle(t).getPropertyValue(n).trim() || void 0;
            }
            return e;
          }
        }
      },
      6266: function (e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var i = {
          interpolateAARRGGBB: function () {
            return s;
          },
          setupAnimateTimeline: function () {
            return u;
          },
        };
        for (var r in i)
          Object.defineProperty(t, r, { enumerable: !0, get: i[r] });
        let a = n(3044),
          o = n(495),
          l = n(7066);
        function s(e, t, n) {
          let i = (e >>> 24) & 255,
            r = (e >>> 16) & 255,
            a = (e >>> 8) & 255,
            o = 255 & e;
          return (
            ((Math.round(i + (((t >>> 24) & 255) - i) * n) << 24) |
              (Math.round(r + (((t >>> 16) & 255) - r) * n) << 16) |
              (Math.round(a + (((t >>> 8) & 255) - a) * n) << 8) |
              Math.round(o + ((255 & t) - o) * n)) >>>
            0
          );
        }
        function u(e, t, n, i, r, u) {
          if (0 === n.length) return;
          let c = t.riveInstance.viewModelInstance;
          if (c)
            for (let d of n) {
              let n;
              if (
                null === d.value ||
                void 0 === d.value ||
                !(0, a.getVmiProperty)(c, d.propertyType, d.propertyName)
              )
                continue;
              let f = d.value;
              if ("string" == typeof f && f.startsWith("var(")) {
                if (
                  ("number" === d.propertyType
                    ? (n = (0, l.resolveToNumber)(f, u))
                    : "color" === d.propertyType &&
                      (n = (0, l.resolveToString)(f, u)),
                  void 0 === n)
                )
                  continue;
              } else n = f;
              "number" === d.propertyType
                ? (function (e, t, n, i, r, a) {
                    let o = e.riveInstance.viewModelInstance;
                    if (!o) return;
                    let l = o.number(n);
                    if (!l) return;
                    let s = "number" == typeof i ? i : parseFloat(String(i));
                    if (isNaN(s)) return;
                    let u = { v: l.value };
                    t.to(
                      u,
                      {
                        ...r,
                        v: s,
                        onStart() {
                          let t = e.currentValues[`number:${n}`];
                          ((u.v = "number" == typeof t ? t : l.value),
                            this.invalidate());
                        },
                        onUpdate: () => {
                          l.value = u.v;
                        },
                      },
                      a ?? 0,
                    );
                  })(t, e, d.propertyName, n, i, r)
                : "color" === d.propertyType &&
                  (function (e, t, n, i, r, a) {
                    let l = e.riveInstance.viewModelInstance;
                    if (!l) return;
                    let u = l.color(n);
                    if (!u) return;
                    let c =
                      "number" == typeof i
                        ? i
                        : (0, o.parseColorToAARRGGBB)(String(i));
                    if (null == c) return;
                    let d = { fromPacked: u.value },
                      f = { t: 0 };
                    t.fromTo(
                      f,
                      { t: 0 },
                      {
                        ...r,
                        t: 1,
                        onStart() {
                          let t = e.currentValues[`color:${n}`];
                          ((d.fromPacked = "number" == typeof t ? t : u.value),
                            this.invalidate());
                        },
                        onUpdate: () => {
                          u.value = s(d.fromPacked, c, f.t);
                        },
                      },
                      a ?? 0,
                    );
                  })(t, e, d.propertyName, n, i, r);
            }
        }
      },
      1248: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "setVmiValue", {
            enumerable: !0,
            get: function () {
              return o;
            },
          }));
        let i = n(9029),
          r = n(3044),
          a = n(495);
        function o(e, t, n, o, l, s) {
          let u = e.riveInstance.viewModelInstance;
          if ("trigger" === t) {
            if (s) return;
            let e = u?.trigger?.(n);
            e?.fire?.();
            return;
          }
          if (!u) return;
          let c = (0, r.getVmiProperty)(u, t, n);
          if (!c) return;
          let d = l?.viewModelProperties[(0, i.vmKey)(e.name, n, t)],
            f = s && null != d ? d : o,
            p = `${t}:${n}`;
          switch (t) {
            case "number":
              "number" == typeof f && ((c.value = f), (e.currentValues[p] = f));
              return;
            case "boolean":
              "boolean" == typeof f &&
                ((c.value = f), (e.currentValues[p] = f));
              return;
            case "string":
            case "enum":
              "string" == typeof f && ((c.value = f), (e.currentValues[p] = f));
              return;
            case "color": {
              let t =
                "number" == typeof f
                  ? f
                  : "string" == typeof f
                    ? (0, a.parseColorToAARRGGBB)(f)
                    : null;
              null != t && ((c.value = t), (e.currentValues[p] = t));
              return;
            }
            default:
              return;
          }
        }
      },
      8052: function (e, t) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "RIVE_CONSTANTS", {
            enumerable: !0,
            get: function () {
              return n;
            },
          }));
        let n = { MINIMUM_TIME: 0.001, MAX_BYTE_VALUE: 255 };
      },
      797: function (e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var i = {
          resolveSurfaceArea: function () {
            return p;
          },
          setupAnimateAnimation: function () {
            return m;
          },
          setupAnimation: function () {
            return h;
          },
          setupTimeline: function () {
            return g;
          },
        };
        for (var r in i)
          Object.defineProperty(t, r, { enumerable: !0, get: i[r] });
        let a = n(8052),
          o = n(148),
          l = n(3044),
          s = n(7469),
          u = n(1248),
          c = n(6266),
          d = n(9029),
          f = n(7066);
        function p(e, t) {
          if (!t) return null;
          let n = `${t.name}:${t.instanceName ?? ""}`,
            i = o.surfaceCache.get(e)?.get(n);
          if (i) return i;
          let r = e.viewModelByName?.(t.name) ?? void 0,
            a = r?.instanceByName?.(t.instanceName ?? "") ?? null;
          e.bindViewModelInstance?.(a);
          let l = { name: t.name, riveInstance: e, currentValues: {} },
            s = o.surfaceCache.get(e);
          return (
            s || ((s = new Map()), o.surfaceCache.set(e, s)),
            s.set(n, l),
            l
          );
        }
        function g(e, t, n, i, r, o) {
          if (0 === n.length) return;
          for (let e of n) {
            let n;
            if (
              "trigger" === e.propertyType ||
              "artboard" === e.propertyType ||
              null === e.value ||
              void 0 === e.value
            )
              continue;
            let i = e.value;
            void 0 !==
              (n =
                "string" == typeof i && i.startsWith("var(")
                  ? "number" === e.propertyType
                    ? (0, f.resolveToNumber)(i, o)
                    : "color" === e.propertyType
                      ? (0, f.resolveToString)(i, o)
                      : void 0
                  : i) &&
              (t.currentValues[`${e.propertyType}:${e.propertyName}`] = n);
          }
          let l = (e) => {
            for (let r of n) {
              let n;
              if (
                ("trigger" !== r.propertyType && null === r.value) ||
                void 0 === r.value
              )
                continue;
              let a = r.value;
              if ("string" == typeof a && a.startsWith("var(")) {
                if (
                  ("number" === r.propertyType
                    ? (n = (0, f.resolveToNumber)(a, o))
                    : "color" === r.propertyType &&
                      (n = (0, f.resolveToString)(a, o)),
                  void 0 === n)
                )
                  continue;
              } else n = a;
              !(function (e, t, n, i, r, a) {
                if ("artboard" === n) {
                  if ("string" != typeof i) return;
                  let o = e.riveInstance.viewModelInstance?.artboard?.(t);
                  if (!o) return;
                  if (a) {
                    let i = (0, d.vmKey)(e.name, t, n),
                      a = r?.viewModelProperties[i];
                    if ("string" == typeof a) {
                      let t = e.riveInstance.getArtboard?.(a);
                      t && (o.value = t);
                    }
                    return;
                  }
                  let l = e.riveInstance.getArtboard?.(i);
                  if (!l) return;
                  o.value = l;
                  return;
                }
                (0, u.setVmiValue)(e, n, t, i, r, a);
              })(t, r.propertyName, r.propertyType, n, i, e);
            }
          };
          e.to(
            { int: 0 },
            {
              int: 1,
              duration: a.RIVE_CONSTANTS.MINIMUM_TIME,
              onStart: () => {
                l(!1);
              },
              onReverseComplete: () => {
                l(!0);
              },
            },
            r ?? a.RIVE_CONSTANTS.MINIMUM_TIME,
          );
        }
        function h(e, t, n, i, r) {
          let a = t.animationSource,
            o = p(e, a);
          if (!o) return;
          let u = Object.values(t.addedProperties ?? {}),
            c = (0, l.storeOriginalValues)(u, o);
          return (g(n, o, u, c, i, r), (0, s.createCleanupFunction)(e, a, c));
        }
        function m(e, t, n, i, r, a) {
          let o = t.animationSource,
            u = p(e, o);
          if (!u) return;
          let d = Object.values(t.addedProperties ?? {}),
            f = (0, l.storeOriginalValues)(d, u);
          return (
            (0, c.setupAnimateTimeline)(n, u, d, i, r, a),
            (0, s.createCleanupFunction)(e, o, f)
          );
        }
      },
      3838: function (e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var i = {
          buildAnimateRiveAction: function () {
            return d;
          },
          buildRiveAction: function () {
            return c;
          },
        };
        for (var r in i)
          Object.defineProperty(t, r, { enumerable: !0, get: i[r] });
        let a = n(797);
        function o(e) {
          return (
            "object" == typeof e &&
            null !== e &&
            "loaded" in e &&
            "boolean" == typeof e.loaded
          );
        }
        function l(e) {
          !e.isPlaying && e.play && e.play();
        }
        function s(e, t, n) {
          let i = [];
          for (let r of e) {
            let e = (function (e, t, n) {
              let i,
                r = t.getInstance(e),
                a = r?.rive,
                s = o(a) ? a : null;
              if (s?.loaded) return (l(s), n(s, e));
              let u = !1,
                c = () => {
                  if (u || !e.isConnected) return;
                  let r = t.getInstance(e),
                    a = r?.rive,
                    s = o(a) ? a : null;
                  (s?.loaded && (l(s), (i = n(s, e))),
                    e.removeEventListener("w-rive-load", c));
                };
              return (
                e.addEventListener("w-rive-load", c),
                () => {
                  ((u = !0), e.removeEventListener("w-rive-load", c), i?.());
                }
              );
            })(r, t, n);
            e && i.push(e);
          }
          if (0 !== i.length)
            return () => {
              for (let e of i) e();
            };
        }
        function u() {
          return window.Webflow
            ? (window.Webflow.require?.("rive") ?? null)
            : null;
        }
        function c(e) {
          e.addAction("rive", {
            createCustomTween: (e, t, n, i, r, o) => {
              let l = n.rive;
              if (!l || !r.length) return;
              let c = u();
              if (c)
                return s(r, c, (t, n) => (0, a.setupAnimation)(t, l, e, o, n));
            },
          });
        }
        function d(e) {
          e.addAction("animate-rive", {
            createCustomTween: (e, t, n, i, r, o) => {
              let l = n.rive;
              if (!l || !r.length) return;
              let c = u();
              if (c)
                return s(r, c, (t, n) =>
                  (0, a.setupAnimateAnimation)(t, l, e, i, o, n),
                );
            },
          });
        }
      },
      7469: function (e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var i = {
          createCleanupFunction: function () {
            return u;
          },
          restoreViewModelProperties: function () {
            return s;
          },
        };
        for (var r in i)
          Object.defineProperty(t, r, { enumerable: !0, get: i[r] });
        let a = n(9029),
          o = n(1248),
          l = n(148);
        function s(e, t, n) {
          let i = e.viewModelInstance ?? null;
          if (i)
            for (let [r, l] of Object.entries(n.viewModelProperties)) {
              let n = (0, a.parseVmKey)(r);
              if (!n || n.vmName !== t) continue;
              let s = { name: t, riveInstance: e, currentValues: {} };
              if ("artboard" === n.propType) {
                if ("string" != typeof l) continue;
                let t = i.artboard?.(n.propName),
                  r = e.getArtboard?.(l);
                t && r && (t.value = r);
                continue;
              }
              (0, o.setVmiValue)(s, n.propType, n.propName, l);
            }
        }
        function u(e, t, n) {
          return () => {
            t && e && (s(e, t.name, n), (0, l.clearSurfaceCache)(e, t));
          };
        }
      },
      3044: function (e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var i = {
          getVmiProperty: function () {
            return l;
          },
          storeOriginalValues: function () {
            return o;
          },
        };
        for (var r in i)
          Object.defineProperty(t, r, { enumerable: !0, get: i[r] });
        let a = n(9029);
        function o(e, t) {
          let n = { viewModelProperties: {} };
          for (let i of e)
            !(function (e, t, n, i) {
              let r = (0, a.vmKey)(e.name, t, n);
              if (!(r in i.viewModelProperties)) {
                if ("artboard" === n) {
                  let n = e.riveInstance.viewModelInstance?.artboard?.(t)?.name;
                  null != n && (i.viewModelProperties[r] = n);
                  return;
                }
                let a = e.riveInstance.viewModelInstance
                  ? (function (e, t, n) {
                      let i = l(e, t, n);
                      return i ? i.value : void 0;
                    })(e.riveInstance.viewModelInstance, n, t)
                  : null;
                null != a && (i.viewModelProperties[r] = a);
              }
            })(t, i.propertyName, i.propertyType, n);
          return n;
        }
        function l(e, t, n) {
          switch (t) {
            case "number":
              return e.number(n);
            case "boolean":
              return e.boolean(n);
            case "string":
              return e.string(n);
            case "color":
              return e.color(n);
            case "enum":
              return e.enum(n);
            default:
              return null;
          }
        }
      },
      148: function (e, t) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var n = {
          clearSurfaceCache: function () {
            return a;
          },
          surfaceCache: function () {
            return r;
          },
        };
        for (var i in n)
          Object.defineProperty(t, i, { enumerable: !0, get: n[i] });
        let r = new WeakMap();
        function a(e, t) {
          if (!t) return;
          let n = `${t.name}:${t.instanceName ?? ""}`,
            i = r.get(e);
          i && (i.delete(n), 0 === i.size && r.delete(e));
        }
      },
      495: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "parseColorToAARRGGBB", {
            enumerable: !0,
            get: function () {
              return r;
            },
          }));
        let i = n(8052);
        function r(e) {
          let t = e.trim();
          if (!t) return null;
          try {
            let {
              red: e,
              green: n,
              blue: r,
              alpha: l,
            } = (function (e) {
              let t,
                n,
                i,
                r = 1,
                l = e.replace(/\s/g, "").toLowerCase(),
                s = l;
              if (
                !s.startsWith("#") &&
                !s.startsWith("rgb") &&
                !s.startsWith("hsl")
              ) {
                let e = (function (e) {
                  if (!a) {
                    let e = document.createElement("canvas");
                    if (
                      ((e.width = 1), (e.height = 1), !(a = e.getContext("2d")))
                    )
                      return null;
                  }
                  return ((a.fillStyle = "#000000"),
                  (a.fillStyle = e),
                  "#000000" === a.fillStyle && "black" !== e.toLowerCase())
                    ? null
                    : a.fillStyle;
                })(l);
                e && (s = e);
              }
              if (s.startsWith("#")) {
                let e = s.substring(1);
                3 === e.length || 4 === e.length
                  ? ((t = parseInt(e.charAt(0) + e.charAt(0), 16)),
                    (n = parseInt(e.charAt(1) + e.charAt(1), 16)),
                    (i = parseInt(e.charAt(2) + e.charAt(2), 16)),
                    4 === e.length &&
                      (r = parseInt(e.charAt(3) + e.charAt(3), 16) / 255))
                  : (6 === e.length || 8 === e.length) &&
                    ((t = parseInt(e.substring(0, 2), 16)),
                    (n = parseInt(e.substring(2, 4), 16)),
                    (i = parseInt(e.substring(4, 6), 16)),
                    8 === e.length &&
                      (r = parseInt(e.substring(6, 8), 16) / 255));
              } else if (s.startsWith("rgba")) {
                let e = s.match(/rgba\(([^)]+)\)/)?.[1]?.split(",");
                ((t = parseInt(e?.[0] ?? "", 10)),
                  (n = parseInt(e?.[1] ?? "", 10)),
                  (i = parseInt(e?.[2] ?? "", 10)),
                  (r = parseFloat(e?.[3] ?? "")));
              } else if (s.startsWith("rgb")) {
                let e = s.match(/rgb\(([^)]+)\)/)?.[1]?.split(",");
                ((t = parseInt(e?.[0] ?? "", 10)),
                  (n = parseInt(e?.[1] ?? "", 10)),
                  (i = parseInt(e?.[2] ?? "", 10)));
              } else if (s.startsWith("hsla")) {
                let e = s.match(/hsla\(([^)]+)\)/)?.[1]?.split(","),
                  a = parseFloat(e?.[0] ?? ""),
                  l = parseFloat(e?.[1]?.replace("%", "") ?? "") / 100,
                  u = parseFloat(e?.[2]?.replace("%", "") ?? "") / 100;
                ((r = parseFloat(e?.[3] ?? "")),
                  ({ red: t, green: n, blue: i } = o(a, l, u)));
              } else if (s.startsWith("hsl")) {
                let e = s.match(/hsl\(([^)]+)\)/)?.[1]?.split(","),
                  r = parseFloat(e?.[0] ?? ""),
                  a = parseFloat(e?.[1]?.replace("%", "") ?? "") / 100,
                  l = parseFloat(e?.[2]?.replace("%", "") ?? "") / 100;
                ({ red: t, green: n, blue: i } = o(r, a, l));
              }
              if (
                Number.isNaN(t) ||
                Number.isNaN(n) ||
                Number.isNaN(i) ||
                Number.isNaN(r)
              )
                throw Error(`Invalid color value: '${e}'`);
              return { red: t, green: n, blue: i, alpha: r };
            })(t);
            if (void 0 === e || void 0 === n || void 0 === r) return null;
            return (
              ((Math.round(l * i.RIVE_CONSTANTS.MAX_BYTE_VALUE) << 24) |
                (e << 16) |
                (n << 8) |
                r) >>>
              0
            );
          } catch {
            return null;
          }
        }
        let a = null;
        function o(e, t, n) {
          let i,
            r,
            a,
            o = (1 - Math.abs(2 * n - 1)) * t,
            l = o * (1 - Math.abs(((e / 60) % 2) - 1)),
            s = n - o / 2;
          return (
            e >= 0 && e < 60
              ? ((i = o), (r = l), (a = 0))
              : e >= 60 && e < 120
                ? ((i = l), (r = o), (a = 0))
                : e >= 120 && e < 180
                  ? ((i = 0), (r = o), (a = l))
                  : e >= 180 && e < 240
                    ? ((i = 0), (r = l), (a = o))
                    : e >= 240 && e < 300
                      ? ((i = l), (r = 0), (a = o))
                      : ((i = o), (r = 0), (a = l)),
            {
              red: Math.round((i + s) * 255),
              green: Math.round((r + s) * 255),
              blue: Math.round((a + s) * 255),
            }
          );
        }
      },
      9029: function (e, t) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var n = {
          parseVmKey: function () {
            return o;
          },
          vmKey: function () {
            return r;
          },
        };
        for (var i in n)
          Object.defineProperty(t, i, { enumerable: !0, get: n[i] });
        function r(e, t, n) {
          return `vm:${e}:${t}:${n}`;
        }
        let a = new Set([
          "string",
          "number",
          "boolean",
          "color",
          "enum",
          "trigger",
          "artboard",
        ]);
        function o(e) {
          if (!e.startsWith("vm:")) return null;
          let t = e.lastIndexOf(":"),
            n = e.slice(t + 1);
          if (!a.has(n)) return null;
          let i = e.slice(3, t),
            r = i.indexOf(":");
          return -1 === r
            ? null
            : { vmName: i.slice(0, r), propName: i.slice(r + 1), propType: n };
        }
      },
      3826: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "fadeObject", {
            enumerable: !0,
            get: function () {
              return u;
            },
          }));
        let i = n(2643),
          r = n(8113),
          a = (e, t, n, i, r, a) => {
            i.fromTo(e, { alpha: t }, { ...r, alpha: n }, a);
          },
          o = (e, t, n, r, a, o) => {
            let l = e.ior ?? i.SPLINE_CONSTANTS.DEFAULT_TRANSMISSION_IOR,
              s =
                e.thickness ??
                i.SPLINE_CONSTANTS.DEFAULT_TRANSMISSION_THICKNESS;
            r.fromTo(
              e,
              { alpha: t, ior: l, thickness: s },
              {
                ...a,
                alpha: 1 - n,
                ior: window.gsap.utils.interpolate(l, 1, 1 - n),
                thickness: window.gsap.utils.interpolate(s, 0, 1 - n),
                onUpdate: () => {
                  e.visible =
                    e.alpha > i.SPLINE_CONSTANTS.OPACITY_TRANSPARENCY_THRESHOLD;
                },
              },
              o,
            );
          },
          l = (e, t, n, i, r, a) => {
            void 0 !== e.alphaOverride &&
              i.fromTo(e, { alphaOverride: t }, { ...r, alphaOverride: n }, a);
          },
          s = (e, t, n, i, r, s) => {
            if (!e.visible) return;
            let u = e.type;
            "color" === u || "depth" === u || "outline" === u
              ? a(e, t, n, i, r, s)
              : "transmission" === u
                ? o(e, t, n, i, r, s)
                : "light" === u && l(e, t, n, i, r, s);
          },
          u = (e, t, n, a, o, l) => {
            if (!e) return;
            let u = e.material,
              c = u?.layers;
            if (c)
              for (let d of ((u.transparent = !0),
              (0, r.hasRenderOrder)(e) &&
                (e.renderOrder = i.SPLINE_CONSTANTS.OPACITY_RENDER_ORDER),
              c)) {
                let e =
                  "light" === d.type ? (d.alphaOverride ?? 1) : (d.alpha ?? 1);
                s(
                  d,
                  void 0 !== t.from && (0, r.checkTt)(a, "from") ? t.from : e,
                  void 0 !== t.to && (0, r.checkTt)(a, "to") ? t.to : e,
                  n,
                  o,
                  l,
                );
              }
          };
      },
      5150: function (e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var i = {
          animateColor: function () {
            return c;
          },
          animateIntensity: function () {
            return s;
          },
          animateZoom: function () {
            return u;
          },
        };
        for (var r in i)
          Object.defineProperty(t, r, { enumerable: !0, get: i[r] });
        let a = n(9164),
          o = n(9888),
          l = n(8113),
          s = (e, t, n, i, r, a) => {
            let o = t.intensity;
            if (!o || "object" != typeof o) return;
            let s = e.intensity ?? 0,
              u = o.from && (0, l.checkTt)(i, "from") ? o.from : s,
              c = o.to && (0, l.checkTt)(i, "to") ? o.to : s,
              d = { v: u };
            n.fromTo(
              d,
              { v: u },
              {
                ...r,
                v: c,
                onUpdate: () => {
                  (0, l.hasIntensity)(e) && (e.intensity = d.v);
                },
              },
              a || 0,
            );
          },
          u = (e, t, n, i, r, o) => {
            let s = t.zoom;
            if (
              !s ||
              "object" != typeof s ||
              "function" != typeof e.spline?.setZoom
            )
              return;
            let u = (0, a.getAppZoom)(e.spline),
              c = s.from && (0, l.checkTt)(i, "from") ? s.from : u,
              d = s.to && (0, l.checkTt)(i, "to") ? s.to : u,
              f = { v: c };
            n.fromTo(
              f,
              { v: c },
              {
                ...r,
                v: d,
                onUpdate: () => {
                  (0, a.setAppZoom)(e.spline, f.v);
                },
              },
              o || 0,
            );
          },
          c = (e, t, n, i, r, a, s, u) => {
            let c = t.color;
            if (!c || "object" != typeof c || (!c.from && !c.to)) return;
            let d = s.spline._scene.entityByUuid[u]?.color,
              f = (0, o.colorDataToCss)(d ?? { r: 255, g: 255, b: 255 }),
              p = c.from && (0, l.checkTt)(i, "from") ? c.from : f,
              g = c.to && (0, l.checkTt)(i, "to") ? c.to : f,
              h = window.gsap.utils.interpolate(p, g),
              m = { t: 0 };
            n.fromTo(
              m,
              { t: 0 },
              {
                ...r,
                t: 1,
                onUpdate: function () {
                  e.color = h(m.t);
                },
              },
              a || 0,
            );
          };
      },
      1456: function (e, t) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var n = {
          createPropertyObject: function () {
            return r;
          },
          createTransformTargets: function () {
            return a;
          },
        };
        for (var i in n)
          Object.defineProperty(t, i, { enumerable: !0, get: n[i] });
        let r = (e, t, n) => {
            let i = {},
              r = n[t];
            return (
              ["X", "Y", "Z"].forEach((n) => {
                let a = e[`${t}${n}`],
                  o = n.toLowerCase(),
                  l = r[o];
                a &&
                  "object" == typeof a &&
                  (i[o] = { from: a.from ?? l, to: a.to ?? l });
              }),
              { props: i }
            );
          },
          a = (e, t) => {
            let n = [];
            return (
              ["position", "rotation", "scale"].forEach((i) => {
                let { props: a } = r(t, i, e);
                Object.keys(a).length > 0 && n.push({ object: e[i], props: a });
              }),
              n
            );
          };
      },
      413: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "animateStateTransitions", {
            enumerable: !0,
            get: function () {
              return o;
            },
          }));
        let i = n(2643),
          r = n(774),
          a = n(8113),
          o = (e, t, n, o, l, s, u, c, d, f) => {
            let p = [];
            e.forEach((e) => {
              if (!e.transition) return void p.push(null);
              let n =
                  d.duration ?? i.SPLINE_CONSTANTS.DEFAULT_TRANSITION_DURATION,
                r = e.transition({
                  from:
                    t.stateName?.from && (0, a.checkTt)(c, "from")
                      ? t.stateName.from
                      : void 0,
                  to:
                    t.stateName?.to && (0, a.checkTt)(c, "to")
                      ? t.stateName.to
                      : null,
                  autoPlay: !1,
                  duration: n,
                  delay: 0,
                });
              p.push(r);
              let o = { time: 0 };
              u.fromTo(
                o,
                { time: 0 },
                {
                  ...d,
                  time: n - i.SPLINE_CONSTANTS.TRANSITION_END_OFFSET,
                  onUpdate: () => {
                    r.seek(o.time);
                  },
                },
                f || 0,
              );
            });
            let g = e.map((e, t) =>
              (0, r.createCleanupFunction)(e, n, o[t], l, s, p[t]),
            );
            return () => g.forEach((e) => e?.());
          };
      },
      2643: function (e, t) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "SPLINE_CONSTANTS", {
            enumerable: !0,
            get: function () {
              return n;
            },
          }));
        let n = {
          OPACITY_RENDER_ORDER: 999,
          TRANSITION_END_OFFSET: 0.001,
          DEFAULT_TRANSITION_DURATION: 0.5,
          OPACITY_TRANSPARENCY_THRESHOLD: 0.01,
          DEFAULT_TRANSMISSION_IOR: 1.3,
          DEFAULT_TRANSMISSION_THICKNESS: 10,
          MIN_ZOOM_VALUE: 1e-4,
        };
      },
      2194: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "setupAnimation", {
            enumerable: !0,
            get: function () {
              return p;
            },
          }));
        let i = n(1909),
          r = n(774),
          a = n(9164),
          o = n(7084),
          l = n(413),
          s = n(5150),
          u = n(1456),
          c = n(3826),
          d = n(8113),
          f = n(2643),
          p = (e, t, n, p, g, h) => {
            n.ease || (n = { ...n, ease: "none" });
            let { force3D: m, ...y } = n;
            if (((n = { ...y }), !e.spline?.findObjectById)) return;
            let v = t.spline,
              T = (t.objectId || "").split(",").filter(Boolean);
            if (0 === T.length) return void (0, o.warnNoObjectId)();
            let b = T.flatMap((t) => {
              let n = e.spline.findObjectById?.(t);
              return n || ((0, o.warnObjectNotFound)(t), []);
            });
            if (0 === b.length) return void (0, o.warnNoObjectsFound)(T);
            let E = b.map((t) => (0, i.storeOriginalState)(t, e, T[0] ?? "")),
              I = (0, a.getAppZoom)(e.spline);
            if (
              t.animatingState &&
              v?.stateName &&
              (v.stateName.from || v.stateName.to)
            )
              return (0, l.animateStateTransitions)(
                b,
                v,
                e,
                E,
                t,
                I,
                p,
                g,
                n,
                h,
              );
            if (!v) return;
            let S = Object.keys(v);
            if (0 === S.length || (1 === S.length && "stateName" === S[0]))
              return;
            b.forEach((t) => {
              ((0, s.animateIntensity)(t, v, p, g, n, h),
                (0, s.animateZoom)(e, v, p, g, n, h),
                (0, s.animateColor)(t, v, p, g, n, h, e, T[0] ?? ""));
              let i =
                v.opacity && "object" == typeof v.opacity ? v.opacity : void 0;
              if (void 0 !== i) {
                let e = {
                    from: void 0 !== i.from ? i.from / 100 : void 0,
                    to: void 0 !== i.to ? i.to / 100 : void 0,
                  },
                  r =
                    !1 !== n.immediateRender &&
                    void 0 !== e.from &&
                    (0, d.checkTt)(g, "from")
                      ? e.from
                      : void 0;
                if (((0, c.fadeObject)(t, e, p, g, n, h), void 0 !== r)) {
                  let e = t.material;
                  for (let t of Array.isArray(e) ? e : e ? [e] : [])
                    ((t.transparent = !0),
                      (t.depthWrite =
                        r > f.SPLINE_CONSTANTS.OPACITY_TRANSPARENCY_THRESHOLD));
                  (0, d.hasRenderOrder)(t) &&
                    (t.renderOrder = f.SPLINE_CONSTANTS.OPACITY_RENDER_ORDER);
                }
              }
              (0, u.createTransformTargets)(t, v).forEach(
                ({ object: e, props: t }) => {
                  if (0 === Object.keys(t).length) return;
                  let i = {},
                    r = {};
                  (Object.keys(t).forEach((n) => {
                    let a = t[n];
                    a &&
                      "object" == typeof a &&
                      ((i[n] =
                        (0, d.checkTt)(g, "from") && a.from
                          ? a.from
                          : (e[n] ?? 0)),
                      (r[n] =
                        (0, d.checkTt)(g, "to") && a.to ? a.to : (e[n] ?? 0)));
                  }),
                    (0 !== Object.keys(i).length ||
                      0 !== Object.keys(r).length) &&
                      p.fromTo(e, i, { ...n, ...r }, h || 0));
                },
              );
            });
            let O = b.map((n, i) =>
              (0, r.createCleanupFunction)(n, e, E[i], t, I),
            );
            return () => O.forEach((e) => e?.());
          };
      },
      8691: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "buildSplineAction", {
            enumerable: !0,
            get: function () {
              return s;
            },
          }));
        let i = n(2194),
          r = n(7066),
          a = new Set(["color", "stateName"]),
          o = new Set(["rotationX", "rotationY", "rotationZ"]),
          l = Math.PI / 180;
        function s(e) {
          e.addAction("spline", {
            createCustomTween: (e, t, n, s, u, c) => {
              let d = t.tt ?? 0;
              if (!u.length || !window.Webflow || !n.objectId) return;
              let f = window.Webflow.require?.("spline");
              if (!f) return;
              let p = [];
              for (let t of u) {
                let u = (function (e, t) {
                    if (!e.spline) return e;
                    let n = e.spline,
                      i = {},
                      s = !1;
                    for (let [e, u] of Object.entries(n)) {
                      if (!u || "object" != typeof u) {
                        i[e] = u;
                        continue;
                      }
                      if (a.has(e)) {
                        let n =
                            void 0 !== u.from
                              ? (0, r.resolveToString)(u.from, t)
                              : void 0,
                          a =
                            void 0 !== u.to
                              ? (0, r.resolveToString)(u.to, t)
                              : void 0;
                        ((n !== u.from || a !== u.to) && (s = !0),
                          (i[e] = { from: n, to: a }));
                      } else {
                        let n =
                            void 0 !== u.from
                              ? (0, r.resolveToNumber)(u.from, t)
                              : void 0,
                          a =
                            void 0 !== u.to
                              ? (0, r.resolveToNumber)(u.to, t)
                              : void 0,
                          c = n !== u.from,
                          d = a !== u.to;
                        ((c || d) && (s = !0),
                          o.has(e)
                            ? (i[e] = {
                                from: void 0 !== n && c ? n * l : n,
                                to: void 0 !== a && d ? a * l : a,
                              })
                            : (i[e] = { from: n, to: a }));
                      }
                    }
                    return s ? { ...e, spline: i } : e;
                  })(n, t),
                  g = (function (e, t, n, r, a, o, l) {
                    let s,
                      u = t.getInstance(e);
                    if (u) return (0, i.setupAnimation)(u, n, r, a, o, l);
                    let c = () => {
                      let u = t.getInstance(e);
                      (u && (s = (0, i.setupAnimation)(u, n, r, a, o, l)),
                        e.removeEventListener("w-spline-load", c));
                    };
                    return (
                      e.addEventListener("w-spline-load", c),
                      () => {
                        (e.removeEventListener("w-spline-load", c), s?.());
                      }
                    );
                  })(t, f, u, s, e, d, c);
                g && p.push(g);
              }
              if (0 !== p.length)
                return () => {
                  for (let e of p) e?.();
                };
            },
          });
        }
      },
      774: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "createCleanupFunction", {
            enumerable: !0,
            get: function () {
              return a;
            },
          }));
        let i = n(9164),
          r = n(8113),
          a = (e, t, n, a, o, l) => () => {
            if (e && n) {
              if (
                (l && (e.state = void 0),
                Object.assign(e.position, n.position),
                Object.assign(e.rotation, {
                  x: n.rotation.x,
                  y: n.rotation.y,
                  z: n.rotation.z,
                }),
                Object.assign(e.scale, n.scale),
                n.color && (e.color = n.color),
                a.spline?.intensity &&
                  "object" == typeof a.spline.intensity &&
                  void 0 !== n.intensity &&
                  (0, r.hasIntensity)(e) &&
                  (e.intensity = n.intensity),
                a.spline?.zoom && "object" == typeof a.spline.zoom)
              ) {
                let e = t.spline;
                "function" == typeof e?.setZoom && (0, i.setAppZoom)(e, o ?? 1);
              }
              if (n.materials) {
                let t = e.material,
                  i = Array.isArray(t) ? t : t ? [t] : [];
                (0, r.hasRenderOrder)(e) &&
                  (e.renderOrder = n.renderOrder ?? 0);
                let a = Math.min(i.length, n.materials.length);
                for (let e = 0; e < a; e++) {
                  let t = i[e],
                    r = n.materials[e];
                  if (!t || !r) continue;
                  ((t.transparent = r.transparent),
                    (t.depthWrite = r.depthWrite),
                    void 0 !== r.alpha && (t.alpha = r.alpha));
                  let a = t.layers ?? [];
                  for (let e = 0; e < a.length; e++) {
                    let t = a[e],
                      n = r.layers[e];
                    t &&
                      n &&
                      ((t.visible = n.visible),
                      void 0 !== n.alpha && (t.alpha = n.alpha),
                      void 0 !== n.alphaOverride &&
                        (t.alphaOverride = n.alphaOverride),
                      void 0 !== n.ior && (t.ior = n.ior),
                      void 0 !== n.thickness && (t.thickness = n.thickness));
                  }
                }
              }
              ((0, r.hasMatrixUpdate)(e) &&
                (e.updateMatrix(), e.updateMatrixWorld(!0)),
                (0, r.hasBBoxUpdate)(e) &&
                  ((e.singleBBoxNeedsUpdate = !0),
                  (e.recursiveBBoxNeedsUpdate = !0)),
                t.spline.requestRender());
            }
          };
      },
      1909: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "storeOriginalState", {
            enumerable: !0,
            get: function () {
              return a;
            },
          }));
        let i = n(8113),
          r = n(9888),
          a = (e, t, n) => {
            let a = e.material,
              o = Array.isArray(a) ? a : a ? [a] : [],
              l = t.spline._scene.entityByUuid[n]?.color,
              s = l ? (0, r.colorDataToCss)(l) : void 0,
              u = e.rotation;
            return {
              position: { ...e.position },
              rotation: { x: u._x ?? 0, y: u._y ?? 0, z: u._z ?? 0 },
              scale: { ...e.scale },
              ...(s ? { color: s } : {}),
              ...{ intensity: e.intensity },
              renderOrder: (0, i.hasRenderOrder)(e) ? e.renderOrder : void 0,
              materials: o?.map((e) => ({
                transparent: e.transparent,
                depthWrite: e.depthWrite,
                alpha: e.alpha,
                layers: (e.layers ?? []).map((e) => ({
                  visible: e.visible,
                  alpha: e.alpha,
                  alphaOverride: e.alphaOverride,
                  ior: e.ior,
                  thickness: e.thickness,
                })),
              })),
            };
          };
      },
      9164: function (e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var i = {
          getAppZoom: function () {
            return o;
          },
          setAppZoom: function () {
            return l;
          },
        };
        for (var r in i)
          Object.defineProperty(t, r, { enumerable: !0, get: i[r] });
        let a = n(2643),
          o = (e) => {
            let t = e._camera;
            return "OrthographicCamera" === t._cameraType
              ? t.orthoCamera.zoom
              : t.perspCamera.zoom;
          },
          l = (e, t) => {
            let n = t > 0 ? t : a.SPLINE_CONSTANTS.MIN_ZOOM_VALUE;
            e.setZoom?.(n);
          };
      },
      9888: function (e, t) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "colorDataToCss", {
            enumerable: !0,
            get: function () {
              return n;
            },
          }));
        let n = ({ r: e, g: t, b: n, a: i }) => {
          let r = (e) => Math.round(255 * Math.min(1, Math.max(0, e))),
            a = r(e),
            o = r(t),
            l = r(n);
          if (void 0 === i || i >= 1) return `rgba(${a}, ${o}, ${l}, 1)`;
          let s = Math.min(1, Math.max(0, i));
          return `rgba(${a}, ${o}, ${l}, ${s})`;
        };
      },
      8113: function (e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var i = {
          checkTt: function () {
            return c;
          },
          hasBBoxUpdate: function () {
            return s;
          },
          hasIntensity: function () {
            return o;
          },
          hasMatrixUpdate: function () {
            return u;
          },
          hasRenderOrder: function () {
            return l;
          },
        };
        for (var r in i)
          Object.defineProperty(t, r, { enumerable: !0, get: i[r] });
        let a = n(1983),
          o = (e) => "intensity" in e,
          l = (e) => "renderOrder" in e,
          s = (e) =>
            "singleBBoxNeedsUpdate" in e && "recursiveBBoxNeedsUpdate" in e,
          u = (e) => "updateMatrix" in e && "updateMatrixWorld" in e,
          c = (e, t) =>
            "from" === t
              ? e === a.TweenType.From || e === a.TweenType.FromTo
              : e === a.TweenType.To || e === a.TweenType.FromTo;
      },
      7084: function (e, t) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var n = {
          warnNoObjectId: function () {
            return r;
          },
          warnNoObjectsFound: function () {
            return o;
          },
          warnObjectNotFound: function () {
            return a;
          },
        };
        for (var i in n)
          Object.defineProperty(t, i, { enumerable: !0, get: n[i] });
        let r = () => {},
          a = (e) => {},
          o = (e) => {};
      },
      2182: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "buildVariableAction", {
            enumerable: !0,
            get: function () {
              return r;
            },
          }));
        let i = n(1983);
        function r(e) {
          e.addAction("variable", {
            createCustomTween: (e, t, n, r, o, u) => {
              let c = n.variable;
              if (!c) return;
              let d = Object.keys(c),
                f = d.length;
              if (0 === f) return;
              let p = (t.targets?.length ?? 0) > 0;
              if (p && 0 === o.length) return;
              let g = p
                  ? Array.from(new Set(o))
                  : (function (e) {
                      let t = [document.documentElement];
                      if (0 === e.length) return t;
                      let n =
                        (function (e) {
                          let t = new Set([document.documentElement]),
                            n = [],
                            i = new Map();
                          try {
                            let r = document.styleSheets;
                            for (let a = 0; a < r.length; a++)
                              !(function e(t, n, i, r, a) {
                                for (let o = 0; o < t.length; o++) {
                                  let l = t[o];
                                  if (l instanceof CSSMediaRule) {
                                    let t = l.conditionText,
                                      o = a.get(t);
                                    (void 0 === o &&
                                      ((o = matchMedia(t).matches),
                                      a.set(t, o)),
                                      o && e(l.cssRules, n, i, r, a));
                                    continue;
                                  }
                                  if (!(l instanceof CSSStyleRule)) continue;
                                  let s = l.style;
                                  for (let e = 0; e < n.length; e++)
                                    if (s.getPropertyValue(n[e])) {
                                      try {
                                        let e = document.querySelectorAll(
                                          l.selectorText,
                                        );
                                        for (let t = 0; t < e.length; t++) {
                                          let n = e[t];
                                          r.has(n) || (r.add(n), i.push(n));
                                        }
                                      } catch {}
                                      break;
                                    }
                                }
                              })(r[a].cssRules, e, n, t, i);
                            return n;
                          } catch {
                            return null;
                          }
                        })(e) ??
                        (function (e) {
                          let t,
                            n = document.documentElement,
                            i = document.body,
                            r = [],
                            a = e.length,
                            o = [],
                            u = [];
                          (l(n, e, a, o, u), s(i, e, a, r, o, u));
                          let c = document.createTreeWalker(
                            i,
                            NodeFilter.SHOW_ELEMENT,
                          );
                          for (; (t = c.nextNode()); ) s(t, e, a, r, o, u);
                          for (let t = 0; t < o.length; t++) {
                            let n = o[t].style,
                              i = u[t];
                            for (let t = 0; t < a; t++) {
                              let r = i[t];
                              r
                                ? n.setProperty(e[t], r)
                                : n.removeProperty(e[t]);
                            }
                          }
                          return r;
                        })(e);
                      for (let e = 0; e < n.length; e++) t.push(n[e]);
                      return t;
                    })(d),
                h = g.length,
                m = Array(h),
                y = Array(h);
              for (let e = 0; e < h; e++) {
                let t = g[e].style;
                m[e] = t;
                let n = Array(f);
                for (let e = 0; e < f; e++) {
                  let i = d[e];
                  ((n[e] = t.getPropertyValue(i)), t.removeProperty(i));
                }
                y[e] = n;
              }
              let v = t.tt ?? i.TweenType.To,
                T = u || 0,
                { force3D: b, ...E } = r,
                I = d.some((e) => c[e].startsWith("var(")),
                S = (e) => {
                  let t = {};
                  for (let n = 0; n < f; n++) {
                    let i = d[n],
                      r = c[i];
                    t[i] =
                      (e &&
                        r.startsWith("var(") &&
                        e.getPropertyValue(r.slice(4, -1)).trim()) ||
                      r;
                  }
                  return t;
                };
              if (p)
                for (let t = 0; t < h; t++) {
                  let n = g[t],
                    i = S(I ? getComputedStyle(n) : null);
                  a(e, v, n, { ...i, ...E }, T);
                }
              else {
                let t = {
                  ...S(I ? getComputedStyle(document.documentElement) : null),
                  ...E,
                };
                for (let n = 0; n < h; n++) a(e, v, g[n], t, T);
              }
              return () => {
                for (let e = 0; e < h; e++) {
                  let t = m[e],
                    n = y[e];
                  for (let e = 0; e < f; e++) {
                    let i = n[e];
                    i ? t.setProperty(d[e], i) : t.removeProperty(d[e]);
                  }
                }
              };
            },
          });
        }
        function a(e, t, n, r, a) {
          t === i.TweenType.From
            ? e.from(n, r, a)
            : t === i.TweenType.Set
              ? e.set(n, r, a)
              : e.to(n, r, a);
        }
        let o = "__ix3__";
        function l(e, t, n, i, r) {
          let a = e.style,
            l = Array(n);
          for (let e = 0; e < n; e++) {
            let n = t[e];
            ((l[e] = a.getPropertyValue(n)), a.setProperty(n, o));
          }
          (i.push(e), r.push(l));
        }
        function s(e, t, n, i, r, a) {
          let s = getComputedStyle(e);
          for (let u = 0; u < n; u++)
            if (s.getPropertyValue(t[u]) !== o) {
              (i.push(e), l(e, t, n, r, a));
              return;
            }
        }
      },
      3922: function (e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var i = {
          elementTargetSelector: function () {
            return d;
          },
          safeClosest: function () {
            return u;
          },
          safeGetElementById: function () {
            return o;
          },
          safeMatches: function () {
            return c;
          },
          safeQuerySelector: function () {
            return s;
          },
          safeQuerySelectorAll: function () {
            return l;
          },
        };
        for (var r in i)
          Object.defineProperty(t, r, { enumerable: !0, get: i[r] });
        let a = n(244),
          o = (e) => {
            try {
              let t = document.getElementById(e);
              return t && !(0, a.isTransientIX3Clone)(t) ? t : null;
            } catch {
              return null;
            }
          },
          l = (e, t) => {
            try {
              let n = t.querySelectorAll(e);
              if (0 === n.length) return [];
              let i = [];
              for (let e of n) (0, a.isTransientIX3Clone)(e) || i.push(e);
              return i;
            } catch {
              return null;
            }
          },
          s = (e, t) => {
            try {
              let n = t.querySelector(e);
              if (!n) return null;
              if (!(0, a.isTransientIX3Clone)(n)) return n;
              for (let n of t.querySelectorAll(e))
                if (!(0, a.isTransientIX3Clone)(n)) return n;
              return null;
            } catch {
              return null;
            }
          },
          u = (e, t) => {
            try {
              return e.closest(t);
            } catch {
              return null;
            }
          },
          c = (e, t) => {
            try {
              return e.matches(t);
            } catch {
              return null;
            }
          },
          d = (e) =>
            `[data-wf-target*="${CSS.escape(`[${JSON.stringify(e)}`)}"]`;
      },
      4574: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "plugin", {
            enumerable: !0,
            get: function () {
              return p;
            },
          }));
        let i = n(6151),
          r = n(2605),
          a = n(8281),
          o = n(3838),
          l = n(8691),
          s = n(2182),
          u = n(7775),
          c = n(1983),
          d = n(2908),
          f = new c.RuntimeBuilder(d.CORE_PLUGIN_INFO);
        ((0, i.build)(f),
          (0, r.build)(f),
          (0, a.buildLottieAction)(f),
          (0, o.buildRiveAction)(f),
          (0, o.buildAnimateRiveAction)(f),
          (0, l.buildSplineAction)(f),
          (0, s.buildVariableAction)(f),
          (0, u.build)(f));
        let p = f.buildRuntime();
      },
      3006: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "applyScope", {
            enumerable: !0,
            get: function () {
              return l;
            },
          }));
        let i = n(2908),
          r = n(3922),
          a = n(244),
          o = (e) => e.filter((e) => !(0, a.isTransientIX3Clone)(e)),
          l = (e, t) => {
            let n = o(e);
            if (!t) return n;
            if (Array.isArray(t)) {
              let [e, a] = t,
                l = [];
              switch (e) {
                case i.TargetScope.FIRST_ANCESTOR:
                  for (let e of n) {
                    let t = a ? (0, r.safeClosest)(e, a) : null;
                    t && l.push(t);
                  }
                  return o(l);
                case i.TargetScope.FIRST_DESCENDANT:
                  for (let e of n) {
                    let t = a
                      ? (0, r.safeQuerySelector)(a, e)
                      : e.firstElementChild;
                    t && l.push(t);
                  }
                  return o(l);
                case i.TargetScope.DESCENDANTS:
                  for (let e of n)
                    l.push(...((0, r.safeQuerySelectorAll)(a, e) || []));
                  return o(l);
                case i.TargetScope.ANCESTORS:
                  for (let e of n) {
                    let t = e.parentElement;
                    for (; t; )
                      ((!a || (0, r.safeMatches)(t, a)) && l.push(t),
                        (t = t.parentElement));
                  }
                  return o(l);
              }
            }
            switch (t) {
              case i.TargetScope.CHILDREN:
                return o(n.flatMap((e) => [...e.children]));
              case i.TargetScope.PARENT:
                return o(n.map((e) => e.parentElement).filter(Boolean));
              case i.TargetScope.SIBLINGS:
                return o(
                  n.flatMap((e) =>
                    e.parentElement
                      ? [...e.parentElement.children].filter((t) => t !== e)
                      : [],
                  ),
                );
              case i.TargetScope.NEXT:
                return o(n.flatMap((e) => e.nextElementSibling || []));
              case i.TargetScope.PREVIOUS:
                return o(n.flatMap((e) => e.previousElementSibling || []));
              default:
                return n;
            }
          };
      },
      7775: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "build", {
            enumerable: !0,
            get: function () {
              return o;
            },
          }));
        let i = n(2104),
          r = n(3922),
          a = n(3006);
        function o(e) {
          let t = [];
          e.addTargetResolver("id", {
            resolve: ([, e]) => {
              let [n, i] = Array.isArray(e) ? e : [e],
                o = n ? (0, r.safeGetElementById)(n) : null;
              return o ? (0, a.applyScope)([o], i) : t;
            },
          })
            .addTargetResolver("trigger-only", {
              resolve: ([, e], { triggerElement: n }) =>
                n
                  ? (0, a.applyScope)([n], Array.isArray(e) ? e[1] : void 0)
                  : t,
              isDynamic: !0,
            })
            .addTargetResolver("trigger-only-parent", {
              resolve: ([, e], { triggerElement: n }) => {
                if (!n) return t;
                let i = n.parentElement;
                return i instanceof HTMLElement
                  ? (0, a.applyScope)([i], Array.isArray(e) ? e[1] : void 0)
                  : t;
              },
              isDynamic: !0,
            })
            .addTargetResolver("inst", {
              resolve: ([, e], { triggerElement: n }) => {
                if (!Array.isArray(e)) return t;
                let [o, l] = e,
                  s = Array.isArray(o),
                  u = s ? (0, i.pair)(o[0], o[1]) : (0, i.pair)(o, l),
                  c = (0, r.safeQuerySelectorAll)(
                    (0, r.elementTargetSelector)(u),
                    document,
                  );
                if (!c?.length) return t;
                let d = [...c];
                if (!n) return (0, a.applyScope)(d, s ? l : void 0);
                let f = n.dataset.wfTarget;
                if (!f) return d;
                try {
                  let e = JSON.parse(f),
                    n = (0, i.getFirst)(u),
                    r = e.find(
                      (e) => (0, i.getFirst)((0, i.getFirst)(e)) === n,
                    );
                  if (!r) return t;
                  return (0, a.applyScope)(
                    d.filter((e) =>
                      (e.dataset.wfTarget || "").includes(
                        `${JSON.stringify((0, i.getSecond)(r))}]`,
                      ),
                    ),
                    s ? l : void 0,
                  );
                } catch {
                  return t;
                }
              },
              isDynamic: !0,
            })
            .addTargetResolver("class", {
              resolve: ([, e]) => {
                let [n, i] = Array.isArray(e) ? e : [e],
                  o = n ? (0, r.safeQuerySelectorAll)(`.${n}`, document) : null;
                return o ? (0, a.applyScope)([...o], i) : t;
              },
            })
            .addTargetResolver("selector", {
              resolve: ([, e]) => {
                let [n, i] = Array.isArray(e) ? e : [e],
                  o = n ? (0, r.safeQuerySelectorAll)(n, document) : null;
                return o ? (0, a.applyScope)([...o], i) : t;
              },
            })
            .addTargetResolver("body", { resolve: () => [document.body] })
            .addTargetResolver("attribute", {
              resolve: ([, e]) => {
                let [n, i] = Array.isArray(e) ? e : [e],
                  o = n ? (0, r.safeQuerySelectorAll)(n, document) : null;
                return o ? (0, a.applyScope)([...o], i) : t;
              },
            })
            .addTargetResolver("any-element", { resolve: () => t })
            .addTargetResolver("viewport", {
              resolve: () => [document.documentElement],
            });
        }
      },
      244: function (e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var i = {
          TRANSIENT_IX3_CLONE_ATTR: function () {
            return a.TRANSIENT_IX3_CLONE_ATTR;
          },
          isTransientIX3Clone: function () {
            return a.isTransientIX3Clone;
          },
        };
        for (var r in i)
          Object.defineProperty(t, r, { enumerable: !0, get: i[r] });
        let a = n(2908);
      },
      6675: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "IntervalController", {
            enumerable: !0,
            get: function () {
              return r;
            },
          }));
        let i = n(2908);
        class r {
          config;
          accum;
          lastX;
          lastY;
          initialized;
          cycleIndex;
          destroyed;
          constructor(e) {
            ((this.config = e),
              (this.accum = 0),
              (this.lastX = 0),
              (this.lastY = 0),
              (this.initialized = !1),
              (this.cycleIndex = 0),
              (this.destroyed = !1),
              document.addEventListener(
                "visibilitychange",
                () => {
                  "visible" === document.visibilityState && this.reset();
                },
                { signal: this.config.signal },
              ));
          }
          get isActive() {
            return this.config.distance > 0;
          }
          update(e) {
            if (this.destroyed || !this.isActive) return;
            let { x: t, y: n, velocityFactor: r, dirX: a, dirY: o } = e;
            if (!this.initialized) {
              ((this.lastX = t), (this.lastY = n), (this.initialized = !0));
              return;
            }
            let l = t - this.lastX,
              s = n - this.lastY;
            ((this.lastX = t), (this.lastY = n));
            let { axes: u, distance: c } = this.config;
            u.x && u.y
              ? (this.accum += Math.hypot(l, s))
              : u.x
                ? (this.accum += Math.abs(l))
                : u.y && (this.accum += Math.abs(s));
            let d = 0;
            for (; this.accum >= c && d < 16; ) {
              this.accum -= c;
              let e = {
                cursorPos: { x: t, y: n },
                velocityFactor: r,
                dirX: a,
                dirY: o,
              };
              (this.config.channelManager.fireInterval?.(
                i.TIMELINE_ROLE_NAMES.INTERVAL,
                {
                  targetIndex: this.cycleIndex++,
                  element: this.config.element,
                  pluginPayload: e,
                },
              ),
                d++);
            }
            this.accum >= c && (this.accum %= c);
          }
          reset() {
            ((this.accum = 0), (this.initialized = !1), (this.cycleIndex = 0));
          }
          destroy() {
            ((this.destroyed = !0), this.reset());
          }
        }
      },
      657: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "TouchScrollGuard", {
            enumerable: !0,
            get: function () {
              return r;
            },
          }));
        let i = n(6969);
        class r {
          isScrolling = !1;
          toleranceDeg;
          refX = 0;
          refY = 0;
          lastY = 0;
          locked = null;
          effectFromBoundary = !1;
          scroller = null;
          maxScroll = 0;
          constructor(e, t, n) {
            this.toleranceDeg = n?.tolerance ?? 18;
            let r = (0, i.initScrollCache)();
            t.addEventListener("abort", r);
            let a = () => {
              ((this.locked = null), (this.isScrolling = !1));
            };
            (e.addEventListener(
              "touchstart",
              (t) => {
                let n = t.touches[0];
                n &&
                  ((this.refX = n.clientX),
                  (this.refY = n.clientY),
                  (this.lastY = n.clientY),
                  (this.locked = null),
                  (this.effectFromBoundary = !1),
                  (this.isScrolling = !1),
                  (this.scroller = (function (e) {
                    let t = e;
                    for (
                      ;
                      t &&
                      t !== document.body &&
                      t !== document.documentElement;
                    ) {
                      if (t instanceof HTMLElement) {
                        let e = getComputedStyle(t).overflowY;
                        if (
                          ("auto" === e || "scroll" === e || "overlay" === e) &&
                          t.scrollHeight > t.clientHeight
                        )
                          return t;
                      }
                      t = t.parentElement;
                    }
                    return null;
                  })(t.target ?? e)),
                  (this.maxScroll = this.scroller
                    ? this.scroller.scrollHeight - this.scroller.clientHeight
                    : document.documentElement.scrollHeight -
                      window.innerHeight));
              },
              { passive: !0, signal: t },
            ),
              e.addEventListener(
                "touchmove",
                (e) => {
                  let t = e.touches[0];
                  if (!t) return;
                  let n = t.clientY,
                    r = t.clientX - this.refX,
                    a = n - this.refY,
                    o = n > this.lastY,
                    l = n < this.lastY,
                    s = this.scroller
                      ? this.scroller.scrollTop
                      : (0, i.getScrollY)(),
                    u = this.maxScroll,
                    c = s <= 1 && o,
                    d = u > 0 && s >= u - 1 && l;
                  (null === this.locked && this.decide(r, a, c || d),
                    "scroll" === this.locked &&
                      (c || d) &&
                      ((this.refX = t.clientX),
                      (this.refY = n),
                      (this.locked = "effect"),
                      (this.effectFromBoundary = !0)),
                    "effect" === this.locked &&
                      this.effectFromBoundary &&
                      !(c || d) &&
                      ((this.refX = t.clientX),
                      (this.refY = n),
                      (this.locked = null),
                      (this.effectFromBoundary = !1)),
                    (this.lastY = n),
                    (this.isScrolling =
                      "scroll" === this.locked ||
                      null === this.locked ||
                      ("effect" === this.locked && !e.cancelable && !(c || d))),
                    "effect" === this.locked &&
                      e.cancelable &&
                      e.preventDefault());
                },
                { passive: !1, signal: t },
              ),
              e.addEventListener("touchend", a, { passive: !0, signal: t }),
              e.addEventListener("touchcancel", a, { passive: !0, signal: t }));
          }
          decide(e, t, n) {
            (10 > Math.abs(e) && 10 > Math.abs(t)) ||
              ((180 / Math.PI) * Math.atan2(Math.abs(e), Math.abs(t)) >
              this.toleranceDeg
                ? ((this.locked = "effect"), (this.effectFromBoundary = !1))
                : n
                  ? ((this.locked = "effect"), (this.effectFromBoundary = !0))
                  : (this.locked = "scroll"));
          }
        }
      },
      6349: function (e, t) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "VelocityController", {
            enumerable: !0,
            get: function () {
              return r;
            },
          }));
        let n = {
            adaptiveMax: 2800,
            adaptAlpha: 0.05,
            adaptDecay: 0.99,
            hardMin: 600,
            hardMax: 4e3,
          },
          i = (e) => e * e;
        class r {
          config;
          velState;
          lastDirX;
          lastDirY;
          lastNormVelocity;
          get dirX() {
            return this.lastDirX;
          }
          get dirY() {
            return this.lastDirY;
          }
          constructor(e) {
            ((this.config = e),
              (this.velState = { ...n }),
              (this.lastDirX = 0),
              (this.lastDirY = 0),
              (this.lastNormVelocity = 0));
          }
          update(e, t) {
            let {
              n,
              dirX: r,
              dirY: a,
            } = (function (e, t, n, r) {
              let a = Math.hypot(e, t),
                o = Math.max(n.hardMin, Math.min(n.hardMax, a));
              ((n.adaptiveMax = Math.max(o, n.adaptiveMax * n.adaptDecay)),
                (n.adaptiveMax += (o - n.adaptiveMax) * n.adaptAlpha),
                (n.adaptiveMax = Math.max(
                  n.hardMin,
                  Math.min(n.hardMax, n.adaptiveMax),
                )));
              let l = i(Math.min(1, a / Math.max(1, n.adaptiveMax))),
                s = 0,
                u = 0;
              return (
                r.x && r.y
                  ? a > 0 && ((s = e / a), (u = t / a))
                  : r.x
                    ? 0 !== e && (s = Math.sign(e))
                    : r.y && 0 !== t && (u = Math.sign(t)),
                { n: l, dirX: s, dirY: u }
              );
            })(e, t, this.velState, this.config.axes);
            ((this.lastNormVelocity = n),
              (this.lastDirX = r),
              (this.lastDirY = a));
          }
          reset() {
            ((this.lastDirX = 0),
              (this.lastDirY = 0),
              (this.lastNormVelocity = 0));
          }
          destroy() {
            this.reset();
          }
        }
      },
      6151: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "build", {
            enumerable: !0,
            get: function () {
              return o;
            },
          }));
        let i = n(2908),
          r = n(6969),
          a = n(9068);
        function o(e) {
          ((function (e) {
            let t = new WeakMap();
            e.addTrigger("click", (e, n, i, r) => {
              let [, a] = e,
                o = i.addEventListener(
                  n,
                  "click",
                  (i) => {
                    let o = a.pluginConfig?.click,
                      l = t.get(n) || new WeakMap();
                    t.set(n, l);
                    let s = (l.get(e) || 0) + 1;
                    switch ((l.set(e, s), o)) {
                      case "each":
                      default:
                        r(i);
                        break;
                      case "first":
                        1 === s && r(i);
                        break;
                      case "second":
                        2 === s && r(i);
                        break;
                      case "odd":
                        s % 2 == 1 && r(i);
                        break;
                      case "even":
                        s % 2 == 0 && r(i);
                        break;
                      case "custom": {
                        let e = a.pluginConfig?.custom;
                        e && s === e && r(i);
                      }
                    }
                  },
                  { delegate: !0 },
                );
              return () => {
                (o(), t.delete(n));
              };
            });
          })(e),
            (function (e) {
              let t = new WeakMap();
              e.addTrigger("hover", (e, n, r, a) => {
                let [, o] = e,
                  l = [],
                  s = o.pluginConfig?.multiTimeline,
                  u = o.pluginConfig?.eventMode,
                  c = "leave" !== u,
                  d = "enter" !== u;
                if (!0 === s)
                  return (
                    c &&
                      l.push(
                        r.addEventListener(n, "mouseenter", () =>
                          a({
                            type: "timeline-role",
                            role: i.TIMELINE_ROLE_NAMES.MOUSE_ENTER,
                          }),
                        ),
                      ),
                    d &&
                      l.push(
                        r.addEventListener(n, "mouseleave", () =>
                          a({
                            type: "timeline-role",
                            role: i.TIMELINE_ROLE_NAMES.MOUSE_LEAVE,
                          }),
                        ),
                      ),
                    () => {
                      (l.forEach((e) => e()), (l.length = 0));
                    }
                  );
                if (!1 === s) {
                  if (
                    void 0 === o.control ||
                    "togglePlayReverse" === o.control ||
                    "togglePlayReverseFlipEase" === o.control
                  ) {
                    let e =
                      "togglePlayReverseFlipEase" === o.control
                        ? "reverseFlipEase"
                        : "reverse";
                    if (
                      (c &&
                        l.push(
                          r.addEventListener(n, "mouseenter", () =>
                            a({ type: "playback-control", control: "play" }),
                          ),
                        ),
                      d)
                    ) {
                      let t = c ? e : "play";
                      l.push(
                        r.addEventListener(n, "mouseleave", () =>
                          a({ type: "playback-control", control: t }),
                        ),
                      );
                    }
                  } else
                    (c &&
                      l.push(r.addEventListener(n, "mouseenter", (e) => a(e))),
                      d &&
                        l.push(
                          r.addEventListener(n, "mouseleave", (e) => a(e)),
                        ));
                  return () => {
                    (l.forEach((e) => e()), (l.length = 0));
                  };
                }
                let f = (e, i) => {
                  if ((o.pluginConfig?.type ?? "mouseenter") !== i) return;
                  let r = o.pluginConfig?.hover || "each",
                    l = t.get(n) || new Map();
                  t.set(n, l);
                  let s = (l.get(i) || 0) + 1;
                  switch ((l.set(i, s), r)) {
                    case "each":
                    default:
                      a(e);
                      break;
                    case "first":
                      1 === s && a(e);
                      break;
                    case "second":
                      2 === s && a(e);
                      break;
                    case "odd":
                      s % 2 == 1 && a(e);
                      break;
                    case "even":
                      s % 2 == 0 && a(e);
                      break;
                    case "custom": {
                      let t = o.pluginConfig?.custom;
                      t && s === t && a(e);
                    }
                  }
                };
                return (
                  l.push(
                    r.addEventListener(n, "mouseenter", (e) => {
                      f(e, "mouseenter");
                    }),
                  ),
                  l.push(
                    r.addEventListener(n, "mouseover", (e) => {
                      f(e, "mouseover");
                    }),
                  ),
                  l.push(
                    r.addEventListener(n, "mouseleave", (e) => {
                      f(e, "mouseleave");
                    }),
                  ),
                  () => {
                    (l.forEach((e) => e()), (l.length = 0), t.delete(n));
                  }
                );
              });
            })(e),
            (0, a.buildMouseMove)(e),
            l(e, "navbar"),
            l(e, "dropdown"),
            e.addTrigger("load", (e, t, n, i) => {
              let a = e[1],
                o = !1,
                l = () => {
                  o || ((o = !0), i({ target: t }));
                };
              switch (a.pluginConfig?.triggerPoint) {
                case "immediate":
                  return (l(), r.noop);
                case "fullyLoaded":
                  if ("complete" === document.readyState) return (l(), r.noop);
                  return n.addEventListener(window, "load", l);
                default:
                  if (
                    "complete" === document.readyState ||
                    "interactive" === document.readyState
                  )
                    return (l(), r.noop);
                  return n.addEventListener(document, "DOMContentLoaded", l);
              }
            }),
            e.addTrigger("focus", (e, t, n, i) => {
              let r = e[1];
              return n.addEventListener(
                t,
                r.pluginConfig?.useFocusWithin ? "focusin" : "focus",
                i,
                { delegate: !r.pluginConfig?.useFocusWithin },
              );
            }),
            e.addTrigger("blur", (e, t, n, i) => {
              let r = e[1];
              return n.addEventListener(
                t,
                r.pluginConfig?.useFocusWithin ? "focusout" : "blur",
                i,
                { delegate: !r.pluginConfig?.useFocusWithin },
              );
            }),
            e.addTrigger("scroll", (e, t, n, i) => (i({ target: t }), r.noop)),
            e.addTrigger("custom", (e, t, n, i) => {
              let a = e[1],
                o = a.pluginConfig?.eventName;
              return o
                ? n.addEventListener(t, o, i, { delegate: !1, kind: "custom" })
                : r.noop;
            }),
            e.addTrigger("change", (e, t, n, i) =>
              n.addEventListener(t, "change", i),
            ));
        }
        function l(e, t) {
          e.addTrigger(t, (e, n, i, r) => {
            let a = e[1].pluginConfig?.event;
            return i.addEventListener(n, "IX3_COMPONENT_STATE_CHANGE", (e) => {
              let n = e.detail;
              if (!n || "object" != typeof n) return;
              let { component: i, state: o } = n;
              i === t &&
                o &&
                ((a && o !== a) || r({ type: "timeline-role", role: o }));
            });
          });
        }
      },
      3451: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "fireMouseMoveInterval", {
            enumerable: !0,
            get: function () {
              return h;
            },
          }));
        let i = n(2908),
          r = n(244),
          a = new Set(["x", "y"]),
          o = new Set(["scale", "scaleX", "scaleY"]),
          l = new WeakMap(),
          s = new WeakMap();
        function u(e) {
          if (e)
            for (let t in e) {
              if (!a.has(t)) continue;
              let n = e[t];
              ("string" == typeof n &&
                (n.startsWith("+=") || n.startsWith("-="))) ||
                (("number" == typeof n || "string" == typeof n) &&
                  (e[t] = `+=${n}`));
            }
        }
        let c = /^random\((.*)\)([a-z%]*)$/i,
          d = /^-?\d*\.?\d+$/;
        function f(e, t, n, i) {
          if (e)
            for (let r in e) {
              let l,
                s,
                u,
                f = e[r];
              if ("number" != typeof f && "string" != typeof f) continue;
              let p = !1,
                g = "string" == typeof f ? f : "";
              if (
                ("string" == typeof f &&
                  (f.startsWith("+=") || f.startsWith("-=")) &&
                  ((p = !0),
                  (g = (f.startsWith("-=") ? "-" : "") + f.slice(2))),
                a.has(r))
              ) {
                let e = "y" === r ? i : n;
                ((l = (n) => n * t * e), (s = !0));
              } else if ("rotation" === r) {
                let e = Math.abs(n) >= Math.abs(i) ? n : -i;
                ((l = (n) => n * t * e), (s = p));
              } else
                ((l = o.has(r)
                  ? p
                    ? (e) => e * t
                    : (e) => 1 + (e - 1) * t
                  : (e) => e * t),
                  (s = p));
              if ("string" == typeof f && g.startsWith("random(")) {
                let t = (function (e, t) {
                  let n = c.exec(e);
                  if (!n) return null;
                  let i = n[1] ?? "",
                    r = n[2] ?? "",
                    a = i.startsWith("[") && i.endsWith("]"),
                    o = (a ? i.slice(1, -1) : i)
                      .split(",")
                      .map((e) => e.trim());
                  if (!o.every((e) => d.test(e))) return null;
                  let l = o
                    .map((e, n) => {
                      let i = Number(e);
                      return !a && n >= 2 ? Math.abs(t(i) - t(0)) : t(i);
                    })
                    .join(", ");
                  return `random(${a ? `[${l}]` : l})${r}`;
                })(g, l);
                if (null == t) continue;
                e[r] = s ? `+=${t}` : t;
                continue;
              }
              let h = "";
              if ("number" == typeof f) u = f;
              else {
                if (isNaN((u = parseFloat(g)))) continue;
                h = g.replace(/^-?[\d.]+/, "");
              }
              let m = l(u);
              e[r] = s ? `+=${m}${h}` : m;
            }
        }
        function p(e) {
          for (let t of e) t();
          e.clear();
        }
        function g(e, t, n) {
          (e.activeIntervalEls.get(t)?.delete(n),
            e.intervalClones.has(n) &&
              (n.isConnected && n.remove(), e.intervalClones.delete(n)));
        }
        let h = ({
          coordinator: e,
          timelineId: t,
          element: n,
          options: o,
          animation: c,
        }) => {
          let d, h;
          if (!c.hasGsap()) return;
          let m = o.targetIndex;
          if (null == m) return;
          let y = (function (e, t) {
            let n = e.getOneShotTimelineContext(t),
              i = n?.timelineDef;
            if (!n || !i?.actions?.length) return null;
            let r = i.triggerMetadata,
              a =
                r?.pluginConfig?.type === "mouseMove" ? r.pluginConfig : void 0;
            return r?.role === "interval" || a
              ? {
                  oneShot: n,
                  mouseMoveMeta: a ?? { type: "mouseMove" },
                  axes: r?.axes,
                }
              : null;
          })(e, t);
          if (!y) return;
          let { oneShot: v, mouseMoveMeta: T, axes: b } = y,
            E =
              ((d = l.get(e)) ||
                ((d = {
                  activeIntervalEls: new Map(),
                  intervalClones: new Set(),
                  baselineValues: new Map(),
                }),
                l.set(e, d)),
              d),
            I = v
              .getFirstActionTargets(n)
              .filter((e) => !(0, r.isTransientIX3Clone)(e));
          if (!I.length) return;
          let S = [I[m % I.length]],
            O = S,
            w = S[0],
            A = E.activeIntervalEls.get(t);
          if ((A || ((A = new Set()), E.activeIntervalEls.set(t, A)), A.has(w)))
            O = [
              (function (e, t, n, i, a) {
                let o = e.cloneNode(!0);
                (o.removeAttribute("style"),
                  o.removeAttribute("id"),
                  o.removeAttribute("data-w-id"),
                  o.setAttribute(r.TRANSIENT_IX3_CLONE_ATTR, "true"),
                  (o.style.position = "absolute"),
                  (o.style.margin = "0"),
                  (o.style.pointerEvents = "none"),
                  e.insertAdjacentElement("beforebegin", o));
                let l = t.baselineValues.get(a)?.get(e);
                return (
                  l && i.set(o, { ...l }),
                  t.intervalClones.add(o),
                  n.add(o),
                  o
                );
              })(w, E, A, c, t),
            ];
          else {
            var R;
            let { clearProps: e, baselineProps: n } = (function (e, t) {
              let n = [],
                i = new Set();
              for (let r of e.timelineDef.actions)
                for (let o in r.properties) {
                  let l = e.getActionTweenConfig(r, o, [t]);
                  if (l) {
                    for (let e of [l.to, l.from])
                      if (e)
                        for (let t of Object.keys(e))
                          a.has(t) ? n.push(t) : i.add(t);
                  }
                }
              return { clearProps: n, baselineProps: i };
            })(v, w);
            if (n.size > 0) {
              let e = {};
              for (let t of n) e[t] = c.getProperty(w, t);
              let i = E.baselineValues.get(t);
              (i || ((i = new WeakMap()), E.baselineValues.set(t, i)),
                i.set(w, e));
            }
            (0 !== e.length && c.set(w, { clearProps: e.join(",") }), A.add(w));
          }
          let C = O[0],
            M = b?.x === !1 && b?.y === !1,
            _ = M || (b?.x ?? T?.setMouseX ?? !0),
            N = M || (b?.y ?? T?.setMouseY ?? !0),
            P = (0, i.narrowMouseMoveIntervalPayload)(o.pluginPayload),
            x = P.cursorPos,
            L = P.velocityFactor,
            k = P.dirX ?? 0,
            F = P.dirY ?? 0,
            U = new Set(),
            V = v.buildActionTimeline({
              targets: O,
              cleanupBucket: U,
              varsTransform: (e, t, n) => {
                t.pluginConfig?.type === "mouseMove" &&
                t.pluginConfig.velocityInfluence
                  ? null != L &&
                    (f(n.to, L, k, F), n.from && f(n.from, L, k, F))
                  : (u(n.to), n.from && u(n.from));
              },
              beforeTweens: (e) => {
                !(function (e, t, n, i, r, a, o, l) {
                  let [s] = n;
                  if (s && (e.set(s, { zIndex: i + 1 + r }, 0), a && (o || l)))
                    for (let i of n) {
                      let n = i.getBoundingClientRect(),
                        r = {};
                      if (o) {
                        let e = Number(t.getProperty(i, "x")) || 0;
                        r.x = a.x - (n.left + n.width / 2 - e);
                      }
                      if (l) {
                        let e = Number(t.getProperty(i, "y")) || 0;
                        r.y = a.y - (n.top + n.height / 2 - e);
                      }
                      e.set(i, r, 0);
                    }
                })(e, c, O, I.length, m, x, _, N);
              },
            });
          if (!V) {
            (p(U), g(E, t, C));
            return;
          }
          let D = null,
            G = !1,
            j = (e) => {
              G || ((G = !0), D?.(), e && V.kill(), p(U), g(E, t, C));
            };
          ((D = v.registerCleanup(() => j(!0))),
            V.eventCallback("onComplete", () => {
              j(!1);
            }),
            (R = v.registerCleanup),
            (h = s.get(e)) || ((h = new Set()), s.set(e, h)),
            h.has(t) ||
              (h.add(t),
              R(() => {
                let e = E.activeIntervalEls.get(t);
                if (e)
                  for (let t of e)
                    E.intervalClones.has(t) &&
                      (t.isConnected && t.remove(), E.intervalClones.delete(t));
                (E.activeIntervalEls.delete(t),
                  E.baselineValues.delete(t),
                  h.delete(t));
              })));
        };
      },
      9068: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "buildMouseMove", {
            enumerable: !0,
            get: function () {
              return T;
            },
          }));
        let i = n(2908),
          r = n(6969),
          a = n(657),
          o = n(6349),
          l = n(6675),
          s = n(3451),
          u = null,
          c = 0,
          d = 0,
          f = 0,
          p = null,
          g = (e) => Math.max(0, Math.min(1, e));
        function h(e, t, n) {
          let i = e.tween;
          ((e.tween = null),
            (e.takeoverTarget = null),
            (e.proxy.value = t),
            (e.lastValue = t),
            e.channel?.setProgress(t),
            n && i?.kill());
        }
        function m(e, t) {
          if (e.tween)
            return e.proxy.value === t
              ? void h(e, t, !0)
              : (e.tweenTarget - e.proxy.value) * (t - e.proxy.value) < 0
                ? void h(e, t, !0)
                : void (e.takeoverTarget = t);
          ((e.proxy.value = t), (e.lastValue = t), e.channel?.setProgress(t));
        }
        function y(e) {
          let t = e.tween;
          ((e.tween = null), (e.takeoverTarget = null), t?.kill());
        }
        function v(e, t, n, i) {
          (y(t), (t.lastValue = t.proxy.value), (t.tweenTarget = n));
          let r = e.to(t.proxy, {
            value: n,
            duration: i,
            ease: "power2.out",
            onUpdate: () => {
              var e;
              let n = t.proxy.value,
                i = t.takeoverTarget;
              if (
                null != i &&
                ((e = t.lastValue),
                n === i || e === i || (e < i && n > i) || (e > i && n < i))
              )
                return void h(t, i, !0);
              ((t.lastValue = n), t.channel?.setImmediate(n));
            },
            onComplete: () => {
              let e = t.takeoverTarget;
              ((t.tween = null),
                (t.takeoverTarget = null),
                null != e && h(t, e, !1));
            },
          });
          if (!r) return void h(t, n, !1);
          t.tween = r;
        }
        function T(e) {
          e.addTrigger("mouse-move", (e, t, n, h) => {
            let T = e[1].pluginConfig,
              b = e[2]?.[0] === i.IX3_WF_EXTENSION_KEYS.VIEWPORT;
            return (
              h({
                type: "continuous",
                setup: (e) => {
                  let n,
                    h,
                    { animation: E } = e;
                  if (!E.hasGsap() || !E.hasObserver()) return r.noop;
                  let I = b
                    ? ((f += 1),
                      p ||
                        ((p = () => {
                          ((c = window.innerWidth), (d = window.innerHeight));
                        })(),
                        window.addEventListener("resize", p)),
                      (h = !1),
                      () => {
                        !h &&
                          ((h = !0),
                          0 === (f = Math.max(0, f - 1)) &&
                            p &&
                            (window.removeEventListener("resize", p),
                            (p = null)));
                      })
                    : r.noop;
                  e.registerIntervalHandler(
                    i.IX3_WF_EXTENSION_KEYS.MOUSE_MOVE,
                    s.fireMouseMoveInterval,
                  );
                  let S = T?.smoothness ?? 50,
                    O = (T?.restingState?.x ?? 50) / 100,
                    w = (T?.restingState?.y ?? 50) / 100,
                    A = e.registerChannel({
                      role: i.TIMELINE_ROLE_NAMES.MOUSE_X,
                      initialValue: O,
                      element: t,
                      smoothing: S,
                    }),
                    R = e.registerChannel({
                      role: i.TIMELINE_ROLE_NAMES.MOUSE_Y,
                      initialValue: w,
                      element: t,
                      smoothing: S,
                    }),
                    C = new AbortController(),
                    { signal: M } = C,
                    _ = e.getMetadata(i.TIMELINE_ROLE_NAMES.INTERVAL),
                    N = {
                      x: _?.axes?.x !== !1 || _?.axes?.y === !1,
                      y: _?.axes?.y !== !1 || _?.axes?.x === !1,
                    },
                    P = _
                      ? new l.IntervalController({
                          distance:
                            _.distance ??
                            i.DEFAULT_MOUSE_MOVE_INTERVAL_DISTANCE,
                          axes: N,
                          channelManager: e,
                          element: t,
                          signal: M,
                        })
                      : null,
                    x = P ? new o.VelocityController({ axes: N }) : null,
                    L = {
                      proxy: { value: O },
                      channel: A,
                      tween: null,
                      takeoverTarget: null,
                      lastValue: O,
                      tweenTarget: O,
                    },
                    k = {
                      proxy: { value: w },
                      channel: R,
                      tween: null,
                      takeoverTarget: null,
                      lastValue: w,
                      tweenTarget: w,
                    },
                    F = !1,
                    U = (e, t) => {
                      var n;
                      let i =
                        ((n = L.proxy.value),
                        0.1 +
                          0.5 *
                            Math.min(
                              Math.max(
                                Math.abs(e - n),
                                Math.abs(t - k.proxy.value),
                              ) / 0.5,
                              1,
                            ));
                      (v(E, L, e, i), v(E, k, t, i));
                    },
                    V =
                      (null === u &&
                        (u =
                          "ontouchstart" in window ||
                          navigator.maxTouchPoints > 0),
                      u),
                    D = b ? document.documentElement : t,
                    G = null;
                  V && (G = new a.TouchScrollGuard(D, M));
                  let j = null,
                    B = () => {
                      j = null;
                    },
                    X = () => (j || (j = t.getBoundingClientRect()), j);
                  if (!b) {
                    let e = new ResizeObserver(B);
                    (e.observe(t),
                      M.addEventListener("abort", () => e.disconnect()),
                      window.addEventListener("scroll", B, {
                        passive: !0,
                        capture: !0,
                        signal: M,
                      }),
                      window.visualViewport &&
                        window.visualViewport.addEventListener("resize", B, {
                          signal: M,
                        }));
                  }
                  try {
                    if (
                      !(n = E.createObserver({
                        target: D,
                        type: V ? "pointer,touch" : "pointer",
                        tolerance: 0,
                        onMove: (n) => {
                          let r, a;
                          if (G?.isScrolling || !e.isPreviewEnabled()) return;
                          let o = n.x ?? 0,
                            l = n.y ?? 0;
                          if (b)
                            ((r = g(o / Math.max(1, c))),
                              (a = g(l / Math.max(1, d))));
                          else {
                            let e = X();
                            ((r = g((o - e.left) / Math.max(1, e.width))),
                              (a = g((l - e.top) / Math.max(1, e.height))));
                          }
                          (F ? (m(L, r), m(k, a)) : ((F = !0), U(r, a)),
                            e.publishChannel(
                              i.MOUSE_MOVE_CHANNELS.POSITION,
                              { x: o, y: l, triggerEl: t, isViewport: b },
                              t,
                            ),
                            x &&
                              (x.update(n.velocityX, n.velocityY),
                              P.update({
                                x: o,
                                y: l,
                                velocityFactor: x.lastNormVelocity,
                                dirX: x.dirX,
                                dirY: x.dirY,
                              })));
                        },
                      }))
                    )
                      return (
                        P?.destroy(),
                        x?.destroy(),
                        C.abort(),
                        I(),
                        r.noop
                      );
                  } catch (e) {
                    return (P?.destroy(), x?.destroy(), C.abort(), I(), r.noop);
                  }
                  let z = () => {
                    e.isPreviewEnabled() &&
                      ((F = !1),
                      U(O, w),
                      x?.reset(),
                      e.publishChannel(i.MOUSE_MOVE_CHANNELS.LEAVE, void 0, t),
                      P?.reset());
                  };
                  return (
                    b
                      ? (D.addEventListener("mouseleave", z, { signal: M }),
                        window.addEventListener("blur", z, { signal: M }))
                      : t.addEventListener("mouseleave", z, { signal: M }),
                    D.addEventListener("touchend", z, {
                      signal: M,
                      passive: !0,
                    }),
                    D.addEventListener("touchcancel", z, {
                      signal: M,
                      passive: !0,
                    }),
                    () => {
                      (n.kill(),
                        C.abort(),
                        y(L),
                        y(k),
                        P?.destroy(),
                        x?.destroy(),
                        I());
                    }
                  );
                },
              }),
              r.noop
            );
          });
        }
      },
      6969: function (e, t) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var n = {
          getScrollY: function () {
            return u;
          },
          initScrollCache: function () {
            return s;
          },
          noop: function () {
            return r;
          },
        };
        for (var i in n)
          Object.defineProperty(t, i, { enumerable: !0, get: n[i] });
        let r = () => {},
          a = 0,
          o = 0,
          l = null;
        function s() {
          ((o += 1),
            l ||
              ((l = () => {
                a = window.scrollY;
              }),
              (a = window.scrollY),
              window.addEventListener("scroll", l, { passive: !0 })));
          let e = !1;
          return () => {
            !e &&
              ((e = !0),
              0 === (o = Math.max(0, o - 1)) &&
                l &&
                (window.removeEventListener("scroll", l), (l = null)));
          };
        }
        function u() {
          return a;
        }
      },
      2908: function (e, t, n) {
        "use strict";
        function i(e, t) {
          return (
            Object.keys(e).forEach(function (n) {
              "default" === n ||
                Object.prototype.hasOwnProperty.call(t, n) ||
                Object.defineProperty(t, n, {
                  enumerable: !0,
                  get: function () {
                    return e[n];
                  },
                });
            }),
            e
          );
        }
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "CORE_PLUGIN_INFO", {
            enumerable: !0,
            get: function () {
              return r;
            },
          }),
          i(n(2387), t),
          i(n(4121), t),
          i(n(936), t));
        let r = { namespace: "wf", pluginId: "core", version: "1.0.0" };
      },
      4121: function (e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var i = {
          createLoadedMouseFollowActionNormalizer: function () {
            return y;
          },
          forTestSuite: function () {
            return v;
          },
          getGroupedMouseFollowConfig: function () {
            return l;
          },
          getUnpairedMouseFollowAction: function () {
            return f;
          },
          getUnpairedMouseFollowConfig: function () {
            return s;
          },
          remapMouseFollowActionGroupsInTimelines: function () {
            return m;
          },
          setGroupedMouseFollowActionConfig: function () {
            return d;
          },
          setMouseFollowActionConfig: function () {
            return c;
          },
          stripMouseFollowActionInstanceIds: function () {
            return p;
          },
          stripMouseFollowConfigInstanceIds: function () {
            return o;
          },
        };
        for (var r in i)
          Object.defineProperty(t, r, { enumerable: !0, get: i[r] });
        let a = n(2387);
        function o(e) {
          let { groupId: t, syncedActionId: n, ...i } = e;
          return i;
        }
        function l(e, t, n) {
          let i = { ...o(e), groupId: t };
          return (
            n?.axis !== void 0 && (i.axis = n.axis),
            n?.followMode !== void 0 && (i.followMode = n.followMode),
            i
          );
        }
        function s(e, t = e.axis) {
          let { syncedActionId: n, ...i } = e,
            r =
              "full" === i.followMode && t
                ? (0, a.getSingleAxisMouseFollowMode)(t)
                : i.followMode;
          return { ...i, ...(void 0 !== r ? { followMode: r } : {}) };
        }
        function u(e, t) {
          let n = (0, a.getMouseFollowConfig)(e);
          if (!n) return e;
          let i = t(n);
          return i === n
            ? e
            : {
                ...e,
                properties: {
                  ...e.properties,
                  [a.IX3_WF_EXTENSION_KEYS.MOUSE_FOLLOW]: i,
                },
              };
        }
        function c(e, t) {
          return {
            ...e,
            properties: {
              ...e.properties,
              [a.IX3_WF_EXTENSION_KEYS.MOUSE_FOLLOW]: t,
            },
          };
        }
        function d(e, t, n, i) {
          return c(e, l(t, n, i));
        }
        function f(e, t) {
          return u(e, (e) => s(e, t));
        }
        function p(e) {
          return u(e, o);
        }
        function g(e, t) {
          let n = {};
          return (i, r = i.id) =>
            u(i, (i) => {
              var a;
              let o =
                  i.groupId ??
                  (i.syncedActionId
                    ? t[(a = i.syncedActionId)]
                      ? [r, a].sort().join(":")
                      : `single:${r}`
                    : `single:${r}`),
                s = n[o] ?? e(o);
              return ((n[o] = s), l(i, s));
            });
        }
        function h(e, t, n) {
          let i = g(
            () => t(),
            n ?? Object.fromEntries(e.map((e) => [e.id, e.id])),
          );
          return (e, t) => i(e, t ?? e.id);
        }
        function m(
          e,
          { generateGroupId: t, actionIdMap: n, mapAction: i = (e) => e },
        ) {
          let r = h(
            e.flatMap((e) => e.actions ?? []),
            t,
            n,
          );
          return e.map((e) => {
            let t = !1,
              n = e.actions?.map((e) => {
                let n = e.id,
                  a = r(i(e), n);
                return ((t = t || a !== e), a);
              });
            return t && n ? { ...e, actions: n } : e;
          });
        }
        function y(e) {
          let t = g((e) => e, Object.fromEntries(e.map((e) => [e.id, e.id])));
          return (e, n) => {
            let i = t(e);
            return n ? u(i, (e) => (e.axis ? e : { ...e, axis: n })) : i;
          };
        }
        let v = { createMouseFollowActionGroupRemapper: h };
      },
      936: function (e, t) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var n = {
          TRANSIENT_IX3_CLONE_ATTR: function () {
            return r;
          },
          isTransientIX3Clone: function () {
            return a;
          },
        };
        for (var i in n)
          Object.defineProperty(t, i, { enumerable: !0, get: n[i] });
        let r = "data-ix3-clone",
          a = (e) => !!e.closest?.(`[${r}]`);
      },
      2387: function (e, t) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var n,
          i,
          r,
          a,
          o = {
            COMPONENT_TIMELINE_ROLES: function () {
              return A;
            },
            DEFAULT_MOUSE_FOLLOW_ANCHOR: function () {
              return d;
            },
            DEFAULT_MOUSE_MOVE_INTERVAL_DISTANCE: function () {
              return f;
            },
            HOVER_TIMELINE_ROLES: function () {
              return R;
            },
            IX3_WF_EXTENSION_KEYS: function () {
              return n;
            },
            MOUSE_MOVE_CHANNELS: function () {
              return O;
            },
            MOUSE_MOVE_TIMELINE_ROLES: function () {
              return h;
            },
            TIMELINE_ROLE_NAMES: function () {
              return p;
            },
            TargetScope: function () {
              return i;
            },
            VELOCITY_CAPABLE_PROPS: function () {
              return m;
            },
            canUseVelocityInfluenceProperty: function () {
              return v;
            },
            getEffectiveFollowMode: function () {
              return u;
            },
            getMouseFollowConfig: function () {
              return s;
            },
            getMouseMoveTimelineContext: function () {
              return g;
            },
            getOppositeMouseFollowAxis: function () {
              return E;
            },
            getSingleAxisMouseFollowMode: function () {
              return c;
            },
            isMouseMoveIntervalRole: function () {
              return T;
            },
            isVelocityInfluenceEnabled: function () {
              return y;
            },
            mouseFollowAxisToRole: function () {
              return I;
            },
            mouseFollowRoleToAxis: function () {
              return b;
            },
            mouseFollowRoleToSiblingRole: function () {
              return S;
            },
            narrowMouseMoveIntervalPayload: function () {
              return w;
            },
          };
        for (var l in o)
          Object.defineProperty(t, l, { enumerable: !0, get: o[l] });
        function s(e) {
          let t = e?.properties?.["wf:mouse-follow"];
          if (!("object" != typeof t || null === t || Array.isArray(t)))
            return t;
        }
        function u(e) {
          return e?.followMode ?? "full";
        }
        function c(e) {
          return "x" === e ? "x-only" : "y-only";
        }
        (((r = n || (n = {})).CLASS = "wf:class"),
          (r.BODY = "wf:body"),
          (r.ID = "wf:id"),
          (r.TRIGGER_ONLY = "wf:trigger-only"),
          (r.TRIGGER_ONLY_PARENT = "wf:trigger-only-parent"),
          (r.SELECTOR = "wf:selector"),
          (r.ATTRIBUTE = "wf:attribute"),
          (r.INST = "wf:inst"),
          (r.ANY_ELEMENT = "wf:any-element"),
          (r.VIEWPORT = "wf:viewport"),
          (r.STYLE = "wf:style"),
          (r.TRANSFORM = "wf:transform"),
          (r.LOTTIE = "wf:lottie"),
          (r.SPLINE = "wf:spline"),
          (r.VARIABLE = "wf:variable"),
          (r.RIVE = "wf:rive"),
          (r.ANIMATE_RIVE = "wf:animate-rive"),
          (r.MOUSE_FOLLOW = "wf:mouse-follow"),
          (r.CLICK = "wf:click"),
          (r.HOVER = "wf:hover"),
          (r.LOAD = "wf:load"),
          (r.FOCUS = "wf:focus"),
          (r.BLUR = "wf:blur"),
          (r.SCROLL = "wf:scroll"),
          (r.CUSTOM = "wf:custom"),
          (r.CHANGE = "wf:change"),
          (r.MOUSE_MOVE = "wf:mouse-move"),
          (r.NAVBAR = "wf:navbar"),
          (r.DROPDOWN = "wf:dropdown"),
          (r.PREFERS_REDUCED_MOTION = "wf:prefersReducedMotion"),
          (r.WEBFLOW_BREAKPOINTS = "wf:webflowBreakpoints"),
          (r.CUSTOM_MEDIA_QUERY = "wf:customMediaQuery"),
          (r.COLOR_SCHEME = "wf:colorScheme"),
          (r.ELEMENT_DATA_ATTRIBUTE = "wf:elementDataAttribute"),
          (r.CURRENT_TIME = "wf:currentTime"),
          (r.ELEMENT_STATE = "wf:elementState"),
          ((a = i || (i = {})).ALL = "all"),
          (a.PARENT = "parent"),
          (a.CHILDREN = "children"),
          (a.SIBLINGS = "siblings"),
          (a.NEXT = "next"),
          (a.PREVIOUS = "previous"),
          (a.FIRST_ANCESTOR = "first-ancestor"),
          (a.FIRST_DESCENDANT = "first-descendant"),
          (a.DESCENDANTS = "descendants"),
          (a.ANCESTORS = "ancestors"));
        let d = "50% 50%",
          f = 100,
          p = {
            MOUSE_X: "mouseX",
            MOUSE_Y: "mouseY",
            INTERVAL: "interval",
            OPEN: "open",
            CLOSE: "close",
            MOUSE_ENTER: "mouseEnter",
            MOUSE_LEAVE: "mouseLeave",
          };
        function g(e) {
          return e === p.MOUSE_X
            ? { kind: "mouse-x", role: e, axis: "x", siblingRole: p.MOUSE_Y }
            : e === p.MOUSE_Y
              ? { kind: "mouse-y", role: e, axis: "y", siblingRole: p.MOUSE_X }
              : e === p.INTERVAL
                ? { kind: "interval", role: e }
                : { kind: "other", role: e ?? void 0 };
        }
        let h = {
            MOUSE_X: {
              role: p.MOUSE_X,
              label: "Mouse X",
              usePercentCanvas: !0,
            },
            MOUSE_Y: {
              role: p.MOUSE_Y,
              label: "Mouse Y",
              usePercentCanvas: !0,
            },
            INTERVAL: { role: p.INTERVAL, label: "Interval" },
          },
          m = new Set([
            "x",
            "y",
            "scale",
            "scaleX",
            "scaleY",
            "rotation",
            "skewX",
            "skewY",
            "opacity",
          ]);
        function y(e) {
          return (
            e?.pluginConfig?.type === "mouseMove" &&
            !!e.pluginConfig.velocityInfluence
          );
        }
        function v(e) {
          return m.has(e);
        }
        function T(e) {
          return "interval" === g(e).kind;
        }
        function b(e) {
          let t = g(e);
          return "mouse-x" === t.kind || "mouse-y" === t.kind ? t.axis : null;
        }
        function E(e) {
          return "x" === e ? "y" : "x";
        }
        function I(e) {
          return "x" === e ? p.MOUSE_X : p.MOUSE_Y;
        }
        function S(e) {
          let t = g(e);
          return "mouse-x" === t.kind || "mouse-y" === t.kind
            ? t.siblingRole
            : null;
        }
        let O = {
          POSITION: "wf:mouse-move:position",
          LEAVE: "wf:mouse-move:leave",
        };
        function w(e) {
          if ("object" != typeof e || null === e) return {};
          let t = {},
            n = e.cursorPos;
          return (
            "object" == typeof n &&
              null !== n &&
              "number" == typeof n.x &&
              "number" == typeof n.y &&
              (t.cursorPos = { x: n.x, y: n.y }),
            "number" == typeof e.velocityFactor &&
              (t.velocityFactor = e.velocityFactor),
            "number" == typeof e.dirX && (t.dirX = e.dirX),
            "number" == typeof e.dirY && (t.dirY = e.dirY),
            t
          );
        }
        let A = {
            OPEN: {
              role: p.OPEN,
              label: "Open",
              allowedControls: ["play", "restart"],
              defaultControl: "play",
            },
            CLOSE: {
              role: p.CLOSE,
              label: "Close",
              allowedControls: [
                "play",
                "restart",
                "reverse",
                "reverseFlipEase",
              ],
              allowedControlsWhenReusing: ["reverse", "reverseFlipEase"],
              defaultControl: "play",
              defaultControlWhenReusing: "reverseFlipEase",
              autoReusesRole: p.OPEN,
            },
          },
          R = {
            MOUSE_ENTER: {
              role: p.MOUSE_ENTER,
              label: "Hover in actions",
              allowedControls: ["play", "restart"],
              defaultControl: "play",
            },
            MOUSE_LEAVE: {
              role: p.MOUSE_LEAVE,
              label: "Hover out actions",
              allowedControls: [
                "play",
                "restart",
                "reverse",
                "reverseFlipEase",
              ],
              defaultControl: "play",
            },
          };
      },
      1983: function (e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var i = {
          CORE_OPERATORS: function () {
            return a.CORE_OPERATORS;
          },
          DEFAULTS: function () {
            return a.DEFAULTS;
          },
          DEFAULT_CUSTOM_EASE: function () {
            return a.DEFAULT_CUSTOM_EASE;
          },
          EASE_DEFAULTS: function () {
            return a.EASE_DEFAULTS;
          },
          PERCENT_CANVAS_DURATION_S: function () {
            return a.PERCENT_CANVAS_DURATION_S;
          },
          RELATIONSHIP_TYPES: function () {
            return a.RELATIONSHIP_TYPES;
          },
          STANDARD_TRIGGER_ALLOWED_CONTROLS: function () {
            return a.STANDARD_TRIGGER_ALLOWED_CONTROLS;
          },
          TimelineControlType: function () {
            return a.TimelineControlType;
          },
          TweenType: function () {
            return a.TweenType;
          },
          isValidControlType: function () {
            return a.isValidControlType;
          },
          tweenTypeFromName: function () {
            return a.tweenTypeFromName;
          },
          tweenTypeToName: function () {
            return a.tweenTypeToName;
          },
        };
        for (var r in i)
          Object.defineProperty(t, r, { enumerable: !0, get: i[r] });
        let a = n(6213);
        function o(e, t) {
          return (
            Object.keys(e).forEach(function (n) {
              "default" === n ||
                Object.prototype.hasOwnProperty.call(t, n) ||
                Object.defineProperty(t, n, {
                  enumerable: !0,
                  get: function () {
                    return e[n];
                  },
                });
            }),
            e
          );
        }
        (o(n(4182), t), o(n(3646), t), o(n(5686), t), o(n(3049), t));
      },
      3049: function (e, t) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
      },
      3646: function (e, t) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var n = {
          ConditionCategoryBuilder: function () {
            return s;
          },
          DesignBuilder: function () {
            return u;
          },
          TargetCategoryBuilder: function () {
            return o;
          },
          TriggerCategoryBuilder: function () {
            return l;
          },
        };
        for (var i in n)
          Object.defineProperty(t, i, { enumerable: !0, get: n[i] });
        class r {
          categoryBuilder;
          groupConfig;
          properties;
          constructor(e, t) {
            ((this.categoryBuilder = e),
              (this.groupConfig = t),
              (this.properties = []));
          }
          addProperty(e, t, n) {
            return (
              this.properties.push({
                id: e,
                schema: { ...t, description: n?.description || t.description },
              }),
              this
            );
          }
          addGroup(e) {
            return (
              this.categoryBuilder.finalizeGroup({
                ...this.groupConfig,
                properties: this.properties,
              }),
              this.categoryBuilder.clearCurrentGroupBuilder(),
              this.categoryBuilder.addGroup(e)
            );
          }
          getGroupData() {
            return { ...this.groupConfig, properties: this.properties };
          }
        }
        class a {
          categoryId;
          config;
          displayGroups;
          currentGroupBuilder;
          constructor(e, t) {
            ((this.categoryId = e),
              (this.config = t),
              (this.displayGroups = []),
              (this.currentGroupBuilder = null));
          }
          addGroup(e) {
            return (
              this.currentGroupBuilder &&
                this.finalizeGroup(this.currentGroupBuilder.getGroupData()),
              (this.currentGroupBuilder = new r(this, e)),
              this.currentGroupBuilder
            );
          }
          finalizeGroup(e) {
            this.displayGroups.push(e);
          }
          clearCurrentGroupBuilder() {
            this.currentGroupBuilder = null;
          }
          getDefinition() {
            this.currentGroupBuilder &&
              (this.finalizeGroup(this.currentGroupBuilder.getGroupData()),
              (this.currentGroupBuilder = null));
            let e = this.displayGroups.flatMap((e) => e.properties);
            return {
              id: this.categoryId,
              properties: e,
              propertyType: this.config.propertyType || "tween",
              displayGroups: this.displayGroups,
            };
          }
        }
        class o {
          categoryId;
          config;
          targets;
          constructor(e, t) {
            ((this.categoryId = e), (this.config = t), (this.targets = []));
          }
          addTargetSchema(e, t) {
            return (this.targets.push({ id: e, schema: t }), this);
          }
          getDefinition() {
            return {
              id: this.categoryId,
              label: this.config.label,
              order: this.config.order,
              targets: this.targets,
            };
          }
        }
        class l {
          categoryId;
          config;
          triggers;
          constructor(e, t) {
            ((this.categoryId = e), (this.config = t), (this.triggers = []));
          }
          addTriggerSchema(e, t) {
            return (this.triggers.push({ id: e, schema: t }), this);
          }
          getDefinition() {
            return {
              id: this.categoryId,
              label: this.config.label,
              order: this.config.order,
              triggers: this.triggers,
            };
          }
        }
        class s {
          categoryId;
          config;
          conditions;
          constructor(e, t) {
            ((this.categoryId = e), (this.config = t), (this.conditions = []));
          }
          addConditionSchema(e, t) {
            return (this.conditions.push({ id: e, schema: t }), this);
          }
          getDefinition() {
            return {
              id: this.categoryId,
              label: this.config.label,
              order: this.config.order,
              conditions: this.conditions,
            };
          }
        }
        class u {
          baseInfo;
          categories = new Map();
          targetCategories = new Map();
          triggerCategories = new Map();
          conditionCategories = new Map();
          actionPresets = new Map();
          reducerHooks = [];
          constructor(e) {
            this.baseInfo = e;
          }
          addCategory(e, t = {}) {
            let n = new a(e, t);
            return (this.categories.set(e, n), n);
          }
          addTargetCategory(e, t) {
            let n = new o(e, t);
            return (this.targetCategories.set(e, n), n);
          }
          addTriggerCategory(e, t) {
            let n = new l(e, t);
            return (this.triggerCategories.set(e, n), n);
          }
          addConditionCategory(e, t) {
            let n = new s(e, t);
            return (this.conditionCategories.set(e, n), n);
          }
          addActionPreset(e, t) {
            let n = `${this.baseInfo.namespace}:${e}`;
            return (
              this.actionPresets.set(n, {
                id: n,
                name: t.name,
                description: t.description,
                icon: t.icon,
                timelineIcon: t.timelineIcon,
                type: "plugin",
                categoryId: t.categoryId,
                action: t.action,
                customEditor: t.customEditor,
                targetFilter: t.targetFilter,
                designerTargetFilter: t.designerTargetFilter,
                customTargetComponent: t.customTargetComponent,
              }),
              this
            );
          }
          addReducerHooks(e) {
            return (this.reducerHooks.push(e), this);
          }
          buildDesign() {
            let e = [];
            for (let [, t] of this.categories) e.push(t.getDefinition());
            let t = [];
            for (let [, e] of this.targetCategories) t.push(e.getDefinition());
            let n = [];
            for (let [, e] of this.triggerCategories) n.push(e.getDefinition());
            let i = [];
            for (let [, e] of this.conditionCategories)
              i.push(e.getDefinition());
            let r = [];
            for (let [, e] of this.actionPresets) r.push(e);
            return {
              namespace: this.baseInfo.namespace,
              pluginId: this.baseInfo.pluginId,
              version: this.baseInfo.version,
              displayName: this.baseInfo.displayName,
              description: this.baseInfo.description,
              categories: e.length > 0 ? e : void 0,
              targetCategories: t.length > 0 ? t : void 0,
              triggerCategories: n.length > 0 ? n : void 0,
              conditionCategories: i.length > 0 ? i : void 0,
              actionPresets: r.length > 0 ? r : void 0,
              reducerHooks:
                this.reducerHooks.length > 0 ? [...this.reducerHooks] : void 0,
            };
          }
        }
      },
      4182: function (e, t) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "RuntimeBuilder", {
            enumerable: !0,
            get: function () {
              return n;
            },
          }));
        class n {
          baseInfo;
          extensions = [];
          lifecycle = {};
          constructor(e) {
            this.baseInfo = e;
          }
          addTrigger(e, t) {
            let n = `${this.baseInfo.namespace}:${e}`;
            return (
              this.extensions.push({
                extensionPoint: "trigger",
                id: n,
                triggerType: n,
                implementation: t,
              }),
              this
            );
          }
          addAction(e, t) {
            let n = `${this.baseInfo.namespace}:${e}`;
            return (
              this.extensions.push({
                extensionPoint: "action",
                id: n,
                actionType: n,
                implementation: t,
              }),
              this
            );
          }
          addTargetResolver(e, t) {
            let n = `${this.baseInfo.namespace}:${e}`;
            return (
              this.extensions.push({
                extensionPoint: "targetResolver",
                id: n,
                resolverType: n,
                implementation: t,
              }),
              this
            );
          }
          addCondition(e, t) {
            let n = `${this.baseInfo.namespace}:${e}`;
            return (
              this.extensions.push({
                extensionPoint: "condition",
                id: n,
                conditionType: n,
                implementation: t,
              }),
              this
            );
          }
          onInitialize(e) {
            return ((this.lifecycle.initialize = e), this);
          }
          onActivate(e) {
            return ((this.lifecycle.activate = e), this);
          }
          onDeactivate(e) {
            return ((this.lifecycle.deactivate = e), this);
          }
          onDispose(e) {
            return ((this.lifecycle.dispose = e), this);
          }
          createManifest() {
            let e = this.extensions.map((e) => `${e.extensionPoint}:${e.id}`);
            return {
              id: [this.baseInfo.namespace, this.baseInfo.pluginId],
              version: this.baseInfo.version,
              name: this.baseInfo.displayName || this.baseInfo.pluginId,
              description: this.baseInfo.description || "",
              dependencies: this.baseInfo.dependencies,
              features: e,
            };
          }
          buildRuntime() {
            return {
              manifest: this.createManifest(),
              extensions: this.extensions,
              ...this.lifecycle,
            };
          }
        }
      },
      5686: function (e, t) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "TransformBuilder", {
            enumerable: !0,
            get: function () {
              return n;
            },
          }));
        class n {
          baseInfo;
          triggerTransforms = new Map();
          targetTransforms = new Map();
          conditionTransforms = new Map();
          actionTransforms = new Map();
          constructor(e) {
            this.baseInfo = e;
          }
          addTargetTransform(e, t) {
            return (
              this.targetTransforms.set(
                this.createExtensionKey(e),
                function (e, n, i) {
                  return t(e, n, i);
                },
              ),
              this
            );
          }
          addTriggerTransform(e, t) {
            return (
              this.triggerTransforms.set(
                this.createExtensionKey(e),
                function (e, n, i) {
                  return t(e, n, i);
                },
              ),
              this
            );
          }
          addConditionTransform(e, t) {
            return (
              this.conditionTransforms.set(
                this.createExtensionKey(e),
                function (e, n, i) {
                  return t(e, n, i);
                },
              ),
              this
            );
          }
          addActionTransform(e, t) {
            return (
              this.actionTransforms.set(
                this.createExtensionKey(e),
                function (e, n, i) {
                  return t(e, n, i);
                },
              ),
              this
            );
          }
          createExtensionKey(e) {
            return `${this.baseInfo.namespace}:${e}`;
          }
          buildTransform() {
            return {
              namespace: this.baseInfo.namespace,
              pluginId: this.baseInfo.pluginId,
              version: this.baseInfo.version,
              displayName: this.baseInfo.displayName,
              description: this.baseInfo.description,
              triggerTransforms: this.triggerTransforms,
              targetTransforms: this.targetTransforms,
              conditionTransforms: this.conditionTransforms,
              actionTransforms: this.actionTransforms,
            };
          }
        }
      },
      6213: function (e, t) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var n,
          i,
          r,
          a,
          o,
          l,
          s,
          u,
          c,
          d,
          f = {
            CORE_OPERATORS: function () {
              return r;
            },
            DEFAULTS: function () {
              return a;
            },
            DEFAULT_CUSTOM_EASE: function () {
              return T;
            },
            EASE_DEFAULTS: function () {
              return v;
            },
            PERCENT_CANVAS_DURATION_S: function () {
              return y;
            },
            RELATIONSHIP_TYPES: function () {
              return o;
            },
            STANDARD_TRIGGER_ALLOWED_CONTROLS: function () {
              return b;
            },
            TimelineControlType: function () {
              return n;
            },
            TweenType: function () {
              return i;
            },
            isValidControlType: function () {
              return g;
            },
            tweenTypeFromName: function () {
              return h;
            },
            tweenTypeToName: function () {
              return m;
            },
          };
        for (var p in f)
          Object.defineProperty(t, p, { enumerable: !0, get: f[p] });
        function g(e) {
          return (
            "standard" === e ||
            "scroll" === e ||
            "load" === e ||
            "continuous" === e
          );
        }
        function h(e) {
          switch (e) {
            case "to":
              return 0;
            case "from":
              return 1;
            case "both":
              return 2;
            case "set":
              return 3;
          }
        }
        function m(e) {
          switch (e) {
            case 0:
              return "to";
            case 1:
              return "from";
            case 2:
              return "both";
            case 3:
              return "set";
            default:
              return null;
          }
        }
        (((l = n || (n = {})).STANDARD = "standard"),
          (l.SCROLL = "scroll"),
          (l.LOAD = "load"),
          (l.CONTINUOUS = "continuous"),
          ((s = i || (i = {}))[(s.To = 0)] = "To"),
          (s[(s.From = 1)] = "From"),
          (s[(s.FromTo = 2)] = "FromTo"),
          (s[(s.Set = 3)] = "Set"),
          ((u = r || (r = {})).AND = "wf:and"),
          (u.OR = "wf:or"),
          ((c = a || (a = {}))[(c.DURATION = 0.5)] = "DURATION"));
        let y = 1;
        (((d = o || (o = {})).NONE = "none"),
          (d.WITHIN = "within"),
          (d.DIRECT_CHILD_OF = "direct-child-of"),
          (d.CONTAINS = "contains"),
          (d.DIRECT_PARENT_OF = "direct-parent-of"),
          (d.NEXT_TO = "next-to"),
          (d.NEXT_SIBLING_OF = "next-sibling-of"),
          (d.PREV_SIBLING_OF = "prev-sibling-of"));
        let v = {
            back: { type: "back", curve: "out", power: 1.7 },
            elastic: {
              type: "elastic",
              curve: "out",
              amplitude: 1,
              period: 0.3,
            },
            steps: { type: "steps", stepCount: 6 },
            rough: {
              type: "rough",
              templateCurve: "none.inOut",
              points: 20,
              strength: 1,
              taper: "none",
              randomizePoints: !0,
              clampPoints: !1,
            },
            slowMo: {
              type: "slowMo",
              linearRatio: 0.7,
              power: 0.7,
              yoyoMode: !1,
            },
            expoScale: {
              type: "expoScale",
              startingScale: 0.05,
              endingScale: 1,
              templateCurve: "none.inOut",
            },
            customWiggle: {
              type: "customWiggle",
              wiggles: 10,
              wiggleType: "easeOut",
            },
            customBounce: {
              type: "customBounce",
              strength: 0.7,
              squash: 1,
              endAtStart: !1,
            },
            customEase: {
              type: "customEase",
              bezierCurve: "M0,160 C40,160 24,96 80,96 136,96 120,0 160,0",
            },
          },
          T = v.back,
          b = [
            "restart",
            "play",
            "reverse",
            "reverseFlipEase",
            "pause",
            "resume",
            "togglePlayReverse",
            "togglePlayReverseFlipEase",
            "stop",
            "none",
          ];
      },
      2019: function (e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var i = {
          EASING_NAMES: function () {
            return o.EASING_NAMES;
          },
          IX3: function () {
            return a.IX3;
          },
          convertEaseConfigToGSAP: function () {
            return l.convertEaseConfigToGSAP;
          },
          convertEaseConfigToLinear: function () {
            return l.convertEaseConfigToLinear;
          },
        };
        for (var r in i)
          Object.defineProperty(t, r, { enumerable: !0, get: i[r] });
        let a = n(8968),
          o = n(3648),
          l = n(3408);
      },
      4054: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "AnimationCoordinator", {
            enumerable: !0,
            get: function () {
              return s;
            },
          }));
        let i = n(1983),
          r = n(3648),
          a = n(3408),
          o = n(6378),
          l = n(7009);
        class s {
          timelineDefs;
          getHandler;
          getTargetResolver;
          resolveFn;
          getInteractionForTimeline;
          env;
          subs;
          dynamicFlags;
          cleanupFns;
          scrollTriggers;
          aliases;
          flipEaseBySource;
          pluginRuntimeBridge;
          animation;
          sharedGroups;
          static MAX_ALIAS_DEPTH = 10;
          resolveAlias(e, t = 0) {
            if (t > s.MAX_ALIAS_DEPTH)
              return (
                console.warn(
                  `IX3: Timeline alias chain exceeded max depth for "${e}". Possible circular reference.`,
                ),
                e
              );
            let n = this.aliases.get(e);
            return n ? this.resolveAlias(n, t + 1) : e;
          }
          shouldFlipEaseForTimeline(e) {
            let t = this.resolveSourceTimelineId(e),
              n = [t];
            for (let [e] of this.timelineDefs)
              e !== t && this.resolveSourceTimelineId(e) === t && n.push(e);
            let i = new Set(n),
              r = !1,
              a = (e) => {
                if (
                  "reverseFlipEase" === e ||
                  "togglePlayReverseFlipEase" === e
                )
                  r = !0;
                else if ("reverse" === e || "togglePlayReverse" === e)
                  return !0;
                return !1;
              },
              o = new Map();
            for (let e of n) {
              let t = this.getInteractionForTimeline(e);
              t && o.set(t.id, t);
            }
            for (let e of o.values()) {
              let t = e.timelineIds ?? [];
              for (let [, n] of e.triggers) {
                let e,
                  r = n?.assignedGroupId;
                if (null === r) continue;
                let o = n?.assignedTimelineRole,
                  l =
                    null != o
                      ? t.filter(
                          (e) =>
                            this.timelineDefs.get(e)?.triggerMetadata?.role ===
                            o,
                        )
                      : null;
                if (null != r) {
                  let n = t.filter(
                    (e) => this.timelineDefs.get(e)?.groupId === r,
                  );
                  if (n.length > 0) e = n;
                  else {
                    if (
                      !t.some(
                        (e) =>
                          this.timelineDefs.get(e)?.triggerMetadata != null,
                      )
                    )
                      continue;
                    e = l;
                  }
                } else e = l;
                let s = (n) =>
                    (null != n ? [n] : t).filter(
                      (t) => (null == e || e.includes(t)) && i.has(t),
                    ),
                  u = n?.conditionalLogic;
                if (u) {
                  for (let e of [u.ifTrue, u.ifFalse])
                    if (
                      e &&
                      s(e.targetTimelineId ?? void 0).length > 0 &&
                      a(e.control)
                    )
                      return !1;
                } else
                  for (let e of s()) {
                    let t = this.timelineDefs.get(e);
                    if (
                      a(t?.triggerMetadata ? t.settings?.control : n?.control)
                    )
                      return !1;
                  }
              }
            }
            return r;
          }
          recomputeFlipEaseForSource(e) {
            let t = this.resolveSourceTimelineId(e),
              n = this.subs.get(t);
            if (!n) return;
            let i = this.shouldFlipEaseForTimeline(t);
            if (i !== this.flipEaseBySource.get(t))
              for (let e of (this.flipEaseBySource.set(t, i), n.values()))
                this.scheduleRebuild(e);
          }
          resolveSourceTimelineId(e) {
            let t = e;
            for (let e = 0; e <= s.MAX_ALIAS_DEPTH; e++) {
              let e = this.timelineDefs.get(t),
                n = e?.reuse?.sourceTimelineId;
              if (!n) return t;
              t = n;
            }
            return (
              console.warn(
                `IX3: Timeline reuse chain exceeded max depth for "${e}". Possible circular reference.`,
              ),
              t
            );
          }
          globalSplitRegistry;
          timelineTargetsCache;
          constructor(e, t, n, i, s, u) {
            ((this.timelineDefs = e),
              (this.getHandler = t),
              (this.getTargetResolver = n),
              (this.resolveFn = i),
              (this.getInteractionForTimeline = s),
              (this.env = u),
              (this.subs = new Map()),
              (this.dynamicFlags = new Map()),
              (this.cleanupFns = new Map()),
              (this.scrollTriggers = new Map()),
              (this.aliases = new Map()),
              (this.flipEaseBySource = new Map()),
              (this.pluginRuntimeBridge = new o.PluginRuntimeBridge()),
              (this.sharedGroups = new Map()),
              (this.globalSplitRegistry = new Map()),
              (this.timelineTargetsCache = new WeakMap()),
              (this.getStaggerConfig = (e, t) => {
                if (!e) return;
                let {
                    ease: n,
                    amount: i,
                    from: o,
                    grid: l,
                    axis: s,
                    each: u,
                  } = e,
                  c = {};
                if (
                  (null != i && (c.amount = (0, r.toSeconds)(i)),
                  null != u && (c.each = (0, r.toSeconds)(u)),
                  null != o && (c.from = o),
                  null != l && (c.grid = l),
                  null != s && (c.axis = s),
                  null != n)
                ) {
                  let e = (0, a.convertEaseConfigToGSAP)(n, void 0, t);
                  null != e && (c.ease = e);
                }
                return c;
              }),
              (this.animation = new l.RuntimeMotionDriver(u)));
          }
          registerSharedGroup(e, t) {
            if (t.length < 2) return;
            let n = [e, e];
            for (let i of t)
              (this.sharedGroups.set(i, n), i !== e && this.aliases.set(i, e));
          }
          createTimeline(e, t) {
            let n = this.timelineDefs.get(e);
            if (this.aliases.has(e)) return;
            let i = this.sharedGroups.get(e);
            if ((this.destroy(e), !n)) return;
            if ((i && this.sharedGroups.set(e, i), n.reuse?.sourceTimelineId)) {
              (this.aliases.set(e, n.reuse.sourceTimelineId),
                this.recomputeFlipEaseForSource(n.reuse.sourceTimelineId));
              return;
            }
            let a = this.isDynamicTimeline(n, t);
            this.dynamicFlags.set(e, a);
            let o = new Set(),
              l = new Set();
            for (let [, e, n] of t.triggers) {
              if (n) for (let e of this.resolveFn(n, {}, t)) l.add(e);
              let i = e?.controlType;
              i && (0, r.isValidControlType)(i) && o.add(i);
            }
            if (!l.size || !a) {
              let t = this.buildSubTimeline(e, null, o);
              t && this.ensureSubs(e).set(null, t);
            }
            if (l.size) {
              let t = this.ensureSubs(e);
              for (let n of l)
                if (!t.has(n)) {
                  let i = a
                    ? this.buildSubTimeline(e, n, o)
                    : this.getSub(e, null);
                  a && i && t.set(n, i);
                }
            }
            this.flipEaseBySource.set(e, this.shouldFlipEaseForTimeline(e));
          }
          getTimeline(e, t) {
            return (this.prepareIfShared(e, t), this.getSub(e, t)?.timeline);
          }
          prepareIfShared(e, t) {
            let n = this.sharedGroups.get(e);
            if (!n || n[1] === e) return;
            let i = this.timelineDefs.get(e);
            if (!i) return;
            let r = this.getSub(n[0], t);
            if (!r) return;
            let a = r.timelineId;
            for (let e of r.cleanupFns ?? []) e();
            r.cleanupFns?.clear();
            let o = this.cleanupFns.get(a);
            if (o) {
              for (let e of o) e();
              o.clear();
            }
            let l = r.timeline;
            (l.clear(), l.progress(0));
            let s = this.convertToGsapDefaults(i.settings || {}, e);
            if (
              (l.repeat("number" == typeof s.repeat ? s.repeat : 0),
              l.repeatDelay(
                "number" == typeof s.repeatDelay ? s.repeatDelay : 0,
              ),
              l.yoyo(!0 === s.yoyo),
              l.delay("number" == typeof s.delay ? s.delay : 0),
              l.reversed(!!i.playInReverse),
              l.timeScale(
                "number" == typeof i.settings?.speed ? i.settings.speed : 1,
              ),
              (r.timelineDef = { ...i, actions: i.actions || [] }),
              (r.timelineId = e),
              this.timelineTargetsCache.delete(r),
              this.env.win.SplitText && i.actions?.length)
            )
              for (let [
                n,
                { types: a, masks: o },
              ] of this.analyzeSplitRequirements(i.actions, t, e))
                this.doSplitText(
                  {
                    type: this.getSplitTypeString(a),
                    mask: this.getMaskString(o),
                  },
                  [n],
                  r,
                  this.env.win.SplitText,
                );
            (this.buildTimeline(r), (n[1] = e));
          }
          getAllTimelines(e) {
            let t = this.resolveAlias(e),
              n = this.subs.get(t);
            if (!n) return [];
            for (let t of n.keys()) this.prepareIfShared(e, t);
            return Array.from(n.values()).map((e) => e.timeline);
          }
          invalidateVolatileFromStart(e, t) {
            let n = null != t ? 0 === t : 0 === e.timeline.progress();
            e.hasVolatileValues && n && e.timeline.invalidate();
          }
          play(e, t, n) {
            this.prepareIfShared(e, t);
            let i = this.getSub(e, t);
            i &&
              (this.invalidateVolatileFromStart(i, n),
              i.timeline.play(n ?? void 0));
          }
          pause(e, t, n) {
            this.prepareIfShared(e, t);
            let i = this.getSubOrNull(e, t);
            i && (void 0 !== n ? i.timeline.pause(n) : i.timeline.pause());
          }
          resume(e, t, n) {
            this.prepareIfShared(e, t);
            let i = this.getSubOrNull(e, t);
            i && (this.invalidateVolatileFromStart(i, n), i.timeline.resume(n));
          }
          reverse(e, t, n) {
            (this.prepareIfShared(e, t),
              this.getSub(e, t)?.timeline.reverse(n));
          }
          restart(e, t) {
            this.prepareIfShared(e, t);
            let n = this.getSub(e, t);
            n &&
              (n.hasVolatileValues && n.timeline.invalidate(),
              n.timeline.restart());
          }
          getTriggerMetadata(e) {
            return this.timelineDefs.get(e)?.triggerMetadata ?? null;
          }
          fireInterval(e, t, n = {}) {
            this.pluginRuntimeBridge.fireInterval({
              coordinator: this,
              timelineId: e,
              element: t,
              options: n,
              animation: this.animation,
            });
          }
          registerIntervalHandler(e, t) {
            this.pluginRuntimeBridge.registerIntervalHandler(e, t);
          }
          getOneShotTimelineContext(e) {
            let t = this.getTimelineDef(e);
            return t
              ? {
                  timelineId: e,
                  timelineDef: t,
                  getFirstActionTargets: (t) =>
                    this.getFirstActionTargets(e, t),
                  getActionTweenConfig: (e, t, n) =>
                    this.getActionTweenConfig(e, t, n),
                  buildActionTimeline: (t) =>
                    this.buildOneShotActionTimeline(e, t),
                  registerCleanup: (t) => this.registerCleanup(e, t),
                }
              : null;
          }
          getTimelineDef(e) {
            return this.timelineDefs.get(this.resolveAlias(e));
          }
          getFirstActionTargets(e, t) {
            let n = this.getTimelineDef(e),
              i = n?.actions?.[0];
            return i ? this.collectTargets(i, t, e) : [];
          }
          getActionTweenConfig(e, t, n) {
            let i = this.getHandler(t);
            if (!i?.createTweenConfig) return null;
            let r = e.properties[t] || {};
            return i.createTweenConfig(r, n);
          }
          registerCleanup(e, t) {
            let n = this.cleanupFns.get(e) ?? new Set();
            return (
              this.cleanupFns.set(e, n),
              n.add(t),
              () => {
                n.delete(t);
              }
            );
          }
          publishChannel(e, t, n) {
            this.pluginRuntimeBridge.publish(e, t, n);
          }
          subscribeChannel(e, t, n, i) {
            return this.pluginRuntimeBridge.subscribe(e, t, n, i);
          }
          buildOneShotActionTimeline(e, t) {
            let n = this.getTimelineDef(e);
            if (!n?.actions?.length) return null;
            let i = this.animation.timeline();
            if (!i) return null;
            for (let r of (t.beforeTweens?.(i), n.actions))
              this.buildTweensForAction(
                r,
                t.targets,
                i,
                e,
                !1,
                t.varsTransform,
                void 0,
                void 0,
                void 0,
                t.cleanupBucket,
              );
            return i;
          }
          togglePlayReverse(e, t) {
            this.prepareIfShared(e, t);
            let n = this.getSub(e, t);
            if (!n) return;
            let i = n.timeline,
              r = i.progress();
            (this.invalidateVolatileFromStart(n),
              0 === r
                ? i.play()
                : 1 === r
                  ? i.reverse()
                  : i.reversed()
                    ? i.play()
                    : i.reverse());
          }
          seek(e, t, n) {
            this.getSubOrNull(e, n)?.timeline.seek(t);
          }
          setTimeScale(e, t, n) {
            (this.prepareIfShared(e, n),
              this.getSubOrNull(e, n)?.timeline.timeScale(t));
          }
          setTotalProgress(e, t, n) {
            this.getSubOrNull(e, n)?.timeline.totalProgress(t);
          }
          setContinuousProgress(e, t, n) {
            this.getSub(e, n)?.timeline.progress(Math.max(0, Math.min(1, t)));
          }
          isPlaying(e, t) {
            return !!this.getSubOrNull(e, t)?.timeline.isActive();
          }
          isPaused(e, t) {
            return !!this.getSubOrNull(e, t)?.timeline.paused();
          }
          destroy(e) {
            (this.aliases.delete(e),
              this.pluginRuntimeBridge.destroyTimeline(e));
            let t = this.subs.get(e),
              n = new Set();
            if (t) {
              for (let [, i] of t) {
                if (
                  (i.timelineId !== e && n.add(i.timelineId),
                  (i.rebuildState = "init"),
                  i.timeline && (i.timeline.revert(), i.timeline.kill()),
                  i.scrollTriggerIds)
                ) {
                  for (let e of i.scrollTriggerIds)
                    this.cleanupScrollTrigger(e);
                  i.scrollTriggerIds.clear();
                }
                for (let e of (i.scrollTriggerConfigs &&
                  i.scrollTriggerConfigs.clear(),
                i.cleanupFns ?? []))
                  e();
                (i.cleanupFns?.clear(), this.timelineTargetsCache.delete(i));
              }
              for (let [, e] of this.globalSplitRegistry)
                e.splitInstance.revert();
              this.globalSplitRegistry.clear();
            }
            for (let t of this.cleanupFns.get(e) ?? []) t();
            for (let e of n) {
              for (let t of this.cleanupFns.get(e) ?? []) t();
              this.cleanupFns.delete(e);
            }
            (this.cleanupFns.delete(e),
              this.subs.delete(e),
              this.dynamicFlags.delete(e),
              this.flipEaseBySource.delete(e),
              this.sharedGroups.delete(e));
          }
          isDynamicTimeline(e, t) {
            let n = t.triggers.some(
              ([, e]) => e?.controlType !== i.TimelineControlType.LOAD,
            );
            if (t.scope?.type === "component" && n) return !0;
            let r = e.actions;
            if (!r?.length) return !1;
            for (let e of r) {
              for (let t of e.targets ?? []) {
                if (this.getTargetResolver(t)?.isDynamic) return !0;
                if (3 === t.length && t[2]) {
                  let e = t[2];
                  if (e.filterBy && "none" !== e.relationship) {
                    let t = this.getTargetResolver(e.filterBy);
                    if (t?.isDynamic) return !0;
                  }
                }
              }
              if (n)
                for (let t in e.properties) {
                  let e = this.getHandler(t);
                  if (e?.requiresTriggerElementContext) return !0;
                }
            }
            return !1;
          }
          ensureSubs(e) {
            return (
              this.subs.has(e) || this.subs.set(e, new Map()),
              this.subs.get(e)
            );
          }
          getSub(e, t) {
            let n = this.resolveAlias(e),
              i = this.ensureSubs(n),
              r = this.dynamicFlags.get(n),
              a = i.get(r ? t : null);
            return (
              !a && (a = this.buildSubTimeline(n, t)) && i.set(r ? t : null, a),
              a
            );
          }
          getSubOrNull(e, t) {
            let n = this.resolveAlias(e),
              i = this.dynamicFlags.get(n);
            return this.subs.get(n)?.get(i ? (t ?? null) : null);
          }
          convertToGsapDefaults(e, t) {
            let n = {},
              i = t ? (0, r.buildEaseContextId)(t, "defaults") : void 0,
              o = t ? (0, r.buildEaseContextId)(t, "defaults-stagger") : void 0;
            if (
              (null != e.duration &&
                (n.duration = (0, r.toSeconds)(e.duration)),
              null != e.ease)
            ) {
              let t = (0, a.convertEaseConfigToGSAP)(e.ease, void 0, i);
              null != t && (n.ease = t);
            }
            if (
              (null != e.delay &&
                (n.delay =
                  "number" == typeof e.delay
                    ? e.delay
                    : (0, r.toSeconds)(e.delay)),
              null != e.repeat && (n.repeat = e.repeat),
              null != e.repeatDelay &&
                (n.repeatDelay = (0, r.toSeconds)(e.repeatDelay)),
              null != e.stagger)
            ) {
              let t = this.getStaggerConfig(e.stagger, o);
              t && (n.stagger = t);
            }
            return (null != e.yoyo && (n.yoyo = e.yoyo), n);
          }
          buildSubTimeline(e, t, n) {
            let i = this.timelineDefs.get(e),
              r = i?.actions,
              a = i?.settings,
              o = this.env.win.gsap;
            if (!o) return;
            let l = o.timeline({
                ...this.convertToGsapDefaults(a || {}, e),
                paused: !0,
                reversed: !!i?.playInReverse,
                data: { id: e, triggerEl: t || void 0 },
              }),
              s = i
                ? { ...i, actions: r || [] }
                : { id: e, pageId: "", deleted: !1, actions: [] },
              u = {
                timeline: l,
                timelineId: e,
                elementContext: t,
                timelineDef: s,
                rebuildState: "init",
                controlTypes: n,
              };
            if (!r?.length) return u;
            if (this.env.win.SplitText)
              for (let [
                n,
                { types: i, masks: a },
              ] of this.analyzeSplitRequirements(r, t, e)) {
                let e = this.getSplitTypeString(i),
                  t = this.getMaskString(a);
                this.doSplitText(
                  { type: e, mask: t },
                  [n],
                  u,
                  this.env.win.SplitText,
                );
              }
            return (this.buildTimeline(u), this.padTimelineToCanvas(u), u);
          }
          padTimelineToCanvas(e) {
            let { canvasDuration: t } = e.timelineDef;
            if (null == t) return;
            let n = e.timeline;
            n.duration() < t && n.to({}, { duration: 0 }, t);
          }
          buildTimeline(e) {
            let t = e.timelineDef,
              n = e.elementContext,
              i = e.timeline,
              r = e.timelineId,
              a = new Map();
            for (let o = 0; o < t.actions.length; o++) {
              let l = t.actions[o];
              if (!l) continue;
              let s = JSON.stringify(l.targets),
                c = !0,
                d = u(l),
                f = "none" === d ? s : `${s}_split_${d}`;
              for (let e of Object.values(l.properties ?? {})) {
                let t = a.get(f) || new Set();
                for (let n of (a.set(f, t), Object.keys(e || {})))
                  t.has(n) ? (c = !1) : t.add(n);
              }
              let p = this.collectTargets(l, n, r);
              if (!p.length) {
                let e = !1;
                for (let t in l.properties)
                  if (this.getHandler(t)?.createCustomTween) {
                    e = !0;
                    break;
                  }
                if (!e) continue;
              }
              let g = p;
              ("none" !== d &&
                p.length > 0 &&
                this.env.win.SplitText &&
                0 === (g = this.getSplitElements(p, d)).length) ||
                this.buildTweensForAction(
                  l,
                  g,
                  i,
                  r,
                  c,
                  void 0,
                  n,
                  t.triggerMetadata?.role,
                  e,
                );
            }
          }
          collectTargets(e, t, n) {
            if (!e.targets) return [];
            let i = [],
              r = this.getInteractionForTimeline(n);
            for (let n of e.targets ?? []) {
              let e = this.resolveFn(n, t ? { triggerElement: t } : {}, r);
              i.push(...e);
            }
            return i;
          }
          buildTweensForAction(e, t, n, o, l, s, u, c, d, f) {
            let p = this.shouldFlipEaseForTimeline(o),
              g = d?.timelineDef.canvasDuration != null;
            for (let h in e.properties) {
              let m = this.getHandler(h);
              if (!m) continue;
              let y = e.properties[h] || {};
              try {
                let v = e.timing?.position;
                v =
                  "string" == typeof v && v.endsWith("ms")
                    ? (0, r.toSeconds)(v)
                    : (v ?? 0);
                let T = e.timing?.duration ?? i.DEFAULTS.DURATION,
                  b = this.getStaggerConfig(
                    e.timing?.stagger,
                    (0, r.buildEaseContextId)(e.id, "stagger"),
                  );
                b && 0 === T && (T = 0.001);
                let E = { id: e.id, presetId: e.presetId, color: e.color },
                  I = {
                    force3D: !0,
                    ...(!l && { immediateRender: l }),
                    data: E,
                    ...(3 !== e.tt && { duration: (0, r.toSeconds)(T) }),
                    ...(e.timing?.repeat != null && {
                      repeat: g && e.timing.repeat < 0 ? 0 : e.timing.repeat,
                    }),
                    ...(e.timing?.repeatDelay != null && {
                      repeatDelay: (0, r.toSeconds)(e.timing.repeatDelay),
                    }),
                    ...(e.timing?.yoyo != null && { yoyo: e.timing.yoyo }),
                    ...(b && { stagger: b }),
                  };
                if (e.timing?.ease != null) {
                  let t = (0, a.convertEaseConfigToGSAP)(
                    e.timing.ease,
                    void 0,
                    (0, r.buildEaseContextId)(e.id, "timing"),
                  );
                  null != t && (I.ease = t);
                }
                if ((p && (I.easeReverse = !0), m.createTweenConfig)) {
                  let i = m.createTweenConfig(y, t);
                  (s?.(h, e, i),
                    i.modifiers &&
                      (I.modifiers = { ...I.modifiers, ...i.modifiers }),
                    d &&
                      !d.hasVolatileValues &&
                      (function (e) {
                        for (let n of [e.to, e.from])
                          if (n)
                            for (let e in n) {
                              var t;
                              if (
                                "string" == typeof (t = n[e]) &&
                                (t.startsWith("+=") ||
                                  t.startsWith("-=") ||
                                  t.startsWith("random("))
                              )
                                return !0;
                            }
                        return !1;
                      })(i) &&
                      (d.hasVolatileValues = !0));
                  let r = Object.keys(i.from || {}).length > 0,
                    a = Object.keys(i.to || {}).length > 0,
                    o = e.tt ?? 0;
                  if (0 === o && !a) continue;
                  if (1 === o && !r) continue;
                  if (2 === o && !r && !a) continue;
                  else if (3 === o && !a) continue;
                  1 === o
                    ? n.from(t, { ...I, ...i.from }, v)
                    : 2 === o
                      ? n.fromTo(t, { ...i.from }, { ...I, ...i.to }, v)
                      : 3 === o
                        ? n.set(t, { ...I, ...i.to }, v)
                        : n.to(t, { ...I, ...i.to }, v);
                } else if (m.createCustomTween) {
                  let i = m.createCustomTween(n, e, y, I, t, v || 0, {
                    triggerElement: u ?? null,
                    timelineRole: c,
                    subscribeChannel: (e, t) =>
                      this.subscribeChannel(o, e, u ?? null, t),
                    animation: this.animation,
                  });
                  if (i)
                    if (null != f) f.add(i);
                    else if (null != d) {
                      let e = d.cleanupFns ?? new Set();
                      ((d.cleanupFns = e), e.add(i));
                    } else {
                      let e = this.cleanupFns.get(o) ?? new Set();
                      (this.cleanupFns.set(o, e), e.add(i));
                    }
                }
              } catch (e) {
                console.error("Error building tween:", e);
              }
            }
          }
          analyzeSplitRequirements(e, t, n) {
            let i = new Map();
            for (let r of e) {
              let e = u(r);
              if ("none" === e) continue;
              let a =
                "object" == typeof r.splitText ? r.splitText.mask : void 0;
              for (let o of this.collectTargets(r, t, n)) {
                if (o === document.body) continue;
                let t = i.get(o) || { types: new Set(), masks: new Set() };
                (i.set(o, t), t.types.add(e), a && t.masks.add(a));
              }
            }
            return i;
          }
          getSplitTypeString(e) {
            return (
              e.has("chars") &&
                !e.has("words") &&
                (e = new Set([...e, "words"])),
              ["lines", "words", "chars"].filter((t) => e.has(t)).join(", ")
            );
          }
          getMaskString(e) {
            if (0 !== e.size) {
              if (e.has("lines")) return "lines";
              if (e.has("words")) return "words";
              if (e.has("chars")) return "chars";
            }
          }
          doSplitText(e, t, n, i) {
            try {
              let a = c(e.type);
              for (let o of t) {
                let t = this.globalSplitRegistry.get(o);
                if (t) {
                  let n = new Set(c(t.splitTextConfig.type));
                  if (a.every((e) => n.has(e))) continue;
                  (t.splitInstance.revert(),
                    this.globalSplitRegistry.delete(o),
                    (e = {
                      type: [...new Set([...n, ...a])].join(", "),
                      mask: e.mask || t.splitTextConfig.mask,
                    }));
                }
                let l = { type: e.type, tag: "span" },
                  s = c(e.type),
                  { mask: u } = e;
                (s.includes("lines") &&
                  ((n.timeline.data.splitLines = !0),
                  (l.linesClass = (0, r.defaultSplitClass)("line")),
                  (l.autoSplit = !0),
                  (l.onSplit = (e) => {
                    (this.applySplitElementStyles(e, u),
                      "init" !== n.rebuildState
                        ? this.scheduleRebuildForElement(o)
                        : (n.rebuildState = "idle"));
                  })),
                  s.includes("words") &&
                    (l.wordsClass = (0, r.defaultSplitClass)("word")),
                  s.includes("chars") &&
                    (l.charsClass = (0, r.defaultSplitClass)("letter")),
                  u && (l.mask = u));
                let d = new i([o], l);
                (this.applySplitElementStyles(d, u),
                  this.globalSplitRegistry.set(o, {
                    splitInstance: d,
                    splitTextConfig: e,
                  }),
                  t && this.scheduleRebuildForElement(o));
              }
            } catch (e) {
              console.error("Error splitting text:", e);
            }
          }
          applySplitElementStyles(e, t) {
            let n = [
              [e.lines, "block"],
              [e.words, "inline-block"],
              [e.chars, "inline-block"],
            ];
            for (let [i, r] of (t &&
              n.push([e.masks, "lines" === t ? "block" : "inline-block"]),
            n))
              for (let e of i) {
                let { style: t } = e;
                ((t.position = "relative"), (t.display = r));
              }
          }
          scheduleRebuild(e) {
            if (
              "building" === e.rebuildState ||
              "rebuild_pending" === e.rebuildState
            ) {
              e.rebuildState = "rebuild_pending";
              return;
            }
            ((e.rebuildState = "building"),
              this.timelineTargetsCache.delete(e),
              this.rebuildTimelineOnTheFly(e));
          }
          rebuildTimelineOnTheFly(e) {
            let t = e.timeline.progress(),
              n = e.controlTypes?.has(i.TimelineControlType.LOAD) && 1 !== t,
              r = e.timeline.isActive() || n;
            for (let t of (e.timeline.pause(),
            e.timeline.revert(),
            e.timeline.clear(),
            e.cleanupFns ?? []))
              t();
            if (
              (e.cleanupFns?.clear(),
              this.buildTimeline(e),
              this.padTimelineToCanvas(e),
              e.timeline.progress(t),
              e.scrollTriggerIds && e.scrollTriggerConfigs)
            )
              for (let t of e.scrollTriggerIds) {
                let n = this.scrollTriggers.get(t),
                  i = e.scrollTriggerConfigs.get(t);
                if (n && i) {
                  let r = { ...i, animation: e.timeline };
                  if ((n.kill(), this.env.win.ScrollTrigger)) {
                    let e = this.env.win.ScrollTrigger.create(r);
                    this.scrollTriggers.set(t, e);
                  }
                }
              }
            else r && e.timeline.play();
            "rebuild_pending" === e.rebuildState
              ? ((e.rebuildState = "building"), this.rebuildTimelineOnTheFly(e))
              : (e.rebuildState = "idle");
          }
          getStaggerConfig;
          getSplitElements(e, t) {
            let n = [];
            for (let i of e) {
              let e = this.globalSplitRegistry.get(i);
              if (e && c(e.splitTextConfig.type).includes(t)) {
                let i = e.splitInstance[t];
                i?.length && n.push(...i);
              }
            }
            return n.length > 0 ? n : e;
          }
          setupScrollControl(e, t, n, i) {
            if (void 0 === this.env.win.ScrollTrigger)
              return void console.warn(
                "ScrollTrigger plugin is not available.",
              );
            let r = `st_${e}_${t}_${i.id || window.crypto.randomUUID().slice(0, 8)}`;
            this.cleanupScrollTrigger(r);
            let a = this.getTimeline(e, i);
            if (!a) return void console.warn(`Timeline ${e} not found`);
            let o = (function (e, t, n, i, r, a = !1) {
              let o = (function (e, t, n) {
                  let i = {},
                    r = (e) =>
                      e &&
                      (e.parentElement === document.body ||
                        e === document.body);
                  if (void 0 !== e.pin)
                    if ("boolean" == typeof e.pin)
                      e.pin && !r(t) && (i.pin = e.pin);
                    else {
                      let a = n(e.pin, { triggerElement: t });
                      a.length > 0 && !r(a[0]) && (i.pin = a[0]);
                    }
                  if (e.endTrigger) {
                    let r = n(e.endTrigger, { triggerElement: t });
                    r.length > 0 && (i.endTrigger = r[0]);
                  }
                  if (e.scroller) {
                    let r = n(e.scroller, { triggerElement: t });
                    r.length > 0 ? (i.scroller = r[0]) : (i.scroller = window);
                  }
                  return i;
                })(e, t, r),
                l = [
                  e.enter || "none",
                  e.leave || "none",
                  e.enterBack || "none",
                  e.leaveBack || "none",
                ],
                s = {
                  trigger: t,
                  markers: e.showMarkers ?? !1,
                  start: e.clamp
                    ? `clamp(${e.start})`
                    : e.start || "top bottom",
                  end: e.clamp ? `clamp(${e.end})` : e.end || "bottom top",
                  scrub: e.scrub ?? !1,
                  horizontal: e.horizontal || !1,
                  toggleActions: l.join(" "),
                  id: n,
                  ...o,
                };
              return (
                !1 !== s.scrub
                  ? (s.animation = i)
                  : Object.assign(
                      s,
                      (function (e, t, n = !1) {
                        let [i, r, a, o] = e,
                          l = (e) => () => {
                            if (void 0 !== e)
                              switch (e) {
                                case "play":
                                  (n && 0 === t.progress() && t.invalidate(),
                                    t.play());
                                  break;
                                case "pause":
                                  t.pause();
                                  break;
                                case "resume":
                                  (n && 0 === t.progress() && t.invalidate(),
                                    t.resume());
                                  break;
                                case "reverse":
                                  t.reverse();
                                  break;
                                case "restart":
                                  (n && t.invalidate(), t.restart());
                                  break;
                                case "reset":
                                  t.pause(0);
                                  break;
                                case "complete":
                                  (n && 0 === t.progress() && t.invalidate(),
                                    t.progress(1));
                              }
                          },
                          s = {};
                        return (
                          "none" !== i && (s.onEnter = l(i)),
                          "none" !== r && (s.onLeave = l(r)),
                          "none" !== a && (s.onEnterBack = l(a)),
                          "none" !== o && (s.onLeaveBack = l(o)),
                          s
                        );
                      })(l, i, a),
                    ),
                s
              );
            })(
              n,
              i,
              r,
              a,
              this.resolveFn,
              this.getSubOrNull(e, i)?.hasVolatileValues ?? !1,
            );
            try {
              let t = this.env.win.ScrollTrigger.create(o);
              this.scrollTriggers.set(r, t);
              let n = this.getSub(e, i);
              (n.scrollTriggerIds || (n.scrollTriggerIds = new Set()),
                n.scrollTriggerConfigs || (n.scrollTriggerConfigs = new Map()),
                n.scrollTriggerIds.add(r),
                n.scrollTriggerConfigs.set(r, o));
            } catch (e) {
              console.error("Failed to create ScrollTrigger:", e);
            }
          }
          cleanupScrollTrigger(e) {
            let t = this.scrollTriggers.get(e);
            t && (t.kill(), this.scrollTriggers.delete(e));
          }
          getScrollTriggers() {
            return this.scrollTriggers;
          }
          getTimelineTargets(e) {
            let t = this.timelineTargetsCache.get(e);
            if (t) return t;
            for (let n of ((t = new WeakSet()), e.timelineDef.actions ?? []))
              for (let i of this.collectTargets(
                n,
                e.elementContext,
                e.timelineId,
              ))
                t.add(i);
            return (this.timelineTargetsCache.set(e, t), t);
          }
          scheduleRebuildForElement(e) {
            for (let [, t] of this.subs)
              for (let [, n] of t)
                this.getTimelineTargets(n).has(e) && this.scheduleRebuild(n);
          }
        }
        function u(e) {
          return e.splitText
            ? "string" == typeof e.splitText
              ? e.splitText
              : e.splitText.type
            : "none";
        }
        function c(e) {
          return e.split(", ");
        }
      },
      4651: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "ConditionEvaluator", {
            enumerable: !0,
            get: function () {
              return r;
            },
          }));
        let i = n(1983);
        class r {
          getConditionEvaluator;
          sharedObservers = new Map();
          conditionCache = new Map();
          CACHE_TTL = 100;
          constructor(e) {
            this.getConditionEvaluator = e;
          }
          evaluateConditionsForTrigger = async (e, t) => {
            if (!e?.length) return !0;
            let n = e.some(([e]) => e === i.CORE_OPERATORS.OR);
            return this.evaluateCondition(
              [
                n ? i.CORE_OPERATORS.OR : i.CORE_OPERATORS.AND,
                { conditions: e },
              ],
              t,
            );
          };
          observeConditionsForTrigger = (e, t) => {
            if (!e?.length) return () => {};
            let n = [],
              i = [];
            for (let t of e) {
              let e = this.getConditionEvaluator(t);
              e?.isReactive ? n.push(t) : i.push(t[0]);
            }
            if (0 === n.length) return () => {};
            let r = n.map((e) => this.getOrCreateSharedObserver(e, t));
            return () => {
              for (let e of r) e();
            };
          };
          disposeSharedObservers = () => {
            for (let [e, t] of this.sharedObservers)
              try {
                t.cleanup();
              } catch (t) {
                console.error("Error disposing shared observer: %s", e, t);
              }
            (this.sharedObservers.clear(), this.conditionCache.clear());
          };
          observeCondition = (e, t) => {
            let n = this.getEvaluator(e);
            if (n?.observe)
              try {
                return n.observe(e, t);
              } catch (e) {
                console.error("Error setting up condition observer:", e);
              }
          };
          getEvaluator = (e) => {
            let [t] = e;
            return t === i.CORE_OPERATORS.AND || t === i.CORE_OPERATORS.OR
              ? this.getLogicalEvaluator(t)
              : this.getConditionEvaluator(e);
          };
          getLogicalEvaluator = (e) => ({
            evaluate: async (t, n) => {
              let [, r, a] = t,
                { conditions: o } = r || {};
              if (!Array.isArray(o)) return !1;
              if (!o.length) return !0;
              let l = e === i.CORE_OPERATORS.OR,
                s = 1 === a;
              for (let e of o) {
                let t = await this.evaluateCondition(e, n);
                if (l ? t : !t) return l ? !s : !!s;
              }
              return l ? !!s : !s;
            },
            observe: (e, t) => {
              let [, n] = e,
                { conditions: i } = n || {};
              if (!Array.isArray(i)) return () => {};
              let r = i.map((n) =>
                this.observeCondition(n, async () =>
                  t(await this.evaluateCondition(e)),
                ),
              );
              return () => r.forEach((e) => e && e());
            },
          });
          evaluateCondition = async (e, t) => {
            let n = this.generateConditionCacheKey(e, t),
              i = Date.now(),
              r = this.conditionCache.get(n);
            if (r && i - r.timestamp < this.CACHE_TTL) return r.result;
            let a = this.getEvaluator(e);
            if (!a)
              return (
                console.warn(`No evaluator found for condition type '${e[0]}'`),
                !1
              );
            try {
              let r = await a.evaluate(e, t);
              return (
                this.conditionCache.set(n, { result: r, timestamp: i }),
                r
              );
            } catch (e) {
              return (console.error("Error evaluating condition:", e), !1);
            }
          };
          generateConditionCacheKey = (e, t) => {
            let [n, i, r] = e,
              a = i ? JSON.stringify(i) : "",
              o = t ? `:ctx:${t.id}` : "";
            return `${n}:${a}${r ? ":negate" : ""}${o}`;
          };
          invalidateConditionCache = (e) => {
            let [t] = e,
              n = [];
            for (let e of this.conditionCache.keys())
              e.startsWith(`${t}:`) && n.push(e);
            n.forEach((e) => this.conditionCache.delete(e));
          };
          generateObserverKey = (e) => {
            let [t, n, i] = e,
              r = n ? JSON.stringify(n) : "";
            return `${t}:${r}${i ? ":negate" : ""}`;
          };
          getOrCreateSharedObserver = (e, t) => {
            let n = this.generateObserverKey(e),
              i = this.sharedObservers.get(n);
            if (!i) {
              let t = this.getEvaluator(e);
              if (!t?.observe) return () => {};
              let r = new Set(),
                a = t.observe(e, async () => {
                  this.invalidateConditionCache(e);
                  let t = Array.from(r, async (e) => {
                    try {
                      await e();
                    } catch (e) {
                      console.error("Error in shared observer callback:", e);
                    }
                  });
                  await Promise.allSettled(t);
                });
              if (!a) return () => {};
              ((i = { cleanup: a, refCount: 0, callbacks: r }),
                this.sharedObservers.set(n, i));
            }
            return (
              i.callbacks.add(t),
              i.refCount++,
              () => this.releaseSharedObserver(n, t)
            );
          };
          releaseSharedObserver = (e, t) => {
            let n = this.sharedObservers.get(e);
            if (
              n &&
              n.callbacks.delete(t) &&
              ((n.refCount = Math.max(0, n.refCount - 1)),
              n.refCount <= 0 && 0 === n.callbacks.size)
            ) {
              try {
                n.cleanup();
              } catch (e) {
                console.error("Error cleaning up shared observer:", e);
              }
              this.sharedObservers.delete(e);
            }
          };
        }
      },
      7127: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "ConditionalPlaybackManager", {
            enumerable: !0,
            get: function () {
              return r;
            },
          }));
        let i = n(1983);
        class r {
          matchMediaInstances = new Map();
          setupConditionalContext = (e, t, n) => {
            let { conditionalPlayback: r, triggers: a, id: o } = e;
            if (!r || 0 === r.length) return void t(null);
            this.cleanup(o);
            let l = window.gsap?.matchMedia();
            if (!l) return void t(null);
            this.matchMediaInstances.set(o, l);
            let s = !0,
              u = a.some(
                ([, { controlType: e }]) => e === i.TimelineControlType.LOAD,
              );
            l.add(this.buildConditionsObject(r), (e) => {
              if (u && !s) return !1;
              s = !1;
              let i = this.evaluateConditions(e.conditions || {}, r);
              return ((i && "skip-to-end" !== i.behavior) || t(i), n);
            });
          };
          cleanup = (e) => {
            let t = this.matchMediaInstances.get(e);
            t && (t.revert(), this.matchMediaInstances.delete(e));
          };
          destroy = () => {
            for (let [e] of this.matchMediaInstances) this.cleanup(e);
            this.matchMediaInstances.clear();
          };
          buildConditionsObject = (e) => {
            let t = {};
            for (let n of e)
              switch (n.type) {
                case "prefers-reduced-motion":
                  t.prefersReduced = "(prefers-reduced-motion: reduce)";
                  break;
                case "breakpoint":
                  (n.breakpoints || []).forEach((e) => {
                    let n = a[e];
                    n && (t[`breakpoint_${e}`] = n);
                  });
              }
            return ((t.fallback = "(min-width: 0px)"), t);
          };
          evaluateConditions(e, t) {
            let n = [];
            for (let i of t)
              ("prefers-reduced-motion" === i.type &&
                e.prefersReduced &&
                n.push({ condition: i, type: "prefers-reduced-motion" }),
                "breakpoint" === i.type &&
                  (i.breakpoints || []).some((t) => e[`breakpoint_${t}`]) &&
                  n.push({ condition: i, type: "breakpoint" }));
            if (0 === n.length) return null;
            let i = n.find(({ condition: e }) => "dont-animate" === e.behavior);
            if (i)
              return {
                behavior: "dont-animate",
                matchedConditions: {
                  prefersReduced: "prefers-reduced-motion" === i.type,
                  breakpointMatched: "breakpoint" === i.type,
                },
              };
            let r = n[0];
            return {
              behavior: r.condition.behavior,
              matchedConditions: {
                prefersReduced: "prefers-reduced-motion" === r.type,
                breakpointMatched: "breakpoint" === r.type,
              },
            };
          }
        }
        let a = {
          tiny: "(max-width: 479px) and (min-width: 0px)",
          small: "(max-width: 767px) and (min-width: 480px)",
          medium: "(max-width: 991px) and (min-width: 768px)",
          main: "(min-width: 992px)",
        };
      },
      6325: function (e, t) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "ContinuousChannelManager", {
            enumerable: !0,
            get: function () {
              return n;
            },
          }));
        class n {
          coordinator;
          resolveRole;
          channels;
          animation;
          constructor(e, t) {
            ((this.coordinator = e),
              (this.resolveRole = t),
              (this.channels = new Map()),
              (this.animation = e.animation));
          }
          isPreviewEnabled() {
            return !(
              window.__wf_ix3 && !1 === window.__wf_ix3_continuous_preview
            );
          }
          registerChannel(e) {
            let t = this.resolveRole(e.role);
            if (!t)
              return (
                console.warn(
                  `IX3 Continuous: Failed to resolve role '${e.role}' to timeline ID. Channel registration skipped.`,
                ),
                null
              );
            let n = new i(
              {
                timelineId: t,
                initialValue: e.initialValue,
                element: e.element,
                smoothing: e.smoothing,
                animation: this.animation,
                isPreviewEnabled: () => this.isPreviewEnabled(),
              },
              this.coordinator,
            );
            return (this.channels.set(t, n), n);
          }
          fireInterval(e, t) {
            let n = this.resolveRole(e);
            n &&
              this.coordinator.fireInterval(n, t.element ?? null, {
                targetIndex: t.targetIndex,
                pluginPayload: t.pluginPayload,
              });
          }
          registerIntervalHandler(e, t) {
            this.coordinator.registerIntervalHandler(e, t);
          }
          getMetadata(e) {
            let t = this.resolveRole(e);
            return t ? this.coordinator.getTriggerMetadata(t) : null;
          }
          publishChannel(e, t, n) {
            this.coordinator.publishChannel(e, t, n);
          }
          cleanup() {
            for (let e of this.channels.values()) e.destroy();
            this.channels.clear();
          }
        }
        class i {
          coordinator;
          proxy;
          setter;
          timelineId;
          element;
          isPreviewEnabled;
          constructor(e, t) {
            ((this.coordinator = t),
              (this.proxy = { p: e.initialValue }),
              (this.timelineId = e.timelineId),
              (this.element = e.element ?? null),
              (this.isPreviewEnabled = e.isPreviewEnabled));
            let n = (e.smoothing ?? 0) / 1e3;
            ((this.setter =
              n > 0
                ? e.animation.quickTo(this.proxy, "p", {
                    duration: n,
                    ease: "power2.out",
                    onUpdate: () => this.updateTimeline(this.proxy.p),
                  })
                : null),
              this.updateTimeline(e.initialValue));
          }
          setProgress(e) {
            this.setter
              ? this.setter(e)
              : ((this.proxy.p = e), this.updateTimeline(e));
          }
          setImmediate(e) {
            this.setter
              ? this.setter(e, e)
              : ((this.proxy.p = e), this.updateTimeline(e));
          }
          destroy() {
            this.setter?.tween.kill();
          }
          updateTimeline(e) {
            this.isPreviewEnabled() &&
              this.coordinator.setContinuousProgress(
                this.timelineId,
                e,
                this.element,
              );
          }
        }
      },
      6976: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "EventManager", {
            enumerable: !0,
            get: function () {
              return r;
            },
          }));
        let i = n(3648);
        class r {
          static instance;
          elementHandlers = new WeakMap();
          eventTypeHandlers = new Map();
          customEventTypes = new Map();
          delegatedHandlers = new Map();
          batchedEvents = new Map();
          batchFrameId = null;
          defaultMaxBatchSize = 10;
          defaultMaxBatchAge = 100;
          defaultErrorHandler = (e, t) =>
            console.error("[EventManager] Error handling event:", e, t);
          constructor() {}
          static getInstance() {
            return (r.instance || (r.instance = new r()), r.instance);
          }
          addEventListener(e, t, n, i) {
            try {
              var r;
              let o = i?.kind === "custom",
                l = {
                  ...(o
                    ? { delegate: !1, passive: !0, batch: !1 }
                    : a[t] || {}),
                  ...i,
                  errorHandler: i?.errorHandler || this.defaultErrorHandler,
                };
              if (!o && "load" === t && "complete" in e && e.complete)
                return (
                  setTimeout(() => {
                    try {
                      n(new Event("load"), e);
                    } catch (e) {
                      l.errorHandler?.(e, new Event("load"));
                    }
                  }, 0),
                  () => {}
                );
              if (!e || !e.addEventListener)
                throw Error("Invalid element provided to addEventListener");
              let s = this.createWrappedHandler(n, l, e),
                u = this.registerHandler(e, t, n, s.handler, l, o, s.cleanup);
              if (o)
                return () => {
                  (this.removeHandler(e, t, n, !0), u.cleanup?.());
                };
              let c = new AbortController();
              return (
                this.ensureDelegatedHandler(t),
                l.delegate ||
                  ((r = l),
                  ("window" === r.target
                    ? window
                    : "document" === r.target
                      ? document
                      : null) || e).addEventListener(t, u.wrappedHandler, {
                    passive: l.passive,
                    signal: c.signal,
                  }),
                () => {
                  (c.abort(), this.removeHandler(e, t, n, !1));
                }
              );
            } catch (e) {
              return (i?.errorHandler?.(e, new Event(t)), () => {});
            }
          }
          emit(e, t, n, i) {
            try {
              let r = this.customEventTypes.get(e);
              if (!r?.size) return;
              let a = new CustomEvent(e, {
                detail: t,
                bubbles: i?.bubbles ?? !0,
                cancelable: !0,
              });
              for (let t of r)
                if (!n || n === t.element || t.element.contains(n))
                  try {
                    t.wrappedHandler(a);
                  } catch (t) {
                    console.error(`[EventManager] Error emitting ${e}:`, t);
                  }
            } catch (t) {
              console.error(
                `[EventManager] Error emitting custom event ${e}:`,
                t,
              );
            }
          }
          dispose() {
            for (let [, e] of (null !== this.batchFrameId &&
              (cancelAnimationFrame(this.batchFrameId),
              (this.batchFrameId = null),
              this.batchedEvents.clear()),
            this.delegatedHandlers))
              e.controller.abort();
            for (let [, e] of this.eventTypeHandlers)
              for (let t of e) t.cleanup?.();
            for (let [, e] of this.customEventTypes)
              for (let t of e) t.cleanup?.();
            (this.delegatedHandlers.clear(),
              (this.elementHandlers = new WeakMap()),
              this.eventTypeHandlers.clear(),
              this.customEventTypes.clear());
          }
          createWrappedHandler(e, t, n) {
            let r = (i) => {
              try {
                let r =
                  "window" === t.target
                    ? window
                    : "document" === t.target
                      ? document
                      : n;
                e(i, r);
              } catch (e) {
                (t.errorHandler || this.defaultErrorHandler)(e, i);
              }
            };
            if (t.batch) {
              let e = (e) => {
                let t = e.type || "unknown";
                (this.batchedEvents.has(t) || this.batchedEvents.set(t, []),
                  this.batchedEvents
                    .get(t)
                    .push({
                      event: e,
                      target: n,
                      timestamp: e.timeStamp || performance.now(),
                    }),
                  null == this.batchFrameId &&
                    (this.batchFrameId = requestAnimationFrame(() =>
                      this.processBatchedEvents(),
                    )));
              };
              return t.throttleMs && t.throttleMs > 0
                ? {
                    handler: e,
                    cleanup: (0, i.throttle)(r, t.throttleMs).cancel,
                  }
                : t.debounceMs && t.debounceMs > 0
                  ? {
                      handler: e,
                      cleanup: (0, i.debounce)(r, t.debounceMs).cancel,
                    }
                  : { handler: e };
            }
            if (t.throttleMs && t.throttleMs > 0) {
              let e = (0, i.throttle)(r, t.throttleMs);
              if (t.debounceMs && t.debounceMs > 0) {
                let n = (0, i.debounce)(e, t.debounceMs);
                return {
                  handler: n,
                  cleanup: () => {
                    (n.cancel?.(), e.cancel?.());
                  },
                };
              }
              return { handler: e, cleanup: e.cancel };
            }
            if (t.debounceMs && t.debounceMs > 0) {
              let e = (0, i.debounce)(r, t.debounceMs);
              return { handler: e, cleanup: e.cancel };
            }
            return { handler: r };
          }
          processBatchedEvents() {
            if (null === this.batchFrameId) return;
            this.batchFrameId = null;
            let e = performance.now();
            for (let [t, n] of this.batchedEvents) {
              let i = this.eventTypeHandlers.get(t);
              if (!i?.size) continue;
              let r = n.filter(
                (t) => e - t.timestamp < this.defaultMaxBatchAge,
              );
              if (!r.length) continue;
              r.sort((e, t) => e.timestamp - t.timestamp);
              let a =
                r.length <= this.defaultMaxBatchSize
                  ? r
                  : r.slice(-this.defaultMaxBatchSize);
              for (let { event: t, target: n } of a)
                for (let r of ((t.batchTimestamp = e),
                (t.batchSize = a.length),
                i))
                  try {
                    r.config.delegate
                      ? r.wrappedHandler(t)
                      : ("window" === r.config.target ||
                          "document" === r.config.target ||
                          n === t.target ||
                          n.contains(t.target)) &&
                        r.wrappedHandler(t);
                  } catch (e) {
                    (r.config.errorHandler || this.defaultErrorHandler)(e, t);
                  }
            }
            this.batchedEvents.clear();
          }
          ensureDelegatedHandler(e) {
            if (this.delegatedHandlers.has(e)) return;
            let t = new AbortController(),
              n = (t) => {
                let n = this.eventTypeHandlers.get(e);
                if (n?.size) {
                  for (let i of t.composedPath
                    ? t.composedPath()
                    : t.target
                      ? [t.target]
                      : [])
                    if (i instanceof Element) {
                      for (let r of n)
                        if (
                          r.config.delegate &&
                          (r.element === i || r.element.contains(i))
                        )
                          try {
                            r.wrappedHandler(t);
                          } catch (t) {
                            console.error(
                              `[EventDelegator] Error for ${e}:`,
                              t,
                            );
                          }
                      if (!t.bubbles) break;
                    }
                }
              },
              i = [
                "focus",
                "blur",
                "focusin",
                "focusout",
                "mouseenter",
                "mouseleave",
              ].includes(e);
            (document.addEventListener(e, n, {
              passive: !1,
              capture: i,
              signal: t.signal,
            }),
              this.delegatedHandlers.set(e, { handler: n, controller: t }));
          }
          registerHandler(e, t, n, i, r, a, o) {
            let l = {
              element: e,
              originalHandler: n,
              wrappedHandler: i,
              config: r,
              cleanup: o,
            };
            if (a) {
              let e = this.customEventTypes.get(t) || new Set();
              (e.add(l), this.customEventTypes.set(t, e));
            } else {
              let n = this.elementHandlers.get(e) || new Set();
              (n.add(l), this.elementHandlers.set(e, n));
              let i = this.eventTypeHandlers.get(t) || new Set();
              (i.add(l), this.eventTypeHandlers.set(t, i));
            }
            return l;
          }
          removeHandler(e, t, n, i) {
            if (i) {
              let i = this.customEventTypes.get(t);
              if (i?.size) {
                for (let r of i)
                  if (r.element === e && r.originalHandler === n) {
                    (i.delete(r),
                      i.size || this.customEventTypes.delete(t),
                      r.cleanup?.());
                    break;
                  }
              }
            } else {
              let i,
                r = this.eventTypeHandlers.get(t);
              if (!r?.size) return;
              let a = this.elementHandlers.get(e);
              if (!a?.size) return;
              for (let e of a)
                if (e.originalHandler === n) {
                  i = e;
                  break;
                }
              if (i) {
                if ((a.delete(i), r.delete(i), !r.size)) {
                  this.eventTypeHandlers.delete(t);
                  let e = this.delegatedHandlers.get(t);
                  e && (e.controller.abort(), this.delegatedHandlers.delete(t));
                }
                i.cleanup?.();
              }
            }
          }
        }
        let a = {
          load: { delegate: !1, passive: !0 },
          DOMContentLoaded: { target: "document", passive: !0 },
          readystatechange: { target: "document", passive: !0 },
          beforeunload: { target: "window", passive: !1 },
          unload: { target: "window", passive: !1 },
          pageshow: { target: "window", passive: !0 },
          pagehide: { target: "window", passive: !0 },
          click: { delegate: !0, passive: !1 },
          dblclick: { delegate: !0, passive: !0 },
          mousedown: { delegate: !0, passive: !0 },
          mouseup: { delegate: !0, passive: !0 },
          mousemove: { delegate: !0, batch: !0, passive: !0 },
          mouseenter: { delegate: !1, passive: !0 },
          mouseleave: { delegate: !1, passive: !0 },
          mouseout: { delegate: !0, passive: !0 },
          contextmenu: { delegate: !0, passive: !1 },
          wheel: { delegate: !0, throttleMs: 16, passive: !0, batch: !0 },
          touchstart: { delegate: !0, passive: !0 },
          touchend: { delegate: !0, passive: !1 },
          touchmove: { delegate: !0, batch: !0, passive: !0 },
          touchcancel: { delegate: !0, passive: !0 },
          pointerdown: { delegate: !0, passive: !0 },
          pointerup: { delegate: !0, passive: !0 },
          pointermove: { delegate: !0, batch: !0, passive: !0 },
          pointerenter: { delegate: !1, passive: !0 },
          pointerleave: { delegate: !1, passive: !0 },
          pointercancel: { delegate: !0, passive: !0 },
          keydown: { delegate: !0, passive: !1 },
          keyup: { delegate: !0, passive: !1 },
          keypress: { delegate: !0, passive: !1 },
          input: { delegate: !0, passive: !1 },
          change: { delegate: !0, passive: !1 },
          focus: { delegate: !1, passive: !0 },
          blur: { delegate: !1, passive: !0 },
          focusin: { delegate: !0, passive: !0 },
          focusout: { delegate: !0, passive: !0 },
          submit: { delegate: !0, passive: !1 },
          reset: { delegate: !0, passive: !1 },
          select: { delegate: !0, passive: !0 },
          selectionchange: { target: "document", passive: !0 },
          dragstart: { delegate: !0, passive: !1 },
          drag: { delegate: !0, passive: !0 },
          dragenter: { delegate: !0, passive: !1 },
          dragleave: { delegate: !0, passive: !0 },
          dragover: { delegate: !0, passive: !1 },
          drop: { delegate: !0, passive: !1 },
          dragend: { delegate: !0, passive: !0 },
          play: { delegate: !0, passive: !0 },
          pause: { delegate: !0, passive: !0 },
          ended: { delegate: !0, passive: !0 },
          timeupdate: { delegate: !0, batch: !0, passive: !0 },
          canplay: { delegate: !0, passive: !0 },
          canplaythrough: { delegate: !0, passive: !0 },
          loadeddata: { delegate: !0, passive: !0 },
          animationstart: { delegate: !0, passive: !0 },
          animationend: { delegate: !0, passive: !0 },
          animationiteration: { delegate: !0, passive: !0 },
          transitionstart: { delegate: !0, passive: !0 },
          transitionend: { delegate: !0, passive: !0 },
          transitionrun: { delegate: !0, passive: !0 },
          transitioncancel: { delegate: !0, passive: !0 },
          scroll: { delegate: !1, throttleMs: 16, passive: !0 },
          resize: { target: "window", throttleMs: 16, passive: !0 },
          intersection: { delegate: !1, passive: !0 },
          orientationchange: { target: "window", passive: !0 },
          visibilitychange: { target: "document", passive: !0 },
          storage: { target: "window", passive: !0 },
          online: { target: "window", passive: !0 },
          offline: { target: "window", passive: !0 },
          hashchange: { target: "window", passive: !0 },
          popstate: { target: "window", passive: !0 },
          copy: { delegate: !0, passive: !1 },
          cut: { delegate: !0, passive: !1 },
          paste: { delegate: !0, passive: !1 },
          compositionstart: { delegate: !0, passive: !1 },
          compositionupdate: { delegate: !0, passive: !1 },
          compositionend: { delegate: !0, passive: !1 },
          beforeinput: { delegate: !0, passive: !1 },
        };
      },
      8968: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "IX3", {
            enumerable: !0,
            get: function () {
              return h;
            },
          }));
        let i = n(1983),
          r = n(6976),
          a = n(4054),
          o = n(8070),
          l = n(4651),
          s = n(7127),
          u = n(8912),
          c = n(3648),
          d = n(9759),
          f = n(3636),
          p = n(4467),
          g = n(3054);
        class h {
          env;
          static instance;
          pluginReg;
          timelineDefs;
          interactions;
          triggeredElements;
          triggerCleanupFunctions;
          continuousCleanups;
          conditionalPlaybackManager;
          triggerStrategies;
          windowSize;
          prevWindowSize;
          windowResizeSubscribers;
          debouncedWindowResize;
          bodyResizeObserver;
          triggerObservers;
          timelineRefCounts;
          interactionTimelineRefs;
          timelineToInteractionId;
          reactiveCallbackQueues;
          debouncedReactiveCallback;
          pendingReactiveUpdates;
          reactiveExecutionContext;
          componentScopeSelectors;
          eventMgr;
          loadInteractions;
          coordinator;
          conditionEval;
          constructor(e) {
            ((this.env = e),
              (this.pluginReg = new u.PluginRegistry()),
              (this.timelineDefs = new Map()),
              (this.interactions = new Map()),
              (this.triggeredElements = new Map()),
              (this.triggerCleanupFunctions = new Map()),
              (this.continuousCleanups = new Map()),
              (this.windowSize = { w: 0, h: 0 }),
              (this.prevWindowSize = { w: 0, h: 0 }),
              (this.windowResizeSubscribers = new Set()),
              (this.debouncedWindowResize = (0, c.debounce)(() => {
                for (let e of this.windowResizeSubscribers) e();
              }, 200)),
              (this.bodyResizeObserver = null),
              (this.triggerObservers = new Map()),
              (this.timelineRefCounts = new Map()),
              (this.interactionTimelineRefs = new Map()),
              (this.timelineToInteractionId = new Map()),
              (this.reactiveCallbackQueues = new Map()),
              (this.pendingReactiveUpdates = new Map()),
              (this.reactiveExecutionContext = new Set()),
              (this.componentScopeSelectors = new Map()),
              (this.eventMgr = r.EventManager.getInstance()),
              (this.loadInteractions = []),
              (this.addEventListener = this.eventMgr.addEventListener.bind(
                this.eventMgr,
              )),
              (this.emit = this.eventMgr.emit.bind(this.eventMgr)),
              (this.resolveTargets = (e, t, n) => {
                let i = n?.scope?.type === "component" ? n.scope : null,
                  r = i?.componentId
                    ? this.getComponentScopeSelector(i.componentId)
                    : null,
                  a = i?.variants?.length ? i.variants : null,
                  o = this.resolveTargetsImpl(e, t, n, r),
                  l =
                    r && t.triggerElement
                      ? this.filterByInstance(o, r, t.triggerElement)
                      : o;
                return a && r ? this.filterByVariant(l, r, a) : l;
              }),
              (this.isTargetDynamic = (e) =>
                !!this.pluginReg.getTargetResolver(e)?.isDynamic),
              (this.getInteractionForTimeline = (e) => {
                let t = this.timelineToInteractionId.get(e);
                if (t) return this.interactions.get(t);
              }),
              window.addEventListener("resize", this.debouncedWindowResize),
              (this.coordinator = new a.AnimationCoordinator(
                this.timelineDefs,
                this.pluginReg.getActionHandler.bind(this.pluginReg),
                this.pluginReg.getTargetResolver.bind(this.pluginReg),
                this.resolveTargets,
                this.getInteractionForTimeline,
                e,
              )),
              (this.conditionEval = new l.ConditionEvaluator(
                this.pluginReg.getConditionEvaluator.bind(this.pluginReg),
              )),
              (this.conditionalPlaybackManager =
                new s.ConditionalPlaybackManager()),
              (this.triggerStrategies = new Map([
                [
                  i.TimelineControlType.STANDARD,
                  new d.StandardTriggerStrategy(
                    this.runTrigger.bind(this),
                    this.runTimelineAction.bind(this),
                    this.skipToEndState.bind(this),
                    this.getTimelineIdsForRole.bind(this),
                    this.resolveAssignedTimelineIds.bind(this),
                  ),
                ],
                [
                  i.TimelineControlType.LOAD,
                  new f.LoadTriggerStrategy(
                    this.runTrigger.bind(this),
                    this.runTimelineAction.bind(this),
                    this.skipToEndState.bind(this),
                    this.loadInteractions,
                    this.coordinator.getTimeline.bind(this.coordinator),
                  ),
                ],
                [
                  i.TimelineControlType.SCROLL,
                  new p.ScrollTriggerStrategy(
                    this.runTrigger.bind(this),
                    this.runTimelineAction.bind(this),
                    this.skipToEndState.bind(this),
                    this.coordinator.setupScrollControl.bind(this.coordinator),
                  ),
                ],
                [
                  i.TimelineControlType.CONTINUOUS,
                  new g.ContinuousTriggerStrategy(
                    this.runTrigger.bind(this),
                    this.runTimelineAction.bind(this),
                    this.skipToEndState.bind(this),
                    this.continuousCleanups,
                    this.triggerCleanupFunctions,
                    this.coordinator,
                    this.getTimelineIdForRole.bind(this),
                  ),
                ],
              ])),
              (this.debouncedReactiveCallback = (0, c.debounce)(
                () => this.processPendingReactiveUpdates(),
                16,
                { leading: !1, trailing: !0, maxWait: 100 },
              )));
          }
          getCoordinator() {
            return this.coordinator;
          }
          addEventListener;
          emit;
          static async init(e) {
            return ((this.instance = new h(e)), this.instance);
          }
          async registerPlugin(e) {
            await this.pluginReg.registerPlugin(e);
          }
          register(e, t) {
            if (t?.length) for (let e of t) this.timelineDefs.set(e.id, e);
            if (e?.length) {
              for (let t of e) {
                if (this.interactions.has(t.id)) {
                  console.warn(
                    `Interaction with ID ${t.id} already exists. Use update() to modify it.`,
                  );
                  continue;
                }
                this.interactions.set(t.id, t);
                let e = new Set();
                (this.interactionTimelineRefs.set(t.id, e),
                  this.conditionalPlaybackManager.setupConditionalContext(
                    t,
                    (n) => {
                      for (let n of t.timelineIds ?? [])
                        (e.add(n),
                          this.incrementTimelineRefCount(n),
                          this.timelineToInteractionId.set(n, t.id));
                      for (let e of (0, o.analyzeSharedTimelineGroups)(
                        t,
                        this.timelineDefs,
                        this.resolveTargets,
                        this.pluginReg.getActionHandler.bind(this.pluginReg),
                        this.coordinator.isDynamicTimeline.bind(
                          this.coordinator,
                        ),
                      ))
                        this.coordinator.registerSharedGroup(
                          e.primary,
                          e.members,
                        );
                      for (let e of t.timelineIds ?? [])
                        this.coordinator.createTimeline(e, t);
                      for (let e of t.triggers ?? []) this.bindTrigger(e, t, n);
                    },
                    () => {
                      this.cleanupInteractionAnimations(t.id);
                    },
                  ));
              }
              for (let e of this.loadInteractions) e();
              if (
                ((this.loadInteractions.length = 0),
                this.coordinator.getScrollTriggers().size > 0)
              ) {
                this.windowResizeSubscribers.add(() => {
                  ((this.windowSize.h = window.innerHeight),
                    (this.windowSize.w = window.innerWidth));
                });
                let e = (0, c.debounce)(
                    () => {
                      ((this.prevWindowSize.h = this.windowSize.h),
                        (this.prevWindowSize.w = this.windowSize.w));
                    },
                    210,
                    { leading: !0, trailing: !1 },
                  ),
                  t = (0, c.debounce)(() => {
                    if (
                      this.windowSize.h === this.prevWindowSize.h &&
                      this.windowSize.w === this.prevWindowSize.w
                    )
                      for (let e of this.coordinator
                        .getScrollTriggers()
                        .values())
                        e.refresh();
                  }, 210);
                ((this.bodyResizeObserver = new ResizeObserver((n) => {
                  for (let i of n) i.target === document.body && (e(), t());
                })),
                  document.body &&
                    this.bodyResizeObserver.observe(document.body));
              }
            }
            return this;
          }
          remove(e) {
            for (let t of Array.isArray(e) ? e : [e]) {
              if (!this.interactions.has(t)) {
                console.warn(
                  `Interaction with ID ${t} not found, skipping removal.`,
                );
                continue;
              }
              (this.cleanupTriggerObservers(t),
                this.unbindAllTriggers(t),
                this.cleanupContinuousControlsForInteraction(t));
              let e = this.decrementTimelineReferences(t);
              (this.cleanupUnusedTimelines(e),
                this.interactions.delete(t),
                this.triggeredElements.delete(t),
                this.interactionTimelineRefs.delete(t),
                this.conditionalPlaybackManager.cleanup(t));
            }
            return this;
          }
          update(e, t) {
            let n = Array.isArray(e) ? e : [e],
              i = t ? (Array.isArray(t) ? t : [t]) : [];
            for (let e of (i.length && this.register([], i), n)) {
              let { id: t } = e;
              if (!this.interactions.has(t)) {
                (console.warn(
                  `Interaction with ID ${t} not found, registering as new.`,
                ),
                  this.register([e], []));
                continue;
              }
              (this.remove(t), this.register([e], []));
            }
            return this;
          }
          destroyTimelineInstance(e) {
            this.coordinator.destroy(e);
            let t = `st_${e}_`;
            for (let [e, n] of this.coordinator.getScrollTriggers().entries())
              e.startsWith(t) &&
                (n.kill(), this.coordinator.getScrollTriggers().delete(e));
          }
          cleanupUnusedTimelines(e) {
            let t = new Set();
            for (let n of e) {
              let e = this.timelineDefs.get(n);
              e?.reuse?.sourceTimelineId &&
                t.add(this.coordinator.resolveSourceTimelineId(n));
            }
            for (let t of e)
              (this.destroyTimelineInstance(t), this.timelineDefs.delete(t));
            for (let n of t)
              e.has(n) || this.coordinator.recomputeFlipEaseForSource(n);
          }
          destroy() {
            let e = Array.from(this.interactions.keys());
            (this.remove(e),
              (this.loadInteractions.length = 0),
              this.env.win.ScrollTrigger &&
                (this.env.win.ScrollTrigger.getAll().forEach((e) => e.kill()),
                this.bodyResizeObserver?.disconnect(),
                (this.bodyResizeObserver = null)),
              window.removeEventListener("resize", this.debouncedWindowResize),
              this.cleanupAllContinuousControls());
            try {
              this.debouncedReactiveCallback.cancel();
            } catch (e) {
              console.error(
                "Error canceling debounced callback during destroy:",
                e,
              );
            }
            (this.pendingReactiveUpdates.clear(),
              this.reactiveCallbackQueues.clear(),
              this.reactiveExecutionContext.clear(),
              this.conditionEval.disposeSharedObservers(),
              this.conditionalPlaybackManager.destroy(),
              this.windowResizeSubscribers.clear(),
              this.timelineDefs.clear(),
              this.interactions.clear(),
              this.triggeredElements.clear(),
              this.triggerCleanupFunctions.clear(),
              this.triggerObservers.clear(),
              this.interactionTimelineRefs.clear(),
              this.timelineToInteractionId.clear(),
              this.componentScopeSelectors.clear());
          }
          bindTrigger(e, t, n) {
            let r = t.id,
              a = this.pluginReg.getTriggerHandler(e),
              o = e[1];
            if (!a) return void console.warn("No trigger handler:", e[0]);
            let l = this.triggerCleanupFunctions.get(r) || new Map();
            this.triggerCleanupFunctions.set(r, l);
            let { delay: s = 0, controlType: u } = o,
              d = (0, c.toSeconds)(s),
              f = this.eventMgr,
              p = e[2],
              g = [];
            p && (g = this.resolveTargets(p, {}, t));
            let h =
                u && (0, c.isValidControlType)(u)
                  ? u
                  : i.TimelineControlType.STANDARD,
              m = this.triggerStrategies.get(h);
            (m
              ? m.bind(e, t, {
                  interactionId: r,
                  elements: g,
                  triggerHandler: a,
                  eventManager: f,
                  conditionalContext: n,
                  cleanupMap: l,
                  delay: d || 0,
                })
              : console.warn("No strategy found for control type:", u),
              o.conditionalLogic && this.setupTriggerReactiveMonitoring(e, t));
          }
          setupTriggerReactiveMonitoring(e, t) {
            let { conditionalLogic: n } = e[1];
            if (!n) return;
            let i = `${t.id}:${t.triggers.indexOf(e)}`;
            try {
              let r = this.conditionEval.observeConditionsForTrigger(
                  n.conditions,
                  async () => {
                    await this.executeReactiveCallbackSafely(
                      t.id,
                      i,
                      async () => {
                        let i =
                          (await this.conditionEval.evaluateConditionsForTrigger(
                            n.conditions,
                            t,
                          ))
                            ? n.ifTrue
                            : n.ifFalse;
                        if (i) {
                          let n = this.triggeredElements.get(t.id);
                          if (!n) return;
                          let r = this.resolveAssignedTimelineIds(e, t);
                          if (r?.length === 0) return;
                          let a = r ?? t.timelineIds ?? [],
                            o = [];
                          for (let e of n)
                            for (let t of a)
                              o.push({
                                timelineId: t,
                                element: e,
                                action: "pause-reset",
                              });
                          (await this.executeTimelineOperationsAsync(o),
                            n.forEach((e) => {
                              this.executeConditionalOutcome(i, e, t, r);
                            }));
                        }
                      },
                    );
                  },
                ),
                a = this.triggerObservers.get(t.id);
              (a || ((a = new Map()), this.triggerObservers.set(t.id, a)),
                a.set(i, r));
            } catch (e) {
              console.error("Error setting up trigger reactive monitoring:", e);
            }
          }
          async executeReactiveCallbackSafely(e, t, n) {
            this.reactiveExecutionContext.has(t) ||
              (this.pendingReactiveUpdates.set(t, n),
              this.debouncedReactiveCallback());
          }
          async processPendingReactiveUpdates() {
            if (0 === this.pendingReactiveUpdates.size) return;
            let e = new Map(this.pendingReactiveUpdates);
            this.pendingReactiveUpdates.clear();
            let t = new Map();
            for (let [n, i] of e) {
              let e = n.split(":")[0];
              (t.has(e) || t.set(e, []),
                t.get(e).push({ triggerKey: n, callback: i }));
            }
            for (let [e, n] of t)
              await this.processInteractionReactiveUpdates(e, n);
          }
          async processInteractionReactiveUpdates(e, t) {
            let n = this.reactiveCallbackQueues.get(e);
            if (n)
              try {
                await n;
              } catch (e) {
                console.error(
                  "Error waiting for pending reactive callback:",
                  e,
                );
              }
            let i = this.executeInteractionUpdates(t);
            this.reactiveCallbackQueues.set(e, i);
            try {
              await i;
            } finally {
              this.reactiveCallbackQueues.get(e) === i &&
                this.reactiveCallbackQueues.delete(e);
            }
          }
          async executeInteractionUpdates(e) {
            for (let { triggerKey: t, callback: n } of e) {
              this.reactiveExecutionContext.add(t);
              try {
                await n();
              } catch (e) {
                console.error("Error in reactive callback for %s:", t, e);
              } finally {
                this.reactiveExecutionContext.delete(t);
              }
            }
          }
          async executeTimelineOperationsAsync(e) {
            if (e.length)
              return new Promise((t) => {
                Promise.resolve().then(() => {
                  (e.forEach(({ timelineId: e, element: t, action: n }) => {
                    try {
                      if (!this.timelineDefs.has(e))
                        return void console.warn(
                          `Timeline ${e} not found, skipping operation`,
                        );
                      if (!t.isConnected)
                        return void console.warn(
                          "Element no longer in DOM, skipping timeline operation",
                        );
                      "pause-reset" === n
                        ? this.coordinator.pause(e, t, 0)
                        : console.warn(`Unknown timeline action: ${n}`);
                    } catch (t) {
                      console.error(
                        "Error executing timeline operation: %s, %s",
                        n,
                        e,
                        t,
                      );
                    }
                  }),
                    t());
                });
              });
          }
          getTimelineIdsForRole(e, t) {
            let n = e.timelineIds ?? [],
              i = n.filter((e) => {
                let n = this.timelineDefs.get(e);
                return n?.triggerMetadata?.role === t;
              });
            if (0 === i.length && n.length > 0) {
              let i = n
                .map(
                  (e) =>
                    this.timelineDefs.get(e)?.triggerMetadata?.role || "none",
                )
                .join(", ");
              console.warn(
                `IX3: No timelines found for role '${t}' in interaction '${e.id}'. Available roles: [${i}]`,
              );
            }
            return i;
          }
          getTimelineIdForRole(e, t) {
            return this.getTimelineIdsForRole(e, t)[0];
          }
          getTimelineIdsForGroup(e, t) {
            return (e.timelineIds ?? []).filter((e) => {
              let n = this.timelineDefs.get(e);
              return n?.groupId === t;
            });
          }
          resolveAssignedTimelineIds(e, t) {
            let n = e[1];
            return null === n.assignedGroupId
              ? []
              : n.assignedGroupId
                ? this.getTimelineIdsForGroup(t, n.assignedGroupId)
                : n.assignedTimelineRole
                  ? this.getTimelineIdsForRole(t, n.assignedTimelineRole)
                  : void 0;
          }
          async runTrigger(e, t, n, i, r) {
            if (window.__wf_ix3) return;
            let a = e[1],
              o = this.triggeredElements.get(n);
            (o || this.triggeredElements.set(n, (o = new Set())), o.add(t));
            let l = this.interactions.get(n);
            if (!l || !l.triggers.includes(e)) return;
            let s = i ?? l.timelineIds ?? [];
            if (a.conditionalLogic)
              try {
                let e = (await this.conditionEval.evaluateConditionsForTrigger(
                  a.conditionalLogic.conditions,
                  l,
                ))
                  ? a.conditionalLogic.ifTrue
                  : a.conditionalLogic.ifFalse;
                e && this.executeConditionalOutcome(e, t, l, s);
              } catch (e) {
                (console.error(
                  "Error evaluating trigger conditional logic:",
                  e,
                ),
                  s.forEach((e) => this.runTimelineAction(e, a, t, r)));
              }
            else s.forEach((e) => this.runTimelineAction(e, a, t, r));
          }
          skipToEndState(e, t, n, i, r) {
            (i ?? e.timelineIds ?? []).forEach((e) => {
              let i,
                a = this.coordinator.getTimeline(e, t);
              if (!a) return;
              let o =
                r ??
                (n ? this.getEffectivePlaybackConfig(e, n).control : void 0);
              if ("pause" !== o && "stop" !== o && "none" !== o) {
                switch (o) {
                  case "reverse":
                  case "reverseFlipEase":
                    i = 0;
                    break;
                  case "togglePlayReverse":
                  case "togglePlayReverseFlipEase":
                    i = Math.round(1 - a.totalProgress());
                    break;
                  case "resume":
                    i = +!a.reversed();
                    break;
                  default:
                    i = 1;
                }
                this.coordinator.setTotalProgress(e, i, t ?? null);
              }
            });
          }
          executeConditionalOutcome(e, t, n, i) {
            let r,
              {
                control: a,
                targetTimelineId: o,
                speed: l,
                jump: s,
                delay: u = 0,
              } = e,
              d = (0, c.toSeconds)(u);
            if ("none" === a) return;
            let f = n.timelineIds ?? [];
            if (o) {
              if (!f.includes(o))
                return void console.warn(
                  `Target timeline '${o}' not found in interaction '${n.id}'. Available timelines: ${f.join(", ")}`,
                );
              r = [o];
            } else r = f;
            if (i) {
              let e = new Set(i);
              r = r.filter((t) => e.has(t));
            }
            if (0 === r.length) return;
            let p = () => {
              r.forEach((e) => {
                void 0 !== l && this.coordinator.setTimeScale(e, l, t);
                let n = (0, c.toSeconds)(s);
                switch (a) {
                  case "play":
                    this.coordinator.play(e, t, n);
                    break;
                  case "pause":
                  case "stop":
                    this.coordinator.pause(e, t, n);
                    break;
                  case "resume":
                    this.coordinator.resume(e, t, n);
                    break;
                  case "reverse":
                  case "reverseFlipEase":
                    this.coordinator.reverse(e, t, n);
                    break;
                  case "restart":
                  default:
                    this.coordinator.restart(e, t);
                    break;
                  case "togglePlayReverse":
                  case "togglePlayReverseFlipEase":
                    this.coordinator.togglePlayReverse(e, t);
                }
              });
            };
            d
              ? setTimeout(() => {
                  p();
                }, 1e3 * d)
              : p();
          }
          getEffectivePlaybackConfig(e, t) {
            let n = this.timelineDefs.get(e);
            if (n?.triggerMetadata) {
              let e = n.settings;
              return {
                control: e?.control,
                delay: e?.delay,
                jump: e?.jump,
                speed: e?.speed,
              };
            }
            let r =
              t.controlType && (0, c.isValidControlType)(t.controlType)
                ? t.controlType
                : i.TimelineControlType.STANDARD;
            if (n?.groupId && r === i.TimelineControlType.STANDARD) {
              let e = n.settings;
              return {
                control: t.control,
                delay: void 0,
                jump: e?.jump,
                speed: e?.speed,
              };
            }
            return {
              control: t.control,
              delay: void 0,
              jump: t.jump,
              speed: t.speed,
            };
          }
          runTimelineAction(e, t, n, i) {
            let {
                control: r,
                delay: a,
                jump: o,
                speed: l,
              } = this.getEffectivePlaybackConfig(e, t),
              s = i ?? r,
              u = this.timelineDefs.get(e);
            if (u?.reuse) {
              let t = u.reuse.sourceTimelineId;
              if (!this.timelineDefs.has(t))
                return void console.warn(
                  `Timeline reuse: source '${t}' not found for '${e}'`,
                );
              e = t;
            }
            let d = () => {
                this.coordinator.setTimeScale(e, l ?? 1, n);
                let t = (0, c.toSeconds)(o);
                switch (s) {
                  case "play":
                    this.coordinator.play(e, n, t);
                    break;
                  case "pause":
                  case "stop":
                    this.coordinator.pause(e, n, t);
                    break;
                  case "resume":
                    this.coordinator.resume(e, n, t);
                    break;
                  case "reverse":
                  case "reverseFlipEase":
                    this.coordinator.reverse(e, n, t);
                    break;
                  case "restart":
                  case void 0:
                  default:
                    this.coordinator.restart(e, n);
                    break;
                  case "togglePlayReverse":
                  case "togglePlayReverseFlipEase":
                    this.coordinator.togglePlayReverse(e, n);
                  case "none":
                }
              },
              f = (0, c.toSeconds)(a);
            f && f > 0 ? setTimeout(d, 1e3 * f) : d();
          }
          resolveTargets;
          isTargetDynamic;
          getComponentScopeSelector(e) {
            let t = this.componentScopeSelectors.get(e);
            return (
              t ||
                ((t = `[data-wf-component-id="${CSS.escape(e)}"]`),
                this.componentScopeSelectors.set(e, t)),
              t
            );
          }
          resolveTargetsImpl(e, t, n, i) {
            let [r, a, o] = e;
            if ("*" === a && o && o.filterBy) {
              let e = this.resolveUniversalSelectorOptimized(o, t, n, i);
              if (e) return e;
            }
            let l = this.pluginReg.getTargetResolver([r, a]);
            if (!l) return [];
            let s = l.resolve([r, a], t),
              u = i ? this.filterByScope(s, i) : s;
            return u.length && o && "none" !== o.relationship && o.filterBy
              ? this.applyRelationshipFilter(
                  u,
                  o.relationship,
                  this.resolveTargetsImpl(o.filterBy, t, n, i),
                  o.firstMatchOnly,
                )
              : u;
          }
          resolveUniversalSelectorOptimized(e, t, n, i) {
            if (!e.filterBy) return null;
            let r = this.resolveTargetsImpl(e.filterBy, t, n, i),
              a = r.length;
            if (!a) return [];
            let o = !!e.firstMatchOnly;
            switch (e.relationship) {
              case "direct-child-of": {
                let e = [];
                for (let t = 0; t < a; t++) {
                  let n = r[t];
                  if (!n) continue;
                  let i = n.children;
                  for (let t = 0; t < i.length; t++)
                    if ((e.push(i[t]), o)) return e;
                }
                return e;
              }
              case "within": {
                let e = [];
                for (let t = 0; t < a; t++) {
                  let n = r[t];
                  if (!n) continue;
                  let i = n.querySelectorAll("*");
                  for (let t = 0; t < i.length; t++)
                    if ((e.push(i[t]), o)) return e;
                }
                return e;
              }
              case "direct-parent-of": {
                let e = new Set(),
                  t = [];
                for (let n = 0; n < a; n++) {
                  let i = r[n];
                  if (!i) continue;
                  let a = i.parentElement;
                  if (a && !e.has(a) && (e.add(a), t.push(a), o)) break;
                }
                return i ? this.filterByScope(t, i) : t;
              }
              case "next-sibling-of": {
                let e = [];
                for (let t = 0; t < a; t++) {
                  let n = r[t];
                  if (!n) continue;
                  let i = n.nextElementSibling;
                  if (i && (e.push(i), o)) break;
                }
                return i ? this.filterByScope(e, i) : e;
              }
              case "prev-sibling-of": {
                let e = [];
                for (let t = 0; t < a; t++) {
                  let n = r[t];
                  if (!n) continue;
                  let i = n.previousElementSibling;
                  if (i && (e.push(i), o)) break;
                }
                return i ? this.filterByScope(e, i) : e;
              }
              case "next-to": {
                let e = new Set(),
                  t = [];
                for (let n = 0; n < a; n++) {
                  let i = r[n];
                  if (!i) continue;
                  let a = i.parentElement;
                  if (a) {
                    let n = a.children;
                    for (let r = 0; r < n.length; r++) {
                      let a = n[r];
                      if (a !== i && !e.has(a) && (e.add(a), t.push(a), o))
                        break;
                    }
                    if (o && t.length) break;
                  }
                }
                return i ? this.filterByScope(t, i) : t;
              }
              case "contains": {
                let e = new Set(),
                  t = [];
                for (let n = 0; n < a; n++) {
                  let i = r[n];
                  if (!i) continue;
                  let a = i.parentElement;
                  for (; a && !e.has(a) && (e.add(a), t.push(a), !o); ) {
                    a = a.parentElement;
                  }
                  if (o && t.length) break;
                }
                return i ? this.filterByScope(t, i) : t;
              }
              default:
                return null;
            }
          }
          applyRelationshipFilter(e, t, n, i) {
            if (!e.length || !n.length) return [];
            if ("none" === t) return e;
            let r = [],
              a = new Set();
            switch (t) {
              case "direct-child-of": {
                let t = new Set(n);
                for (let n = 0; n < e.length; n++) {
                  let o = e[n];
                  if (
                    !a.has(o) &&
                    o.parentElement &&
                    t.has(o.parentElement) &&
                    (a.add(o), r.push(o), i)
                  )
                    break;
                }
                return r;
              }
              case "direct-parent-of": {
                let t = new Set();
                for (let e = 0; e < n.length; e++) {
                  let i = n[e].parentElement;
                  i && t.add(i);
                }
                for (let n = 0; n < e.length; n++) {
                  let o = e[n];
                  if (!a.has(o) && t.has(o) && (a.add(o), r.push(o), i)) break;
                }
                return r;
              }
              case "next-sibling-of": {
                let t = new Set(n);
                for (let n = 0; n < e.length; n++) {
                  let o = e[n];
                  if (a.has(o)) continue;
                  let l = o.previousElementSibling;
                  if (l && t.has(l) && (a.add(o), r.push(o), i)) break;
                }
                return r;
              }
              case "prev-sibling-of": {
                let t = new Set(n);
                for (let n = 0; n < e.length; n++) {
                  let o = e[n];
                  if (a.has(o)) continue;
                  let l = o.nextElementSibling;
                  if (l && t.has(l) && (a.add(o), r.push(o), i)) break;
                }
                return r;
              }
              case "next-to": {
                let t = new Set(n),
                  o = new Map();
                for (let e = 0; e < n.length; e++) {
                  let t = n[e].parentElement;
                  t && o.set(t, (o.get(t) ?? 0) + 1);
                }
                for (let n = 0; n < e.length; n++) {
                  let l = e[n];
                  if (a.has(l) || !l.parentElement) continue;
                  let s = o.get(l.parentElement);
                  if (s && (!t.has(l) || !(s <= 1)) && (a.add(l), r.push(l), i))
                    break;
                }
                return r;
              }
              case "within": {
                let t = new Set(n);
                for (let n = 0; n < e.length; n++) {
                  let o = e[n];
                  if (a.has(o)) continue;
                  let l = o.parentElement;
                  for (; l; ) {
                    if (t.has(l)) {
                      if ((a.add(o), r.push(o), i)) return r;
                      break;
                    }
                    l = l.parentElement;
                  }
                }
                return r;
              }
              case "contains": {
                let t = new Set();
                for (let e = 0; e < n.length; e++) {
                  let i = n[e].parentElement;
                  for (; i && !t.has(i); ) (t.add(i), (i = i.parentElement));
                }
                for (let n = 0; n < e.length; n++) {
                  let o = e[n];
                  if (!a.has(o) && t.has(o) && (a.add(o), r.push(o), i)) break;
                }
                return r;
              }
              default:
                return [];
            }
          }
          filterByInstance(e, t, n) {
            if (!e.length) return e;
            let i = n.closest(t);
            if (!i) return e;
            let r = -1;
            for (let n = 0; n < e.length; n++)
              if (e[n]?.closest(t) !== i) {
                r = n;
                break;
              }
            if (-1 === r) return e;
            let a = e.slice(0, r);
            for (let n = r + 1; n < e.length; n++) {
              let r = e[n];
              r?.closest(t) === i && a.push(r);
            }
            return a;
          }
          filterByScope(e, t) {
            if (!e.length) return e;
            let n = -1;
            for (let i = 0; i < e.length; i++) {
              let r = e[i];
              if (!r?.closest(t)) {
                n = i;
                break;
              }
            }
            if (-1 === n) return e;
            let i = e.slice(0, n);
            for (let r = n + 1; r < e.length; r++) {
              let n = e[r];
              n?.closest(t) && i.push(n);
            }
            return i;
          }
          filterByVariant(e, t, n) {
            if (!e.length) return e;
            let i = (e) => {
                let i = e.closest(t);
                if (!i) return !1;
                let r = i.getAttribute("data-wf-variant-state");
                return null != r && n.includes(r);
              },
              r = -1;
            for (let t = 0; t < e.length; t++) {
              let n = e[t];
              if (!n || !i(n)) {
                r = t;
                break;
              }
            }
            if (-1 === r) return e;
            let a = e.slice(0, r);
            for (let t = r + 1; t < e.length; t++) {
              let n = e[t];
              n && i(n) && a.push(n);
            }
            return a;
          }
          getInteractionForTimeline;
          incrementTimelineRefCount(e) {
            let t = this.timelineRefCounts.get(e) || 0;
            this.timelineRefCounts.set(e, t + 1);
          }
          decrementTimelineRefCount(e) {
            let t = Math.max(0, (this.timelineRefCounts.get(e) || 0) - 1);
            return (this.timelineRefCounts.set(e, t), t);
          }
          decrementTimelineReferences(e) {
            let t = new Set(),
              n = this.interactionTimelineRefs.get(e);
            if (!n) return t;
            for (let e of n)
              0 === this.decrementTimelineRefCount(e) && t.add(e);
            return t;
          }
          unbindAllTriggers(e) {
            let t = this.triggerCleanupFunctions.get(e);
            if (t) {
              for (let [, e] of t)
                for (let t of e)
                  try {
                    t();
                  } catch (e) {
                    console.error("Error during trigger cleanup:", e);
                  }
              this.triggerCleanupFunctions.delete(e);
            }
          }
          cleanupTriggerObservers(e) {
            let t = this.triggerObservers.get(e);
            if (t) {
              for (let [e, n] of t) {
                try {
                  n();
                } catch (e) {
                  console.error("Error during trigger observer cleanup:", e);
                }
                (this.pendingReactiveUpdates.delete(e),
                  this.reactiveExecutionContext.delete(e));
              }
              (this.reactiveCallbackQueues.delete(e),
                this.triggerObservers.delete(e));
            }
          }
          cleanupContinuousControlsForInteraction(e) {
            let t = this.continuousCleanups.get(e);
            if (t) {
              for (let [, e] of t)
                try {
                  e();
                } catch (e) {
                  console.error("Error during continuous control cleanup:", e);
                }
              this.continuousCleanups.delete(e);
            }
          }
          cleanupAllContinuousControls() {
            for (let [, e] of this.continuousCleanups)
              for (let [, t] of e)
                try {
                  t();
                } catch (e) {
                  console.error("Error during continuous control cleanup:", e);
                }
            this.continuousCleanups.clear();
          }
          cleanupInteractionAnimations(e) {
            (this.unbindAllTriggers(e),
              this.cleanupContinuousControlsForInteraction(e));
            let t = this.interactionTimelineRefs.get(e);
            if (t)
              for (let e of t)
                0 === this.decrementTimelineRefCount(e) &&
                  this.destroyTimelineInstance(e);
            this.triggeredElements.delete(e);
          }
        }
      },
      8912: function (e, t) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "PluginRegistry", {
            enumerable: !0,
            get: function () {
              return n;
            },
          }));
        class n {
          plugins = new Map();
          extensionsByPoint = new Map();
          activePlugins = new Set();
          pluginStorage = new Map();
          constructor() {
            ["trigger", "action", "targetResolver", "condition"].forEach((e) =>
              this.extensionsByPoint.set(e, new Map()),
            );
          }
          async registerPlugin(e) {
            let t = i(e.manifest.id);
            if (this.plugins.has(t))
              throw Error(`Plugin ${t} is already registered`);
            let n = Object.entries(e.manifest.dependencies ?? {});
            for (let [e] of n)
              if (!this.plugins.has(e))
                throw Error(`Missing dependency: ${e} required by ${t}`);
            for (let n of (this.plugins.set(t, e),
            e.initialize && (await e.initialize()),
            e.extensions))
              this.registerExtension(n);
            n.length || (await this.activatePlugin(t));
          }
          registerExtension(e) {
            this.extensionsByPoint.has(e.extensionPoint) ||
              this.extensionsByPoint.set(e.extensionPoint, new Map());
            let t = this.extensionsByPoint.get(e.extensionPoint),
              n = e.id;
            if (t.has(n))
              throw Error(
                `Extension ${n} is already registered for point ${e.extensionPoint}`,
              );
            t.set(n, e);
          }
          async activatePlugin(e) {
            if (this.activePlugins.has(e)) return;
            let t = this.plugins.get(e);
            if (!t) throw Error(`Cannot activate unknown plugin: ${e}`);
            for (let e of Object.keys(t.manifest.dependencies ?? {}))
              await this.activatePlugin(e);
            (t.activate && (await t.activate()), this.activePlugins.add(e));
          }
          async deactivatePlugin(e) {
            if (!this.activePlugins.has(e)) return;
            let t = this.plugins.get(e);
            if (!t) throw Error(`Cannot deactivate unknown plugin: ${e}`);
            (t.deactivate && (await t.deactivate()),
              this.activePlugins.delete(e));
          }
          async unregisterPlugin(e, t) {
            let n = i([e, t]),
              r = this.plugins.get(n);
            if (r) {
              for (let e of (this.activePlugins.has(n) &&
                (await this.deactivatePlugin(n)),
              r.extensions))
                ("condition" === e.extensionPoint &&
                  e.implementation.dispose &&
                  (await e.implementation.dispose()),
                  this.extensionsByPoint
                    .get(e.extensionPoint)
                    ?.delete(`${n}:${e.id}`));
              (r.dispose && (await r.dispose()),
                this.plugins.delete(n),
                this.pluginStorage.delete(n));
            }
          }
          getExtensions(e) {
            return this.extensionsByPoint.get(e) || new Map();
          }
          getExtensionImpl(e, t) {
            return this.getExtensions(t).get(e)?.implementation;
          }
          getTriggerHandler([e]) {
            return this.getExtensionImpl(e, "trigger");
          }
          getActionHandler(e) {
            return this.getExtensionImpl(e, "action");
          }
          getTargetResolver([e]) {
            return this.getExtensionImpl(e, "targetResolver");
          }
          getConditionEvaluator([e]) {
            return this.getExtensionImpl(e, "condition");
          }
          getAllPlugins() {
            return this.plugins.values();
          }
        }
        function i(e) {
          return `${e[0]}:${e[1]}`;
        }
      },
      6378: function (e, t) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "PluginRuntimeBridge", {
            enumerable: !0,
            get: function () {
              return n;
            },
          }));
        class n {
          intervalHandlers = new Map();
          channelSubscribers = new Map();
          registerIntervalHandler(e, t) {
            let n = this.intervalHandlers.get(e);
            n !== t &&
              (void 0 !== n &&
                console.warn(
                  "IX3: registerIntervalHandler called twice. The previous handler is being replaced; verify the plugin is registered exactly once (or use a unique pluginKey per concurrent handler).",
                  { pluginKey: e },
                ),
              this.intervalHandlers.set(e, t));
          }
          fireInterval(e) {
            for (let [t, n] of this.intervalHandlers)
              try {
                n(e);
              } catch (e) {
                console.error(
                  "IX3: interval handler threw. Continuing with the remaining handlers. Investigate the plugin to prevent silent data drift.",
                  { pluginKey: t },
                  e,
                );
              }
          }
          publish(e, t, n) {
            let i = this.channelSubscribers.get(e);
            if (i) {
              for (let r of i.values())
                for (let i of r.slice())
                  if (!i.element || !n || i.element === n)
                    try {
                      i.cb(t);
                    } catch (t) {
                      console.error(
                        "IX3: channel subscriber threw. Continuing with remaining subscribers.",
                        { channel: e },
                        t,
                      );
                    }
            }
          }
          subscribe(e, t, n, i) {
            let r = this.channelSubscribers.get(t);
            r || ((r = new Map()), this.channelSubscribers.set(t, r));
            let a = r.get(e) ?? [],
              o = { element: n, cb: i };
            return (
              a.push(o),
              r.set(e, a),
              () => {
                let n = this.channelSubscribers.get(t)?.get(e);
                if (!n) return;
                let i = n.indexOf(o);
                (-1 !== i && n.splice(i, 1),
                  0 === n.length &&
                    (this.channelSubscribers.get(t)?.delete(e),
                    this.channelSubscribers.get(t)?.size === 0 &&
                      this.channelSubscribers.delete(t)));
              }
            );
          }
          destroyTimeline(e) {
            for (let [t, n] of this.channelSubscribers)
              (n.delete(e), 0 === n.size && this.channelSubscribers.delete(t));
          }
        }
      },
      7009: function (e, t) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "RuntimeMotionDriver", {
            enumerable: !0,
            get: function () {
              return n;
            },
          }));
        class n {
          env;
          constructor(e) {
            this.env = e;
          }
          hasGsap() {
            return null != this.env.win.gsap;
          }
          hasObserver() {
            return null != this.env.win.Observer;
          }
          timeline() {
            return this.env.win.gsap?.timeline() ?? null;
          }
          to(...e) {
            return this.env.win.gsap?.to(...e) ?? null;
          }
          set(...e) {
            this.env.win.gsap?.set(...e);
          }
          getProperty(...e) {
            return this.env.win.gsap?.getProperty(...e) ?? 0;
          }
          quickSetter(...e) {
            return this.env.win.gsap?.quickSetter(...e) ?? null;
          }
          quickTo(...e) {
            return this.env.win.gsap?.quickTo(...e) ?? null;
          }
          addTicker(e) {
            let t = this.env.win.gsap;
            if (t?.ticker)
              return (
                t.ticker.add(e),
                () => {
                  try {
                    t.ticker?.remove(e);
                  } catch {}
                }
              );
            let n = this.env.win,
              i = 0,
              r = !0,
              a = () => {
                r && (e(), r && (i = n.requestAnimationFrame(a)));
              };
            return (
              (i = n.requestAnimationFrame(a)),
              () => {
                ((r = !1), n.cancelAnimationFrame(i));
              }
            );
          }
          createObserver(...e) {
            return this.env.win.Observer?.create(...e) ?? null;
          }
        }
      },
      3408: function (e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var i = {
          convertEaseConfigToGSAP: function () {
            return l;
          },
          convertEaseConfigToLinear: function () {
            return s;
          },
          isAdvancedEase: function () {
            return u;
          },
          isBasicEase: function () {
            return c;
          },
        };
        for (var r in i)
          Object.defineProperty(t, r, { enumerable: !0, get: i[r] });
        let a = n(3648);
        function o() {
          return {
            gsap: window.gsap,
            CustomEase: window.CustomEase,
            CustomWiggle: window.CustomWiggle,
            CustomBounce: window.CustomBounce,
          };
        }
        function l(e, t = o(), n) {
          return null == e
            ? "none"
            : "number" == typeof e
              ? a.EASING_NAMES[e] || "none"
              : (function (e, t, n) {
                  switch (e.type) {
                    case "back":
                      return `back.${e.curve}(${e.power})`;
                    case "elastic":
                      return `elastic.${e.curve}(${e.amplitude}, ${e.period})`;
                    case "steps":
                      return `steps(${e.stepCount})`;
                    case "rough": {
                      let {
                        templateCurve: t,
                        points: n,
                        strength: i,
                        taper: r,
                        randomizePoints: a,
                        clampPoints: o,
                      } = e;
                      return `rough({ template: ${t}, strength: ${i}, points: ${n}, taper: ${r}, randomize: ${a}, clamp: ${o} })`;
                    }
                    case "slowMo":
                      return `slow(${e.linearRatio}, ${e.power}, ${e.yoyoMode})`;
                    case "expoScale":
                      return `expoScale(${e.startingScale}, ${e.endingScale}, ${e.templateCurve})`;
                    case "customWiggle": {
                      let { CustomWiggle: i } = t;
                      if (!i) return null;
                      return i.create(
                        (0, a.buildCustomEaseId)("customIX3Wiggle", n),
                        { wiggles: e.wiggles, type: e.wiggleType },
                      );
                    }
                    case "customBounce": {
                      let { CustomBounce: i } = t;
                      if (!i) return null;
                      return i.create(
                        (0, a.buildCustomEaseId)("customIX3Bounce", n),
                        {
                          strength: e.strength,
                          endAtStart: e.endAtStart,
                          squash: e.squash,
                          squashID: (0, a.buildCustomEaseId)(
                            "customIX3Squash",
                            n,
                          ),
                        },
                      );
                    }
                    case "customEase": {
                      let { CustomEase: i } = t;
                      if (!i) return null;
                      return i.create(
                        (0, a.buildCustomEaseId)("customIX3Ease", n),
                        e.bezierCurve,
                      );
                    }
                    default:
                      return "none";
                  }
                })(e, t, n);
        }
        function s(e, t = o(), n = 20) {
          if (null == e) return "linear";
          let i = l(e, t);
          if (null === i) return "linear";
          if ("object" == typeof e && "steps" === e.type)
            return `steps(${e.stepCount})`;
          let { gsap: r } = t;
          if (!r) return "linear";
          let a = r.parseEase(i);
          if ("function" != typeof a) return "linear";
          let u = [];
          for (let e = 0; e <= n; e++) {
            let t = e / n,
              i = a(t);
            u.push({ t: Number(t.toFixed(4)), value: Number(i.toFixed(4)) });
          }
          return (
            "linear(" +
            u.map((e) => `${e.value} ${Math.round(100 * e.t)}%`).join(", ") +
            ")"
          );
        }
        function u(e) {
          return "object" == typeof e && null !== e;
        }
        function c(e) {
          return "number" == typeof e;
        }
      },
      8070: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "analyzeSharedTimelineGroups", {
            enumerable: !0,
            get: function () {
              return r;
            },
          }));
        let i = n(1983);
        function r(e, t, n, r, a) {
          let o = e.timelineIds ?? [];
          if (o.length < 2) return [];
          for (let [, t] of e.triggers)
            if (
              t?.controlType === i.TimelineControlType.CONTINUOUS ||
              (function (e) {
                var t;
                return (
                  !e ||
                  (void 0 !== e.controlType &&
                    e.controlType !== i.TimelineControlType.STANDARD) ||
                  !(
                    void 0 !== e.assignedGroupId ||
                    e.assignedTimelineRole ||
                    ("object" == typeof (t = e.pluginConfig) &&
                      null !== t &&
                      !0 === t.multiTimeline)
                  )
                );
              })(t)
            )
              return [];
          if (
            (function (e, t, n) {
              let i = [];
              for (let [, r, a] of e) {
                let e = (function (e) {
                  let t =
                    "string" == typeof e?.assignedGroupId
                      ? e.assignedGroupId
                      : void 0;
                  return void 0 !== t
                    ? `group:${t}`
                    : e?.assignedTimelineRole
                      ? `role:${e.assignedTimelineRole}`
                      : void 0;
                })(r);
                void 0 !== e &&
                  i.push({
                    route: e,
                    eventMode: (function (e) {
                      let t = e?.pluginConfig;
                      if ("object" == typeof t && null !== t) {
                        let e = t.eventMode;
                        return "enter" === e || "leave" === e ? e : void 0;
                      }
                    })(r),
                    elements: a ? new Set(t(a, {}, n)) : new Set(),
                  });
              }
              for (let e = 0; e < i.length; e++)
                for (let t = e + 1; t < i.length; t++) {
                  if (i[e].route === i[t].route) continue;
                  let n = i[e].eventMode,
                    r = i[t].eventMode,
                    a = (function (e, t) {
                      let [n, i] = e.size <= t.size ? [e, t] : [t, e];
                      for (let e of n) if (i.has(e)) return !0;
                      return !1;
                    })(i[e].elements, i[t].elements),
                    o = void 0 !== n && void 0 !== r;
                  if (a) {
                    if (!(o && n !== r)) return !0;
                  } else if (
                    o ||
                    (function (e, t) {
                      for (let n of e)
                        for (let e of t)
                          if (n !== e && (n.contains(e) || e.contains(n)))
                            return !0;
                      return !1;
                    })(i[e].elements, i[t].elements)
                  )
                    return !0;
                }
              return !1;
            })(e.triggers, n, e)
          )
            return [];
          let l = [];
          for (let i of o) {
            let o = t.get(i);
            if (
              !o ||
              o.reuse ||
              !o.actions?.length ||
              (function (e, t) {
                for (let n of e.actions ?? [])
                  for (let e in n.properties)
                    if (t(e)?.createCustomTween) return !0;
                return !1;
              })(o, r) ||
              a?.(o, e)
            )
              continue;
            let s = new Set();
            for (let t of o.actions)
              if (t.targets)
                for (let i of t.targets) for (let t of n(i, {}, e)) s.add(t);
            l.push({ id: i, targets: s });
          }
          let s = [],
            u = new Set();
          for (let e = 0; e < l.length; e++) {
            if (u.has(e)) continue;
            let t = [l[e].id],
              { targets: n } = l[e];
            u.add(e);
            for (let i = e + 1; i < l.length; i++) {
              if (u.has(i)) continue;
              let { targets: e } = l[i];
              (function (e, t) {
                if (e.size !== t.size) return !1;
                for (let n of e) if (!t.has(n)) return !1;
                return !0;
              })(n, e) && (t.push(l[i].id), u.add(i));
            }
            t.length >= 2 && s.push({ primary: t[0], members: t });
          }
          return s;
        }
      },
      3054: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "ContinuousTriggerStrategy", {
            enumerable: !0,
            get: function () {
              return a;
            },
          }));
        let i = n(2855),
          r = n(6325);
        class a extends i.BaseTriggerStrategy {
          continuousCleanups;
          triggerCleanupFunctions;
          coordinator;
          getTimelineIdForRole;
          constructor(e, t, n, i, r, a, o) {
            (super(e, t, n),
              (this.continuousCleanups = i),
              (this.triggerCleanupFunctions = r),
              (this.coordinator = a),
              (this.getTimelineIdForRole = o));
          }
          bind(e, t, n) {
            let {
              interactionId: i,
              elements: a,
              triggerHandler: o,
              conditionalContext: l,
            } = n;
            for (let s of a) {
              if (!s) continue;
              if (null !== l) {
                "skip-to-end" === l.behavior && this.skipToEndState(t, s);
                continue;
              }
              let a = (e) => this.getTimelineIdForRole(t, e),
                u = new r.ContinuousChannelManager(this.coordinator, a),
                c = o(e, s, n.eventManager, (e) => {
                  if (null != e && "type" in e && "continuous" === e.type) {
                    let t = e.setup(u),
                      n = this.continuousCleanups.get(i);
                    (n || ((n = new Map()), this.continuousCleanups.set(i, n)),
                      n.set(s, () => {
                        (t(), u.cleanup());
                      }));
                  }
                });
              if (c) {
                let e = this.triggerCleanupFunctions.get(i);
                e || ((e = new Map()), this.triggerCleanupFunctions.set(i, e));
                let t = e.get(s);
                (t || ((t = new Set()), e.set(s, t)), t.add(c));
              }
            }
          }
        }
      },
      3636: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "LoadTriggerStrategy", {
            enumerable: !0,
            get: function () {
              return r;
            },
          }));
        let i = n(2855);
        class r extends i.BaseTriggerStrategy {
          loadInteractions;
          getTimeline;
          constructor(e, t, n, i, r) {
            (super(e, t, n),
              (this.loadInteractions = i),
              (this.getTimeline = r));
          }
          bind(e, t, n) {
            if (window.__wf_ix3) return;
            let { conditionalContext: i, delay: r } = n,
              a = e[1];
            this.loadInteractions.push(() => {
              if (null !== i) {
                "skip-to-end" === i.behavior && this.skipToEndState(t, null);
                return;
              }
              let e = () => {
                for (let e of t.timelineIds ?? []) {
                  let t = this.getTimeline(e, null);
                  t &&
                    (t.data.splitLines
                      ? document.fonts.ready.then(() => {
                          this.runTimelineAction(e, a, null);
                        })
                      : this.runTimelineAction(e, a, null));
                }
              };
              r ? setTimeout(e, 1e3 * r) : e();
            });
          }
        }
      },
      4467: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "ScrollTriggerStrategy", {
            enumerable: !0,
            get: function () {
              return r;
            },
          }));
        let i = n(2855);
        class r extends i.BaseTriggerStrategy {
          setupScrollControl;
          constructor(e, t, n, i) {
            (super(e, t, n), (this.setupScrollControl = i));
          }
          bind(e, t, n) {
            let { interactionId: i, elements: r, conditionalContext: a } = n,
              o = e[1].scrollTriggerConfig;
            if (o) {
              for (let e of r)
                if (e) {
                  if (null !== a) {
                    "skip-to-end" === a.behavior && this.skipToEndState(t, e);
                    continue;
                  }
                  for (let n of t.timelineIds ?? [])
                    this.setupScrollControl(n, i, o, e);
                }
            }
          }
        }
      },
      9759: function (e, t, n) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "StandardTriggerStrategy", {
            enumerable: !0,
            get: function () {
              return r;
            },
          }));
        let i = n(2855);
        class r extends i.BaseTriggerStrategy {
          getTimelineIdsForRole;
          resolveAssignedTimelineIds;
          constructor(e, t, n, i, r) {
            (super(e, t, n),
              (this.getTimelineIdsForRole = i),
              (this.resolveAssignedTimelineIds = r));
          }
          bind(e, t, n) {
            let {
                interactionId: i,
                elements: r,
                triggerHandler: a,
                eventManager: o,
                conditionalContext: l,
                cleanupMap: s,
                delay: u,
              } = n,
              c = e[1];
            for (let n of r) {
              let r;
              if (!n) continue;
              let d = s.get(n);
              d || ((d = new Set()), s.set(n, d));
              let f = null,
                p = a(e, n, o, (a) => {
                  let o,
                    s =
                      a &&
                      "object" == typeof a &&
                      "playback-control" === a.type &&
                      "string" == typeof a.control
                        ? a.control
                        : void 0;
                  if (
                    ((o = (
                      a && "object" == typeof a
                        ? "timeline-role" !== a.type ||
                          "string" != typeof a.role
                        : 1
                    )
                      ? this.resolveAssignedTimelineIds(e, t)
                      : this.getTimelineIdsForRole(t, a.role)),
                    o?.length === 0)
                  )
                    return;
                  if (null !== l) {
                    "skip-to-end" === l.behavior &&
                      this.skipToEndState(t, null, c, o, s);
                    return;
                  }
                  let d = () => {
                    this.runTrigger(e, n, i, o, s).catch((e) =>
                      console.error("Error in trigger execution:", e),
                    );
                  };
                  c.conditionalLogic || !u
                    ? d()
                    : (null == f || s !== r) &&
                      (null != f && clearTimeout(f),
                      (r = s),
                      (f = setTimeout(() => {
                        ((f = null), d());
                      }, 1e3 * u)));
                });
              (p && d.add(p),
                d.add(() => {
                  null != f && (clearTimeout(f), (f = null));
                }));
            }
          }
        }
      },
      2855: function (e, t) {
        "use strict";
        (Object.defineProperty(t, "__esModule", { value: !0 }),
          Object.defineProperty(t, "BaseTriggerStrategy", {
            enumerable: !0,
            get: function () {
              return n;
            },
          }));
        class n {
          runTrigger;
          runTimelineAction;
          skipToEndState;
          constructor(e, t, n) {
            ((this.runTrigger = e),
              (this.runTimelineAction = t),
              (this.skipToEndState = n));
          }
        }
      },
      3648: function (e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var i = {
          EASING_NAMES: function () {
            return p;
          },
          buildCustomEaseId: function () {
            return f;
          },
          buildEaseContextId: function () {
            return d;
          },
          debounce: function () {
            return u;
          },
          defaultSplitClass: function () {
            return s;
          },
          isValidControlType: function () {
            return o;
          },
          throttle: function () {
            return c;
          },
          toSeconds: function () {
            return l;
          },
        };
        for (var r in i)
          Object.defineProperty(t, r, { enumerable: !0, get: i[r] });
        let a = n(1983);
        function o(e) {
          return (
            e === a.TimelineControlType.STANDARD ||
            e === a.TimelineControlType.SCROLL ||
            e === a.TimelineControlType.LOAD ||
            e === a.TimelineControlType.CONTINUOUS
          );
        }
        function l(e) {
          return "string" == typeof e ? parseFloat(e) / 1e3 : e;
        }
        function s(e) {
          return `gsap_split_${e}++`;
        }
        let u = (
            e,
            t = 0,
            { leading: n = !1, trailing: i = !0, maxWait: r } = {},
          ) => {
            let a,
              o,
              l,
              s = 0,
              u = () => {
                ((s = 0), (a = void 0), i && e.apply(o, l));
              };
            function c(...i) {
              ((o = this),
                (l = i),
                !s && ((s = performance.now()), n && e.apply(o, l)));
              let d = performance.now() - s;
              if (r && d >= r) {
                (clearTimeout(a), u());
                return;
              }
              (clearTimeout(a), (a = setTimeout(u, t)));
            }
            return (
              (c.cancel = () => {
                (clearTimeout(a), (a = void 0), (s = 0));
              }),
              c
            );
          },
          c = (
            e,
            t = 0,
            { leading: n = !0, trailing: i = !0, maxWait: r } = {},
          ) => {
            let a,
              o,
              l,
              s = 0,
              u = (t) => {
                ((s = t), (a = void 0), e.apply(o, l));
              };
            function c(...e) {
              let d = performance.now();
              s || n || (s = d);
              let f = t - (d - s);
              ((o = this),
                (l = e),
                f <= 0 || (r && d - s >= r)
                  ? (a && (clearTimeout(a), (a = void 0)), u(d))
                  : i && !a && (a = setTimeout(() => u(performance.now()), f)));
            }
            return (
              (c.cancel = () => {
                (clearTimeout(a), (a = void 0), (s = 0));
              }),
              c
            );
          };
        function d(e, t) {
          return `${e}-${t}`;
        }
        function f(e, t) {
          return t ? `${e}-${t}` : e;
        }
        let p = [
          "none",
          "power1.in",
          "power1.out",
          "power1.inOut",
          "power2.in",
          "power2.out",
          "power2.inOut",
          "power3.in",
          "power3.out",
          "power3.inOut",
          "power4.in",
          "power4.out",
          "power4.inOut",
          "back.in",
          "back.out",
          "back.inOut",
          "bounce.in",
          "bounce.out",
          "bounce.inOut",
          "circ.in",
          "circ.out",
          "circ.inOut",
          "elastic.in",
          "elastic.out",
          "elastic.inOut",
          "expo.in",
          "expo.out",
          "expo.inOut",
          "sine.in",
          "sine.out",
          "sine.inOut",
        ];
      },
      3973: function (e, t, n) {
        "use strict";
        let i = n(2019),
          r = n(5050),
          a = n(3949),
          o = { doc: document, win: window };
        class l {
          getInstance = () => this.instance;
          emit = (e, t, n, i) => {
            this.instance && this.instance.emit(e, t, n, i);
          };
          destroy = () => {
            this.instance && (this.instance.destroy(), (this.instance = null));
          };
          ready = async () => {
            if (!this.instance)
              try {
                ((this.instance = await i.IX3.init(o)),
                  await this.instance.registerPlugin(r.plugin));
              } catch (e) {
                throw (console.error("Error initializing IX3:", e), e);
              }
          };
        }
        a.define("ix3", () => new l());
      },
      2104: function (e, t) {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 });
        var n = {
          getFirst: function () {
            return r;
          },
          getSecond: function () {
            return a;
          },
          pair: function () {
            return o;
          },
        };
        for (var i in n)
          Object.defineProperty(t, i, { enumerable: !0, get: n[i] });
        let r = (e) => e[0],
          a = (e) => e[1],
          o = (e, t) => [e, t];
      },
      7043: function () {
        function e() {
          let e = Webflow.require("ix3");
          e.ready().then(() => {
            let t = e.getInstance();
            t &&
              (t.register(
                [
                  {
                    id: "i-a90b2f02",
                    scope: {
                      type: "pages",
                      value: ["6a507028c696969494376713"],
                    },
                    triggers: [
                      [
                        "wf:scroll",
                        {
                          controlType: "scroll",
                          scrollTriggerConfig: {
                            clamp: !0,
                            start: "top bottom",
                            end: "top 90%",
                            scrub: null,
                            enter: "play",
                            leave: "none",
                            enterBack: "none",
                            leaveBack: "none",
                          },
                        },
                        [
                          "wf:class",
                          ["chatbot-grid"],
                          { relationship: "none", firstMatchOnly: !1 },
                        ],
                      ],
                    ],
                    timelineIds: ["t-e7983cb5"],
                    deleted: !1,
                  },
                ],
                [
                  {
                    id: "t-e7983cb5",
                    deleted: !1,
                    actions: [
                      {
                        id: "ta-0dc816c0",
                        targets: [
                          [
                            "wf:class",
                            ["div-block-4"],
                            { relationship: "none", firstMatchOnly: !1 },
                          ],
                        ],
                        timing: { duration: 1, position: 0.5, ease: 6 },
                        tt: 1,
                        properties: {
                          "wf:transform": {
                            opacity: ["0%", null],
                            y: ["15%", null],
                          },
                        },
                      },
                    ],
                  },
                ],
              ),
              window.dispatchEvent(new CustomEvent("__wf_ix3_ready")),
              document.documentElement.classList.add("w-mod-ix3"));
          });
        }
        (Webflow.require("ix2").init({
          events: {
            e: {
              id: "e",
              name: "",
              animationType: "custom",
              eventTypeId: "PAGE_SCROLL",
              action: {
                id: "",
                actionTypeId: "GENERAL_CONTINUOUS_ACTION",
                config: {
                  actionListId: "a-29",
                  affectedElements: {},
                  duration: 0,
                },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                id: "6a50665ba4f0fd333a19689a",
                appliesTo: "PAGE",
                styleBlockIds: [],
              },
              targets: [
                {
                  id: "6a50665ba4f0fd333a19689a",
                  appliesTo: "PAGE",
                  styleBlockIds: [],
                },
              ],
              config: [
                {
                  continuousParameterGroupId: "a-29-p",
                  smoothing: 31,
                  startsEntering: !0,
                  addStartOffset: !1,
                  addOffsetValue: 50,
                  startsExiting: !1,
                  addEndOffset: !1,
                  endOffsetValue: 50,
                },
              ],
              createdOn: 0x18655215ac2,
            },
            "e-20": {
              id: "e-20",
              name: "",
              animationType: "custom",
              eventTypeId: "PAGE_START",
              action: {
                id: "",
                actionTypeId: "GENERAL_START_ACTION",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  actionListId: "a-27",
                  affectedElements: {},
                  playInReverse: !1,
                  autoStopEventId: "e-21",
                },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                id: "6a50665ba4f0fd333a19689a",
                appliesTo: "PAGE",
                styleBlockIds: [],
              },
              targets: [
                {
                  id: "6a50665ba4f0fd333a19689a",
                  appliesTo: "PAGE",
                  styleBlockIds: [],
                },
              ],
              config: {
                loop: !0,
                playInReverse: !1,
                scrollOffsetValue: null,
                scrollOffsetUnit: null,
                delay: null,
                direction: null,
                effectIn: null,
              },
              createdOn: 0x1866eb462f5,
            },
            "e-26": {
              id: "e-26",
              name: "",
              animationType: "custom",
              eventTypeId: "MOUSE_OVER",
              action: {
                id: "",
                actionTypeId: "GENERAL_START_ACTION",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  actionListId: "a-16",
                  affectedElements: {},
                  playInReverse: !1,
                  autoStopEventId: "e-27",
                },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                selector: ".image-hover",
                originalId:
                  "63eccca3bd3bb7bf1d1f0b69|3d69d647-c24d-7ba3-7730-31ed9d093f79",
                appliesTo: "CLASS",
              },
              targets: [
                {
                  selector: ".image-hover",
                  originalId:
                    "63eccca3bd3bb7bf1d1f0b69|3d69d647-c24d-7ba3-7730-31ed9d093f79",
                  appliesTo: "CLASS",
                },
              ],
              config: {
                loop: !1,
                playInReverse: !1,
                scrollOffsetValue: null,
                scrollOffsetUnit: null,
                delay: null,
                direction: null,
                effectIn: null,
              },
              createdOn: 0x183cb911912,
            },
            "e-27": {
              id: "e-27",
              name: "",
              animationType: "custom",
              eventTypeId: "MOUSE_OUT",
              action: {
                id: "",
                actionTypeId: "GENERAL_START_ACTION",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  actionListId: "a-17",
                  affectedElements: {},
                  playInReverse: !1,
                  autoStopEventId: "e-26",
                },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                selector: ".image-hover",
                originalId:
                  "63eccca3bd3bb7bf1d1f0b69|3d69d647-c24d-7ba3-7730-31ed9d093f79",
                appliesTo: "CLASS",
              },
              targets: [
                {
                  selector: ".image-hover",
                  originalId:
                    "63eccca3bd3bb7bf1d1f0b69|3d69d647-c24d-7ba3-7730-31ed9d093f79",
                  appliesTo: "CLASS",
                },
              ],
              config: {
                loop: !1,
                playInReverse: !1,
                scrollOffsetValue: null,
                scrollOffsetUnit: null,
                delay: null,
                direction: null,
                effectIn: null,
              },
              createdOn: 0x183cb911915,
            },
            "e-28": {
              id: "e-28",
              name: "",
              animationType: "custom",
              eventTypeId: "MOUSE_OVER",
              action: {
                id: "",
                actionTypeId: "GENERAL_START_ACTION",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  actionListId: "a-14",
                  affectedElements: {},
                  playInReverse: !1,
                  autoStopEventId: "e-29",
                },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                selector: ".image-link",
                originalId:
                  "6a50665ba4f0fd333a19689a|23f394ab-358a-a2cd-0e53-004a90255409",
                appliesTo: "CLASS",
              },
              targets: [
                {
                  selector: ".image-link",
                  originalId:
                    "6a50665ba4f0fd333a19689a|23f394ab-358a-a2cd-0e53-004a90255409",
                  appliesTo: "CLASS",
                },
              ],
              config: {
                loop: !1,
                playInReverse: !1,
                scrollOffsetValue: null,
                scrollOffsetUnit: null,
                delay: null,
                direction: null,
                effectIn: null,
              },
              createdOn: 0x18679462ff4,
            },
            "e-29": {
              id: "e-29",
              name: "",
              animationType: "custom",
              eventTypeId: "MOUSE_OUT",
              action: {
                id: "",
                actionTypeId: "GENERAL_START_ACTION",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  actionListId: "a-15",
                  affectedElements: {},
                  playInReverse: !1,
                  autoStopEventId: "e-28",
                },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                selector: ".image-link",
                originalId:
                  "6a50665ba4f0fd333a19689a|23f394ab-358a-a2cd-0e53-004a90255409",
                appliesTo: "CLASS",
              },
              targets: [
                {
                  selector: ".image-link",
                  originalId:
                    "6a50665ba4f0fd333a19689a|23f394ab-358a-a2cd-0e53-004a90255409",
                  appliesTo: "CLASS",
                },
              ],
              config: {
                loop: !1,
                playInReverse: !1,
                scrollOffsetValue: null,
                scrollOffsetUnit: null,
                delay: null,
                direction: null,
                effectIn: null,
              },
              createdOn: 0x18679462ff5,
            },
            "e-40": {
              id: "e-40",
              name: "",
              animationType: "custom",
              eventTypeId: "MOUSE_MOVE",
              action: {
                id: "",
                actionTypeId: "GENERAL_CONTINUOUS_ACTION",
                config: {
                  actionListId: "a-18",
                  affectedElements: {},
                  duration: 0,
                },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                id: "64072c0202cbdab48ec484e1",
                appliesTo: "PAGE",
                styleBlockIds: [],
              },
              targets: [
                {
                  id: "64072c0202cbdab48ec484e1",
                  appliesTo: "PAGE",
                  styleBlockIds: [],
                },
              ],
              config: [
                {
                  continuousParameterGroupId: "a-18-p",
                  selectedAxis: "X_AXIS",
                  basedOn: "VIEWPORT",
                  reverse: !1,
                  smoothing: 50,
                  restingState: 50,
                },
                {
                  continuousParameterGroupId: "a-18-p-2",
                  selectedAxis: "Y_AXIS",
                  basedOn: "VIEWPORT",
                  reverse: !1,
                  smoothing: 50,
                  restingState: 50,
                },
              ],
              createdOn: 0x1869c5042ae,
            },
            "e-49": {
              id: "e-49",
              name: "",
              animationType: "custom",
              eventTypeId: "MOUSE_CLICK",
              action: {
                id: "",
                actionTypeId: "GENERAL_START_ACTION",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  actionListId: "a-19",
                  affectedElements: {},
                  playInReverse: !1,
                  autoStopEventId: "e-50",
                },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                id: "577246c2-be80-9a0d-4fe9-018c566815de",
                appliesTo: "ELEMENT",
                styleBlockIds: [],
              },
              targets: [
                {
                  id: "577246c2-be80-9a0d-4fe9-018c566815de",
                  appliesTo: "ELEMENT",
                  styleBlockIds: [],
                },
              ],
              config: {
                loop: !1,
                playInReverse: !1,
                scrollOffsetValue: null,
                scrollOffsetUnit: null,
                delay: null,
                direction: null,
                effectIn: null,
              },
              createdOn: 0x186c09eeefb,
            },
            "e-50": {
              id: "e-50",
              name: "",
              animationType: "custom",
              eventTypeId: "MOUSE_SECOND_CLICK",
              action: {
                id: "",
                actionTypeId: "GENERAL_START_ACTION",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  actionListId: "a-20",
                  affectedElements: {},
                  playInReverse: !1,
                  autoStopEventId: "e-49",
                },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                id: "577246c2-be80-9a0d-4fe9-018c566815de",
                appliesTo: "ELEMENT",
                styleBlockIds: [],
              },
              targets: [
                {
                  id: "577246c2-be80-9a0d-4fe9-018c566815de",
                  appliesTo: "ELEMENT",
                  styleBlockIds: [],
                },
              ],
              config: {
                loop: !1,
                playInReverse: !1,
                scrollOffsetValue: null,
                scrollOffsetUnit: null,
                delay: null,
                direction: null,
                effectIn: null,
              },
              createdOn: 0x186c09eeefc,
            },
            "e-59": {
              id: "e-59",
              name: "",
              animationType: "custom",
              eventTypeId: "NAVBAR_OPEN",
              action: {
                id: "",
                actionTypeId: "GENERAL_START_ACTION",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  actionListId: "a-19",
                  affectedElements: {},
                  playInReverse: !1,
                  autoStopEventId: "e-60",
                },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                id: "577246c2-be80-9a0d-4fe9-018c566815d9",
                appliesTo: "ELEMENT",
                styleBlockIds: [],
              },
              targets: [
                {
                  id: "577246c2-be80-9a0d-4fe9-018c566815d9",
                  appliesTo: "ELEMENT",
                  styleBlockIds: [],
                },
              ],
              config: {
                loop: !1,
                playInReverse: !1,
                scrollOffsetValue: null,
                scrollOffsetUnit: null,
                delay: null,
                direction: null,
                effectIn: null,
              },
              createdOn: 0x186ea936d2d,
            },
            "e-60": {
              id: "e-60",
              name: "",
              animationType: "custom",
              eventTypeId: "NAVBAR_CLOSE",
              action: {
                id: "",
                actionTypeId: "GENERAL_START_ACTION",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  actionListId: "a-20",
                  affectedElements: {},
                  playInReverse: !1,
                  autoStopEventId: "e-59",
                },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                id: "577246c2-be80-9a0d-4fe9-018c566815d9",
                appliesTo: "ELEMENT",
                styleBlockIds: [],
              },
              targets: [
                {
                  id: "577246c2-be80-9a0d-4fe9-018c566815d9",
                  appliesTo: "ELEMENT",
                  styleBlockIds: [],
                },
              ],
              config: {
                loop: !1,
                playInReverse: !1,
                scrollOffsetValue: null,
                scrollOffsetUnit: null,
                delay: null,
                direction: null,
                effectIn: null,
              },
              createdOn: 0x186ea936d2d,
            },
            "e-61": {
              id: "e-61",
              name: "",
              animationType: "preset",
              eventTypeId: "SCROLL_INTO_VIEW",
              action: {
                id: "",
                actionTypeId: "FADE_EFFECT",
                instant: !1,
                config: { actionListId: "fadeIn", autoStopEventId: "e-62" },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                id: "6a50665ba4f0fd333a19689a|54174dcc-aea1-b483-3b76-af7c93538bcd",
                appliesTo: "ELEMENT",
                styleBlockIds: [],
              },
              targets: [
                {
                  id: "6a50665ba4f0fd333a19689a|54174dcc-aea1-b483-3b76-af7c93538bcd",
                  appliesTo: "ELEMENT",
                  styleBlockIds: [],
                },
              ],
              config: {
                loop: !1,
                playInReverse: !1,
                scrollOffsetValue: 0,
                scrollOffsetUnit: "%",
                delay: 300,
                direction: null,
                effectIn: !0,
              },
              createdOn: 0x186eec8c90e,
            },
            "e-63": {
              id: "e-63",
              name: "",
              animationType: "custom",
              eventTypeId: "SCROLL_INTO_VIEW",
              action: {
                id: "",
                actionTypeId: "GENERAL_START_ACTION",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  actionListId: "a-23",
                  affectedElements: {},
                  playInReverse: !1,
                  autoStopEventId: "e-64",
                },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                id: "6a50665ba4f0fd333a19689a|5cd846b7-aae4-71b2-ca7a-70d8b7616be7",
                appliesTo: "ELEMENT",
                styleBlockIds: [],
              },
              targets: [
                {
                  id: "6a50665ba4f0fd333a19689a|5cd846b7-aae4-71b2-ca7a-70d8b7616be7",
                  appliesTo: "ELEMENT",
                  styleBlockIds: [],
                },
              ],
              config: {
                loop: !1,
                playInReverse: !1,
                scrollOffsetValue: 0,
                scrollOffsetUnit: "%",
                delay: null,
                direction: null,
                effectIn: null,
              },
              createdOn: 0x186eec90591,
            },
            "e-65": {
              id: "e-65",
              name: "",
              animationType: "custom",
              eventTypeId: "SCROLL_INTO_VIEW",
              action: {
                id: "",
                actionTypeId: "GENERAL_START_ACTION",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  actionListId: "a-30",
                  affectedElements: {},
                  playInReverse: !1,
                  autoStopEventId: "e-66",
                },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                id: "6a50665ba4f0fd333a19689a|aeeed16e-bfc0-1466-2017-39da55aff322",
                appliesTo: "ELEMENT",
                styleBlockIds: [],
              },
              targets: [
                {
                  id: "6a50665ba4f0fd333a19689a|aeeed16e-bfc0-1466-2017-39da55aff322",
                  appliesTo: "ELEMENT",
                  styleBlockIds: [],
                },
              ],
              config: {
                loop: !1,
                playInReverse: !1,
                scrollOffsetValue: 0,
                scrollOffsetUnit: "%",
                delay: null,
                direction: null,
                effectIn: null,
              },
              createdOn: 0x186eec92da9,
            },
            "e-69": {
              id: "e-69",
              name: "",
              animationType: "preset",
              eventTypeId: "SCROLL_INTO_VIEW",
              action: {
                id: "",
                actionTypeId: "FADE_EFFECT",
                instant: !1,
                config: { actionListId: "fadeIn", autoStopEventId: "e-70" },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                id: "6a50665ba4f0fd333a19689a|c1f648b3-2bae-f1cd-1a4e-1cfa0c938230",
                appliesTo: "ELEMENT",
                styleBlockIds: [],
              },
              targets: [
                {
                  id: "6a50665ba4f0fd333a19689a|c1f648b3-2bae-f1cd-1a4e-1cfa0c938230",
                  appliesTo: "ELEMENT",
                  styleBlockIds: [],
                },
              ],
              config: {
                loop: !1,
                playInReverse: !1,
                scrollOffsetValue: 0,
                scrollOffsetUnit: "%",
                delay: 1500,
                direction: null,
                effectIn: !0,
              },
              createdOn: 0x186eeca2e4c,
            },
            "e-71": {
              id: "e-71",
              name: "",
              animationType: "preset",
              eventTypeId: "SCROLL_INTO_VIEW",
              action: {
                id: "",
                actionTypeId: "FADE_EFFECT",
                instant: !1,
                config: { actionListId: "fadeIn", autoStopEventId: "e-72" },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                id: "6a50665ba4f0fd333a19689a|62c94f9a-5b09-7cb4-88d8-b76cbdfdc2cc",
                appliesTo: "ELEMENT",
                styleBlockIds: [],
              },
              targets: [
                {
                  id: "6a50665ba4f0fd333a19689a|62c94f9a-5b09-7cb4-88d8-b76cbdfdc2cc",
                  appliesTo: "ELEMENT",
                  styleBlockIds: [],
                },
              ],
              config: {
                loop: !1,
                playInReverse: !1,
                scrollOffsetValue: 0,
                scrollOffsetUnit: "%",
                delay: 1800,
                direction: null,
                effectIn: !0,
              },
              createdOn: 0x186eeca7594,
            },
            "e-73": {
              id: "e-73",
              name: "",
              animationType: "custom",
              eventTypeId: "SCROLL_INTO_VIEW",
              action: {
                id: "",
                actionTypeId: "GENERAL_START_ACTION",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  actionListId: "a-25",
                  affectedElements: {},
                  playInReverse: !1,
                  autoStopEventId: "e-74",
                },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                id: "6a50665ba4f0fd333a19689a|9a004d67-26d4-a27d-f78c-0ec4169fc242",
                appliesTo: "ELEMENT",
                styleBlockIds: [],
              },
              targets: [
                {
                  id: "6a50665ba4f0fd333a19689a|9a004d67-26d4-a27d-f78c-0ec4169fc242",
                  appliesTo: "ELEMENT",
                  styleBlockIds: [],
                },
              ],
              config: {
                loop: !1,
                playInReverse: !1,
                scrollOffsetValue: 0,
                scrollOffsetUnit: "%",
                delay: null,
                direction: null,
                effectIn: null,
              },
              createdOn: 0x186eeccbeef,
            },
            "e-137": {
              id: "e-137",
              name: "",
              animationType: "preset",
              eventTypeId: "MOUSE_CLICK",
              action: {
                id: "",
                actionTypeId: "GENERAL_START_ACTION",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  actionListId: "a-36",
                  affectedElements: {},
                  playInReverse: !1,
                  autoStopEventId: "e-138",
                },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                id: "7590f01b-7096-42f9-5adc-6c95104a1366",
                appliesTo: "ELEMENT",
                styleBlockIds: [],
              },
              targets: [
                {
                  id: "7590f01b-7096-42f9-5adc-6c95104a1366",
                  appliesTo: "ELEMENT",
                  styleBlockIds: [],
                },
              ],
              config: {
                loop: !1,
                playInReverse: !1,
                scrollOffsetValue: null,
                scrollOffsetUnit: null,
                delay: null,
                direction: null,
                effectIn: null,
              },
              createdOn: 0x186ef469833,
            },
            "e-138": {
              id: "e-138",
              name: "",
              animationType: "preset",
              eventTypeId: "MOUSE_SECOND_CLICK",
              action: {
                id: "",
                actionTypeId: "GENERAL_START_ACTION",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  actionListId: "a-37",
                  affectedElements: {},
                  playInReverse: !1,
                  autoStopEventId: "e-137",
                },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                id: "7590f01b-7096-42f9-5adc-6c95104a1366",
                appliesTo: "ELEMENT",
                styleBlockIds: [],
              },
              targets: [
                {
                  id: "7590f01b-7096-42f9-5adc-6c95104a1366",
                  appliesTo: "ELEMENT",
                  styleBlockIds: [],
                },
              ],
              config: {
                loop: !1,
                playInReverse: !1,
                scrollOffsetValue: null,
                scrollOffsetUnit: null,
                delay: null,
                direction: null,
                effectIn: null,
              },
              createdOn: 0x186ef469833,
            },
            "e-139": {
              id: "e-139",
              name: "",
              animationType: "preset",
              eventTypeId: "NAVBAR_OPEN",
              action: {
                id: "",
                actionTypeId: "GENERAL_START_ACTION",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  actionListId: "a-19",
                  affectedElements: {},
                  playInReverse: !1,
                  autoStopEventId: "e-140",
                },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                id: "7590f01b-7096-42f9-5adc-6c95104a1361",
                appliesTo: "ELEMENT",
                styleBlockIds: [],
              },
              targets: [
                {
                  id: "7590f01b-7096-42f9-5adc-6c95104a1361",
                  appliesTo: "ELEMENT",
                  styleBlockIds: [],
                },
              ],
              config: {
                loop: !1,
                playInReverse: !1,
                scrollOffsetValue: null,
                scrollOffsetUnit: null,
                delay: null,
                direction: null,
                effectIn: null,
              },
              createdOn: 0x186ef469833,
            },
            "e-140": {
              id: "e-140",
              name: "",
              animationType: "preset",
              eventTypeId: "NAVBAR_CLOSE",
              action: {
                id: "",
                actionTypeId: "GENERAL_START_ACTION",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  actionListId: "a-20",
                  affectedElements: {},
                  playInReverse: !1,
                  autoStopEventId: "e-139",
                },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                id: "7590f01b-7096-42f9-5adc-6c95104a1361",
                appliesTo: "ELEMENT",
                styleBlockIds: [],
              },
              targets: [
                {
                  id: "7590f01b-7096-42f9-5adc-6c95104a1361",
                  appliesTo: "ELEMENT",
                  styleBlockIds: [],
                },
              ],
              config: {
                loop: !1,
                playInReverse: !1,
                scrollOffsetValue: null,
                scrollOffsetUnit: null,
                delay: null,
                direction: null,
                effectIn: null,
              },
              createdOn: 0x186ef469833,
            },
            "e-143": {
              id: "e-143",
              name: "",
              animationType: "custom",
              eventTypeId: "PAGE_SCROLL",
              action: {
                id: "",
                actionTypeId: "GENERAL_CONTINUOUS_ACTION",
                config: {
                  actionListId: "a-29",
                  affectedElements: {},
                  duration: 0,
                },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                id: "6a50665ba4f0fd333a19689c",
                appliesTo: "PAGE",
                styleBlockIds: [],
              },
              targets: [
                {
                  id: "6a50665ba4f0fd333a19689c",
                  appliesTo: "PAGE",
                  styleBlockIds: [],
                },
              ],
              config: [
                {
                  continuousParameterGroupId: "a-29-p",
                  smoothing: 50,
                  startsEntering: !0,
                  addStartOffset: !1,
                  addOffsetValue: 50,
                  startsExiting: !1,
                  addEndOffset: !1,
                  endOffsetValue: 50,
                },
              ],
              createdOn: 0x186efb94abc,
            },
            "e-144": {
              id: "e-144",
              name: "",
              animationType: "preset",
              eventTypeId: "MOUSE_CLICK",
              action: {
                id: "",
                actionTypeId: "GENERAL_START_ACTION",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  actionListId: "a-38",
                  affectedElements: {},
                  playInReverse: !1,
                  autoStopEventId: "e-145",
                },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                id: "6a507028c696969494376713|bac276c2-30e9-ba49-429f-cd82c2b6d6f6",
                appliesTo: "ELEMENT",
                styleBlockIds: [],
              },
              targets: [],
              config: {
                loop: !1,
                playInReverse: !1,
                scrollOffsetValue: null,
                scrollOffsetUnit: null,
                delay: null,
                direction: null,
                effectIn: null,
              },
              createdOn: 0x19f4a369c06,
            },
            "e-145": {
              id: "e-145",
              name: "",
              animationType: "preset",
              eventTypeId: "MOUSE_SECOND_CLICK",
              action: {
                id: "",
                actionTypeId: "GENERAL_START_ACTION",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  actionListId: "a-39",
                  affectedElements: {},
                  playInReverse: !1,
                  autoStopEventId: "e-144",
                },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                id: "6a507028c696969494376713|bac276c2-30e9-ba49-429f-cd82c2b6d6f6",
                appliesTo: "ELEMENT",
                styleBlockIds: [],
              },
              targets: [],
              config: {
                loop: !1,
                playInReverse: !1,
                scrollOffsetValue: null,
                scrollOffsetUnit: null,
                delay: null,
                direction: null,
                effectIn: null,
              },
              createdOn: 0x19f4a369c06,
            },
            "e-146": {
              id: "e-146",
              name: "",
              animationType: "preset",
              eventTypeId: "NAVBAR_OPEN",
              action: {
                id: "",
                actionTypeId: "GENERAL_START_ACTION",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  actionListId: "a-38",
                  affectedElements: {},
                  playInReverse: !1,
                  autoStopEventId: "e-147",
                },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                id: "6a507028c696969494376713|bac276c2-30e9-ba49-429f-cd82c2b6d6f1",
                appliesTo: "ELEMENT",
                styleBlockIds: [],
              },
              targets: [],
              config: {
                loop: !1,
                playInReverse: !1,
                scrollOffsetValue: null,
                scrollOffsetUnit: null,
                delay: null,
                direction: null,
                effectIn: null,
              },
              createdOn: 0x19f4a369c06,
            },
            "e-147": {
              id: "e-147",
              name: "",
              animationType: "preset",
              eventTypeId: "NAVBAR_CLOSE",
              action: {
                id: "",
                actionTypeId: "GENERAL_START_ACTION",
                config: {
                  delay: 0,
                  easing: "",
                  duration: 0,
                  actionListId: "a-39",
                  affectedElements: {},
                  playInReverse: !1,
                  autoStopEventId: "e-146",
                },
              },
              mediaQueries: ["main", "medium", "small", "tiny"],
              target: {
                id: "6a507028c696969494376713|bac276c2-30e9-ba49-429f-cd82c2b6d6f1",
                appliesTo: "ELEMENT",
                styleBlockIds: [],
              },
              targets: [],
              config: {
                loop: !1,
                playInReverse: !1,
                scrollOffsetValue: null,
                scrollOffsetUnit: null,
                delay: null,
                direction: null,
                effectIn: null,
              },
              createdOn: 0x19f4a369c06,
            },
          },
          actionLists: {
            "a-29": {
              id: "a-29",
              title: "Navbar Sticky",
              continuousParameterGroups: [
                {
                  id: "a-29-p",
                  type: "SCROLL_PROGRESS",
                  parameterLabel: "Scroll",
                  continuousActionGroups: [
                    {
                      keyframe: 0,
                      actionItems: [
                        {
                          id: "a-29-n",
                          actionTypeId: "STYLE_BACKGROUND_COLOR",
                          config: {
                            delay: 0,
                            easing: "",
                            duration: 500,
                            target: {
                              selector: ".navbar",
                              selectorGuids: [
                                "705f9959-1400-d0ea-19ee-b18dd462c6ec",
                              ],
                            },
                            globalSwatchId: "c4bcf6d9",
                            rValue: 255,
                            bValue: 255,
                            gValue: 255,
                            aValue: 1,
                          },
                        },
                        {
                          id: "a-29-n-5",
                          actionTypeId: "STYLE_OPACITY",
                          config: {
                            delay: 0,
                            easing: "",
                            duration: 500,
                            target: {
                              selector: ".navbar-shadow",
                              selectorGuids: [
                                "edeb7300-2c0c-cbdd-b5c1-a720f433db70",
                              ],
                            },
                            value: 0,
                            unit: "",
                          },
                        },
                      ],
                    },
                    {
                      keyframe: 10,
                      actionItems: [
                        {
                          id: "a-29-n-4",
                          actionTypeId: "STYLE_BACKGROUND_COLOR",
                          config: {
                            delay: 0,
                            easing: "",
                            duration: 500,
                            target: {
                              selector: ".navbar",
                              selectorGuids: [
                                "705f9959-1400-d0ea-19ee-b18dd462c6ec",
                              ],
                            },
                            globalSwatchId: "",
                            rValue: 255,
                            bValue: 255,
                            gValue: 255,
                            aValue: 0.97,
                          },
                        },
                        {
                          id: "a-29-n-6",
                          actionTypeId: "STYLE_OPACITY",
                          config: {
                            delay: 0,
                            easing: "",
                            duration: 500,
                            target: {
                              selector: ".navbar-shadow",
                              selectorGuids: [
                                "edeb7300-2c0c-cbdd-b5c1-a720f433db70",
                              ],
                            },
                            value: 1,
                            unit: "",
                          },
                        },
                      ],
                    },
                    {
                      keyframe: 100,
                      actionItems: [
                        {
                          id: "a-29-n-2",
                          actionTypeId: "STYLE_BACKGROUND_COLOR",
                          config: {
                            delay: 0,
                            easing: "",
                            duration: 500,
                            target: {
                              selector: ".navbar",
                              selectorGuids: [
                                "705f9959-1400-d0ea-19ee-b18dd462c6ec",
                              ],
                            },
                            globalSwatchId: "",
                            rValue: 255,
                            bValue: 255,
                            gValue: 255,
                            aValue: 0.97,
                          },
                        },
                        {
                          id: "a-29-n-7",
                          actionTypeId: "STYLE_OPACITY",
                          config: {
                            delay: 0,
                            easing: "",
                            duration: 500,
                            target: {
                              selector: ".navbar-shadow",
                              selectorGuids: [
                                "edeb7300-2c0c-cbdd-b5c1-a720f433db70",
                              ],
                            },
                            value: 1,
                            unit: "",
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
              createdOn: 0x186e9b4bc2b,
            },
            "a-27": {
              id: "a-27",
              title: "Button Pulse",
              actionItemGroups: [
                {
                  actionItems: [
                    {
                      id: "a-27-n",
                      actionTypeId: "STYLE_SIZE",
                      config: {
                        delay: 0,
                        easing: "outQuint",
                        duration: 1500,
                        target: {
                          selector: ".play-button-pulse",
                          selectorGuids: [
                            "37e12519-2ff0-3e66-33ce-25224851b59a",
                          ],
                        },
                        widthValue: 100,
                        heightValue: 100,
                        widthUnit: "px",
                        heightUnit: "px",
                        locked: !1,
                      },
                    },
                    {
                      id: "a-27-n-2",
                      actionTypeId: "STYLE_OPACITY",
                      config: {
                        delay: 0,
                        easing: "outQuint",
                        duration: 1500,
                        target: {
                          selector: ".play-button-pulse",
                          selectorGuids: [
                            "37e12519-2ff0-3e66-33ce-25224851b59a",
                          ],
                        },
                        value: 0,
                        unit: "",
                      },
                    },
                  ],
                },
                {
                  actionItems: [
                    {
                      id: "a-27-n-3",
                      actionTypeId: "STYLE_SIZE",
                      config: {
                        delay: 0,
                        easing: "easeIn",
                        duration: 0,
                        target: {
                          selector: ".play-button-pulse",
                          selectorGuids: [
                            "37e12519-2ff0-3e66-33ce-25224851b59a",
                          ],
                        },
                        widthValue: 75,
                        heightValue: 75,
                        widthUnit: "px",
                        heightUnit: "px",
                        locked: !1,
                      },
                    },
                  ],
                },
                {
                  actionItems: [
                    {
                      id: "a-27-n-4",
                      actionTypeId: "STYLE_OPACITY",
                      config: {
                        delay: 0,
                        easing: "easeIn",
                        duration: 0,
                        target: {
                          selector: ".play-button-pulse",
                          selectorGuids: [
                            "37e12519-2ff0-3e66-33ce-25224851b59a",
                          ],
                        },
                        value: 1,
                        unit: "",
                      },
                    },
                  ],
                },
              ],
              useFirstGroupAsInitialState: !1,
              createdOn: 0x16973395010,
            },
            "a-16": {
              id: "a-16",
              title: "Image Hover [In]",
              actionItemGroups: [
                {
                  actionItems: [
                    {
                      id: "a-16-n",
                      actionTypeId: "TRANSFORM_SCALE",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 500,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".image-hover",
                          selectorGuids: [
                            "58c20343-1da3-246a-206e-359b09f435c8",
                          ],
                        },
                        xValue: 1,
                        yValue: 1,
                        locked: !0,
                      },
                    },
                  ],
                },
                {
                  actionItems: [
                    {
                      id: "a-16-n-2",
                      actionTypeId: "TRANSFORM_SCALE",
                      config: {
                        delay: 0,
                        easing: "easeInOut",
                        duration: 350,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".image-hover",
                          selectorGuids: [
                            "58c20343-1da3-246a-206e-359b09f435c8",
                          ],
                        },
                        xValue: 1.05,
                        yValue: 1.05,
                        locked: !0,
                      },
                    },
                  ],
                },
              ],
              useFirstGroupAsInitialState: !0,
              createdOn: 0x183cb913e62,
            },
            "a-17": {
              id: "a-17",
              title: "Image Hover [Out]",
              actionItemGroups: [
                {
                  actionItems: [
                    {
                      id: "a-17-n",
                      actionTypeId: "TRANSFORM_SCALE",
                      config: {
                        delay: 0,
                        easing: "easeInOut",
                        duration: 350,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".image-hover",
                          selectorGuids: [
                            "58c20343-1da3-246a-206e-359b09f435c8",
                          ],
                        },
                        xValue: 1,
                        yValue: 1,
                        locked: !0,
                      },
                    },
                  ],
                },
              ],
              useFirstGroupAsInitialState: !1,
              createdOn: 0x183cb913e62,
            },
            "a-14": {
              id: "a-14",
              title: "View Cursor [In]",
              actionItemGroups: [
                {
                  actionItems: [
                    {
                      id: "a-14-n",
                      actionTypeId: "TRANSFORM_SCALE",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 500,
                        target: {},
                        xValue: 0,
                        yValue: 0,
                        zValue: null,
                        locked: !0,
                      },
                    },
                    {
                      id: "a-14-n-2",
                      actionTypeId: "STYLE_OPACITY",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 500,
                        target: {},
                        value: 1,
                        unit: "",
                      },
                    },
                    {
                      id: "a-14-n-3",
                      actionTypeId: "STYLE_OPACITY",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 500,
                        target: {},
                        value: 0,
                        unit: "",
                      },
                    },
                  ],
                },
                {
                  actionItems: [
                    {
                      id: "a-14-n-4",
                      actionTypeId: "TRANSFORM_SCALE",
                      config: {
                        delay: 0,
                        easing: "ease",
                        duration: 200,
                        target: {},
                        xValue: 1,
                        yValue: 1,
                        locked: !0,
                      },
                    },
                    {
                      id: "a-14-n-5",
                      actionTypeId: "STYLE_OPACITY",
                      config: {
                        delay: 0,
                        easing: "ease",
                        duration: 200,
                        target: {},
                        value: 1,
                        unit: "",
                      },
                    },
                  ],
                },
              ],
              useFirstGroupAsInitialState: !0,
              createdOn: 0x182adf694b3,
            },
            "a-15": {
              id: "a-15",
              title: "View Cursor [Out]",
              actionItemGroups: [
                {
                  actionItems: [
                    {
                      id: "a-15-n",
                      actionTypeId: "TRANSFORM_SCALE",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 500,
                        target: {},
                        xValue: 0,
                        yValue: 0,
                        locked: !0,
                      },
                    },
                    {
                      id: "a-15-n-2",
                      actionTypeId: "STYLE_OPACITY",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 500,
                        target: {},
                        value: 0,
                        unit: "",
                      },
                    },
                  ],
                },
                {
                  actionItems: [
                    {
                      id: "a-15-n-3",
                      actionTypeId: "TRANSFORM_SCALE",
                      config: {
                        delay: 0,
                        easing: "ease",
                        duration: 200,
                        target: {},
                        xValue: 0,
                        yValue: 0,
                        locked: !0,
                      },
                    },
                    {
                      id: "a-15-n-4",
                      actionTypeId: "STYLE_OPACITY",
                      config: {
                        delay: 0,
                        easing: "ease",
                        duration: 200,
                        target: {},
                        value: 0,
                        unit: "",
                      },
                    },
                  ],
                },
              ],
              useFirstGroupAsInitialState: !0,
              createdOn: 0x182adf694b3,
            },
            "a-18": {
              id: "a-18",
              title: "Cursor Move",
              continuousParameterGroups: [
                {
                  id: "a-18-p",
                  type: "MOUSE_X",
                  parameterLabel: "Mouse X",
                  continuousActionGroups: [
                    {
                      keyframe: 0,
                      actionItems: [
                        {
                          id: "a-18-n",
                          actionTypeId: "TRANSFORM_MOVE",
                          config: {
                            delay: 0,
                            easing: "",
                            duration: 500,
                            target: {},
                            xValue: -50,
                            xUnit: "vw",
                            yUnit: "PX",
                            zUnit: "PX",
                          },
                        },
                      ],
                    },
                    {
                      keyframe: 100,
                      actionItems: [
                        {
                          id: "a-18-n-2",
                          actionTypeId: "TRANSFORM_MOVE",
                          config: {
                            delay: 0,
                            easing: "",
                            duration: 500,
                            target: {},
                            xValue: 50,
                            xUnit: "vw",
                            yUnit: "PX",
                            zUnit: "PX",
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  id: "a-18-p-2",
                  type: "MOUSE_Y",
                  parameterLabel: "Mouse Y",
                  continuousActionGroups: [
                    {
                      keyframe: 0,
                      actionItems: [
                        {
                          id: "a-18-n-3",
                          actionTypeId: "TRANSFORM_MOVE",
                          config: {
                            delay: 0,
                            easing: "",
                            duration: 500,
                            target: {},
                            yValue: -50,
                            xUnit: "PX",
                            yUnit: "vh",
                            zUnit: "PX",
                          },
                        },
                      ],
                    },
                    {
                      keyframe: 100,
                      actionItems: [
                        {
                          id: "a-18-n-4",
                          actionTypeId: "TRANSFORM_MOVE",
                          config: {
                            delay: 0,
                            easing: "",
                            duration: 500,
                            target: {},
                            yValue: 50,
                            xUnit: "PX",
                            yUnit: "vh",
                            zUnit: "PX",
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
              createdOn: 0x186794978a8,
            },
            "a-19": {
              id: "a-19",
              title: "Mobile Navbar [In]",
              actionItemGroups: [
                {
                  actionItems: [
                    {
                      id: "a-19-n",
                      actionTypeId: "TRANSFORM_SCALE",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 500,
                        target: {},
                        yValue: 0.9,
                        locked: !1,
                      },
                    },
                    {
                      id: "a-19-n-2",
                      actionTypeId: "GENERAL_DISPLAY",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 0,
                        target: {},
                        value: "none",
                      },
                    },
                    {
                      id: "a-19-n-3",
                      actionTypeId: "STYLE_OPACITY",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 500,
                        target: {},
                        value: 0,
                        unit: "",
                      },
                    },
                    {
                      id: "a-19-n-4",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 500,
                        target: {},
                        yValue: -13,
                        xUnit: "PX",
                        yUnit: "PX",
                        zUnit: "PX",
                      },
                    },
                  ],
                },
                {
                  actionItems: [
                    {
                      id: "a-19-n-5",
                      actionTypeId: "TRANSFORM_SCALE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {},
                        yValue: 1,
                        locked: !1,
                      },
                    },
                    {
                      id: "a-19-n-6",
                      actionTypeId: "GENERAL_DISPLAY",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 0,
                        target: {},
                        value: "flex",
                      },
                    },
                    {
                      id: "a-19-n-7",
                      actionTypeId: "STYLE_OPACITY",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 200,
                        target: {},
                        value: 1,
                        unit: "",
                      },
                    },
                    {
                      id: "a-19-n-8",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {},
                        yValue: 0,
                        xUnit: "PX",
                        yUnit: "PX",
                        zUnit: "PX",
                      },
                    },
                    {
                      id: "a-19-n-9",
                      actionTypeId: "TRANSFORM_ROTATE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-bottom",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c708",
                          ],
                        },
                        zValue: 45,
                        xUnit: "DEG",
                        yUnit: "DEG",
                        zUnit: "DEG",
                      },
                    },
                    {
                      id: "a-19-n-10",
                      actionTypeId: "TRANSFORM_SCALE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-middle",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c706",
                          ],
                        },
                        xValue: 0,
                        yValue: 0,
                        locked: !0,
                      },
                    },
                    {
                      id: "a-19-n-11",
                      actionTypeId: "TRANSFORM_ROTATE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-top",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c707",
                          ],
                        },
                        zValue: -45,
                        xUnit: "DEG",
                        yUnit: "DEG",
                        zUnit: "DEG",
                      },
                    },
                    {
                      id: "a-19-n-12",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-top",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c707",
                          ],
                        },
                        yValue: 8,
                        xUnit: "PX",
                        yUnit: "PX",
                        zUnit: "PX",
                      },
                    },
                    {
                      id: "a-19-n-13",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-bottom",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c708",
                          ],
                        },
                        yValue: -8,
                        xUnit: "PX",
                        yUnit: "PX",
                        zUnit: "PX",
                      },
                    },
                  ],
                },
              ],
              useFirstGroupAsInitialState: !0,
              createdOn: 0x16ce2c7855c,
            },
            "a-20": {
              id: "a-20",
              title: "Mobile Navbar [Out]",
              actionItemGroups: [
                {
                  actionItems: [
                    {
                      id: "a-20-n",
                      actionTypeId: "TRANSFORM_SCALE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {},
                        yValue: 0.9,
                        locked: !1,
                      },
                    },
                    {
                      id: "a-20-n-2",
                      actionTypeId: "STYLE_OPACITY",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {},
                        value: 0,
                        unit: "",
                      },
                    },
                    {
                      id: "a-20-n-3",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {},
                        yValue: -13,
                        xUnit: "PX",
                        yUnit: "PX",
                        zUnit: "PX",
                      },
                    },
                    {
                      id: "a-20-n-4",
                      actionTypeId: "TRANSFORM_ROTATE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-bottom",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c708",
                          ],
                        },
                        zValue: 0,
                        xUnit: "DEG",
                        yUnit: "DEG",
                        zUnit: "DEG",
                      },
                    },
                    {
                      id: "a-20-n-5",
                      actionTypeId: "TRANSFORM_SCALE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-middle",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c706",
                          ],
                        },
                        xValue: 1,
                        yValue: 1,
                        locked: !0,
                      },
                    },
                    {
                      id: "a-20-n-6",
                      actionTypeId: "TRANSFORM_ROTATE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-top",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c707",
                          ],
                        },
                        zValue: 0,
                        xUnit: "DEG",
                        yUnit: "DEG",
                        zUnit: "DEG",
                      },
                    },
                    {
                      id: "a-20-n-7",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-top",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c707",
                          ],
                        },
                        yValue: 0,
                        xUnit: "PX",
                        yUnit: "PX",
                        zUnit: "PX",
                      },
                    },
                    {
                      id: "a-20-n-8",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-bottom",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c708",
                          ],
                        },
                        yValue: 0,
                        xUnit: "PX",
                        yUnit: "PX",
                        zUnit: "PX",
                      },
                    },
                  ],
                },
                {
                  actionItems: [
                    {
                      id: "a-20-n-9",
                      actionTypeId: "GENERAL_DISPLAY",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 0,
                        target: {},
                        value: "none",
                      },
                    },
                  ],
                },
              ],
              useFirstGroupAsInitialState: !1,
              createdOn: 0x16ce2c7855c,
            },
            "a-23": {
              id: "a-23",
              title: "Slide From Down 0.6 Delay",
              actionItemGroups: [
                {
                  actionItems: [
                    {
                      id: "a-23-n",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 500,
                        target: {
                          useEventTarget: !0,
                          id: "62e2887865b5e0439a6ef13a|42c608cd-e868-4d98-5ff8-81a81256e8a2",
                        },
                        yValue: 20,
                        xUnit: "PX",
                        yUnit: "%",
                        zUnit: "PX",
                      },
                    },
                    {
                      id: "a-23-n-2",
                      actionTypeId: "STYLE_OPACITY",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 500,
                        target: {
                          useEventTarget: !0,
                          id: "62e2887865b5e0439a6ef13a|42c608cd-e868-4d98-5ff8-81a81256e8a2",
                        },
                        value: 0,
                        unit: "",
                      },
                    },
                  ],
                },
                {
                  actionItems: [
                    {
                      id: "a-23-n-3",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 600,
                        easing: "ease",
                        duration: 700,
                        target: {
                          useEventTarget: !0,
                          id: "62e2887865b5e0439a6ef13a|42c608cd-e868-4d98-5ff8-81a81256e8a2",
                        },
                        yValue: 0,
                        xUnit: "PX",
                        yUnit: "px",
                        zUnit: "PX",
                      },
                    },
                    {
                      id: "a-23-n-4",
                      actionTypeId: "STYLE_OPACITY",
                      config: {
                        delay: 600,
                        easing: "ease",
                        duration: 700,
                        target: {
                          useEventTarget: !0,
                          id: "62e2887865b5e0439a6ef13a|42c608cd-e868-4d98-5ff8-81a81256e8a2",
                        },
                        value: 1,
                        unit: "",
                      },
                    },
                  ],
                },
              ],
              useFirstGroupAsInitialState: !0,
              createdOn: 1658152011e3,
            },
            "a-30": {
              id: "a-30",
              title: "Slide From Down 0.9 Delay",
              actionItemGroups: [
                {
                  actionItems: [
                    {
                      id: "a-30-n",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 500,
                        target: {
                          useEventTarget: !0,
                          id: "62e2887865b5e0439a6ef13a|42c608cd-e868-4d98-5ff8-81a81256e8a2",
                        },
                        yValue: 20,
                        xUnit: "PX",
                        yUnit: "%",
                        zUnit: "PX",
                      },
                    },
                    {
                      id: "a-30-n-2",
                      actionTypeId: "STYLE_OPACITY",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 500,
                        target: {
                          useEventTarget: !0,
                          id: "62e2887865b5e0439a6ef13a|42c608cd-e868-4d98-5ff8-81a81256e8a2",
                        },
                        value: 0,
                        unit: "",
                      },
                    },
                  ],
                },
                {
                  actionItems: [
                    {
                      id: "a-30-n-3",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 900,
                        easing: "ease",
                        duration: 700,
                        target: {
                          useEventTarget: !0,
                          id: "62e2887865b5e0439a6ef13a|42c608cd-e868-4d98-5ff8-81a81256e8a2",
                        },
                        yValue: 0,
                        xUnit: "PX",
                        yUnit: "px",
                        zUnit: "PX",
                      },
                    },
                    {
                      id: "a-30-n-4",
                      actionTypeId: "STYLE_OPACITY",
                      config: {
                        delay: 900,
                        easing: "ease",
                        duration: 700,
                        target: {
                          useEventTarget: !0,
                          id: "62e2887865b5e0439a6ef13a|42c608cd-e868-4d98-5ff8-81a81256e8a2",
                        },
                        value: 1,
                        unit: "",
                      },
                    },
                  ],
                },
              ],
              useFirstGroupAsInitialState: !0,
              createdOn: 1658152011e3,
            },
            "a-25": {
              id: "a-25",
              title: "Slide From Down 1.2 Delay",
              actionItemGroups: [
                {
                  actionItems: [
                    {
                      id: "a-25-n",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 500,
                        target: {
                          useEventTarget: !0,
                          id: "62e2887865b5e0439a6ef13a|42c608cd-e868-4d98-5ff8-81a81256e8a2",
                        },
                        yValue: 20,
                        xUnit: "PX",
                        yUnit: "%",
                        zUnit: "PX",
                      },
                    },
                    {
                      id: "a-25-n-2",
                      actionTypeId: "STYLE_OPACITY",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 500,
                        target: {
                          useEventTarget: !0,
                          id: "62e2887865b5e0439a6ef13a|42c608cd-e868-4d98-5ff8-81a81256e8a2",
                        },
                        value: 0,
                        unit: "",
                      },
                    },
                  ],
                },
                {
                  actionItems: [
                    {
                      id: "a-25-n-3",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 1200,
                        easing: "ease",
                        duration: 700,
                        target: {
                          useEventTarget: !0,
                          id: "62e2887865b5e0439a6ef13a|42c608cd-e868-4d98-5ff8-81a81256e8a2",
                        },
                        yValue: 0,
                        xUnit: "PX",
                        yUnit: "px",
                        zUnit: "PX",
                      },
                    },
                    {
                      id: "a-25-n-4",
                      actionTypeId: "STYLE_OPACITY",
                      config: {
                        delay: 1200,
                        easing: "ease",
                        duration: 700,
                        target: {
                          useEventTarget: !0,
                          id: "62e2887865b5e0439a6ef13a|42c608cd-e868-4d98-5ff8-81a81256e8a2",
                        },
                        value: 1,
                        unit: "",
                      },
                    },
                  ],
                },
              ],
              useFirstGroupAsInitialState: !0,
              createdOn: 1658152011e3,
            },
            "a-36": {
              id: "a-36",
              title: "Mobile Navbar [In] 2",
              actionItemGroups: [
                {
                  actionItems: [
                    {
                      id: "a-36-n",
                      actionTypeId: "TRANSFORM_SCALE",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 500,
                        target: {},
                        yValue: 0.9,
                        locked: !1,
                      },
                    },
                    {
                      id: "a-36-n-2",
                      actionTypeId: "GENERAL_DISPLAY",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 0,
                        target: {},
                        value: "none",
                      },
                    },
                    {
                      id: "a-36-n-3",
                      actionTypeId: "STYLE_OPACITY",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 500,
                        target: {},
                        value: 0,
                        unit: "",
                      },
                    },
                    {
                      id: "a-36-n-4",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 500,
                        target: {},
                        yValue: -13,
                        xUnit: "PX",
                        yUnit: "PX",
                        zUnit: "PX",
                      },
                    },
                  ],
                },
                {
                  actionItems: [
                    {
                      id: "a-36-n-5",
                      actionTypeId: "TRANSFORM_SCALE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {},
                        yValue: 1,
                        locked: !1,
                      },
                    },
                    {
                      id: "a-36-n-6",
                      actionTypeId: "GENERAL_DISPLAY",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 0,
                        target: {},
                        value: "flex",
                      },
                    },
                    {
                      id: "a-36-n-7",
                      actionTypeId: "STYLE_OPACITY",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 200,
                        target: {},
                        value: 1,
                        unit: "",
                      },
                    },
                    {
                      id: "a-36-n-8",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {},
                        yValue: 0,
                        xUnit: "PX",
                        yUnit: "PX",
                        zUnit: "PX",
                      },
                    },
                    {
                      id: "a-36-n-9",
                      actionTypeId: "TRANSFORM_ROTATE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-bottom",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c708",
                          ],
                        },
                        zValue: 45,
                        xUnit: "DEG",
                        yUnit: "DEG",
                        zUnit: "DEG",
                      },
                    },
                    {
                      id: "a-36-n-10",
                      actionTypeId: "TRANSFORM_SCALE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-middle",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c706",
                          ],
                        },
                        xValue: 0,
                        yValue: 0,
                        locked: !0,
                      },
                    },
                    {
                      id: "a-36-n-11",
                      actionTypeId: "TRANSFORM_ROTATE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-top",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c707",
                          ],
                        },
                        zValue: -45,
                        xUnit: "DEG",
                        yUnit: "DEG",
                        zUnit: "DEG",
                      },
                    },
                    {
                      id: "a-36-n-12",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-top",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c707",
                          ],
                        },
                        yValue: 8,
                        xUnit: "PX",
                        yUnit: "PX",
                        zUnit: "PX",
                      },
                    },
                    {
                      id: "a-36-n-13",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-bottom",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c708",
                          ],
                        },
                        yValue: -8,
                        xUnit: "PX",
                        yUnit: "PX",
                        zUnit: "PX",
                      },
                    },
                  ],
                },
              ],
              useFirstGroupAsInitialState: !0,
              createdOn: 0x16ce2c7855c,
            },
            "a-37": {
              id: "a-37",
              title: "Mobile Navbar [Out] 2",
              actionItemGroups: [
                {
                  actionItems: [
                    {
                      id: "a-37-n",
                      actionTypeId: "TRANSFORM_SCALE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {},
                        yValue: 0.9,
                        locked: !1,
                      },
                    },
                    {
                      id: "a-37-n-2",
                      actionTypeId: "STYLE_OPACITY",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {},
                        value: 0,
                        unit: "",
                      },
                    },
                    {
                      id: "a-37-n-3",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {},
                        yValue: -13,
                        xUnit: "PX",
                        yUnit: "PX",
                        zUnit: "PX",
                      },
                    },
                    {
                      id: "a-37-n-4",
                      actionTypeId: "TRANSFORM_ROTATE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-bottom",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c708",
                          ],
                        },
                        zValue: 0,
                        xUnit: "DEG",
                        yUnit: "DEG",
                        zUnit: "DEG",
                      },
                    },
                    {
                      id: "a-37-n-5",
                      actionTypeId: "TRANSFORM_SCALE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-middle",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c706",
                          ],
                        },
                        xValue: 1,
                        yValue: 1,
                        locked: !0,
                      },
                    },
                    {
                      id: "a-37-n-6",
                      actionTypeId: "TRANSFORM_ROTATE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-top",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c707",
                          ],
                        },
                        zValue: 0,
                        xUnit: "DEG",
                        yUnit: "DEG",
                        zUnit: "DEG",
                      },
                    },
                    {
                      id: "a-37-n-7",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-top",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c707",
                          ],
                        },
                        yValue: 0,
                        xUnit: "PX",
                        yUnit: "PX",
                        zUnit: "PX",
                      },
                    },
                    {
                      id: "a-37-n-8",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-bottom",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c708",
                          ],
                        },
                        yValue: 0,
                        xUnit: "PX",
                        yUnit: "PX",
                        zUnit: "PX",
                      },
                    },
                  ],
                },
                {
                  actionItems: [
                    {
                      id: "a-37-n-9",
                      actionTypeId: "GENERAL_DISPLAY",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 0,
                        target: {},
                        value: "none",
                      },
                    },
                  ],
                },
              ],
              useFirstGroupAsInitialState: !1,
              createdOn: 0x16ce2c7855c,
            },
            "a-38": {
              id: "a-38",
              title: "Mobile Navbar [In] 3",
              actionItemGroups: [
                {
                  actionItems: [
                    {
                      id: "a-38-n",
                      actionTypeId: "TRANSFORM_SCALE",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 500,
                        target: {},
                        yValue: 0.9,
                        locked: !1,
                      },
                    },
                    {
                      id: "a-38-n-2",
                      actionTypeId: "GENERAL_DISPLAY",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 0,
                        target: {},
                        value: "none",
                      },
                    },
                    {
                      id: "a-38-n-3",
                      actionTypeId: "STYLE_OPACITY",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 500,
                        target: {},
                        value: 0,
                        unit: "",
                      },
                    },
                    {
                      id: "a-38-n-4",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 500,
                        target: {},
                        yValue: -13,
                        xUnit: "PX",
                        yUnit: "PX",
                        zUnit: "PX",
                      },
                    },
                  ],
                },
                {
                  actionItems: [
                    {
                      id: "a-38-n-5",
                      actionTypeId: "TRANSFORM_SCALE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {},
                        yValue: 1,
                        locked: !1,
                      },
                    },
                    {
                      id: "a-38-n-6",
                      actionTypeId: "GENERAL_DISPLAY",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 0,
                        target: {},
                        value: "flex",
                      },
                    },
                    {
                      id: "a-38-n-7",
                      actionTypeId: "STYLE_OPACITY",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 200,
                        target: {},
                        value: 1,
                        unit: "",
                      },
                    },
                    {
                      id: "a-38-n-8",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {},
                        yValue: 0,
                        xUnit: "PX",
                        yUnit: "PX",
                        zUnit: "PX",
                      },
                    },
                    {
                      id: "a-38-n-9",
                      actionTypeId: "TRANSFORM_ROTATE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-bottom",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c708",
                          ],
                        },
                        zValue: 45,
                        xUnit: "DEG",
                        yUnit: "DEG",
                        zUnit: "DEG",
                      },
                    },
                    {
                      id: "a-38-n-10",
                      actionTypeId: "TRANSFORM_SCALE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-middle",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c706",
                          ],
                        },
                        xValue: 0,
                        yValue: 0,
                        locked: !0,
                      },
                    },
                    {
                      id: "a-38-n-11",
                      actionTypeId: "TRANSFORM_ROTATE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-top",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c707",
                          ],
                        },
                        zValue: -45,
                        xUnit: "DEG",
                        yUnit: "DEG",
                        zUnit: "DEG",
                      },
                    },
                    {
                      id: "a-38-n-12",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-top",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c707",
                          ],
                        },
                        yValue: 8,
                        xUnit: "PX",
                        yUnit: "PX",
                        zUnit: "PX",
                      },
                    },
                    {
                      id: "a-38-n-13",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-bottom",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c708",
                          ],
                        },
                        yValue: -8,
                        xUnit: "PX",
                        yUnit: "PX",
                        zUnit: "PX",
                      },
                    },
                  ],
                },
              ],
              useFirstGroupAsInitialState: !0,
              createdOn: 0x16ce2c7855c,
            },
            "a-39": {
              id: "a-39",
              title: "Mobile Navbar [Out] 3",
              actionItemGroups: [
                {
                  actionItems: [
                    {
                      id: "a-39-n",
                      actionTypeId: "TRANSFORM_SCALE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {},
                        yValue: 0.9,
                        locked: !1,
                      },
                    },
                    {
                      id: "a-39-n-2",
                      actionTypeId: "STYLE_OPACITY",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {},
                        value: 0,
                        unit: "",
                      },
                    },
                    {
                      id: "a-39-n-3",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {},
                        yValue: -13,
                        xUnit: "PX",
                        yUnit: "PX",
                        zUnit: "PX",
                      },
                    },
                    {
                      id: "a-39-n-4",
                      actionTypeId: "TRANSFORM_ROTATE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-bottom",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c708",
                          ],
                        },
                        zValue: 0,
                        xUnit: "DEG",
                        yUnit: "DEG",
                        zUnit: "DEG",
                      },
                    },
                    {
                      id: "a-39-n-5",
                      actionTypeId: "TRANSFORM_SCALE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-middle",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c706",
                          ],
                        },
                        xValue: 1,
                        yValue: 1,
                        locked: !0,
                      },
                    },
                    {
                      id: "a-39-n-6",
                      actionTypeId: "TRANSFORM_ROTATE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-top",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c707",
                          ],
                        },
                        zValue: 0,
                        xUnit: "DEG",
                        yUnit: "DEG",
                        zUnit: "DEG",
                      },
                    },
                    {
                      id: "a-39-n-7",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-top",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c707",
                          ],
                        },
                        yValue: 0,
                        xUnit: "PX",
                        yUnit: "PX",
                        zUnit: "PX",
                      },
                    },
                    {
                      id: "a-39-n-8",
                      actionTypeId: "TRANSFORM_MOVE",
                      config: {
                        delay: 0,
                        easing: "outExpo",
                        duration: 300,
                        target: {
                          useEventTarget: "CHILDREN",
                          selector: ".burger-line.cc-bottom",
                          selectorGuids: [
                            "705f9959-1400-d0ea-19ee-b18dd462c6ff",
                            "705f9959-1400-d0ea-19ee-b18dd462c708",
                          ],
                        },
                        yValue: 0,
                        xUnit: "PX",
                        yUnit: "PX",
                        zUnit: "PX",
                      },
                    },
                  ],
                },
                {
                  actionItems: [
                    {
                      id: "a-39-n-9",
                      actionTypeId: "GENERAL_DISPLAY",
                      config: {
                        delay: 0,
                        easing: "",
                        duration: 0,
                        target: {},
                        value: "none",
                      },
                    },
                  ],
                },
              ],
              useFirstGroupAsInitialState: !1,
              createdOn: 0x16ce2c7855c,
            },
            fadeIn: {
              id: "fadeIn",
              useFirstGroupAsInitialState: !0,
              actionItemGroups: [
                {
                  actionItems: [
                    {
                      actionTypeId: "STYLE_OPACITY",
                      config: {
                        delay: 0,
                        duration: 0,
                        target: {
                          id: "N/A",
                          appliesTo: "TRIGGER_ELEMENT",
                          useEventTarget: !0,
                        },
                        value: 0,
                      },
                    },
                  ],
                },
                {
                  actionItems: [
                    {
                      actionTypeId: "STYLE_OPACITY",
                      config: {
                        delay: 0,
                        easing: "outQuart",
                        duration: 1e3,
                        target: {
                          id: "N/A",
                          appliesTo: "TRIGGER_ELEMENT",
                          useEventTarget: !0,
                        },
                        value: 1,
                      },
                    },
                  ],
                },
              ],
            },
          },
          site: {
            mediaQueries: [
              { key: "main", min: 992, max: 1e4 },
              { key: "medium", min: 768, max: 991 },
              { key: "small", min: 480, max: 767 },
              { key: "tiny", min: 0, max: 479 },
            ],
          },
        }),
          "complete" === document.readyState
            ? e()
            : document.addEventListener("readystatechange", () => {
                "complete" === document.readyState && e();
              }));
      },
      5387: function (e, t, n) {
        (n(9461),
          n(7624),
          n(286),
          n(8334),
          n(2338),
          n(3695),
          n(322),
          n(941),
          n(5134),
          n(1655),
          n(3973),
          n(7043));
      },
    },
    t = {};
  function n(i) {
    var r = t[i];
    if (void 0 !== r) return r.exports;
    var a = (t[i] = { id: i, loaded: !1, exports: {} });
    return (e[i](a, a.exports, n), (a.loaded = !0), a.exports);
  }
  ((n.m = e),
    (n.d = (e, t) => {
      for (var i in t)
        n.o(t, i) &&
          !n.o(e, i) &&
          Object.defineProperty(e, i, { enumerable: !0, get: t[i] });
    }),
    (n.hmd = (e) => (
      (e = Object.create(e)).children || (e.children = []),
      Object.defineProperty(e, "exports", {
        enumerable: !0,
        set: () => {
          throw Error(
            "ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: " +
              e.id,
          );
        },
      }),
      e
    )),
    (n.g = (() => {
      if ("object" == typeof globalThis) return globalThis;
      try {
        return this || Function("return this")();
      } catch (e) {
        if ("object" == typeof window) return window;
      }
    })()),
    (n.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)),
    (n.r = (e) => {
      ("undefined" != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
        Object.defineProperty(e, "__esModule", { value: !0 }));
    }),
    (n.nmd = (e) => ((e.paths = []), e.children || (e.children = []), e)),
    (() => {
      var e = [];
      n.O = (t, i, r, a) => {
        if (i) {
          a = a || 0;
          for (var o = e.length; o > 0 && e[o - 1][2] > a; o--) e[o] = e[o - 1];
          e[o] = [i, r, a];
          return;
        }
        for (var l = 1 / 0, o = 0; o < e.length; o++) {
          for (var [i, r, a] = e[o], s = !0, u = 0; u < i.length; u++)
            (!1 & a || l >= a) && Object.keys(n.O).every((e) => n.O[e](i[u]))
              ? i.splice(u--, 1)
              : ((s = !1), a < l && (l = a));
          if (s) {
            e.splice(o--, 1);
            var c = r();
            void 0 !== c && (t = c);
          }
        }
        return t;
      };
    })(),
    (n.rv = () => "1.3.9"),
    (() => {
      var e = { 821: 0 };
      n.O.j = (t) => 0 === e[t];
      var t = (t, i) => {
          var r,
            a,
            [o, l, s] = i,
            u = 0;
          if (o.some((t) => 0 !== e[t])) {
            for (r in l) n.o(l, r) && (n.m[r] = l[r]);
            if (s) var c = s(n);
          }
          for (t && t(i); u < o.length; u++)
            ((a = o[u]), n.o(e, a) && e[a] && e[a][0](), (e[a] = 0));
          return n.O(c);
        },
        i = (self.webpackChunk = self.webpackChunk || []);
      (i.forEach(t.bind(null, 0)), (i.push = t.bind(null, i.push.bind(i))));
    })(),
    (n.ruid = "bundler=rspack@1.3.9"));
  var i = n.O(void 0, ["87", "378"], function () {
    return n(5387);
  });
  i = n.O(i);
})();
