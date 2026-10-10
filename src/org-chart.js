import { OrgChart } from "d3-org-chart";

const charts = new WeakMap();
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

export function renderOrganizationChart(container, nodes, lang, onSelect) {
  if (!nodes.length) return;
  let chart = charts.get(container);
  if (!chart) {
    chart = new OrgChart().container(container);
    charts.set(container, chart);
  }
  chart
    .data(nodes)
    .layout("top")
    .compact(true)
    .duration(0)
    .defaultFont("Vazirmatn, Arial, sans-serif")
    .nodeButtonWidth(() => 0)
    .nodeButtonHeight(() => 0)
    .svgHeight(Math.max(320, 220 + Math.ceil((nodes.length - 1) / 2) * 140))
    .nodeWidth(() => 230)
    .nodeHeight(node => node.data.parentId === null ? 90 : 75 + Math.max(1, node.data.members?.length || 1) * 22)
    .childrenMargin(() => 45)
    .siblingsMargin(() => 25)
    .compactMarginBetween(() => 35)
    .compactMarginPair(() => 25)
    .nodeContent(({ data }) => `<div class="org-node ${data.parentId === null ? "org-root" : ""}" dir="${lang === "fa" ? "rtl" : "ltr"}"><strong>${escapeHtml(data.label)}</strong><div>${escapeHtml(data.names)}</div></div>`)
    .nodeUpdate(function () {
      this.querySelector(".node-rect")?.setAttribute("fill", "transparent");
      this.setAttribute("role", "button");
      this.setAttribute("tabindex", "0");
      this.onkeydown = event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(this.__data__.data);
        }
      };
    })
    .linkUpdate(function () {
      this.setAttribute("stroke", "var(--accent)");
      this.setAttribute("stroke-width", "1.5");
      this.setAttribute("marker-end", `url(#${container.id}-arrow)`);
    })
    .onNodeClick(node => onSelect(node.data))
    .render()
    .expandAll()
    .render()
    .fit({ animate: false });
  const svg = container.querySelector("svg");
  const markerId = container.id + "-arrow";
  if (!svg.querySelector(`[id="${markerId}"]`)) {
    const ns = "http://www.w3.org/2000/svg";
    const defs = document.createElementNS(ns, "defs");
    const marker = document.createElementNS(ns, "marker");
    for (const [key, value] of Object.entries({ id: markerId, viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "6", markerHeight: "6", orient: "auto-start-reverse" })) marker.setAttribute(key, value);
    const arrow = document.createElementNS(ns, "path");
    arrow.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
    arrow.setAttribute("fill", "var(--accent)");
    marker.append(arrow);
    defs.append(marker);
    svg.append(defs);
  }
}

export function controlOrganizationChart(container, action) {
  const chart = charts.get(container);
  if (!chart) return;
  if (action === "in") chart.zoomIn();
  else if (action === "out") chart.zoomOut();
  else chart.fit({ animate: false });
}
