import React, {useEffect, useRef} from "react";
import * as d3 from 'd3';
import {Molecule, ProjectedMolecule} from "../types/Molecules";


const BUFFER_PROPORTION = 1 / 20;
const MARGINS_PROPORTION = 1 / 8;
const CIRCLE_R = 2;
const colors = d3.scaleOrdinal(d3.schemeCategory10);
const WIDTH = 410;
const HEIGHT = 410;


interface ProjectionChartProps {
    readonly data: ProjectedMolecule[];
    readonly handleSelectedMoleculeChange: (mol: Molecule) => void;
}

export const ProjectionChart: React.FC<ProjectionChartProps> = ({data, handleSelectedMoleculeChange}) => {
    const d3Container = useRef(null);

    useEffect(() => {
        if (data !== undefined) {
            const margins = WIDTH * MARGINS_PROPORTION;
            const getX = (d: ProjectedMolecule) => d.x;
            const getY = (d: ProjectedMolecule) => d.y;
            const minX = d3.min(data, getX);
            const maxX = d3.max(data, getX);
            const minY = d3.min(data, getY);
            const maxY = d3.max(data, getY);

            if (minX !== undefined && maxX !== undefined && minY !== undefined && maxY !== undefined) {
                const xScaleBuffer = (maxX - minX) * BUFFER_PROPORTION;
                const yScaleBuffer = (maxY - minY) * BUFFER_PROPORTION;

                const xScale = d3.scaleLinear()
                    .domain([minX - xScaleBuffer, maxX + xScaleBuffer])
                    .range([margins, (WIDTH - margins)]);
                const yScale = d3.scaleLinear()
                    .domain([minY - yScaleBuffer, maxY + yScaleBuffer])
                    .range([(HEIGHT - margins), margins]);
                const xAxis = d3.axisBottom(xScale);
                const yAxis = d3.axisLeft(yScale);

                const rootG = d3.select(d3Container.current);
                rootG.selectAll('g').remove().exit();

                const circlesG = rootG.append('g');
                const xAxisG = rootG.append('g');
                const yAxisG = rootG.append('g');

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

                xAxisG
                    .attr("class", "axis")
                    .attr("transform", "translate(0," + (HEIGHT - margins) + ")")
                    .call(xAxis);

                yAxisG
                    .attr("class", "axis")
                    .attr("transform", "translate(" + margins + ", 0)")
                    .call(yAxis);
            }

        }
    }, [data, handleSelectedMoleculeChange]);


    return (
        <svg ref={d3Container} width={WIDTH} height={HEIGHT}/>
    )

}
