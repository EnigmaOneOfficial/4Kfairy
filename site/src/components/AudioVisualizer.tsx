"use client";

import React, { useRef, useEffect } from "react";
import { select } from "d3-selection";
import { scaleLinear } from "d3-scale";
import { line, curveBasis } from "d3-shape";

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioElement }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const mouseYRef = useRef<number | null>(null);
  const mouseXRef = useRef<number | null>(null);
  const frequencyData = new Uint8Array(128);

  useEffect(() => {
    if (!audioElement || !svgRef.current) return;

    const audioContext = new (window.AudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const svg = select(svgRef.current);
    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      svg.attr('width', width).attr('height', height);
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    const updateVisualizer = () => {
      analyser.getByteFrequencyData(frequencyData);

      const width = +svg.attr('width');
      const height = +svg.attr('height');
      const centerX = width / 2;
      const centerY = height / 2;

      const xScale = scaleLinear().domain([0, frequencyData.length]).range([0, width]);
      const yScale = scaleLinear().domain([0, 256]).range([centerY, height]);
      const smoothing = 0.2;

      const liney = line<number>()
        .x((_, i) => xScale(i) - centerX)
        .y((d) => {
          const currentValue = yScale(d);
          const targetValue = centerY + (currentValue - centerY)
          return smoothing * targetValue + (1 - smoothing) * currentValue;
        })
        .curve(curveBasis);

      const path = svg.selectAll<SVGPathElement, Uint8Array>('path').data([frequencyData]);

      path
        .enter()
        .append('path')
        .merge(path)
        .attr('transform', `translate(${centerX}, 0)`)
        .attr('d', liney)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 3);

      path.exit().remove();

      requestAnimationFrame(updateVisualizer);
    };

    updateVisualizer();

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [audioElement]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseYRef.current = event.clientY;
      mouseXRef.current = event.clientX;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <svg ref={svgRef}></svg>;
};

export default AudioVisualizer;
