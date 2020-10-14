import React, {useEffect, useRef} from "react";
import * as d3 from 'd3';
import {Molecule, ProjectedMolecule} from "../types/Molecules";


const BUFFER_PROPORTION = 1 / 20;
const MARGINS_PROPORTION = 1 / 20;
const LEGEND_PROPORTION = 1/8;
const CIRCLE_R = 2;
const colors = d3.scaleOrdinal(d3.schemeCategory10);
const WIDTH = 410;
const HEIGHT = 410;


interface ProjectionChartProps {
    readonly data: ProjectedMolecule[];
    readonly selectedMolecule: Molecule | undefined;
    readonly handleSelectedMoleculeChange: (mol: Molecule) => void;
}

export const ProjectionChart: React.FC<ProjectionChartProps> = ({data, selectedMolecule, handleSelectedMoleculeChange}) => {
    const d3Container = useRef(null);

    useEffect(() => {
        if (data !== undefined) {
            const margins = WIDTH * MARGINS_PROPORTION;
            const legend_space = WIDTH * LEGEND_PROPORTION;
            const getX = (d: ProjectedMolecule) => d.x;
            const getY = (d: ProjectedMolecule) => d.y;
            const minX = d3.min(data, getX);
            const maxX = d3.max(data, getX);
            const minY = d3.min(data, getY);
            const maxY = d3.max(data, getY);
            const labels = Array.from(new Set(data.map(d => d.label)));

            if (minX !== undefined && maxX !== undefined && minY !== undefined && maxY !== undefined && labels !== undefined) {
                const xScaleBuffer = (maxX - minX) * BUFFER_PROPORTION;
                const yScaleBuffer = (maxY - minY) * BUFFER_PROPORTION;

                const xScale = d3.scaleLinear()
                    .domain([minX - xScaleBuffer, maxX + xScaleBuffer])
                    .range([margins, (WIDTH - margins - legend_space)]);
                const yScale = d3.scaleLinear()
                    .domain([minY - yScaleBuffer, maxY + yScaleBuffer])
                    .range([(HEIGHT - margins), margins]);
                const xAxis = d3.axisBottom(xScale).tickFormat(() => "").tickSize(0);
                const yAxis = d3.axisLeft(yScale).tickFormat(() => "").tickSize(0);

                const rootG = d3.select(d3Container.current);
                rootG.selectAll('g').remove().exit();

                // Add a clipPath: everything out of this area won't be drawn.
                const clip = rootG.append("defs").append("SVG:clipPath")
                    .attr("id", "clip")
                    .append("SVG:rect")
                    .attr("width", (WIDTH - (margins * 2) - legend_space))
                    .attr("height", HEIGHT - margins * 2)
                    .attr("x", margins)
                    .attr("y", margins);

                const circlesG = rootG.append('g').attr("clip-path", "url(#clip)");
                const legendCirclesG = rootG.append('g');
                const legendTextG = rootG.append('g');
                const xAxisG = rootG.append('g');
                const yAxisG = rootG.append('g');

                legendCirclesG.selectAll('circle')
                    .data(labels)
                    .enter()
                    .append("circle")
                    .attr('r', 2*CIRCLE_R)
                    .style("stroke", "black")
                    .style("stroke-width", .25)
                    .style("fill", (label) => {
                        return colors(String(label));
                    })
                    .attr('cx', function (d, i) {
                        return WIDTH - (margins / 2) - legend_space;
                    })
                    .attr('cy', function (d, i) {
                        return ((HEIGHT - margins) / 2) + (i * ((labels.length / 2) * 8*CIRCLE_R));
                    })

                legendTextG.selectAll('text')
                    .data(labels)
                    .enter()
                    .append("text")
                    .attr('x', function (d, i) {
                        return WIDTH - (margins / 2) - legend_space + 2*CIRCLE_R;
                    })
                    .attr('y', function (d, i) {
                        return (((HEIGHT - margins) / 2) + 2*CIRCLE_R)+ (i * ((labels.length / 2) * 8*CIRCLE_R));
                    })
                    .text((d) => d);



                xAxisG
                    .attr("class", "axis")
                    .attr("transform", "translate(0," + (HEIGHT - margins) + ")")
                    .call(xAxis);

                yAxisG
                    .attr("class", "axis")
                    .attr("transform", "translate(" + margins + ", 0)")
                    .call(yAxis);

                const updateChart = (t: any) => {

                    // recover the new scale
                    const newXScale = t.rescaleX(xScale);
                    const newYScale = t.rescaleY(yScale);

                    // update circle position
                    circlesG
                        .selectAll("circle")
                        .attr('cx', function(d) {
                            const mol = d as ProjectedMolecule
                            return newXScale(mol.x)
                        })
                        .attr('cy', function(d) {
                            const mol = d as ProjectedMolecule
                            return newYScale(mol.y)
                        });
                }
                const zoom = d3.zoom()
                    .scaleExtent([.5, 40])  // This control how much you can unzoom (x0.5) and zoom (x20)
                    .extent([[margins, margins], [(WIDTH - margins - legend_space), HEIGHT - margins]])
                    .on("zoom", (event) => {
                        // @ts-ignore
                        updateChart(event.transform)
                    });

                circlesG.append("rect")
                    .attr("width", WIDTH)
                    .attr("height", HEIGHT)
                    .style("fill", "none")
                    .style("pointer-events", "all")
                    .attr('transform', 'translate(' + margins + ',' + margins + ')')
                    //@ts-ignore
                    .call(zoom);

                circlesG
                    .selectAll('circle')
                    .data(data)
                    .enter()
                    .append('circle')
                    .attr('cx', function (d) {
                        return xScale(getX(d)) as number;
                    })
                    .attr('cy', function (d) {
                        return yScale(getY(d)) as number;
                    })
                    .attr('r', CIRCLE_R)
                    .style("stroke", "black")
                    .style("stroke-width", .25)
                    .style("fill", (d) => {
                        return colors(String(d.label));
                    })
                    .on("click", function (mouseoverEvent, mol) {
                        circlesG
                            .select(".selected")
                            .attr('class', null)
                            .style('fill', (d) => {
                                // Danger
                                const mol = d as ProjectedMolecule;
                                return colors(String(mol.label));
                            });

                        d3.select(this)
                            .attr('class', 'selected')
                            .style("fill", "#fff13b");

                        handleSelectedMoleculeChange(mol as unknown as ProjectedMolecule);
                    });
            }
        }
    }, [data, handleSelectedMoleculeChange]);


    return (
        <svg ref={d3Container} width={WIDTH} height={HEIGHT}/>
    )

}
