import { beforeEach, describe, expect, it } from "vitest";
import { createSearchTrigger, qualifies } from "./search";

function renderPanel(query: string, results: string[]): void {
  const imgs = results.map((name) => `<img alt="${name}">`).join("");
  document.body.innerHTML = `
    <div>
      <form class="my-3"><input type="text" value="${query}"><button>Search</button></form>
      <div class="search-results"><div class="grid">${imgs}</div></div>
    </div>`;
}

describe("qualifies", () => {
  it("requires at least five characters", () => {
    expect(qualifies("troll", ["Precious Trolley"])).toBe(true);
    expect(qualifies("trol", ["Precious Trolley"])).toBe(false);
    expect(qualifies("  trol  ", ["Precious Trolley"])).toBe(false);
  });

  it("requires Precious Trolley in the results", () => {
    expect(qualifies("precious", ["Precious Cargo"])).toBe(false);
    expect(qualifies("precious", ["Precious Cargo", "Precious Trolley"])).toBe(true);
  });
});

describe("createSearchTrigger", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("does nothing when the search panel is absent", () => {
    expect(createSearchTrigger(document)()).toBe(false);
  });

  it("fires once per qualifying query", () => {
    const check = createSearchTrigger(document);
    renderPanel("Precious Trolley", ["Precious Trolley"]);
    expect(check()).toBe(true);
    expect(check()).toBe(false);
  });

  it("re-arms after a non-qualifying search", () => {
    const check = createSearchTrigger(document);
    renderPanel("trolley", ["Precious Trolley"]);
    expect(check()).toBe(true);
    renderPanel("pikachu", ["Pikachu"]);
    expect(check()).toBe(false);
    renderPanel("trolley", ["Precious Trolley"]);
    expect(check()).toBe(true);
  });

  it("fires for a different qualifying query", () => {
    const check = createSearchTrigger(document);
    renderPanel("trolley", ["Precious Trolley"]);
    expect(check()).toBe(true);
    renderPanel("precious", ["Precious Trolley", "Precious Cargo"]);
    expect(check()).toBe(true);
  });
});
