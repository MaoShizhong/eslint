/**
 * @fileoverview Tests for no-loop-func rule.
 * @author Ilya Volodin
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/no-loop-func"),
	RuleTester = require("../../../lib/rule-tester/rule-tester");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();

ruleTester.run("no-loop-func", rule, {
	valid: [
		"string = 'function a() {}';",
		"for (var i=0; i<l; i++) { } var a = function() { i; };",
		"for (var i=0, a=function() { i; }; i<l; i++) { }",
		"for (var x in xs.filter(function(x) { return x != upper; })) { }",
		{
			code: "for (var x of xs.filter(function(x) { return x != upper; })) { }",
			languageOptions: { ecmaVersion: 6 },
		},

		// no refers to variables that declared on upper scope.
		"for (var i=0; i<l; i++) { (function() {}) }",
		"for (var i in {}) { (function() {}) }",
		{
			code: "for (var i of {}) { (function() {}) }",
			languageOptions: { ecmaVersion: 6 },
		},

		// functions which are using unmodified variables are OK.
		{
			code: "for (let i=0; i<l; i++) { (function() { i; }) }",
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "for (let i in {}) { i = 7; (function() { i; }) }",
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "for (const i of {}) { (function() { i; }) }",
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "for (using i of foo) { (function() { i; }) }",
			languageOptions: { ecmaVersion: 2026 },
		},
		{
			code: "for (await using i of foo) { (function() { i; }) }",
			languageOptions: { ecmaVersion: 2026 },
		},
		{
			code: "for (var i = 0; i < 10; ++i) { using foo = bar(i); (function() { foo; }) }",
			languageOptions: { ecmaVersion: 2026 },
		},
		{
			code: "for (var i = 0; i < 10; ++i) { await using foo = bar(i); (function() { foo; }) }",
			languageOptions: { ecmaVersion: 2026 },
		},
		{
			code: "for (let i = 0; i < 10; ++i) { for (let x in xs.filter(x => x != i)) {  } }",
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "let a = 0; for (let i=0; i<l; i++) { (function() { a; }); }",
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "let a = 0; for (let i in {}) { (function() { a; }); }",
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "let a = 0; for (let i of {}) { (function() { a; }); }",
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "let a = 0; for (let i=0; i<l; i++) { (function() { (function() { a; }); }); }",
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "let a = 0; for (let i in {}) { function foo() { (function() { a; }); } }",
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "let a = 0; for (let i of {}) { (() => { (function() { a; }); }); }",
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "var a = 0; for (let i=0; i<l; i++) { (function() { a; }); }",
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "var a = 0; for (let i in {}) { (function() { a; }); }",
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "var a = 0; for (let i of {}) { (function() { a; }); }",
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: [
				"let result = {};",
				"for (const score in scores) {",
				"  const letters = scores[score];",
				"  letters.split('').forEach(letter => {",
				"    result[letter] = score;",
				"  });",
				"}",
				"result.__default = 6;",
			].join("\n"),
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: [
				"while (true) {",
				"    (function() { a; });",
				"}",
				"let a;",
			].join("\n"),
			languageOptions: { ecmaVersion: 6 },
		},

		/*
		 * These loops _look_ like they might be unsafe, but because i is undeclared, they're fine
		 * at least as far as this rule is concerned - the loop doesn't declare/generate the variable.
		 */
		"while(i) { (function() { i; }) }",
		"do { (function() { i; }) } while (i)",

		/**
		 * These loops _look_ like they might be unsafe, but because i is declared outside the loop
		 * and is not updated in or after the loop, they're fine as far as this rule is concerned.
		 * The variable that's captured is just the one variable shared by all the loops, but that's
		 * explicitly expected in these cases.
		 */
		"var i; while(i) { (function() { i; }) }",
		"var i; do { (function() { i; }) } while (i)",

		/**
		 * These loops use an undeclared variable, and so shouldn't be flagged by this rule,
		 * they'll be picked up by no-undef.
		 */
		{
			code: "for (var i=0; i<l; i++) { (function() { undeclared; }) }",
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "for (let i=0; i<l; i++) { (function() { undeclared; }) }",
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "for (var i in {}) { i = 7; (function() { undeclared; }) }",
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "for (let i in {}) { i = 7; (function() { undeclared; }) }",
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "for (const i of {}) { (function() { undeclared; }) }",
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "for (let i = 0; i < 10; ++i) { for (let x in xs.filter(x => x != undeclared)) {  } }",
			languageOptions: { ecmaVersion: 6 },
		},

		// IIFE
		{
			code: `
            let current = getStart();
            while (current) {
            (() => {
                current;
                current.a;
                current.b;
                current.c;
                current.d;
            })();

            current = current.upper;
            }
            `,
			languageOptions: { ecmaVersion: 6 },
		},
		"for (var i=0; (function() { i; })(), i<l; i++) { }",
		"for (var i=0; i<l; (function() { i; })(), i++) { }",
		{
			code: "for (var i = 0; i < 10; ++i) { (()=>{ i;})() }",
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: "for (var i = 0; i < 10; ++i) { (function a(){i;})() }",
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: `
            var arr = [];

            for (var i = 0; i < 5; i++) {
                arr.push((f => f)((() => i)()));
            }
            `,
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: `
            var arr = [];

            for (var i = 0; i < 5; i++) {
                arr.push((() => {
                    return (() => i)();
                })());
            }
            `,
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: `
            const foo = bar;

            for (var i = 0; i < 5; i++) {
                arr.push(() => foo);
            }

			foo = baz; // This is a runtime error, but not concern of this rule. For this rule, variable 'foo' is constant.
            `,
			languageOptions: { ecmaVersion: 6 },
		},
		{
			code: `
            using foo = bar;

            for (var i = 0; i < 5; i++) {
                arr.push(() => foo);
            }

			foo = baz; // This is a runtime error, but not concern of this rule. For this rule, variable 'foo' is constant.
            `,
			languageOptions: { ecmaVersion: 2026 },
		},
		{
			code: `
            await using foo = bar;

            for (var i = 0; i < 5; i++) {
                arr.push(() => foo);
            }

			foo = baz; // This is a runtime error, but not concern of this rule. For this rule, variable 'foo' is constant.
            `,
			languageOptions: { ecmaVersion: 2026 },
		},
	],
	invalid: [
		{
			code: "for (var i=0; i<l; i++) { (function() { i; }) }",
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "FunctionExpression",
				},
			],
		},
		{
			code: "for (var i=0; i<l; i++) { for (var j=0; j<m; j++) { (function() { i+j; }) } }",
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i', 'j'" },
					type: "FunctionExpression",
				},
			],
		},
		{
			code: "for (var i in {}) { (function() { i; }) }",
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "FunctionExpression",
				},
			],
		},
		{
			code: "for (var i of {}) { (function() { i; }) }",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "FunctionExpression",
				},
			],
		},
		{
			code: "for (var i=0; i < l; i++) { (() => { i; }) }",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "ArrowFunctionExpression",
				},
			],
		},
		{
			code: "for (var i=0; i < l; i++) { var a = function() { i; } }",
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "FunctionExpression",
				},
			],
		},
		{
			code: "for (var i=0; i < l; i++) { function a() { i; }; a(); }",
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "FunctionDeclaration",
				},
			],
		},

		// Warns functions which are using modified variables.
		{
			code: "let a; for (let i=0; i<l; i++) { a = 1; (function() { a; });}",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'a'" },
					type: "FunctionExpression",
				},
			],
		},
		{
			code: "let a; for (let i in {}) { (function() { a; }); a = 1; }",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'a'" },
					type: "FunctionExpression",
				},
			],
		},
		{
			code: "let a; for (let i of {}) { (function() { a; }); } a = 1; ",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'a'" },
					type: "FunctionExpression",
				},
			],
		},
		{
			code: "let a; for (let i=0; i<l; i++) { (function() { (function() { a; }); }); a = 1; }",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'a'" },
					type: "FunctionExpression",
				},
			],
		},
		{
			code: "let a; for (let i in {}) { a = 1; function foo() { (function() { a; }); } }",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'a'" },
					type: "FunctionDeclaration",
				},
			],
		},
		{
			code: "let a; for (let i of {}) { (() => { (function() { a; }); }); } a = 1;",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'a'" },
					type: "ArrowFunctionExpression",
				},
			],
		},
		{
			code: "for (var i = 0; i < 10; ++i) { for (let x in xs.filter(x => x != i)) {  } }",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "ArrowFunctionExpression",
				},
			],
		},
		{
			code: "for (let x of xs) { let a; for (let y of ys) { a = 1; (function() { a; }); } }",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'a'" },
					type: "FunctionExpression",
				},
			],
		},
		{
			code: "for (var x of xs) { for (let y of ys) { (function() { x; }); } }",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'x'" },
					type: "FunctionExpression",
				},
			],
		},
		{
			code: "for (var x of xs) { (function() { x; }); }",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'x'" },
					type: "FunctionExpression",
				},
			],
		},
		{
			code: "var a; for (let x of xs) { a = 1; (function() { a; }); }",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'a'" },
					type: "FunctionExpression",
				},
			],
		},
		{
			code: "var a; for (let x of xs) { (function() { a; }); a = 1; }",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'a'" },
					type: "FunctionExpression",
				},
			],
		},
		{
			code: "let a; function foo() { a = 10; } for (let x of xs) { (function() { a; }); } foo();",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'a'" },
					type: "FunctionExpression",
				},
			],
		},
		{
			code: "let a; function foo() { a = 10; for (let x of xs) { (function() { a; }); } } foo();",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'a'" },
					type: "FunctionExpression",
				},
			],
		},

		// IIFE
		{
			code: "let a; for (var i=0; i<l; i++) { (function* (){i;})() }",
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "FunctionExpression",
				},
			],
		},
		{
			code: "let a; for (var i=0; i<l; i++) { (async function (){i;})() }",
			languageOptions: { ecmaVersion: 2022 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "FunctionExpression",
				},
			],
		},
		{
			code: `
            let current = getStart();
            const arr = [];
            while (current) {
                (function f() {
                    current;
                    arr.push(f);
                })();

                current = current.upper;
            }
            `,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'current'" },
					type: "FunctionExpression",
				},
			],
		},
		{
			code: `
            var arr = [];

            for (var i = 0; i < 5; i++) {
                (function fun () {
                    if (arr.includes(fun)) return i;
                    else arr.push(fun);
                })();
            }
            `,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "FunctionExpression",
				},
			],
		},
		{
			code: `
            let current = getStart();
            const arr = [];
            while (current) {
                const p = (async () => {
                    await someDelay();
                    current;
                })();

                arr.push(p);
                current = current.upper;
            }
            `,
			languageOptions: { ecmaVersion: 2022 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'current'" },
					type: "ArrowFunctionExpression",
				},
			],
		},
		{
			code: `
            var arr = [];

            for (var i = 0; i < 5; i++) {
                arr.push((f => f)(
                    () => i
                ));
            }
            `,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "ArrowFunctionExpression",
					line: 6,
				},
			],
		},
		{
			code: `
            var arr = [];

            for (var i = 0; i < 5; i++) {
                arr.push((() => {
                    return () => i;
                })());
            }
            `,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "ArrowFunctionExpression",
					line: 6,
				},
			],
		},
		{
			code: `
            var arr = [];

            for (var i = 0; i < 5; i++) {
                arr.push((() => {
                    return () => { return i };
                })());
            }
            `,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "ArrowFunctionExpression",
					line: 6,
				},
			],
		},
		{
			code: `
            var arr = [];

            for (var i = 0; i < 5; i++) {
                arr.push((() => {
                    return () => {
                        return () => i
                    };
                })());
            }
            `,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "ArrowFunctionExpression",
					line: 6,
				},
			],
		},
		{
			code: `
            var arr = [];

            for (var i = 0; i < 5; i++) {
                arr.push((() => {
                    return () =>
                        (() => i)();
                })());
            }
            `,
			languageOptions: { ecmaVersion: 6 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "ArrowFunctionExpression",
					line: 6,
				},
			],
		},
		{
			code: `
            var arr = [];

            for (var i = 0; i < 5; i ++) {
                (() => {
                    arr.push((async () => {
                        await 1;
                        return i;
                    })());
                })();
            }
            `,
			languageOptions: { ecmaVersion: 2022 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "ArrowFunctionExpression",
					line: 6,
				},
			],
		},
		{
			code: `
            var arr = [];

            for (var i = 0; i < 5; i ++) {
                (() => {
                    (function f() {
                        if (!arr.includes(f)) {
                            arr.push(f);
                        }
                        return i;
                    })();
                })();

            }
            `,
			languageOptions: { ecmaVersion: 2022 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "FunctionExpression",
				},
			],
		},
		{
			code: `
            var arr1 = [], arr2 = [];

            for (var [i, j] of ["a", "b", "c"].entries()) {
                (() => {
                    arr1.push((() => i)());
                    arr2.push(() => j);
                })();
            }
            `,
			languageOptions: { ecmaVersion: 2022 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'j'" },
					type: "ArrowFunctionExpression",
					line: 7,
				},
			],
		},
		{
			code: `
            var arr = [];

            for (var i = 0; i < 5; i ++) {
                ((f) => {
                    arr.push(f);
                })(() => {
                    return (() => i)();
                });

            }
            `,
			languageOptions: { ecmaVersion: 2022 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "ArrowFunctionExpression",
					line: 7,
				},
			],
		},
		{
			code: `
            for (var i = 0; i < 5; i++) {
                (async () => {
                    () => i;
                })();
            }
            `,
			languageOptions: { ecmaVersion: 2022 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "ArrowFunctionExpression",
					line: 3,
				},
			],
		},
		{
			code: `
            for (var i = 0; i < 10; i++) {
				items.push({
					id: i,
					name: "Item " + i
				});

				const process = function (callback){
					callback({ id: i, name: "Item " + i });
				};
			}
            `,
			languageOptions: { ecmaVersion: 2022 },
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "FunctionExpression",
					line: 8,
				},
			],
		},
	],
});

const ruleTesterTypeScript = new RuleTester({
	languageOptions: {
		parser: require("@typescript-eslint/parser"),
	},
});

ruleTesterTypeScript.run("no-loop-func", rule, {
	valid: [
		`
  for (let i = 0; i < 10; i++) {
	function foo() {
	  console.log('A');
	}
  }
	  `,
		`
  let someArray: MyType[] = [];
  for (let i = 0; i < 10; i += 1) {
	someArray = someArray.filter((item: MyType) => !!item);
  }
	  `,
		{
			code: `
  let someArray: MyType[] = [];
  for (let i = 0; i < 10; i += 1) {
	someArray = someArray.filter((item: MyType) => !!item);
  }
		`,
			languageOptions: {
				globals: {
					MyType: "readonly",
				},
			},
		},
		{
			code: `
  let someArray: MyType[] = [];
  for (let i = 0; i < 10; i += 1) {
	someArray = someArray.filter((item: MyType) => !!item);
  }
		`,
			languageOptions: {
				globals: {
					MyType: "writable",
				},
			},
		},
		`
  type MyType = 1;
  let someArray: MyType[] = [];
  for (let i = 0; i < 10; i += 1) {
	someArray = someArray.filter((item: MyType) => !!item);
  }
	  `,
		// Test case for a global type that hasn't been configured
		`
    // UnconfiguredGlobalType is not defined anywhere or configured in globals
    for (var i = 0; i < 10; i++) {
      const process = (item: UnconfiguredGlobalType) => {
        // This is valid because the type reference is considered safe
        // even though UnconfiguredGlobalType is not configured
        return item.id;
      };
    }
    `,

		// Test both configured and unconfigured global types
		{
			code: `
    for (var i = 0; i < 10; i++) {
      // ConfiguredType is in globals, UnconfiguredType is not
      // Both should be considered safe as they are type references
      const process = (configItem: ConfiguredType, unconfigItem: UnconfiguredType) => {
        return {
          config: configItem.value,
          unconfig: unconfigItem.value
        };
      };
    }
      `,
			languageOptions: {
				globals: {
					ConfiguredType: "readonly",
				},
			},
		},
	],
	invalid: [
		{
			code: `
  for (var i = 0; i < 10; i++) {
    function foo() {
      console.log(i);
    }
  }
			`,
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "FunctionDeclaration",
				},
			],
		},
		{
			code: `
  for (var i = 0; i < 10; i++) {
    const handler = (event: Event) => {
      console.log(i);
    };
  }
			`,
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "ArrowFunctionExpression",
				},
			],
		},
		{
			code: `
  interface Item {
    id: number;
    name: string;
  }

  const items: Item[] = [];
  for (var i = 0; i < 10; i++) {
    items.push({
      id: i,
      name: "Item " + i
    });

    const process = function(callback: (item: Item) => void): void {
      callback({ id: i, name: "Item " + i });
    };
  }
			`,
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "FunctionExpression",
				},
			],
		},
		{
			code: `
  type Processor<T> = (item: T) => void;

  for (var i = 0; i < 10; i++) {
    const processor: Processor<number> = (item) => {
      return item + i;
    };
  }
			`,
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "ArrowFunctionExpression",
				},
			],
		},
		// Function uses unconfigured global type but still references loop variable
		{
			code: `
      for (var i = 0; i < 10; i++) {
        // UnconfiguredGlobalType is not defined anywhere
        // But the function still references i which makes it unsafe
        const process = (item: UnconfiguredGlobalType) => {
          console.log(i, item.value);
        };
      }
      `,
			errors: [
				{
					messageId: "unsafeRefs",
					data: { varNames: "'i'" },
					type: "ArrowFunctionExpression",
				},
			],
		},
	],
});
