import React, {useContext, useEffect, useRef} from "react";

import * as d3 from 'd3';
import {Molecule, ProjectedMolecule} from "../types/Molecules";
import {Dimensions, DimensionsContext} from "../contexts/Dimensions";

// The version of d3 types is like two major versions behind the actual d3
// version, so for the most part ignore typescript


type RootSelection = d3.Selection<SVGSVGElement, unknown, null, undefined>;

type Scale = d3.ScaleLinear<number, number>;

interface Scales {
    readonly xScale: Scale;
    readonly yScale: Scale;
}

interface D3Coords {
    readonly startX: number;
    readonly endX: number;
    readonly startY: number;
    readonly endY: number;
}

interface D3RectSpec {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
}

interface D3LegendSpec {
    readonly symbolX: number;
    readonly textX: number;
    readonly symbolStartY: number;
    readonly textStartY: number;
    readonly incrementY: number;
}

interface ExtremeValues {
    readonly minX: number;
    readonly maxX: number;
    readonly minY: number;
    readonly maxY: number;
}

const BUFFER_PROPORTION = 1 / 20;
const MARGINS_PROPORTION = 1 / 40;
const LEGEND_PROPORTION = 1 / 6;
const CIRCLE_R = 2;
const colors = d3.scaleOrdinal(d3.schemeCategory10);


interface ProjectionChartProps {
    readonly data: ProjectedMolecule[];
    readonly selectedMolecule: ProjectedMolecule | undefined;
    readonly handleSelectedMoleculeChange: (mol: Molecule) => void;
}

const createGroups = (rootG: RootSelection) => {
    rootG.append('g').attr("id", "circlesG").attr("clip-path", "url(#clip)");
    rootG.append('g').attr("id", 'legendCirclesG');
    rootG.append('g').attr("id", "legendTextG");
    rootG.append('g').attr("id", "xAxisG");
    rootG.append('g').attr("id", "yAxisG");
}

const createScales = ({minX, maxX, minY, maxY}: ExtremeValues, {startX, endX, startY, endY}: D3Coords) => {


    const xScaleBuffer = (maxX - minX) * BUFFER_PROPORTION;
    const yScaleBuffer = (maxY - minY) * BUFFER_PROPORTION;

    const xScale = d3.scaleLinear()
        .domain([minX - xScaleBuffer, maxX + xScaleBuffer])
        .range([startX, endX]);
    const yScale = d3.scaleLinear()
        .domain([minY - yScaleBuffer, maxY + yScaleBuffer])
        .range([startY, endY]);

    return {xScale, yScale};
}

const removeAppendDefs = (rootG: RootSelection, {x, y, width, height}: D3RectSpec) => {
    rootG.selectAll("defs").remove().exit();

    // Add a clipPath: everything out of this area won't be drawn.
    rootG.append("defs").append("SVG:clipPath")
        .attr("id", "clip")
        .append("SVG:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", x)
        .attr("y", y);
}

const joinLegend = (rootG: RootSelection, labels: string[], {symbolX, textX, symbolStartY, textStartY, incrementY}: D3LegendSpec) => {
    const legendCirclesG = rootG.select('#legendCirclesG');
    const legendTextG = rootG.select('#legendTextG');

    legendCirclesG.selectAll('circle')
        .data(labels)
        .join("circle")
        .attr('r', 2 * CIRCLE_R)
        .style("stroke", "black")
        .style("stroke-width", .25)
        .style("fill", (label) => {
            return colors(String(label));
        })
        .attr('cx', function (d, i) {
            return symbolX;
        })
        .attr('cy', function (d, i) {
            return symbolStartY + (i * incrementY);
        })

    legendTextG.selectAll('text')
        .data(labels)
        .join("text")
        .attr('x', function (d, i) {
            return textX;
        })
        .attr('y', function (d, i) {
            return textStartY + (i * incrementY);
        })
        .text((d) => d);
}


const callAxis = (rootG: RootSelection,
                  {xScale, yScale}: Scales,
                  {startX, startY}: D3Coords) => {
    const xAxisG = rootG.select('#xAxisG');
    const yAxisG = rootG.select('#yAxisG');

    const xAxis = d3.axisBottom(xScale).tickFormat(() => "").tickSize(0);
    const yAxis = d3.axisLeft(yScale).tickFormat(() => "").tickSize(0);

    xAxisG
        .attr("class", "axis")
        .attr("transform", "translate(0," + startY + ")")
        // @ts-ignore
        .call(xAxis);

    yAxisG
        .attr("class", "axis")
        .attr("transform", "translate(" + startX + ", 0)")
        // @ts-ignore
        .call(yAxis);
}

const removeAppendZoom = (rootG: RootSelection,
                          {xScale, yScale}: Scales,
                          {startX, endX, startY, endY}: D3Coords,
                          {x, y, width, height}: D3RectSpec) => {
    const circlesG = rootG.select('#circlesG');

    circlesG.selectAll('#zoom_rect').remove().exit()


    const updateChart = (t: any) => {

        // recover the new scale
        const newXScale = t.rescaleX(xScale);
        const newYScale = t.rescaleY(yScale);

        // update circle position
        circlesG
            .selectAll("circle")
            .attr('cx', function (d) {
                const mol = d as ProjectedMolecule
                return newXScale(mol.x)
            })
            .attr('cy', function (d) {
                const mol = d as ProjectedMolecule
                return newYScale(mol.y)
            });
    }

    const zoom = d3.zoom()
        .scaleExtent([.8, 40])  // This control how much you can unzoom (x0.5) and zoom (x20)
        .extent([[startX, startY], [endX, endY]])
        .on("zoom", (event) => {
            // @ts-ignore
            updateChart(event.transform)
        });

    circlesG.append("rect")
        .attr("id", "zoom_rect")
        .raise()
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('transform', 'translate(' + x + ',' + y + ')')
        //@ts-ignore
        .call(zoom);
}

const joinCircles = (rootG: RootSelection,
                     data: ProjectedMolecule[],
                     {xScale, yScale}: Scales,
                     handleSelectedMoleculeChange: (mol: Molecule) => void) => {
    const circlesG = rootG.select('#circlesG');

    circlesG
        .selectAll('circle')
        .data(data)
        .join('circle')
        .raise()
        .attr('id', (d) => `id${d.uid}`)
        .attr('cx', function (d) {
            return xScale(d.x) as number;
        })
        .attr('cy', function (d) {
            return yScale(d.y) as number;
        })
        .attr('r', CIRCLE_R)
        .style("stroke", "black")
        .style("stroke-width", .25)
        .style("fill", (d) => {
            return colors(String(d.label));
        })
        .on("click", function (mouseoverEvent, mol) {
            handleSelectedMoleculeChange(mol as unknown as ProjectedMolecule);
        });

    circlesG
        .select(".selected")
        .style("fill", "#fff13b");
}

const updateSelectedCircle = (rootG: RootSelection, selectedMolecule: ProjectedMolecule) => {
    const circlesG = rootG
        .select('#circlesG');

    circlesG
        .select(".selected")
        .attr('class', null)
        .style('fill', (d) => {
            // Danger
            const mol = d as ProjectedMolecule;
            return colors(String(mol.label));
        });

    d3.select(`#id${selectedMolecule.uid}`)
        .attr('class', 'selected')
        .order()
        .raise()
        .style("fill", "#fff13b");
}


const getCoordsAndSpecs = (dimensions: Dimensions, labelLength: number) => {
    const {width, height} = dimensions;
    const margins = {w: width * MARGINS_PROPORTION, h: height * MARGINS_PROPORTION};
    const legend_space = width * LEGEND_PROPORTION;

    const scatterCoords = {
        startX: margins.w,
        endX: (width - margins.w - legend_space),
        startY: (height - margins.h),
        endY: margins.h
    }

    const rectSpec = {
        x: margins.w,
        y: margins.h,
        width: (width - 2 * margins.w - legend_space),
        height: (height - 2 * margins.h)
    }

    const legendSpec: D3LegendSpec = {
        symbolX: width - (margins.w / 2) - legend_space,
        textX: width - (margins.w / 2) - legend_space + 2 * CIRCLE_R,
        symbolStartY: (height - margins.h) / 2,
        textStartY: ((height - margins.h) / 2) + 2 * CIRCLE_R,
        incrementY: ((labelLength / 2) * 8 * CIRCLE_R)
    }

    return {scatterCoords, rectSpec, legendSpec}
}

const getExtrema = (data: ProjectedMolecule[]) => {
    const minX = d3.min(data, d => d.x);
    const maxX = d3.max(data, d => d.x);
    const minY = d3.min(data, d => d.y);
    const maxY = d3.max(data, d => d.y);

    return {minX, maxX, minY, maxY};
}


export const ProjectionChart: React.FC<ProjectionChartProps> = ({data, selectedMolecule, handleSelectedMoleculeChange}) => {
    const d3Container = useRef<SVGSVGElement>(null);
    const dimensions = useContext(DimensionsContext);

    useEffect(() => {
        if (d3Container.current !== null) {
            const rootG = d3.select(d3Container.current);
            createGroups(rootG);
        }
    }, []);


    useEffect(() => {
        if (data !== undefined && d3Container.current !== null) {
            const extrema = getExtrema(data);
            const labels = Array.from(new Set(data.map(d => d.label)));

            const {scatterCoords, rectSpec, legendSpec} = getCoordsAndSpecs(dimensions, labels.length)
            if (Object.values(extrema).every(o => o !== undefined)) {
                // @ts-ignore
                const scales: Scales = createScales(extrema, scatterCoords);
                const rootG = d3.select(d3Container.current);
                removeAppendDefs(rootG, rectSpec);
                joinLegend(rootG, labels, legendSpec);
                callAxis(rootG, scales, scatterCoords);
                removeAppendZoom(rootG, scales, scatterCoords, rectSpec);
                joinCircles(rootG, data, scales, handleSelectedMoleculeChange)
            }
        }
    }, [data, dimensions, handleSelectedMoleculeChange]);

    useEffect(() => {
        if (data !== undefined && d3Container.current !== null && selectedMolecule !== undefined) {
            const rootG = d3.select(d3Container.current);
            updateSelectedCircle(rootG, selectedMolecule)
        }
        // eslint-disable-next-line
    }, [selectedMolecule]);

    return (
        <svg ref={d3Container} width={dimensions.width} height={dimensions.height}/>
    )

}
