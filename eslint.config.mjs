import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// RTL-first (07-i18n.md): physical-direction Tailwind utilities are banned in class
// strings; use the logical ones (ms-/me-/ps-/pe-/start-/end-/text-start/rounded-s…).
// A class token may be prefixed by a variant (`hover:`), `!` or a negative `-`.
const PHYSICAL = String.raw`/(^|[\s:!-])(m[lr]|p[lr]|left|right|scroll-[mp][lr]|border-[lr]|rounded-([lr]|[tb][lr])|text-(left|right)|float-(left|right)|clear-(left|right))(-|\s|$)/`;
const MESSAGE =
  "Physical-direction utility in a class string. Use the logical form (ms-/me-/ps-/pe-/start-/end-/text-start/text-end/rounded-s/rounded-e/border-s/border-e) so RTL works.";
const CLASS_CONTEXTS = [
  'JSXAttribute[name.name="className"]',
  "CallExpression[callee.name=/^(cn|cva|clsx)$/]",
];

export const rtlRule = {
  "no-restricted-syntax": [
    "error",
    ...CLASS_CONTEXTS.flatMap((ctx) => [
      { selector: `${ctx} Literal[value=${PHYSICAL}]`, message: MESSAGE },
      {
        selector: `${ctx} TemplateElement[value.raw=${PHYSICAL}]`,
        message: MESSAGE,
      },
    ]),
  ],
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: rtlRule,
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
