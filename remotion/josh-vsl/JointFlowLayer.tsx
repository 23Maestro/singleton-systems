import {dia, shapes} from "@joint/core";
import {useLayoutEffect, useRef} from "react";

export type FlowNode = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FlowEdge = {
  id: string;
  source: string;
  target: string;
  sourceAnchor?: "left" | "right" | "top" | "bottom";
  targetAnchor?: "left" | "right" | "top" | "bottom";
  vertices?: Array<{x: number; y: number}>;
};

export type FlowLayout = {
  nodes: FlowNode[];
  edges: FlowEdge[];
};

const anchorPoint = (node: FlowNode, anchor: NonNullable<FlowEdge["sourceAnchor"]>) => {
  if (anchor === "left") return {x: node.x, y: node.y + node.height / 2};
  if (anchor === "top") return {x: node.x + node.width / 2, y: node.y};
  if (anchor === "bottom") return {x: node.x + node.width / 2, y: node.y + node.height};
  return {x: node.x + node.width, y: node.y + node.height / 2};
};

type JointFlowLayerProps = {
  layout: (width: number, height: number) => FlowLayout;
  progress: number;
  stroke: string;
  strokeWidth?: number;
  cornerRadius?: number;
  obstaclePadding?: number;
  canvasWidth?: number;
  canvasHeight?: number;
};

/**
 * JointJS owns graph geometry only. The parent composition owns cards, styling,
 * and frame-based animation so Remotion renders remain deterministic.
 */
export const JointFlowLayer = ({
  layout,
  progress,
  stroke,
  strokeWidth = 2.5,
  cornerRadius = 12,
  obstaclePadding = 6,
  canvasWidth,
  canvasHeight,
}: JointFlowLayerProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<shapes.standard.Link[]>([]);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const width = canvasWidth ?? host.clientWidth;
    const height = canvasHeight ?? host.clientHeight;
    const graph = new dia.Graph({}, {cellNamespace: shapes});
    const paper = new dia.Paper({
      el: host,
      model: graph,
      width,
      height,
      cellViewNamespace: shapes,
      interactive: false,
      async: false,
      frozen: true,
      background: {color: "transparent"},
    });
    const resolved = layout(width, height);
    const nodeById = new Map(resolved.nodes.map((node) => [node.id, node]));
    const nodes = resolved.nodes.map((node) =>
      new shapes.standard.Rectangle({
        id: node.id,
        position: {x: node.x, y: node.y},
        size: {width: node.width, height: node.height},
        attrs: {
          body: {fill: "transparent", stroke: "none"},
          label: {display: "none"},
        },
      }),
    );
    const links = resolved.edges.map((edge) => {
      const sourceNode = nodeById.get(edge.source);
      const targetNode = nodeById.get(edge.target);
      if (!sourceNode || !targetNode) {
        throw new Error(`JointFlowLayer edge ${edge.id} references a missing node`);
      }
      const sourceAnchor = edge.sourceAnchor ?? "right";
      const targetAnchor = edge.targetAnchor ?? "left";
      return new shapes.standard.Link({
        id: edge.id,
        source: anchorPoint(sourceNode, sourceAnchor),
        target: anchorPoint(targetNode, targetAnchor),
        vertices: edge.vertices,
        router: edge.vertices ? {name: "normal"} : {
          name: "manhattan",
          args: {
            padding: obstaclePadding,
            step: 6,
            startDirections: [sourceAnchor],
            endDirections: [targetAnchor],
          },
        },
        connector: {name: "rounded", args: {radius: cornerRadius}},
        attrs: {
          line: {
            fill: "none",
            stroke,
            strokeWidth,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            sourceMarker: {type: "none"},
            targetMarker: {type: "none"},
            pathLength: 1,
            strokeDasharray: 1,
            strokeDashoffset: 1 - progress,
          },
        },
      });
    });

    graph.resetCells([...nodes, ...links]);
    linksRef.current = links;
    paper.unfreeze();

    return () => {
      linksRef.current = [];
      paper.remove();
    };
  }, [canvasHeight, canvasWidth, cornerRadius, layout, obstaclePadding, strokeWidth]);

  useLayoutEffect(() => {
    for (const link of linksRef.current) {
      link.attr({
        line: {
          stroke,
          strokeDashoffset: 1 - progress,
        },
      });
    }
  }, [progress, stroke]);

  return (
    <div
      aria-hidden="true"
      style={{position: "absolute", inset: 0, gridColumn: "1 / -1", gridRow: "1", zIndex: 0, pointerEvents: "none", overflow: "visible"}}
    >
      <div ref={hostRef} style={{position: "absolute", inset: 0, overflow: "visible"}}/>
    </div>
  );
};
