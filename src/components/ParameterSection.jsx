import React, { useRef, useEffect, useState } from 'react';
import { Box, Slider, Typography, Paper } from '@mui/material';
import * as d3 from 'd3';

const ParameterSection = ({ 
  title, 
  value, 
  onChange, 
  min, 
  max, 
  step, 
  unit, 
  chartData,
  currentLSI 
}) => {
  const chartRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(0);
  const [chartHeight, setChartHeight] = useState(0);

  useEffect(() => {
    if (chartRef.current) {
      const containerWidth = chartRef.current.getBoundingClientRect().width;
      const containerHeight = chartRef.current.getBoundingClientRect().height;
      setChartWidth(containerWidth - 80); // Subtract margins
      setChartHeight(containerHeight - 40); // Subtract margins
    }
  }, [chartData]);

  useEffect(() => {
    if (!chartRef.current || !chartWidth || !chartHeight || !chartData.length) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', chartWidth + 80)
      .attr('height', chartHeight + 60)  // Increased from 40 to 60 to accommodate lower labels
      .append('g')
      .attr('transform', `translate(40, 20)`);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([min, max])
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain([-1, 1])
      .range([chartHeight, 0]);

    // Add grid lines with labels
    const yGridLines = d3.axisLeft(yScale)
      .tickSize(-chartWidth)
      .tickFormat(val => val.toFixed(1));

    const grid = svg.append('g')
      .attr('class', 'grid')
      .attr('opacity', 1)
      .call(yGridLines);

    // Remove domain line
    grid.select('.domain').remove();

    // Style grid lines and labels
    grid.selectAll('.tick')
      .each(function() {
        const tick = d3.select(this);
        // Move labels to the left and style them
        tick.select('text')
          .attr('x', -20)
          .attr('dy', 4)
          .style('opacity', 1)
          .style('fill', '#333');
        // Style the grid lines
        tick.select('line')
          .style('stroke', '#ccc')
          .style('opacity', 0.3);
      });

    // Add horizontal line at y=0
    svg.append('line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', yScale(0))
      .attr('y2', yScale(0))
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1);

    // Calculate bar width based on data density
    const BAR_SPACING = 4; // pixels between bars
    const barWidth = Math.max(
      4, // minimum bar width
      (chartWidth / chartData.length) - BAR_SPACING
    );

    // Add bars
    svg.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.value) - barWidth/2)
      .attr('y', d => d.lsi >= 0 ? yScale(d.lsi) : yScale(0))
      .attr('width', barWidth)
      .attr('height', d => Math.abs(yScale(d.lsi) - yScale(0)))
      .attr('fill', d => {
        if (d.lsi >= -0.3 && d.lsi <= 0.3) return '#4caf50'; // Green for values between -0.3 and 0.3
        return d.lsi >= 0 ? '#1976d2' : '#d32f2f'; // Blue for positive, red for negative
      })
      .attr('opacity', 0.8)
      .on('mouseover', (event, d) => {
        const svgBounds = chartRef.current.getBoundingClientRect();
        const mouseX = event.clientX - svgBounds.left;
        const mouseY = event.clientY - svgBounds.top;
        
        tooltip
          .style('visibility', 'visible')
          .html(`LSI: ${d.lsi.toFixed(2)}<br/>${formatValue(d.value)}`)
          .style('left', `${mouseX}px`)
          .style('top', `${mouseY - 10}px`);
      })
      .on('mousemove', (event) => {
        const svgBounds = chartRef.current.getBoundingClientRect();
        const mouseX = event.clientX - svgBounds.left;
        const mouseY = event.clientY - svgBounds.top;
        
        tooltip
          .style('left', `${mouseX}px`)
          .style('top', `${mouseY - 10}px`);
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden');
      });

    // Add invisible overlay for better touch/click interaction
    const overlay = svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'pointer');

    // Add mouse/touch event handlers
    const updateValueFromPosition = (event) => {
      const svgBounds = chartRef.current.getBoundingClientRect();
      const mouseX = event.touches ? event.touches[0].clientX : event.clientX;
      const mouseY = event.touches ? event.touches[0].clientY : event.clientY;
      const relativeX = mouseX - svgBounds.left - 40; // 40 is the SVG transform x offset
      const newValue = xScale.invert(relativeX);
      // Clamp value to min/max and round to nearest step
      const clampedValue = Math.min(Math.max(min, newValue), max);
      const roundedValue = Math.round(clampedValue / step) * step;
      
      // Show value tooltip during drag
      tooltip
        .style('visibility', 'visible')
        .html(formatValue(roundedValue))
        .style('left', `${mouseX - svgBounds.left}px`)
        .style('top', `${mouseY - svgBounds.top - 10}px`);
      
      onChange({ target: { value: roundedValue } }, roundedValue);
    };

    const handleDragStart = (event) => {
      event.preventDefault();
      updateValueFromPosition(event);
      
      const handleDragMove = (e) => {
        e.preventDefault();
        if (e.touches || (e.buttons & 1)) { // Check if left mouse button is pressed or touch is active
          updateValueFromPosition(e);
        } else {
          handleDragEnd();
        }
      };
      
      const handleDragEnd = () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchmove', handleDragMove);
        document.removeEventListener('touchend', handleDragEnd);
        document.removeEventListener('touchcancel', handleDragEnd);
        tooltip.style('visibility', 'hidden'); // Hide tooltip when drag ends
      };
      
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDragMove);
      document.addEventListener('touchend', handleDragEnd);
      document.addEventListener('touchcancel', handleDragEnd);
    };

    overlay
      .on('mousedown', handleDragStart)
      .on('touchstart', handleDragStart);

    // Add x-axis labels at bottom
    const xLabels = svg.append('g')
      .attr('class', 'x-labels')
      .attr('transform', `translate(0, ${chartHeight + 24})`); // Adjusted to 24px

    // Add labels at min, middle, and max points
    const labelPoints = [min, (min + max) / 2, max];
    
    // First add the background rectangles
    xLabels.selectAll('rect')
      .data(labelPoints)
      .enter()
      .append('rect')
      .attr('x', d => {
        const textWidth = formatValue(d).length * 8; // Approximate width based on text length
        const i = labelPoints.indexOf(d);
        if (i === 0) return xScale(d) - 6; // Left align, increased offset from -4 to -6
        if (i === 2) return xScale(d) - textWidth - 2; // Right align, adjusted offset from -4 to -2
        return xScale(d) - textWidth/2 - 4; // Center align
      })
      .attr('y', -12) // Position above the text baseline
      .attr('width', d => formatValue(d).length * 8 + 8) // Add padding
      .attr('height', 16)
      .attr('rx', 4) // Rounded corners
      .attr('ry', 4)
      .attr('fill', 'white')
      .attr('opacity', 0.8);

    // Then add the text labels
    xLabels.selectAll('text')
      .data(labelPoints)
      .enter()
      .append('text')
      .attr('x', d => xScale(d))
      .attr('y', 0)
      .attr('text-anchor', (d, i) => i === 0 ? 'start' : i === 2 ? 'end' : 'middle')
      .style('fill', '#333')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text(formatValue);

    // Add tooltip
    const tooltip = d3.select(chartRef.current)
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('padding', '8px')
      .style('border', '1px solid #ccc')
      .style('border-radius', '4px')
      .style('box-shadow', '0 1px 3px rgba(0,0,0,0.1)')
      .style('pointer-events', 'none')
      .style('font-size', '12px')
      .style('transform', 'translate(-50%, -100%)'); // Center horizontally and position above pointer

    // Remove the duplicate tooltip event handlers at the bottom of the file
    svg.selectAll('rect')
      .on('mouseover', null)
      .on('mousemove', null)
      .on('mouseout', null);

  }, [chartData, chartWidth, chartHeight, min, max, unit]);

  const formatValue = (val) => {
    if (unit === '°F') return `${val}°F`;
    if (unit === 'ppm') return `${val} ppm`;
    return val.toFixed(1);
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        mb: 3,
        backgroundColor: 'background.paper',
        borderRadius: 2
      }}
    >
      <Box>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      </Box>

      <Box 
        sx={{ 
          position: 'relative',
          height: 200,
          mb: 2
        }}
      >
        <Box 
          ref={chartRef} 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            '& .domain': { stroke: '#ccc' },
            '& .tick line': { stroke: '#ccc' },
            '& .tick text': { fill: '#666' },
            '& .grid line': { stroke: '#ccc' }
          }}
        />
        <Box 
          sx={{ 
            position: 'absolute',
            left: 40, // Match the SVG transform x offset
            width: chartWidth,
            height: 24,
            top: {
              xs: 'calc(50% - 2px)', // Mobile positioning
              sm: 'calc(50% - 5px)' // Desktop positioning
            },
            transform: {
              xs: 'translateY(calc(50% + 4px))', // Mobile positioning
              sm: 'translateY(calc(50% + 9px))' // Desktop positioning
            },
            zIndex: 1,
            px: 0 // Remove any padding that might affect alignment
          }}
        >
          <Slider
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            step={step}
            valueLabelDisplay="on"
            valueLabelFormat={formatValue}
            sx={{
              width: '100%',
              '& .MuiSlider-rail': {
                display: 'none',
              },
              '& .MuiSlider-track': {
                display: 'none',
              },
              '& .MuiSlider-thumb': {
                height: 0,
                width: 0,
                visibility: 'visible',
                '&:before': {
                  display: 'none',
                },
                '&:hover, &.Mui-focusVisible, &.Mui-active': {
                  boxShadow: 'none',
                  outline: 'none',
                },
              },
              '& .MuiSlider-mark': {
                display: 'none',
              },
              '& .MuiSlider-valueLabel': {
                backgroundColor: 'white',
                color: 'text.primary',
                border: '1px solid #ccc',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                top: {
                  xs: 2, // Mobile spacing
                  sm: 5  // Desktop spacing
                },
                '&:before': {
                  borderTop: '1px solid #ccc',
                  borderLeft: '1px solid #ccc',
                  top: {
                    xs: -4, // Mobile arrow position
                    sm: -5  // Desktop arrow position
                  },
                  transform: 'translate(-50%, 0) rotate(45deg)'
                }
              }
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default ParameterSection; 