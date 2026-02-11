import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useOutletContext } from 'react-router-dom';
import { mockNodes, mockEdges } from '../services/mockData';
import { Filter, Search, Layers, Maximize, Share, ZoomIn, ZoomOut, MousePointer2 } from 'lucide-react';
import { BNode } from '../types';

interface ContextType {
    setSelectedEntity: (node: BNode) => void;
    setDockOpen: (open: boolean) => void;
    setActiveDockTab: (tab: string) => void;
}

const Explore: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setSelectedEntity, setDockOpen } = useOutletContext<ContextType>();
  const [filterType, setFilterType] = useState<string>('All');

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Simulation
    const nodes = mockNodes.map(d => ({ ...d }));
    const links = mockEdges.map(d => ({ ...d }));

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(40));

    // Links
    const link = g.append("g")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2);

    // Nodes
    const node = g.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<SVGGElement, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Node Circles
    node.append("circle")
      .attr("r", 25)
      .attr("fill", (d: BNode) => {
          switch(d.type) {
              case 'BusinessObject': return '#0ea5e9'; // brand-500
              case 'Process': return '#8b5cf6'; // violet-500
              case 'Term': return '#10b981'; // emerald-500
              default: return '#64748b'; // slate-500
          }
      })
      .attr("cursor", "pointer")
      .on("click", (event, d) => {
          // Find original BNode data
          const original = mockNodes.find(n => n.id === d.id);
          if (original) {
            setSelectedEntity(original);
            setDockOpen(true);
          }
          event.stopPropagation();
      });

    // Node Labels
    node.append("text")
      .attr("dx", 0)
      .attr("dy", 35)
      .text((d: any) => d.name.split(' ')[0]) // Simplify name for display
      .attr("text-anchor", "middle")
      .attr("stroke", "none")
      .attr("fill", "#475569")
      .style("font-size", "10px")
      .style("font-family", "sans-serif");
      
    // Node Icons (Simple simulation)
    node.append("text")
      .attr("dy", 5)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("pointer-events", "none")
      .style("font-size", "14px")
      .text((d: any) => d.type.substring(0,1));

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
        simulation.stop();
    }
  }, [filterType, setSelectedEntity, setDockOpen]);

  return (
    <div className="flex h-full">
        {/* Left Filters */}
        <div className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col gap-4 z-10 shadow-sm">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">筛选器</h2>
            
            <div className="space-y-2">
                <label className="text-xs text-slate-500 font-medium">节点类型</label>
                <select 
                    className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-brand-500 focus:ring-brand-500"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="All">所有类型</option>
                    <option value="BusinessObject">业务对象</option>
                    <option value="Process">业务流程</option>
                    <option value="Term">业务术语</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-xs text-slate-500 font-medium">状态</label>
                <div className="space-y-1">
                    {['已发布', '草稿', '审核中'].map(s => (
                        <label key={s} className="flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" className="rounded text-brand-600 focus:ring-brand-500" defaultChecked />
                            {s}
                        </label>
                    ))}
                </div>
            </div>

            <hr className="border-slate-100" />
            
            <div className="space-y-2">
                <label className="text-xs text-slate-500 font-medium">保存的视图</label>
                <div className="text-sm text-brand-600 cursor-pointer hover:underline">核心财务域</div>
                <div className="text-sm text-slate-600 cursor-pointer hover:text-brand-600">GDPR 敏感数据</div>
                <div className="text-sm text-slate-600 cursor-pointer hover:text-brand-600">最近变更</div>
            </div>
        </div>

        {/* Graph Canvas */}
        <div className="flex-1 relative bg-slate-50" ref={containerRef}>
            {/* Toolbar */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                <div className="bg-white p-1 rounded-lg shadow-md border border-slate-200 flex pointer-events-auto">
                    <button className="p-2 hover:bg-slate-100 rounded text-slate-600" title="选择"><MousePointer2 className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-slate-100 rounded text-slate-600" title="放大"><ZoomIn className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-slate-100 rounded text-slate-600" title="缩小"><ZoomOut className="w-4 h-4" /></button>
                    <div className="w-px h-6 bg-slate-200 mx-1 my-1"></div>
                    <button className="p-2 hover:bg-slate-100 rounded text-slate-600" title="布局"><Layers className="w-4 h-4" /></button>
                </div>

                <div className="pointer-events-auto">
                    <button className="bg-white px-3 py-1.5 rounded-lg shadow-md border border-slate-200 text-sm font-medium text-slate-700 hover:text-brand-600 flex items-center gap-2">
                        <Share className="w-4 h-4" /> 分享视图
                    </button>
                </div>
            </div>

            <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing"></svg>

            {/* Minimap Placeholder */}
            <div className="absolute bottom-4 left-4 w-32 h-24 bg-white border border-slate-200 shadow-md rounded opacity-80 pointer-events-none overflow-hidden">
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">小地图</div>
            </div>
        </div>
    </div>
  );
};

export default Explore;