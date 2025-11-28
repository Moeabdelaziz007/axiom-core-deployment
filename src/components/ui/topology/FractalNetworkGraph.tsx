"use client";

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
    id: string;
    group: string;
    val: number;
    label: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
    source: string | Node;
    target: string | Node;
    value: number;
}

interface GraphData {
    nodes: Node[];
    links: Link[];
}

interface FractalNetworkGraphProps {
    data: GraphData;
    width?: number;
    height?: number;
}

export const FractalNetworkGraph: React.FC<FractalNetworkGraphProps> = ({
    data,
    width = 800,
    height = 600
}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous render

        const simulation = d3.forceSimulation<Node>(data.nodes)
            .force("link", d3.forceLink<Node, Link>(data.links).id(d => d.id).distance(50))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius(d => (d as Node).val + 5));

        // Define gradients and filters for Cyberpunk look
        const defs = svg.append("defs");

        // Glow filter
        const filter = defs.append("filter")
            .attr("id", "glow");
        filter.append("feGaussianBlur")
            .attr("stdDeviation", "2.5")
            .attr("result", "coloredBlur");
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        // Draw links
        const link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(data.links)
            .join("line")
            .attr("stroke-width", d => Math.sqrt(d.value))
            .attr("stroke", "#00f0ff"); // Cyan links

        // Draw nodes
        const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(data.nodes)
            .join("circle")
            .attr("r", d => d.val)
            .attr("fill", d => {
                if (d.group === 'imam') return "#ff0055"; // Red/Pink for Leader
                if (d.group === 'alim') return "#00f0ff"; // Cyan for Scholar
                return "#7000ff"; // Purple for Worker
            })
            .attr("filter", "url(#glow)") // Apply glow
            .call(d3.drag<SVGCircleElement, Node>()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended) as any);

        // Add labels
        const labels = svg.append("g")
            .attr("class", "labels")
            .selectAll("text")
            .data(data.nodes)
            .enter()
            .append("text")
            .attr("dx", 12)
            .attr("dy", ".35em")
            .text(d => d.label)
            .style("fill", "#e0e0e0")
            .style("font-size", "10px")
            .style("font-family", "monospace")
            .style("pointer-events", "none");

        node.append("title")
            .text(d => d.id);

        simulation.on("tick", () => {
            link
                .attr("x1", d => (d.source as Node).x!)
                .attr("y1", d => (d.source as Node).y!)
                .attr("x2", d => (d.target as Node).x!)
                .attr("y2", d => (d.target as Node).y!);

            node
                .attr("cx", d => d.x!)
                .attr("cy", d => d.y!);

            labels
                .attr("x", d => d.x!)
                .attr("y", d => d.y!);
        });

        function dragstarted(event: any, d: Node) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event: any, d: Node) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event: any, d: Node) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return () => {
            simulation.stop();
        };
    }, [data, width, height]);

    return (
        <div className="relative w-full h-full bg-black/50 border border-cyan-500/30 rounded-lg overflow-hidden shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <div className="absolute top-2 left-2 text-xs text-cyan-400 font-mono">
                FRACTAL COSMOS v1.0
            </div>
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full"
            />
        </div>
    );
};
