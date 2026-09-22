// @vitest-environment node
import { describe, it, expect } from "vitest";
import { expandTree, collectDepartmentsUnderUnits } from "@/features/shared/lib/hierarchy-tree";

describe("expandTree", () => {
  const nodes = [
    { id: 1, parentId: null },
    { id: 2, parentId: 1 },
    { id: 3, parentId: 1 },
    { id: 4, parentId: 2 },
    { id: 5, parentId: 4 },
    { id: 6, parentId: null },
  ];

  it("expands all transitive descendants of a root", () => {
    expect(expandTree([1], nodes)).toEqual(new Set([1, 2, 3, 4, 5]));
  });

  it("returns only the root when it has no children", () => {
    expect(expandTree([6], nodes)).toEqual(new Set([6]));
  });

  it("handles multiple roots and deduplicates", () => {
    expect(expandTree([2, 3], nodes)).toEqual(new Set([2, 3, 4, 5]));
  });

  it("returns an empty set for no roots", () => {
    expect(expandTree([], nodes)).toEqual(new Set());
  });

  it("ignores unknown roots without crashing", () => {
    expect(expandTree([99], nodes)).toEqual(new Set([99]));
  });
});

describe("collectDepartmentsUnderUnits", () => {
  const departments = [
    { id: 10, organizationalUnitId: 1 },
    { id: 11, organizationalUnitId: 1 },
    { id: 20, organizationalUnitId: 2 },
    { id: 30, organizationalUnitId: 3 },
  ];

  it("collects every department under the expanded units", () => {
    expect(collectDepartmentsUnderUnits(departments, new Set([1, 3]))).toEqual(new Set([10, 11, 30]));
  });

  it("returns an empty set when no unit matches", () => {
    expect(collectDepartmentsUnderUnits(departments, new Set([99]))).toEqual(new Set());
  });
});
