import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const eslint = new ESLint({ cwd: process.cwd() });

async function physicalHits(code: string) {
  const [result] = await eslint.lintText(code, {
    filePath: "src/components/rtl-fixture.tsx",
  });
  return result.messages.filter((m) => m.ruleId === "no-restricted-syntax");
}

describe("RTL lint rule", () => {
  it.each([
    'export const X = () => <div className="ml-2" />;',
    'export const X = () => <div className="hover:pr-4" />;',
    'export const X = () => <div className="-left-1" />;',
    'export const X = () => <div className="text-right" />;',
    'export const X = () => <div className="rounded-tl-md" />;',
    'import { cn } from "@/lib/utils";\nexport const c = cn("border-l", "p-2");',
    "export const X = () => <div className={`pt-1 ${String(1)} mr-auto`} />;",
  ])("rejects %s", async (code) => {
    expect(await physicalHits(code)).toHaveLength(1);
  });

  it("accepts logical and look-alike utilities", async () => {
    const code =
      'export const X = () => <div className="ms-2 pe-4 start-0 end-1 text-start rounded-lg rounded-s-md border-ring border-e px-2 data-[side=left]:ps-1" />;';
    expect(await physicalHits(code)).toEqual([]);
  });

  it("ignores strings that are not class names", async () => {
    expect(await physicalHits('export const label = "ml-2";')).toEqual([]);
  });
});
