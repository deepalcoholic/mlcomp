export class Project {
  id: number;
  name: string;
  last_activity: Date;
  img_size: number;
  file_size: number;
}

export class NameCount {
  name: string;
  count: number;
}
export class Dag {
  id: number;
  name: string;
  created: Date;
  started: Date;
  last_activity: Date;
  finished: Date;
  project: Project;
  task_count: number;
  task_statuses: NameCount;
  img_size: number;
  file_size: number;
}

export class Task {
  id: number;
  name: string;
  dag: Dag;
}

export class PaginatorRes<T> {
  data: Array<T> = [];
  total: number = 0;
}

export class Data<T> {
  data: T
}

export interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  content: any;
}

export class CodeNode {
    name: string;
    content: string;
    children?: CodeNode[];
}

export class Gpu {
    memory: number;
    load: number;
}

export class Usage {
    cpu: number;
    gpu: Gpu[];
    memory: number;
}

export class ComputerUsage {
    mean: Usage[];
    peak: Usage[];
}

export class Computer {
    name: string;
    gpu: number;
    cpu: number;
    memory: number;
    usage: Usage;
}

export class Step {
  id: number;
  task: Task;
  level: number;
  started: Date;
  finished: Date;
  status: string;
  name: string;
}

export class Log {
    id: number;
    message: string[];
    time: Date;
    level: string;
    component: string;
    computer: Computer;
    step: Step;
    task: Task;
    module: string;
    line: number;
}

export class Graph {
    nodes: any;
    edges: any;
}

export class PaginatorFilter{
    sort_column: string;
    sort_descending: boolean;
    page_number: number;
    page_size: number;

}

export class ComputerFilter {
    paginator: PaginatorFilter;
    usage_min_time: Date;
}

export class LogFilter{
    dag: number;
    task: number;
    components: number[];
    levels: number[];
    step: number;

    task_name: string;
    step_name: string;
    computer: string;

    paginator: PaginatorFilter;

}

export class ProjectFilter {
    paginator: PaginatorFilter;
    name: string;
}

export class DagFilter {
    paginator: PaginatorFilter;
    name: string;
    project: number;
    report: number;
    id: number;
}

export class TaskFilter {
    paginator: PaginatorFilter;
    name: string;
    dag: number;
    status: string;
    report: number;
    id: number;
}

export class ReportsFilter {
    paginator: PaginatorFilter;
    task: number;
    dag: number;
}

export class BaseResult {
    success: boolean;
}

export class ToogleReportResult extends BaseResult{
    report_full: boolean;
}

export class Status extends BaseResult{
    status: string;
}

export class DagStopResult extends BaseResult{
    dag: Dag;
}

export class ReportItem {
    type: string;
    items: ReportItem[];
    title: string;
    parent_cols: number;
    cols: number;
    rows: number;
    row_height: number;
    source: string;
    expanded: boolean;
}

export class Report {
    layout;
    data;
}

export class StepNode {
    name: string;
    id: number;
    children?: StepNode[];
}

export class Img {
    content: string;
}