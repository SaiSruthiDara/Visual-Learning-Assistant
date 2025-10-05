export type SlideType = 'TEXT' | 'BAR_CHART' | 'LINE_CHART' | 'FLOWCHART';

export interface ChartDataItem {
  name: string;
  value: number;
}

export interface FlowchartNode {
  id: string;
  label: string;
  position?: { x: number; y: number }; // For rendering
}

export interface FlowchartEdge {
  from: string;
  to: string;
  label?: string;
}

interface BaseSlide {
  type: SlideType;
  title: string;
  narration: string;
}

export interface TextSlideData extends BaseSlide {
  type: 'TEXT';
  content: string;
}

export interface BarChartSlideData extends BaseSlide {
  type: 'BAR_CHART';
  data: ChartDataItem[];
  xAxisTitle?: string;
  yAxisTitle?: string;
}

export interface LineChartSlideData extends BaseSlide {
  type: 'LINE_CHART';
  data: ChartDataItem[];
  xAxisTitle?: string;
  yAxisTitle?: string;
}

export interface FlowchartSlideData extends BaseSlide {
  type: 'FLOWCHART';
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}

export type Slide = TextSlideData | BarChartSlideData | LineChartSlideData | FlowchartSlideData;