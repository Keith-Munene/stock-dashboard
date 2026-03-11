/**
 * components/chart/StockChart.tsx — D3 Candlestick & Line Chart
 *
 * TypeScript additions:
 * - Props interface with explicit types
 * - Typed refs: useRef<SVGSVGElement> and useRef<HTMLDivElement>
 * - ChartType and TimeRange union types (not just string)
 * - ChartTooltip interface for tooltip state
 * - d3 types from @types/d3 (installed as devDependency)
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import type { OHLCData, ParsedOHLC, ChartType, TimeRange, ChartTooltip } from '../../types'

// ── Props interface ──
interface StockChartProps {
  history: OHLCData[]
  ticker: string
  currentPrice: number
  change: number
}

const MARGIN = { top: 20, right: 60, bottom: 40, left: 10 }

export default function StockChart({ history, ticker, currentPrice, change }: StockChartProps) {
  // Typed refs — TypeScript knows exactly what the ref points to
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [chartType, setChartType] = useState<ChartType>('line')
  const [timeRange, setTimeRange] = useState<TimeRange>('3M')
  const [tooltip, setTooltip] = useState<ChartTooltip | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 380 })

  // Filter and parse data for selected time range
  const filteredData = useCallback((): ParsedOHLC[] => {
    const now = new Date()
    const cutoffs: Record<TimeRange, Date> = {
      '1W': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '1M': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '3M': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
    }
    return history
      .filter(d => new Date(d.date) >= cutoffs[timeRange])
      .map(d => ({ ...d, date: new Date(d.date) }))
  }, [history, timeRange])

  // Responsive: watch container width with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect
      setDimensions({ width: Math.max(width, 300), height: 380 })
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // ── Main D3 render ──
  useEffect(() => {
    const data = filteredData()
    if (!data.length || !svgRef.current) return

    const { width, height } = dimensions
    const innerWidth = width - MARGIN.left - MARGIN.right
    const innerHeight = height - MARGIN.top - MARGIN.bottom
    const isPositive = change >= 0
    const lineColor = isPositive ? '#00d17a' : '#ff4d6d'

    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    // Gradient fill for line chart area
    const defs = svg.append('defs')
    const gradientId = `gradient-${ticker}`
    const gradient = defs.append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0').attr('y1', '0')
      .attr('x2', '0').attr('y2', '1')
    gradient.append('stop').attr('offset', '0%')
      .attr('stop-color', lineColor).attr('stop-opacity', 0.3)
    gradient.append('stop').attr('offset', '100%')
      .attr('stop-color', lineColor).attr('stop-opacity', 0)

    const g = svg.append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`)

    // ── Scales ──
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, innerWidth])

    // Compute price extent differently for line vs candle
    const allPrices = chartType === 'candle'
      ? data.flatMap(d => [d.low, d.high])
      : data.map(d => d.close)

    const [minPrice, maxPrice] = d3.extent(allPrices) as [number, number]
    const padding = (maxPrice - minPrice) * 0.1

    const yScale = d3.scaleLinear()
      .domain([minPrice - padding, maxPrice + padding])
      .range([innerHeight, 0])
      .nice()

    // ── Grid ──
    g.append('g').attr('class', 'grid')
      .call(d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => ''))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line')
        .attr('stroke', 'rgba(255,255,255,0.05)')
        .attr('stroke-dasharray', '4,4'))

    // ── X Axis ──
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(width < 500 ? 4 : 6)
          .tickFormat(d => d3.timeFormat(timeRange === '1W' ? '%a %d' : '%b %d')(d as Date))
      )
      .call(g => g.select('.domain').attr('stroke', 'rgba(255,255,255,0.1)'))
      .call(g => g.selectAll('.tick line').attr('stroke', 'rgba(255,255,255,0.1)'))
      .call(g => g.selectAll('.tick text')
        .attr('fill', '#6b7db3').attr('font-size', '11px').attr('font-family', 'DM Sans'))

    // ── Y Axis ──
    g.append('g')
      .attr('transform', `translate(${innerWidth},0)`)
      .call(d3.axisRight(yScale).ticks(5).tickFormat(d => `$${(d as number).toFixed(0)}`))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').remove())
      .call(g => g.selectAll('.tick text')
        .attr('fill', '#6b7db3').attr('font-size', '11px').attr('font-family', 'DM Sans'))

    if (chartType === 'line') {
      // Area fill
      const area = d3.area<ParsedOHLC>()
        .x(d => xScale(d.date))
        .y0(innerHeight)
        .y1(d => yScale(d.close))
        .curve(d3.curveMonotoneX)

      g.append('path')
        .datum(data)
        .attr('fill', `url(#${gradientId})`)
        .attr('d', area)

      // Line with draw animation
      const line = d3.line<ParsedOHLC>()
        .x(d => xScale(d.date))
        .y(d => yScale(d.close))
        .curve(d3.curveMonotoneX)

      const path = g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', lineColor)
        .attr('stroke-width', 2)
        .attr('d', line)

      // Animate the line drawing
      const totalLength = (path.node() as SVGPathElement).getTotalLength()
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition().duration(800).ease(d3.easeQuadOut)
        .attr('stroke-dashoffset', 0)

    } else {
      // Candlestick chart
      const candleWidth = Math.max(2, Math.min(8, innerWidth / data.length - 2))

      g.selectAll<SVGLineElement, ParsedOHLC>('.wick')
        .data(data).join('line').attr('class', 'wick')
        .attr('x1', d => xScale(d.date)).attr('x2', d => xScale(d.date))
        .attr('y1', d => yScale(d.high)).attr('y2', d => yScale(d.low))
        .attr('stroke', d => d.close >= d.open ? '#00d17a' : '#ff4d6d')
        .attr('stroke-width', 1)

      g.selectAll<SVGRectElement, ParsedOHLC>('.candle')
        .data(data).join('rect').attr('class', 'candle')
        .attr('x', d => xScale(d.date) - candleWidth / 2)
        .attr('y', d => yScale(Math.max(d.open, d.close)))
        .attr('width', candleWidth)
        .attr('height', d => Math.max(1, Math.abs(yScale(d.open) - yScale(d.close))))
        .attr('fill', d => d.close >= d.open ? '#00d17a' : '#ff4d6d')
        .attr('rx', 1)
    }

    // ── Interactive crosshair ──
    const crosshairV = g.append('line')
      .attr('stroke', 'rgba(255,255,255,0.2)').attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4').attr('y1', 0).attr('y2', innerHeight)
      .style('display', 'none')

    const crosshairH = g.append('line')
      .attr('stroke', 'rgba(255,255,255,0.2)').attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4').attr('x1', 0).attr('x2', innerWidth)
      .style('display', 'none')

    const bisect = d3.bisector<ParsedOHLC, Date>(d => d.date).left

    g.append('rect')
      .attr('width', innerWidth).attr('height', innerHeight)
      .attr('fill', 'none').attr('pointer-events', 'all')
      .style('cursor', 'crosshair')
      .on('mousemove', function (event: MouseEvent) {
        const [mouseX, mouseY] = d3.pointer(event)
        const xDate = xScale.invert(mouseX)
        const idx = Math.min(bisect(data, xDate, 1), data.length - 1)
        const d = data[idx]
        if (!d) return

        crosshairV.style('display', null).attr('x1', mouseX).attr('x2', mouseX)
        crosshairH.style('display', null).attr('y1', mouseY).attr('y2', mouseY)

        setTooltip({
          x: mouseX + MARGIN.left,
          y: mouseY + MARGIN.top,
          date: d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          open: d.open, high: d.high, low: d.low, close: d.close,
          volume: d.volume, isUp: d.close >= d.open,
        })
      })
      .on('mouseleave', () => {
        crosshairV.style('display', 'none')
        crosshairH.style('display', 'none')
        setTooltip(null)
      })

  }, [filteredData, dimensions, chartType, ticker, change, timeRange])

  const timeRanges: TimeRange[] = ['1W', '1M', '3M']
  const chartTypes: ChartType[] = ['line', 'candle']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {chartTypes.map(type => (
            <button key={type} onClick={() => setChartType(type)} style={{
              padding: '5px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              fontSize: '12px', fontWeight: 500, fontFamily: 'DM Sans, sans-serif',
              background: chartType === type ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: chartType === type ? '#e8eaf6' : '#6b7db3',
              transition: 'all 0.15s',
            }}>
              {type === 'line' ? 'Line' : 'Candle'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {timeRanges.map(range => (
            <button key={range} onClick={() => setTimeRange(range)} style={{
              padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              fontSize: '12px', fontWeight: 500, fontFamily: 'DM Sans, sans-serif',
              background: timeRange === range ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: timeRange === range ? '#e8eaf6' : '#6b7db3',
              transition: 'all 0.15s',
            }}>
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* SVG container */}
      <div ref={containerRef} style={{ position: 'relative', flex: 1, minHeight: '380px' }}>
        <svg ref={svgRef} style={{ width: '100%', height: '380px', overflow: 'visible' }} />

        {/* Tooltip */}
        {tooltip && (
          <div style={{
            position: 'absolute',
            left: Math.min(tooltip.x + 12, dimensions.width - 180),
            top: Math.max(tooltip.y - 70, 0),
            background: '#0e1428',
            border: `1px solid ${tooltip.isUp ? 'rgba(0,209,122,0.3)' : 'rgba(255,77,109,0.3)'}`,
            borderRadius: '10px', padding: '10px 14px',
            pointerEvents: 'none', zIndex: 10, minWidth: '160px',
          }}>
            <div style={{ fontSize: '11px', color: '#6b7db3', marginBottom: '6px', fontFamily: 'DM Sans' }}>
              {tooltip.date}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
              {(['O', 'H', 'L', 'C'] as const).map((label, i) => {
                const val = [tooltip.open, tooltip.high, tooltip.low, tooltip.close][i]
                return (
                  <div key={label} style={{ display: 'flex', gap: '4px', fontSize: '12px', fontFamily: 'DM Mono, monospace' }}>
                    <span style={{ color: '#6b7db3' }}>{label}</span>
                    <span style={{ color: tooltip.isUp ? '#00d17a' : '#ff4d6d' }}>${val?.toFixed(2)}</span>
                  </div>
                )
              })}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7db3', marginTop: '6px', fontFamily: 'DM Sans' }}>
              Vol: {tooltip.volume?.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}